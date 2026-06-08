import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Состояние пошаговых диалогов бота. Храним в Supabase (таблица bot_sessions),
// потому что webhook-обработчик в serverless не имеет памяти между вызовами.

export interface ProductDraft {
  id?: string; // при редактировании
  name?: string;
  price?: number;
  category_id?: string | null;
  description?: string;
  images?: string[];
  is_available?: boolean;
  is_featured?: boolean;
}

export interface BotSession {
  state: string | null;
  draft: ProductDraft & Record<string, unknown>;
}

const EMPTY: BotSession = { state: null, draft: {} };

export async function loadSession(chatId: number): Promise<BotSession> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("bot_sessions")
    .select("state, draft")
    .eq("chat_id", chatId)
    .maybeSingle();
  if (!data) return { ...EMPTY, draft: {} };
  return {
    state: data.state ?? null,
    draft: (data.draft as BotSession["draft"]) ?? {},
  };
}

export async function saveSession(
  chatId: number,
  session: BotSession,
): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb.from("bot_sessions").upsert({
    chat_id: chatId,
    state: session.state,
    draft: session.draft,
    updated_at: new Date().toISOString(),
  });
}

export async function clearSession(chatId: number): Promise<void> {
  await saveSession(chatId, { ...EMPTY, draft: {} });
}
