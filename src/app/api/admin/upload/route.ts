import { authorizeRequest } from "@/lib/telegram/initdata";
import { uploadImageBuffer } from "@/lib/telegram/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Загрузка фото из Mini App (multipart/form-data, поле "file").
export async function POST(req: Request) {
  if (!authorizeRequest(req)) {
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Нужен файл-изображение" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return Response.json({ error: "Фото больше 8 МБ" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const url = await uploadImageBuffer(buffer, file.type || "image/jpeg");
    return Response.json({ url });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Ошибка загрузки" },
      { status: 500 },
    );
  }
}
