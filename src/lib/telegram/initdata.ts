import { createHmac } from "node:crypto";
import { getBotToken, isAdmin } from "./config";

// Проверка подлинности Telegram Mini App (initData).
// Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

const MAX_AGE_SECONDS = 24 * 60 * 60; // initData считаем действительным сутки

/**
 * Проверяет подпись initData и возвращает пользователя, если:
 *  - подпись валидна (HMAC от токена бота),
 *  - данные не протухли,
 *  - пользователь в белом списке администраторов.
 * Иначе — null.
 */
export function verifyInitData(initData: string): TelegramUser | null {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  // Строка для проверки: пары key=value, отсортированные по ключу, через \n.
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(getBotToken())
    .digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  // Свежесть.
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SECONDS) return null;

  // Пользователь.
  let user: TelegramUser | null = null;
  try {
    user = JSON.parse(params.get("user") || "null");
  } catch {
    return null;
  }
  if (!user || !isAdmin(user.id)) return null;

  return user;
}

/** Достаёт initData из запроса (заголовок X-Init-Data). */
export function getInitDataFromRequest(req: Request): string {
  return req.headers.get("x-init-data") || "";
}

/** Проверка доступа для API-роутов Mini App. Возвращает user или null. */
export function authorizeRequest(req: Request): TelegramUser | null {
  return verifyInitData(getInitDataFromRequest(req));
}
