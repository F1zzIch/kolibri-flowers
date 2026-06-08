import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Админский клиент Supabase с service_role-ключом.
 * Обходит RLS — поэтому используется ТОЛЬКО на сервере (Telegram-бот),
 * никогда не импортируется в клиентские компоненты.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Не заданы NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const PRODUCT_IMAGES_BUCKET = "product-images";
