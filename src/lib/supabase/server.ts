import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Серверный клиент Supabase с публичным anon-ключом.
 * Используется для чтения каталога на сайте (RLS разрешает только select).
 * Возвращает null, если переменные окружения не заданы — тогда сайт
 * работает на мок-данных (см. src/lib/data.ts).
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
