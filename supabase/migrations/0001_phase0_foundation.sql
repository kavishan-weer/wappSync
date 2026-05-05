create extension if not exists pgcrypto;

create table if not exists public.owner_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  business_type text,
  whatsapp_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shops_owner_id_unique unique (owner_id)
);

alter table public.owner_profiles enable row level security;
alter table public.shops enable row level security;

create policy "Owners can read their own profile"
  on public.owner_profiles
  for select
  to authenticated
  using (id = auth.uid());

create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  default_currency text not null default 'USD',
  order_prefix text not null default 'ORD-',
  low_stock_alert_threshold integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shop_settings_shop_id_unique unique (shop_id)
);

alter table public.shop_settings enable row level security;

create policy "Owners can read their own shop settings"
  on public.shop_settings
  for select
  to authenticated
  using (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Owners can insert their own shop settings"
  on public.shop_settings
  for insert
  to authenticated
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Owners can update their own shop settings"
  on public.shop_settings
  for update
  to authenticated
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Owners can update their own profile"
  on public.owner_profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Owners can insert their own profile"
  on public.owner_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "Owners can read their own shop"
  on public.shops
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Owners can insert their own shop"
  on public.shops
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Owners can update their own shop"
  on public.shops
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_owner_profiles_updated_at on public.owner_profiles;
create trigger set_owner_profiles_updated_at
  before update on public.owner_profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_shops_updated_at on public.shops;
create trigger set_shops_updated_at
  before update on public.shops
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_shop_settings_updated_at on public.shop_settings;
create trigger set_shop_settings_updated_at
  before update on public.shop_settings
  for each row
  execute function public.set_updated_at();
