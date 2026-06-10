import { Bot, InlineKeyboard, type Context } from "grammy";
import { getBotToken, getWebAppUrl, isAdmin, isHttps } from "./config";
import {
  clearSession,
  loadSession,
  saveSession,
  type ProductDraft,
} from "./session";
import { uploadTelegramPhoto } from "./photos";
import {
  createCategory,
  createProduct,
  deleteProduct,
  deleteOrder,
  getOrder,
  getProduct,
  getSettings,
  listCategories,
  listOrders,
  listProducts,
  updateOrderStatus,
  updateProduct,
  updateSettings,
} from "./repo";
import { orderSummary } from "./order-format";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

// Поля настроек, доступные для редактирования через бота.
const SETTINGS_FIELDS: { key: keyof SettingsPatch; label: string }[] = [
  { key: "phone", label: "Телефон" },
  { key: "instagram_url", label: "Instagram" },
  { key: "telegram_url", label: "Telegram" },
  { key: "whatsapp_url", label: "WhatsApp" },
  { key: "address", label: "Адрес" },
  { key: "working_hours", label: "Часы работы" },
];
type SettingsPatch = {
  phone: string;
  instagram_url: string;
  telegram_url: string;
  whatsapp_url: string;
  address: string;
  working_hours: string;
};

let botPromise: Promise<Bot> | null = null;

/** Возвращает инициализированный экземпляр бота (мемоизируется на процесс). */
export function getBot(): Promise<Bot> {
  if (!botPromise) {
    botPromise = (async () => {
      const bot = new Bot(getBotToken());
      registerHandlers(bot);
      await bot.init();
      return bot;
    })();
  }
  return botPromise;
}

// ---------- Меню ----------

function mainMenuKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  // Кнопка-приложение (графический интерфейс). Telegram открывает Web App
  // только по HTTPS — на localhost кнопку не показываем.
  if (isHttps()) {
    kb.webApp("🖥 Открыть приложение", getWebAppUrl()).row();
  }
  return kb
    .text("📥 Заказы", "orders:0")
    .row()
    .text("➕ Добавить букет", "add_start")
    .row()
    .text("📋 Список букетов", "list:0")
    .row()
    .text("🏷 Категории", "cats")
    .text("⚙️ Настройки", "settings");
}

async function showMainMenu(ctx: Context, text = "Что хотите сделать?") {
  await ctx.reply(`🌸 *Управление каталогом kolibri_flowers*\n\n${text}`, {
    parse_mode: "Markdown",
    reply_markup: mainMenuKeyboard(),
  });
}

// ---------- Регистрация обработчиков ----------

function registerHandlers(bot: Bot) {
  // Доступ только для администраторов из белого списка.
  bot.use(async (ctx, next) => {
    if (!isAdmin(ctx.from?.id)) {
      await ctx.reply(
        "⛔️ Нет доступа. Этот бот управляет каталогом и доступен только администратору магазина.",
      );
      return;
    }
    await next();
  });

  bot.command("start", async (ctx) => {
    await clearSession(ctx.chat.id);
    await showMainMenu(ctx, "Добро пожаловать! Управляйте букетами прямо здесь.");
  });

  bot.command("menu", async (ctx) => {
    await clearSession(ctx.chat.id);
    await showMainMenu(ctx);
  });

  bot.command("cancel", async (ctx) => {
    await clearSession(ctx.chat.id);
    await showMainMenu(ctx, "Действие отменено.");
  });

  bot.on("callback_query:data", handleCallback);
  bot.on("message:photo", handlePhoto);
  bot.on("message:text", handleText);
}

// ---------- Обработка нажатий кнопок ----------

