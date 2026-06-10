import { authorizeRequest } from "@/lib/telegram/initdata";
import { listOrders } from "@/lib/telegram/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeRequest(req)) {
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  }
  const orders = await listOrders();
  return Response.json({ orders });
}
