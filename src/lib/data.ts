import {
  mockCategories,
  mockProducts,
  mockSettings,
} from "@/data/mock-products";
import { getSupabase } from "@/lib/supabase/server";
import type {
  Category,
  Product,
  ProductWithCategory,
  ShopSettings,
} from "@/lib/types";

// Единая точка доступа к данным.
// Если Supabase настроен (заданы env-переменные) — читаем из БД,
// иначе работаем на мок-данных (режим разработки/демо).
//
// Все запросы обёрнуты в try/catch: при любой ошибке/недоступности БД
// (в т.ч. на этапе сборки) возвращаем фолбэк, чтобы не падала сборка.

export async function getCategories(): Promise<Category[]> {
  const fallback = () => sortByOrder([...mockCategories]);
  const sb = getSupabase();
  if (!sb) return fallback();
  try {
    const { data, error } = await sb
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data) return fallback();
    return data as Category[];
  } catch {
    return fallback();
  }
}

export async function getProducts(): Promise<ProductWithCategory[]> {
  const fallback = () =>
    sortByOrder([...mockProducts]).map((p) => withCategory(p, mockCategories));
  const sb = getSupabase();
  if (!sb) return fallback();
  try {
    const { data, error } = await sb
      .from("products")
      .select("*, category:categories(*)")
      .order("sort_order", { ascending: true });
    if (error || !data) return fallback();
    return data as ProductWithCategory[];
  } catch {
    return fallback();
  }
}

export async function getFeaturedProducts(
  limit = 6,
): Promise<ProductWithCategory[]> {
  const products = await getProducts();
  return products.filter((p) => p.is_featured).slice(0, limit);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | null> {
  const sb = getSupabase();
  if (!sb) {
    const p = mockProducts.find((x) => x.slug === slug);
    return p ? withCategory(p, mockCategories) : null;
  }
  try {
    const { data, error } = await sb
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as ProductWithCategory;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  product: ProductWithCategory,
  limit = 3,
): Promise<ProductWithCategory[]> {
  const products = await getProducts();
  return products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, limit);
}

export async function getSettings(): Promise<ShopSettings> {
  const sb = getSupabase();
  if (!sb) return mockSettings;
  try {
    const { data, error } = await sb
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return mockSettings;
    return data as ShopSettings;
  } catch {
    return mockSettings;
  }
}

// ---------- helpers ----------

function sortByOrder<T extends { sort_order: number }>(arr: T[]): T[] {
  return arr.sort((a, b) => a.sort_order - b.sort_order);
}

function withCategory(
  product: Product,
  categories: Category[],
): ProductWithCategory {
  return {
    ...product,
    category: categories.find((c) => c.id === product.category_id),
  };
}
