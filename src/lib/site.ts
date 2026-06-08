// Базовый URL сайта. Приоритет:
//  1) NEXT_PUBLIC_SITE_URL (если задан явно),
//  2) продакшен-домен Vercel (выставляется автоматически на Vercel),
//  3) localhost для разработки.
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // Netlify: основной адрес продакшен-сайта.
  const netlify = process.env.URL;
  if (netlify?.startsWith("https://")) return netlify.replace(/\/$/, "");

  // Vercel: продакшен-домен.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export function isHttps(): boolean {
  return getSiteUrl().startsWith("https://");
}