async function handleCallback(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  const chatId = ctx.chat?.id;
  if (!data || !chatId) return;
  await ctx.answerCallbackQuery().catch(() => {});

  // --- Добавление букета ---
  if (data === "add_start") {
    await saveSession(chatId, { state: "add:name", draft: {} });
    await ctx.reply(
      "➕ *Новый букет*\n\nВведите *название* букета:\n\n(в любой момент — /cancel)",
      { parse_mode: "Markdown" },
    );
    return;
  }

  if (data.startsWith("addcat:")) {
    const session = await loadSession(chatId);
    if (session.state !== "add:category") return;
    const catId = data.slice("addcat:".length);
    session.draft.category_id = catId === "none" ? null : catId;
    session.state = "add:desc";
    await saveSession(chatId, session);
    await ctx.reply(
      "Введите *описание* букета (состав, повод) или нажмите «Пропустить»:",
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().text("Пропустить", "skip_desc"),
      },
    );
    return;
  }

  if (data === "skip_desc") {
    const session = await loadSession(chatId);
    if (session.state !== "add:desc") return;
    session.draft.description = "";
    session.state = "add:photos";
    session.draft.images = [];
    await saveSession(chatId, session);
    await askPhotos(ctx, 0);
    return;
  }

  if (data === "photos_done") {
    const session = await loadSession(chatId);
    if (session.state !== "add:photos") return;
    if (!session.draft.images || session.draft.images.length === 0) {
      await ctx.reply("Добавьте хотя бы одно фото 📷");
      return;
    }
    session.state = "add:avail";
    await saveSession(chatId, session);
    await ctx.reply("Букет *в наличии*?", {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("✅ В наличии", "avail:1")
        .text("🚫 Нет", "avail:0"),
    });
    return;
  }

  if (data.startsWith("avail:")) {
    const session = await loadSession(chatId);
    if (session.state !== "add:avail") return;
    session.draft.is_available = data.endsWith("1");
    session.state = "add:feat";
    await saveSession(chatId, session);
    await ctx.reply("Показывать на главной как *«Хит»*?", {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("⭐️ Да, хит", "feat:1")
        .text("Обычный", "feat:0"),
    });
    return;
  }

  if (data.startsWith("feat:")) {
    const session = await loadSession(chatId);
    if (session.state !== "add:feat") return;
    session.draft.is_featured = data.endsWith("1");
    await saveSession(chatId, session);
    const id = await createProduct(session.draft as ProductDraft);
    await clearSession(chatId);
    if (id) {
      await ctx.reply(
        `✅ Букет *«${escapeMd(session.draft.name || "")}»* добавлен и уже на сайте!`,
        { parse_mode: "Markdown" },
      );
    } else {
      await ctx.reply("⚠️ Не удалось сохранить букет. Попробуйте ещё раз.");
    }
    await showMainMenu(ctx);
    return;
  }

  // --- Заказы ---
  if (data.startsWith("orders:")) {
    const page = Number(data.slice("orders:".length)) || 0;
    await showOrdersList(ctx, page);
    return;
  }

  if (data.startsWith("order:")) {
    await showOrderCard(ctx, data.slice("order:".length));
    return;
  }

  if (data.startsWith("order_accept:")) {
    await changeOrder(ctx, data.slice("order_accept:".length), "accepted");
    return;
  }

  if (data.startsWith("order_cancel:")) {
    await changeOrder(ctx, data.slice("order_cancel:".length), "cancelled");
    return;
  }

  if (data.startsWith("order_del:")) {
    const id = data.slice("order_del:".length);
    await deleteOrder(id);
    await ctx.reply("🗑 Заказ удалён.");
    await showOrdersList(ctx, 0);
    return;
  }

  // --- Список букетов ---
  if (data.startsWith("list:")) {
    const page = Number(data.slice("list:".length)) || 0;
    await showProductList(ctx, page);
    return;
  }

  if (data.startsWith("prod:")) {
    const id = data.slice("prod:".length);
    await showProductCard(ctx, id);
    return;
  }

  if (data.startsWith("p_avail:")) {
    const id = data.slice("p_avail:".length);
    const p = await getProduct(id);
    if (p) await updateProduct(id, { is_available: !p.is_available });
    await showProductCard(ctx, id);
    return;
  }

  if (data.startsWith("p_feat:")) {
    const id = data.slice("p_feat:".length);
    const p = await getProduct(id);
    if (p) await updateProduct(id, { is_featured: !p.is_featured });
    await showProductCard(ctx, id);
    return;
  }

  if (data.startsWith("p_price:")) {
    const id = data.slice("p_price:".length);
    await saveSession(chatId, { state: `edit_price:${id}`, draft: {} });
    await ctx.reply("Введите новую *цену* (число, BYN):", {
      parse_mode: "Markdown",
    });
    return;
  }

  if (data.startsWith("p_name:")) {
    const id = data.slice("p_name:".length);
    await saveSession(chatId, { state: `edit_name:${id}`, draft: {} });
    await ctx.reply("Введите новое *название*:", { parse_mode: "Markdown" });
    return;
  }

  if (data.startsWith("p_del:")) {
    const id = data.slice("p_del:".length);
    await ctx.reply("Точно удалить этот букет?", {
      reply_markup: new InlineKeyboard()
        .text("🗑 Да, удалить", `p_delyes:${id}`)
        .text("Отмена", `prod:${id}`),
    });
    return;
  }

  if (data.startsWith("p_delyes:")) {
    const id = data.slice("p_delyes:".length);
    const ok = await deleteProduct(id);
    await ctx.reply(ok ? "🗑 Букет удалён." : "⚠️ Не удалось удалить.");
    await showProductList(ctx, 0);
    return;
  }

  // --- Категории ---
  if (data === "cats") {
    await showCategories(ctx);
    return;
  }

  if (data === "cat_add") {
    await saveSession(chatId, { state: "cat:name", draft: {} });
    await ctx.reply("Введите название новой категории:");
    return;
  }

  // --- Настройки ---
  if (data === "settings") {
    await showSettings(ctx);
    return;
  }

  if (data.startsWith("set:")) {
    const field = data.slice("set:".length);
    await saveSession(chatId, { state: `set:${field}`, draft: {} });
    const label =
      SETTINGS_FIELDS.find((f) => f.key === field)?.label || field;
    await ctx.reply(`Введите новое значение «${label}»:`);
    return;
  }

  if (data === "menu") {
    await clearSession(chatId);
    await showMainMenu(ctx);
    return;
  }
}

