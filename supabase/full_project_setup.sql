-- wappSync full Supabase setup
-- Safe to run multiple times in Supabase SQL Editor.
-- Covers Phase 0 through Phase 8: auth-owned shops, products, orders,
-- WhatsApp inbox, RAG documents, storage buckets, and chat order RPCs.

create extension if not exists pgcrypto;
create extension if not exists vector;
set search_path = public, extensions;

do $$
begin
  create type public.product_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum (
    'pending',
    'confirmed',
    'packed',
    'shipped',
    'delivered',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.owner_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.owner_profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

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

alter table public.shops
  add column if not exists business_type text,
  add column if not exists whatsapp_number text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null unique references public.shops(id) on delete cascade,
  default_currency text not null default 'LKR',
  order_prefix text not null default 'ORD',
  low_stock_alert_threshold integer not null default 5 check (low_stock_alert_threshold >= 0),
  automation_enabled boolean not null default true,
  owner_alert_phone text,
  fallback_message text not null default 'Thanks for your message. I want to make sure you get the right answer, so I''m connecting you with the shop owner. 😊',
  business_hours_enabled boolean not null default false,
  business_hours_start time not null default '09:00',
  business_hours_end time not null default '17:00',
  business_hours_timezone text not null default 'Asia/Colombo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shop_settings
  add column if not exists default_currency text not null default 'LKR',
  add column if not exists order_prefix text not null default 'ORD',
  add column if not exists low_stock_alert_threshold integer not null default 5,
  add column if not exists automation_enabled boolean not null default true,
  add column if not exists owner_alert_phone text,
  add column if not exists fallback_message text not null default 'Thanks for your message. I want to make sure you get the right answer, so I''m connecting you with the shop owner. 😊',
  add column if not exists business_hours_enabled boolean not null default false,
  add column if not exists business_hours_start time not null default '09:00',
  add column if not exists business_hours_end time not null default '17:00',
  add column if not exists business_hours_timezone text not null default 'Asia/Colombo',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.shop_settings
  alter column default_currency set default 'LKR',
  alter column order_prefix set default 'ORD',
  alter column low_stock_alert_threshold set default 5,
  alter column automation_enabled set default true,
  alter column fallback_message set default 'Thanks for your message. I want to make sure you get the right answer, so I''m connecting you with the shop owner. 😊',
  alter column business_hours_enabled set default false,
  alter column business_hours_start set default '09:00',
  alter column business_hours_end set default '17:00',
  alter column business_hours_timezone set default 'Asia/Colombo';

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  stock_count integer not null default 0 check (stock_count >= 0),
  category text,
  tags text[] not null default '{}',
  status public.product_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists price numeric(12, 2) not null default 0,
  add column if not exists stock_count integer not null default 0,
  add column if not exists category text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists status public.product_status not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_images
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists product_id uuid references public.products(id) on delete cascade,
  add column if not exists storage_path text,
  add column if not exists public_url text,
  add column if not exists alt_text text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  created_at timestamptz not null default now()
);

alter table public.product_variants
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists product_id uuid references public.products(id) on delete cascade,
  add column if not exists name text,
  add column if not exists value text,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  phone text not null,
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_shop_phone_unique unique (shop_id, phone)
);

alter table public.customers
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  status public.order_status not null default 'pending',
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists customer_id uuid references public.customers(id),
  add column if not exists status public.order_status not null default 'pending',
  add column if not exists total_amount numeric(12, 2) not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists product_id uuid references public.products(id),
  add column if not exists quantity integer not null default 1,
  add column if not exists unit_price numeric(12, 2) not null default 0,
  add column if not exists line_total numeric(12, 2) not null default 0,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.whatsapp_accounts (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  phone_number_id text not null,
  waba_id text,
  access_token text not null,
  verify_token text not null,
  display_phone text,
  is_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_accounts_shop_id_unique unique (shop_id)
);

alter table public.whatsapp_accounts
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists phone_number_id text,
  add column if not exists waba_id text,
  add column if not exists access_token text,
  add column if not exists verify_token text,
  add column if not exists display_phone text,
  add column if not exists is_connected boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_phone text not null,
  customer_name text,
  status text not null default 'active'
    check (status in ('active', 'needs_attention', 'resolved', 'closed')),
  automation_paused boolean not null default false,
  pending_order_state jsonb,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_shop_phone_unique unique (shop_id, customer_phone)
);

