-- ============================================================
--  kolibri_flowers — схема базы данных Supabase
--  Выполнить в Supabase → SQL Editor (один раз).
--  Модель данных по CLAUDE-3.md §6.
-- ============================================================

-- Расширение для генерации UUID (в Supabase обычно уже включено).
create extension if not exists "pgcrypto";

-- ---------- Таблицы ----------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  int  not null default 0
);

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text not null default '',
  price         numeric not null default 0,         -- цена в BYN
  category_id   uuid references public.categories(id) on delete set null,
  images        text[] not null default '{}',       -- публичные URL из Storage
  is_available  boolean not null default true,
  is_featured   boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(is_featured);

-- Настройки магазина — ровно одна строка (id = 1).
create table if not exists public.settings (
  id            int primary key default 1,
  phone         text not null default '',
  instagram_url text not null default '',
  telegram_url  text not null default '',
  whatsapp_url  text not null default '',
  address       text not null default '',
  working_hours text not null default '',
  constraint settings_singleton check (id = 1)
);

-- Состояние диалога Telegram-бота (пошаговые формы в serverless).
create table if not exists public.bot_sessions (
  chat_id    bigint primary key,
  state      text,
  draft      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Публичное чтение каталога; запись только через service_role
-- (Telegram-бот на сервере), который RLS обходит. Анонимная запись запрещена.

alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.settings     enable row level security;
alter table public.bot_sessions enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings
  for select using (true);

-- bot_sessions — никакого публичного доступа (только service_role).
-- Политик на select/insert/update для anon не создаём: по умолчанию запрещено.

-- ---------- Storage: бакет для фото букетов ----------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Публичное чтение файлов бакета. Запись — только service_role (бот).
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- ---------- Начальные данные ----------

insert into public.settings (id, phone, instagram_url, telegram_url, whatsapp_url, address, working_hours)
values (
  1,
  '+375 (29) 000-00-00',
  'https://instagram.com/_kolibri_flowers_',
  'https://t.me/kolibri_flowers',
  'https://wa.me/375290000000',
  'г. Мозырь, ул. Пролетарская, 1',
  'Ежедневно 9:00 – 21:00'
)
on conflict (id) do nothing;

insert into public.categories (name, slug, sort_order) values
  ('Авторские букеты',        'avtorskie-bukety',      1),
  ('Розы',                    'rozy',                  2),
  ('Композиции в коробке',    'kompozicii-v-korobke',  3),
  ('Пионы и сезонное',        'piony-sezonnoe',        4),
  ('Букеты невесты',          'bukety-nevesty',        5)
on conflict (slug) do nothing;