// ---------- Обработка фото ----------

async function handlePhoto(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;
  const session = await loadSession(chatId);
  if (session.state !== "add:photos") {
    await ctx.reply(
      "Чтобы добавить букет с фото, начните с кнопки «➕ Добавить букет» в /menu.",
    );
    return;
  }

  const photos = ctx.message?.photo;
  if (!photos || photos.length === 0) return;
  const fileId = photos[photos.length - 1].file_id; // самое крупное

  try {
    const url = await uploadTelegramPhoto(ctx.api, fileId);
    session.draft.images = [...(session.draft.images ?? []), url];
    await saveSession(chatId, session);
    await askPhotos(ctx, session.draft.images.length);
  } catch (e) {
    await ctx.reply(
      `⚠️ Не удалось загрузить фото: ${e instanceof Error ? e.message : "ошибка"}`,
    );
  }
}

// ---------- Обработка текста по состоянию ----------

async function handleText(ctx: Context) {
  const chatId = ctx.chat?.id;
  const text = ctx.message?.text?.trim();
  if (!chatId || !text) return;
  if (text.startsWith("/")) return; // команды обрабатываются отдельно

  const session = await loadSession(chatId);
  const state = session.state;

  if (!state) {
    await showMainMenu(ctx);
    return;
  }

  // Добавление: название
  if (state === "add:name") {
    session.draft.name = text;
    session.state = "add:price";
    await saveSession(chatId, session);
    await ctx.reply("Введите *цену* букета (число, BYN):", {
      parse_mode: "Markdown",
    });
    return;
  }

  // Добавление: цена
  if (state === "add:price") {
    const price = parsePrice(text);
    if (price === null) {
      await ctx.reply("Введите цену числом, например: 150");
      return;
    }
    session.draft.price = price;
    session.state = "add:category";
    await saveSession(chatId, session);
    await ctx.reply("Выберите категорию:", {
      reply_markup: await categoryKeyboard(),
    });
    return;
  }

  // Добавление: описание
  if (state === "add:desc") {
    session.draft.description = text;
    session.draft.images = [];
    session.state = "add:photos";
    await saveSession(chatId, session);
    await askPhotos(ctx, 0);
    return;
  }

  // Редактирование цены
  if (state.startsWith("edit_price:")) {
    const id = state.slice("edit_price:".length);
    const price = parsePrice(text);
    if (price === null) {
      await ctx.reply("Введите цену числом, например: 150");
      return;
    }
    await updateProduct(id, { price });
    await clearSession(chatId);
    await ctx.reply("💰 Цена обновлена.");
    await showProductCard(ctx, id);
    return;
  }

  // Редактирование названия
  if (state.startsWith("edit_name:")) {
    const id = state.slice("edit_name:".length);
    await updateProduct(id, { name: text });
    await clearSession(chatId);
    await ctx.reply("✏️ Название обновлено.");
    await showProductCard(ctx, id);
    return;
  }

  // Новая категория
  if (state === "cat:name") {
    const cat = await createCategory(text);
    await clearSession(chatId);
    await ctx.reply(cat ? `🏷 Категория «${text}» создана.` : "⚠️ Не удалось.");
    await showCategories(ctx);
    return;
  }

  // Настройки
  if (state.startsWith("set:")) {
    const field = state.slice("set:".length) as keyof SettingsPatch;
    await updateSettings({ [field]: text } as Partial<SettingsPatch>);
    await clearSession(chatId);
    await ctx.reply("⚙️ Настройка обновлена.");
    await showSettings(ctx);
    return;
  }
}

