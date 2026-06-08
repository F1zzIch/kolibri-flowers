import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Объединяет классы Tailwind с разрешением конфликтов. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Форматирует цену в белорусских рублях. */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-BY", {
    style: "currency",
    currency: "BYN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Ссылка-заказ: ведёт в Instagram Direct с предзаполненным текстом.
 * Instagram не поддерживает префилл текста, поэтому для текста заказа
 * лучше использовать Telegram/WhatsApp (см. orderLink).
 */
export function instagramOrderUrl(instagramUrl: string): string {
  return instagramUrl;
}

/** Формирует текст заказа для мессенджеров. */
export function orderMessage(productName: string): string {
  return `Здравствуйте! Хочу заказать букет: ${productName}`;
}

/** Telegram-ссылка с предзаполненным текстом заказа. */
export function telegramOrderUrl(telegramUrl: string, productName: string): string {
  const base = telegramUrl.replace(/\/$/, "");
  return `${base}?text=${encodeURIComponent(orderMessage(productName))}`;
}

/** WhatsApp-ссылка с предзаполненным текстом заказа. */
export function whatsappOrderUrl(whatsappUrl: string, productName: string): string {
  const sep = whatsappUrl.includes("?") ? "&" : "?";
  return `${whatsappUrl}${sep}text=${encodeURIComponent(orderMessage(productName))}`;
}
