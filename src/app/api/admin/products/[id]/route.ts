import { authorizeRequest } from "@/lib/telegram/initdata";
import { deleteProduct, updateProduct } from "@/lib/telegram/repo";
import type { ProductDraft } from "@/lib/telegram/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!authorizeRequest(req)) return unauthorized();
  const { id } = await params;
  const patch = (await req.json()) as Partial<ProductDraft>;

  // Пропускаем только разрешённые поля.
  const clean: Partial<ProductDraft> = {};
  if (patch.name !== undefined) clean.name = String(patch.name).trim();
  if (patch.price !== undefined) clean.price = Number(patch.price) || 0;
  if (patch.category_id !== undefined) clean.category_id = patch.category_id;
  if (patch.description !== undefined) clean.description = patch.description;
  if (patch.images !== undefined) clean.images = patch.images;
  if (patch.is_available !== undefined) clean.is_available = patch.is_available;
  if (patch.is_featured !== undefined) clean.is_featured = patch.is_featured;

  const ok = await updateProduct(id, clean);
  if (!ok) return Response.json({ error: "Не удалось обновить" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!authorizeRequest(req)) return unauthorized();
  const { id } = await params;
  const ok = await deleteProduct(id);
  if (!ok) return Response.json({ error: "Не удалось удалить" }, { status: 500 });
  return Response.json({ ok: true });
}

function unauthorized() {
  return Response.json({ error: "Нет доступа" }, { status: 401 });
}
