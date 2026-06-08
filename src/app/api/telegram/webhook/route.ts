import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram/bot";
import { getWebhookSecret } from "@/lib/telegram/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Telegram шлёт сюда обновления (POST). Эндпоинт защищён секретным токеном,
// который Telegram передаёт в заголовке X-Telegram-Bot-Api-Secret-Token.
export async function POST(req: Request): Promise<Response> {
  try {
    const bot = await getBot();
    const handler = webhookCallback(bot, "std/http", {
      secretToken: getWebhookSecret(),
    });
    return await handler(req);
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return new Response("error", { status: 500 });
  }
}