// ---------- Вспомогательные экраны ----------

async function showOrdersList(ctx: Context, page: number) {
  const all = await listOrders();
  if (all.length === 0) {
    await ctx.reply("Заказов пока нет.", {
      reply_markup: new InlineKeyboard().text("⬅️ Меню", "menu"),
    });
    return;
  }
  const pageSize = 8;
  const pages = Math.ceil(all.length / pageSize);
  const slice = all.slice(page * pageSize, page * pageSize + pageSize);

  const kb = new InlineKeyboard();
  for (const o of slice) {
    const mark = o.status === "new" ? "🆕" : o.status === "accepted" ? "✅" : "✖️";
    kb.text(`${mark} ${o.customer_name} · ${formatPrice(o.total)}`, `order:${o.id}`).row();
  }
  if (pages > 1) {
    if (page > 0) kb.text("⬅️", `orders:${page - 1}`);
    kb.text(`${page + 1}/${pages}`, "noop");
    if (page < pages - 1) kb.text("➡️", `orders:${page + 1}`);
    kb.row();
  }
  kb.text("⬅️ Меню", "menu");

  const newCount = all.filter((o) => o.status === "new").length;
  await ctx.reply(`📥 Заказы (новых: ${newCount} из ${all.length}):`, {
    reply_markup: kb,
  });
}

async function showOrderCard(ctx: Context, id: string) {
  const order = await getOrder(id);
  if (!order) {
    await ctx.reply("Заказ не найден.");
    return;
  }
  const kb = new InlineKeyboard();
  if (order.status !== "accepted") kb.text("✅ Принять", `order_accept:${order.id}`);
  if (order.status !== "cancelled") kb.text("✖️ Отменить", `order_cancel:${order.id}`);
  kb.row().text("🗑 Удалить", `order_del:${order.id}`).row().text("⬅️ К заказам", "orders:0");
  await ctx.reply(orderSummary(order), { parse_mode: "Markdown", reply_markup: kb });
}

async function changeOrder(ctx: Context, id: string, status: OrderStatus) {
  await updateOrderStatus(id, status);
  await ctx.reply(status === "accepted" ? "✅ Заказ принят." : "✖️ Заказ отменён.");
  await showOrderCard(ctx, id);
}

async function askPhotos(ctx: Context, count: number) {
  await ctx.reply(
    count === 0
      ? "📷 Пришлите *фото* букета (можно несколько). Когда закончите — нажмите «Готово»."
      : `📷 Загружено фото: ${count}. Пришлите ещё или нажмите «Готово».`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard().text("✅ Готово", "photos_done"),
    },
  );
}

