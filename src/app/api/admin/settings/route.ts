import { authorizeRequest } from "@/lib/telegram/initdata";
import { getSettings, updateSettings } from "@/lib/telegram/repo";
import type { ShopSettings } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS: (keyof ShopSettings)[] = [
  "phone",
  "instagram_url",
  "telegram_url",
  "whatsapp_url",
  "address",
  "working_hours",
];

export async function GET(req: Request) {
  if (!authorizeRequest(req)) return unauthorized();
  const settings = await getSettings();
  return Response.json({ settings });
}

export async function PUT(req: Request) {
  if (!authorizeRequest(req)) return unauthorized();
  const body = (await req.json()) as Partial<ShopSettings>;
  const patch: Partial<ShopSettings> = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) patch[f] = String(body[f]);
  }
  const ok = await updateSettings(patch);
  if (!ok) return Response.json({ error: "Не удалось сохранить" }, { status: 500 });
  return Response.json({ ok: true });
}

function unauthorized() {
  return Response.json({ error: "Нет доступа" }, { status: 401 });
}
