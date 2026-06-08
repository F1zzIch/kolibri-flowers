import type { Api } from "grammy";
import { getSupabaseAdmin, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/admin";
import { getBotToken } from "./config";

/**
 * Скачивает фото из Telegram по file_id и загружает в Supabase Storage.
 * Возвращает публичный URL картинки.
 */
export async function uploadTelegramPhoto(
  api: Api,
  fileId: string,
): Promise<string> {
  // 1. Узнаём путь к файлу на серверах Telegram.
  const file = await api.getFile(fileId);
  if (!file.file_path) throw new Error("Не удалось получить файл из Telegram");

  // 2. Скачиваем файл.
  const downloadUrl = `https://api.telegram.org/file/bot${getBotToken()}/${file.file_path}`;
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error("Ошибка скачивания фото из Telegram");
  const buffer = Buffer.from(await res.arrayBuffer());

  // 3. Загружаем в Storage.
  const ext = file.file_path.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const sb = getSupabaseAdmin();
  const { error } = await sb.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: false,
    });
  if (error) throw new Error(`Ошибка загрузки в Storage: ${error.message}`);

  // 4. Публичный URL.
  const { data } = sb.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Загружает произвольное изображение (например, из формы Mini App) в Storage.
 * Возвращает публичный URL.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const ext = extFromContentType(contentType);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = getSupabaseAdmin();
  const { error } = await sb.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Ошибка загрузки в Storage: ${error.message}`);
  const { data } = sb.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function extFromContentType(ct: string): string {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "jpg";
}

/** Удаляет файлы из Storage по их публичным URL (best-effort). */
export async function deleteStorageImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const sb = getSupabaseAdmin();
  const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
  const paths = urls
    .map((u) => {
      const i = u.indexOf(marker);
      return i === -1 ? null : u.slice(i + marker.length);
    })
    .filter((p): p is string => Boolean(p));
  if (paths.length > 0) {
    await sb.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  }
}
