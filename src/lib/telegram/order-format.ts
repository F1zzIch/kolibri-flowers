import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "🆕 Новый",
  accepted: "✅ Принят",
  cancelled: "✖️ Отменён",
};

/** Текст заказа для сообщений бота. */
export function orderSummary(order: Order): string {
  const items = order.items
    .map((i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`)
    .join("\n");
  return [
    `🛒 *Заказ* — ${STATUS_LABEL[order.status]}`,
    ``,
    `👤 ${order.customer_name}`,
    `📞 ${order.customer_phone}`,
    order.customer_address ? `📍 ${order.customer_address}` : null,
    order.comment ? `💬 ${order.comment}` : null,
    ``,
    items,
    ``,
    `*Итого: ${formatPrice(order.total)}*`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export { STATUS_LABEL };
