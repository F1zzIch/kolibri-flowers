import { InlineKeyboard } from "grammy";
import { getBot } from "./bot";
import { getAdminIds } from "./config";
import { orderSummary } from "./order-format";
import type { Order } from "@/lib/types";

/** Отправляет уведомление о новом заказе всем администраторам. */
export async function notifyNewOrder(order: Order): Promise<void> {
  const admins = getAdminIds();
  if (admins.length === 0) return;
  const bot = await getBot();
  const keyboard = new InlineKeyboard()
    .text("✅ Принять", `order_accept:${order.id}`)
    .text("✖️ Отменить", `order_cancel:${order.id}`);

  await Promise.all(
    admins.map((chatId) =>
      bot.api
        .sendMessage(chatId, `🛒 *Новый заказ!*\n\n${orderSummary(order)}`, {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        })
        .catch(() => {
          /* пользователь мог не начать диалог с ботом — игнорируем */
        }),
    ),
  );
}
