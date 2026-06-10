import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { deleteStorageImages } from "./photos";
import type { ProductDraft } from "./session";
import type {
  Category,
  Order,
  OrderItem,
  OrderStatus,
  ProductWithCategory,
  ShopSettings,
} from "@/lib/types";

// CRUD-операции каталога от имени service_role (вызываются только из бота).
// После любой правки триггерим ревалидацию публичного сайта.

export function revalidateSite(): void {
  // Сбрасываем кэш всех страниц под корневым layout — изменения видны сразу.
  // В режиме локального polling (вне запроса Next) вызов может бросить — игнорируем,
  // там кэш обновится по ISR.
  try {
    revalidatePath("/", "layout");
  } catch {
    /* вне контекста Next — пропускаем */
  }
}

export async function listCategories(): Promise<Category[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Category[]) ?? [];
}

export async function createCategory(name: string): Promise<Category | null> {
  const sb = getSupabaseAdmin();
  const slug = await uniqueSlug("categories", slugify(name));
  const { data: maxRow } = await sb
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 1;
  const { data, error } = await sb
    .from("categories")
    .insert({ name, slug, sort_order })
    .select()
    .single();
  if (error) return null;
  revalidateSite();
  return data as Category;
}

export async function listProducts(): Promise<ProductWithCategory[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("products")
    .select("*, category:categories(*)")
    .order("sort_order", { ascending: true });
  return (data as ProductWithCategory[]) ?? [];
}

export async function getProduct(
  id: string,
): Promise<ProductWithCategory | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .maybeSingle();
  return (data as ProductWithCategory) ?? null;
}

export async function createProduct(draft: ProductDraft): Promise<string | null> {
  const sb = getSupabaseAdmin();
  const slug = await uniqueSlug("products", slugify(draft.name || "bukety"));
  const { data: maxRow } = await sb
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await sb
    .from("products")
    .insert({
      name: draft.name,
      slug,
      description: draft.description ?? "",
      price: draft.price ?? 0,
      category_id: draft.category_id ?? null,
      images: draft.images ?? [],
      is_available: draft.is_available ?? true,
      is_featured: draft.is_featured ?? false,
      sort_order,
    })
    .select("id")
    .single();
  if (error) return null;
  revalidateSite();
  return (data as { id: string }).id;
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductDraft>,
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("products").update(patch).eq("id", id);
  if (error) return false;
  revalidateSite();
  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  // Сначала забираем картинки, чтобы подчистить Storage.
  const { data } = await sb
    .from("products")
    .select("images")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) return false;
  if (data?.images) await deleteStorageImages(data.images as string[]);
  revalidateSite();
  return true;
}

export async function getSettings(): Promise<ShopSettings | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return (data as ShopSettings) ?? null;
}

export async function updateSettings(
  patch: Partial<ShopSettings>,
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("settings")
    .update(patch)
    .eq("id", 1);
  if (error) return false;
  revalidateSite();
  return true;
}

// ---------- Заказы ----------

export interface NewOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  comment?: string;
  items: OrderItem[];
}

/** Создаёт заказ. Итог считается на сервере по позициям (не доверяем клиенту). */
export async function createOrder(input: NewOrderInput): Promise<Order | null> {
  const sb = getSupabaseAdmin();
  const items = input.items
    .filter((i) => i.qty > 0)
    .map((i) => ({
      product_id: i.product_id,
      name: i.name,
      price: Number(i.price) || 0,
      qty: Math.max(1, Math.floor(i.qty)),
    }));
  if (items.length === 0) return null;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const { data, error } = await sb
    .from("orders")
    .insert({
      status: "new",
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_address: input.customer_address ?? "",
      comment: input.comment ?? "",
      items,
      total,
    })
    .select("*")
    .single();
  if (error) return null;
  return data as Order;
}

export async function listOrders(): Promise<Order[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Order[]) ?? [];
}

export async function getOrder(id: string): Promise<Order | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  return (data as Order) ?? null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("orders").update({ status }).eq("id", id);
  return !error;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("orders").delete().eq("id", id);
  return !error;
}

export async function countNewOrders(): Promise<number> {
  const sb = getSupabaseAdmin();
  const { count } = await sb
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  return count ?? 0;
}

// Гарантирует уникальность slug в таблице, добавляя суффикс -2, -3, …
async function uniqueSlug(
  table: "products" | "categories",
  base: string,
): Promise<string> {
  const sb = getSupabaseAdmin();
  let candidate = base;
  let n = 1;
  // Защита от бесконечного цикла.
  while (n < 100) {
    const { data } = await sb
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}
