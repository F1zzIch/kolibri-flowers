import { getBot } from "@/lib/telegram/bot";
import {
  getWebAppUrl,
  getWebhookSecret,
  isHttps,
} from "@/lib/telegram/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Одноразовая настройка webhook'а Telegram.
// Открыть в браузере: /api/telegram/setup?secret=ВАШ_TELEGRAM_WEBHOOK_SECRET
// Привязывает бота к /api/telegram/webhook на текущем домене.
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const secret = getWebhookSecret();

  if (!secret || url.searchParams.get("secret") !== secret) {
    return Response.json({ ok: false, error: "Неверный secret" }, { status: 401 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || url.origin;
  const webhookUrl = `${siteUrl}/api/telegram/webhook`;

  try {
    const bot = await getBot();
    await bot.api.setWebhook(webhookUrl, {
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
    });

    // Кнопка-меню рядом с полем ввода → открывает Mini App (только по HTTPS).
    let menuButton = false;
    if (isHttps()) {
      await bot.api.setChatMenuButton({
        menu_button: {
          type: "web_app",
          text: "Каталог",
          web_app: { url: getWebAppUrl() },
        },
      });
      menuButton = true;
    }

    const info = await bot.api.getWebhookInfo();
    return Response.json({ ok: true, webhookUrl, menuButton, info });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "ошибка" },
      { status: 500 },
    );
  }
}
