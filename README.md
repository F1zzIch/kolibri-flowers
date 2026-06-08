# kolibri_flowers — сайт-витрина цветочного магазина (Мозырь)

Онлайн-каталог букетов и композиций. Next.js (App Router) + TypeScript + Tailwind CSS
+ Framer Motion. Данные — в Supabase; управление каталогом — через **Telegram-бот**.
Без ключей Supabase сайт работает на мок-данных (демо-режим).

## Запуск

```bash
npm install      # установка зависимостей
npm run dev      # локальная разработка → http://localhost:3000
npm run build    # production-сборка
npm run start    # запуск собранного сайта
npm run lint     # проверка кода
```

## Публичная витрина

- **Главная** (`/`): анимированный hero, популярные букеты, блок «о мастерской», CTA-контакты.
- **Каталог** (`/catalog`): фильтр по категориям, поиск, сетка карточек с анимациями.
- **Страница букета** (`/catalog/[slug]`): галерея фото, цена, описание, кнопки заказа, похожие.
- **Контакты** (`/contacts`): телефон, соцсети, адрес, часы, карта.
- Анимации (Framer Motion), mobile-first, `prefers-reduced-motion`.
- SEO: метаданные, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD (Florist).

Кнопка «Заказать» ведёт в Telegram с предзаполненным текстом и в Instagram Direct.

## Архитектура данных

- БД — **Supabase** (Postgres): таблицы `products`, `categories`, `settings`, `bot_sessions`.
- Чтение каталога на сайте — публичное (RLS `select` для всех).
- Запись — только через **service_role** (Telegram-бот на сервере). Анонимная запись запрещена.
- Фото букетов — в Supabase Storage (бакет `product-images`, публичное чтение).
- Весь доступ к данным сайта — в `src/lib/data.ts`; если env-ключей нет, отдаются мок-данные.
- После правок бот вызывает ревалидацию (`revalidatePath`) — изменения видны на сайте сразу.

## Управление каталогом через Telegram-бот

Владелец управляет каталогом из Telegram: добавить/изменить/удалить букет,
загрузить фото (просто прислать боту), отметить наличие/хит, менять цену,
категории и контакты магазина. Доступ — только у Telegram ID из белого списка.

### Настройка (один раз)

1. **База данных.** В Supabase → SQL Editor выполнить `supabase/schema.sql`
   (создаст таблицы, RLS, бакет для фото и начальные данные).
2. **Бот.** Создать бота у [@BotFather](https://t.me/BotFather) (`/newbot`) — получить токен.
   Свой Telegram ID узнать у [@userinfobot](https://t.me/userinfobot).
3. **Переменные окружения.** Скопировать `.env.local.example` → `.env.local` и заполнить:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_IDS`, `TELEGRAM_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (адрес задеплоенного сайта)
4. **Деплой** на Vercel (те же переменные — в настройках проекта Vercel).
5. **Привязать webhook:** открыть в браузере
   `https://ВАШ-САЙТ/api/telegram/setup?secret=ВАШ_TELEGRAM_WEBHOOK_SECRET`
   — увидите `{ "ok": true, ... }`.
6. Написать боту `/start`.

> Telegram доставляет обновления только на публичный HTTPS-адрес, поэтому
> бот работает после деплоя (или через туннель типа ngrok при локальной отладке).

### Команды бота

- `/start`, `/menu` — главное меню; `/cancel` — отменить текущее действие.
- Всё остальное — кнопками: ➕ добавить, 📋 список (правка/удаление), 🏷 категории, ⚙️ настройки.