async function categoryKeyboard(): Promise<InlineKeyboard> {
  const cats = await listCategories();
  const kb = new InlineKeyboard();
  for (const c of cats) {
    kb.text(c.name, `addcat:${c.id}`).row();
  }
  kb.text("Без категории", "addcat:none");
  return kb;
}

async function showProductList(ctx: Context, page: number) {
  const all = await listProducts();
  if (all.length === 0) {
    await ctx.reply("Каталог пуст. Добавьте первый букет — «➕ Добавить букет».", {
      reply_markup: new InlineKeyboard().text("⬅️ Меню", "menu"),
    });
    return;
  }
  const pageSize = 8;
  const pages = Math.ceil(all.length / pageSize);
  const slice = all.slice(page * pageSize, page * pageSize + pageSize);

  const kb = new InlineKeyboard();
  for (const p of slice) {
    const flag = p.is_available ? "" : " 🚫";
    const star = p.is_featured ? "⭐️" : "";
    kb.text(`${star}${p.name} · ${formatPrice(p.price)}${flag}`, `prod:${p.id}`).row();
  }
  if (pages > 1) {
    if (page > 0) kb.text("⬅️", `list:${page - 1}`);
    kb.text(`${page + 1}/${pages}`, "noop");
    if (page < pages - 1) kb.text("➡️", `list:${page + 1}`);
    kb.row();
  }
  kb.text("⬅️ Меню", "menu");

  await ctx.reply(`📋 Букеты (${all.length}). Выберите для редактирования:`, {
    reply_markup: kb,
  });
}

async function showProductCard(ctx: Context, id: string) {
  const p = await getProduct(id);
  if (!p) {
    await ctx.reply("Букет не найден.");
    return;
  }
  const lines = [
    `*${escapeMd(p.name)}*`,
    `Цена: ${formatPrice(p.price)}`,
    `Категория: ${p.category?.name ?? "—"}`,
    `Наличие: ${p.is_available ? "✅ есть" : "🚫 нет"}`,
    `Хит: ${p.is_featured ? "⭐️ да" : "нет"}`,
    `Фото: ${p.images.length}`,
  ];
  const kb = new InlineKeyboard()
    .text(p.is_available ? "🚫 Снять с продажи" : "✅ В наличие", `p_avail:${p.id}`)
    .row()
    .text(p.is_featured ? "Убрать из хитов" : "⭐️ Сделать хитом", `p_feat:${p.id}`)
    .row()
    .text("💰 Цена", `p_price:${p.id}`)
    .text("✏️ Название", `p_name:${p.id}`)
    .row()
    .text("🗑 Удалить", `p_del:${p.id}`)
    .row()
    .text("⬅️ К списку", "list:0");

  const caption = lines.join("\n");
  if (p.images[0]) {
    await ctx.replyWithPhoto(p.images[0], {
      caption,
      parse_mode: "Markdown",
      reply_markup: kb,
    });
  } else {
    await ctx.reply(caption, { parse_mode: "Markdown", reply_markup: kb });
  }
}

async function showCategories(ctx: Context) {
  const cats = await listCategories();
  const list =
    cats.length > 0
      ? cats.map((c) => `• ${c.name}`).join("\n")
      : "Категорий пока нет.";
  await ctx.reply(`🏷 *Категории:*\n${list}`, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard()
      .text("➕ Новая категория", "cat_add")
      .row()
      .text("⬅️ Меню", "menu"),
  });
}

async function showSettings(ctx: Context) {
  const s = await getSettings();
  const lines = SETTINGS_FIELDS.map(
    (f) => `*${f.label}:* ${s?.[f.key] || "—"}`,
  );
  const kb = new InlineKeyboard();
  for (const f of SETTINGS_FIELDS) {
    kb.text(`✏️ ${f.label}`, `set:${f.key}`).row();
  }
  kb.text("⬅️ Меню", "menu");
  await ctx.reply(`⚙️ *Настройки магазина*\n\n${lines.join("\n")}`, {
    parse_mode: "Markdown",
    reply_markup: kb,
  });
}

// ---------- Утилиты ----------

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function escapeMd(text: string): string {
  return text.replace(/([_*[\]()`])/g, "\\$1");
}
