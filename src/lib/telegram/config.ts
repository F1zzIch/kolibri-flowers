// Доступ к настройкам Telegram-бота из окружения.

import { getSiteUrl, isHttps } from "@/lib/site";

export function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Не задан TELEGRAM_BOT_TOKEN");
  return token;
}

export function getWebhookSecret(): string | undefined {
  return process.env.TELEGRAM_WEBHOOK_SECRET;
}

/** Список разрешённых Telegram ID администраторов. */
export function getAdminIds(): number[] {
  return (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Доступен ли пользователь к управлению (белый список). */
export function isAdmin(userId: number | undefined): boolean {
  if (!userId) return false;
  return getAdminIds().includes(userId);
}

/** URL Mini App. Telegram открывает Web App только по HTTPS. */
export function getWebAppUrl(): string {
  return `${getSiteUrl()}/admin`;
}

export { getSiteUrl, isHttps };