alter table public.conversations
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists customer_phone text,
  add column if not exists customer_name text,
  add column if not exists status text not null default 'active',
  add column if not exists automation_paused boolean not null default false,
  add column if not exists pending_order_state jsonb,
  add column if not exists last_message_at timestamptz,
  add column if not exists last_message_preview text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  content text not null,
  wa_message_id text,
  status text not null default 'sent'
    check (status in ('sent', 'delivered', 'read', 'failed')),
  sender_type text not null default 'customer'
    check (sender_type in ('customer', 'ai', 'owner')),
  created_at timestamptz not null default now()
);

alter table public.messages
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists conversation_id uuid references public.conversations(id) on delete cascade,
  add column if not exists direction text not null default 'inbound',
  add column if not exists content text not null default '',
  add column if not exists wa_message_id text,
  add column if not exists status text not null default 'sent',
  add column if not exists sender_type text not null default 'customer',
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  file_path text not null,
  file_size integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  chunk_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists name text,
  add column if not exists file_path text,
  add column if not exists file_size integer not null default 0,
  add column if not exists status text not null default 'pending',
  add column if not exists chunk_count integer not null default 0,
  add column if not exists error_message text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  chunk_index integer not null default 0,
  embedding vector(768),
  created_at timestamptz not null default now()
);

alter table public.document_chunks
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists document_id uuid references public.documents(id) on delete cascade,
  add column if not exists content text,
  add column if not exists chunk_index integer not null default 0,
  add column if not exists embedding vector(768),
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.app_logs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  source text not null,
  level text not null default 'info' check (level in ('info', 'warn', 'error')),
  event text not null,
  message text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.app_logs
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists conversation_id uuid references public.conversations(id) on delete set null,
  add column if not exists source text,
  add column if not exists level text not null default 'info',
  add column if not exists event text,
  add column if not exists message text,
  add column if not exists metadata jsonb not null default '{}',
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'shops_owner_id_unique'
      and conrelid = 'public.shops'::regclass
  ) then
    alter table public.shops
      add constraint shops_owner_id_unique unique (owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'shop_settings_shop_id_unique'
      and conrelid = 'public.shop_settings'::regclass
  ) then
    alter table public.shop_settings
      add constraint shop_settings_shop_id_unique unique (shop_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'customers_shop_phone_unique'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_shop_phone_unique unique (shop_id, phone);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'whatsapp_accounts_shop_id_unique'
      and conrelid = 'public.whatsapp_accounts'::regclass
  ) then
    alter table public.whatsapp_accounts
      add constraint whatsapp_accounts_shop_id_unique unique (shop_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'conversations_shop_phone_unique'
      and conrelid = 'public.conversations'::regclass
  ) then
    alter table public.conversations
      add constraint conversations_shop_phone_unique unique (shop_id, customer_phone);
  end if;
end $$;

create index if not exists products_shop_id_idx on public.products(shop_id);
create index if not exists products_shop_search_idx on public.products(shop_id, name);
create index if not exists orders_shop_created_idx on public.orders(shop_id, created_at desc);
create index if not exists customers_shop_phone_idx on public.customers(shop_id, phone);
create index if not exists whatsapp_accounts_phone_number_id_idx on public.whatsapp_accounts(phone_number_id);
create index if not exists conversations_shop_id_idx on public.conversations(shop_id, last_message_at desc);
create index if not exists conversations_shop_phone_idx on public.conversations(shop_id, customer_phone);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id, created_at asc);
create index if not exists messages_wa_message_id_idx on public.messages(wa_message_id);
create index if not exists documents_shop_id_idx on public.documents(shop_id);
create index if not exists document_chunks_document_id_idx on public.document_chunks(document_id);
create index if not exists document_chunks_shop_id_idx on public.document_chunks(shop_id);
create index if not exists app_logs_shop_created_idx on public.app_logs(shop_id, created_at desc);
create index if not exists app_logs_conversation_created_idx on public.app_logs(conversation_id, created_at desc);
do $$
begin
  begin
    create index if not exists document_chunks_embedding_idx
      on public.document_chunks
      using ivfflat (embedding vector_cosine_ops)
      with (lists = 100);
  exception
    when undefined_object then
      raise notice 'Skipping vector similarity index because vector_cosine_ops is not available in this Supabase project.';
    when others then
      raise notice 'Skipping vector similarity index: %', sqlerrm;
  end;
end $$;

