import { createOrder } from "@/lib/telegram/repo";
import { notifyNewOrder } from "@/lib/telegram/notify";
import type { OrderItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Публичное оформление заказа из корзины.
export async function POST(req: Request) {
  let body: {
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    comment?: string;
    items?: OrderItem[];
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = (body.customer_name || "").trim();
  const phone = (body.customer_phone || "").trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!name || !phone) {
    return Response.json({ error: "Укажите имя и телефон" }, { status: 400 });
  }
  if (items.length === 0) {
    return Response.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const order = await createOrder({
    customer_name: name,
    customer_phone: phone,
    customer_address: (body.customer_address || "").trim(),
    comment: (body.comment || "").trim(),
    items,
  });

  if (!order) {
    return Response.json({ error: "Не удалось создать заказ" }, { status: 500 });
  }

  // Уведомляем администратора (не блокируем ответ при сбое Telegram).
  try {
    await notifyNewOrder(order);
  } catch {
    /* ignore */
  }

  return Response.json({ ok: true, id: order.id });
}
