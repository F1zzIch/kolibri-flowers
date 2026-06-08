import { authorizeRequest } from "@/lib/telegram/initdata";
import { createCategory, listCategories } from "@/lib/telegram/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeRequest(req)) return unauthorized();
  const categories = await listCategories();
  return Response.json({ categories });
}

export async function POST(req: Request) {
  if (!authorizeRequest(req)) return unauthorized();
  const { name } = (await req.json()) as { name?: string };
  if (!name || name.trim() === "") {
    return Response.json({ error: "Укажите название" }, { status: 400 });
  }
  const category = await createCategory(name.trim());
  if (!category) {
    return Response.json({ error: "Не удалось создать" }, { status: 500 });
  }
  return Response.json({ category });
}

function unauthorized() {
  return Response.json({ error: "Нет доступа" }, { status: 401 });
}