alter table public.owner_profiles enable row level security;
alter table public.shops enable row level security;
alter table public.shop_settings enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.whatsapp_accounts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.app_logs enable row level security;

drop policy if exists "Owners can read their own profile" on public.owner_profiles;
create policy "Owners can read their own profile"
  on public.owner_profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "Owners can insert their own profile" on public.owner_profiles;
create policy "Owners can insert their own profile"
  on public.owner_profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "Owners can update their own profile" on public.owner_profiles;
create policy "Owners can update their own profile"
  on public.owner_profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Owners can read their own shop" on public.shops;
create policy "Owners can read their own shop"
  on public.shops for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Owners can insert their own shop" on public.shops;
create policy "Owners can insert their own shop"
  on public.shops for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update their own shop" on public.shops;
create policy "Owners can update their own shop"
  on public.shops for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Owners can manage their shop settings" on public.shop_settings;
create policy "Owners can manage their shop settings"
  on public.shop_settings for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = shop_settings.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = shop_settings.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can read their own shop settings" on public.shop_settings;
drop policy if exists "Owners can insert their own shop settings" on public.shop_settings;
drop policy if exists "Owners can update their own shop settings" on public.shop_settings;

drop policy if exists "Owners can manage their products" on public.products;
create policy "Owners can manage their products"
  on public.products for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = products.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = products.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their product images" on public.product_images;
create policy "Owners can manage their product images"
  on public.product_images for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = product_images.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = product_images.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their product variants" on public.product_variants;
create policy "Owners can manage their product variants"
  on public.product_variants for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = product_variants.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = product_variants.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their customers" on public.customers;
create policy "Owners can manage their customers"
  on public.customers for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = customers.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = customers.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their orders" on public.orders;
create policy "Owners can manage their orders"
  on public.orders for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = orders.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = orders.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their order items" on public.order_items;
create policy "Owners can manage their order items"
  on public.order_items for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = order_items.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = order_items.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their whatsapp accounts" on public.whatsapp_accounts;
create policy "Owners can manage their whatsapp accounts"
  on public.whatsapp_accounts for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = whatsapp_accounts.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = whatsapp_accounts.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their conversations" on public.conversations;
create policy "Owners can manage their conversations"
  on public.conversations for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = conversations.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = conversations.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their messages" on public.messages;
create policy "Owners can manage their messages"
  on public.messages for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = messages.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = messages.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their documents" on public.documents;
create policy "Owners can manage their documents"
  on public.documents for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = documents.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = documents.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can manage their document chunks" on public.document_chunks;
create policy "Owners can manage their document chunks"
  on public.document_chunks for all to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = document_chunks.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = document_chunks.shop_id
      and shops.owner_id = auth.uid()
  ));

drop policy if exists "Owners can read their app logs" on public.app_logs;
create policy "Owners can read their app logs"
  on public.app_logs for select to authenticated
  using (
    shop_id is null
    or exists (
      select 1 from public.shops
      where shops.id = app_logs.shop_id
        and shops.owner_id = auth.uid()
    )
  );

drop trigger if exists set_owner_profiles_updated_at on public.owner_profiles;
create trigger set_owner_profiles_updated_at
  before update on public.owner_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_shops_updated_at on public.shops;
create trigger set_shops_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

drop trigger if exists set_shop_settings_updated_at on public.shop_settings;
create trigger set_shop_settings_updated_at
  before update on public.shop_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists set_whatsapp_accounts_updated_at on public.whatsapp_accounts;
create trigger set_whatsapp_accounts_updated_at
  before update on public.whatsapp_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners can upload product images" on storage.objects;
create policy "Owners can upload product images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update product images" on storage.objects;
create policy "Owners can update product images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete product images" on storage.objects;
create policy "Owners can delete product images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select to public
  using (bucket_id = 'product-images');

drop policy if exists "Owners can upload documents" on storage.objects;
create policy "Owners can upload documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can read documents" on storage.objects;
create policy "Owners can read documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update documents" on storage.objects;
create policy "Owners can update documents"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete documents" on storage.objects;
create policy "Owners can delete documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

