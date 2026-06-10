import { authorizeRequest } from "@/lib/telegram/initdata";
import { deleteOrder, updateOrderStatus } from "@/lib/telegram/repo";
import type { OrderStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

const VALID: OrderStatus[] = ["new", "accepted", "cancelled"];

export async function PATCH(req: Request, { params }: Ctx) {
  if (!authorizeRequest(req)) return unauthorized();
  const { id } = await params;
  const { status } = (await req.json()) as { status?: OrderStatus };
  if (!status || !VALID.includes(status)) {
    return Response.json({ error: "Неверный статус" }, { status: 400 });
  }
  const ok = await updateOrderStatus(id, status);
  if (!ok) return Response.json({ error: "Не удалось обновить" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!authorizeRequest(req)) return unauthorized();
  const { id } = await params;
  const ok = await deleteOrder(id);
  if (!ok) return Response.json({ error: "Не удалось удалить" }, { status: 500 });
  return Response.json({ ok: true });
}

function unauthorized() {
  return Response.json({ error: "Нет доступа" }, { status: 401 });
}
