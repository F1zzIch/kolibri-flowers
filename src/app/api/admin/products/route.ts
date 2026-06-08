import { authorizeRequest } from "@/lib/telegram/initdata";
import { createProduct, listProducts } from "@/lib/telegram/repo";
import type { ProductDraft } from "@/lib/telegram/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeRequest(req)) return unauthorized();
  const products = await listProducts();
  return Response.json({ products });
}

export async function POST(req: Request) {
  if (!authorizeRequest(req)) return unauthorized();
  const body = (await req.json()) as ProductDraft;
  if (!body.name || body.name.trim() === "") {
    return Response.json({ error: "Укажите название" }, { status: 400 });
  }
  const id = await createProduct({
    name: body.name.trim(),
    price: Number(body.price) || 0,
    category_id: body.category_id ?? null,
    description: body.description ?? "",
    images: body.images ?? [],
    is_available: body.is_available ?? true,
    is_featured: body.is_featured ?? false,
  });
  if (!id) return Response.json({ error: "Не удалось создать" }, { status: 500 });
  return Response.json({ id });
}

function unauthorized() {
  return Response.json({ error: "Нет доступа" }, { status: 401 });
}
