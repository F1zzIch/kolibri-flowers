// Локальный запуск Telegram-бота в режиме long-polling (без публичного адреса).
// Использование: npm run bot
//
// Боевой режим на проде — через webhook (/api/telegram/webhook + /api/telegram/setup),
// этот скрипт нужен только для разработки и тестов.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Загружаем .env.local вручную (минимальный парсер), до импорта модулей бота.
loadEnv(".env.local");

async function main() {
  const { getBot } = await import("@/lib/telegram/bot");
  const bot = await getBot();

  // На время polling снимаем webhook, чтобы не было конфликта получения обновлений.
  await bot.api.deleteWebhook({ drop_pending_updates: false });

  console.log(`🤖 Бот @${bot.botInfo.username} запущен в режиме polling. Ctrl+C — остановить.`);
  await bot.start({
    allowed_updates: ["message", "callback_query"],
    onStart: () => console.log("✅ Готов принимать сообщения."),
  });
}

function loadEnv(file: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    console.warn(`⚠️ Не найден ${file} — переменные окружения не загружены.`);
  }
}

main().catch((e) => {
  console.error("Ошибка запуска бота:", e);
  process.exit(1);
});