create or replace function public.create_manual_order(
  p_shop_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_items jsonb,
  p_status public.order_status default 'pending'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_customer_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_product record;
  v_quantity integer;
  v_total numeric(12, 2) := 0;
begin
  v_owner_id := auth.uid();

  if v_owner_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1 from public.shops
    where id = p_shop_id
      and owner_id = v_owner_id
  ) then
    raise exception 'Shop not found';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one order item is required';
  end if;

  insert into public.customers (shop_id, name, phone, address)
  values (p_shop_id, trim(p_customer_name), trim(p_customer_phone), trim(p_customer_address))
  on conflict (shop_id, phone)
  do update set
    name = excluded.name,
    address = excluded.address,
    updated_at = now()
  returning id into v_customer_id;

  insert into public.orders (shop_id, customer_id, status)
  values (p_shop_id, v_customer_id, p_status)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Order item quantity must be greater than zero';
    end if;

    select id, price, stock_count
    into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
      and shop_id = p_shop_id
      and status = 'active'
    for update;

    if v_product.id is null then
      raise exception 'Product not found or inactive';
    end if;

    if v_product.stock_count < v_quantity then
      raise exception 'Insufficient stock';
    end if;

    update public.products
    set stock_count = stock_count - v_quantity
    where id = v_product.id;

    insert into public.order_items (
      shop_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      line_total
    )
    values (
      p_shop_id,
      v_order_id,
      v_product.id,
      v_quantity,
      v_product.price,
      v_product.price * v_quantity
    );

    v_total := v_total + (v_product.price * v_quantity);
  end loop;

  update public.orders
  set total_amount = v_total
  where id = v_order_id;

  return v_order_id;
end;
$$;

create or replace function public.create_chat_order(
  p_shop_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_items jsonb,
  p_status public.order_status default 'pending'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_product record;
  v_quantity integer;
  v_total numeric(12, 2) := 0;
begin
  if not exists (
    select 1 from public.shops
    where id = p_shop_id
  ) then
    raise exception 'Shop not found';
  end if;

  if trim(coalesce(p_customer_name, '')) = '' then
    raise exception 'Customer name is required';
  end if;

  if trim(coalesce(p_customer_phone, '')) = '' then
    raise exception 'Customer phone is required';
  end if;

  if trim(coalesce(p_customer_address, '')) = '' then
    raise exception 'Customer address is required';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one order item is required';
  end if;

  insert into public.customers (shop_id, name, phone, address)
  values (p_shop_id, trim(p_customer_name), trim(p_customer_phone), trim(p_customer_address))
  on conflict (shop_id, phone)
  do update set
    name = excluded.name,
    address = excluded.address,
    updated_at = now()
  returning id into v_customer_id;

  insert into public.orders (shop_id, customer_id, status)
  values (p_shop_id, v_customer_id, p_status)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Order item quantity must be greater than zero';
    end if;

    select id, price, stock_count
    into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
      and shop_id = p_shop_id
      and status = 'active'
    for update;

    if v_product.id is null then
      raise exception 'Product not found or inactive';
    end if;

    if v_product.stock_count < v_quantity then
      raise exception 'Insufficient stock';
    end if;

    update public.products
    set stock_count = stock_count - v_quantity
    where id = v_product.id;

    insert into public.order_items (
      shop_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      line_total
    )
    values (
      p_shop_id,
      v_order_id,
      v_product.id,
      v_quantity,
      v_product.price,
      v_product.price * v_quantity
    );

    v_total := v_total + (v_product.price * v_quantity);
  end loop;

  update public.orders
  set total_amount = v_total
  where id = v_order_id;

  return v_order_id;
end;
$$;

create or replace function public.search_document_chunks(
  p_shop_id uuid,
  p_query_embedding vector(768),
  p_match_count integer default 5,
  p_match_threshold float default 0.7
)
returns table (
  id uuid,
  content text,
  document_id uuid,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
    select
      dc.id,
      dc.content,
      dc.document_id,
      1 - (dc.embedding <=> p_query_embedding) as similarity
    from public.document_chunks dc
    where dc.shop_id = p_shop_id
      and dc.embedding is not null
      and 1 - (dc.embedding <=> p_query_embedding) > p_match_threshold
    order by dc.embedding <=> p_query_embedding
    limit p_match_count;
end;
$$;

grant execute on function public.create_manual_order(
  uuid,
  text,
  text,
  text,
  jsonb,
  public.order_status
) to authenticated;

grant execute on function public.create_chat_order(
  uuid,
  text,
  text,
  text,
  jsonb,
  public.order_status
) to service_role;

grant execute on function public.search_document_chunks(
  uuid,
  vector(768),
  integer,
  float
) to authenticated, service_role;

notify pgrst, 'reload schema';
