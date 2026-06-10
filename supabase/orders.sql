-- ============================================================
--  kolibri_flowers — заказы (корзина + оформление)
--  Выполнить в Supabase → SQL Editor (один раз, после schema.sql).
-- ============================================================

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  status          text not null default 'new',   -- new | accepted | cancelled
  customer_name   text not null,
  customer_phone  text not null,
  customer_address text not null default '',
  comment         text not null default '',
  items           jsonb not null default '[]'::jsonb, -- [{product_id,name,price,qty}]
  total           numeric not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- RLS: заказами управляет только сервер (service_role обходит RLS).
-- Анонимный доступ запрещён (создание заказа идёт через серверный API /api/orders).
alter table public.orders enable row level security;
-- Никаких политик для anon — значит публичный доступ закрыт.
