-- Phase 4: WhatsApp Cloud API Integration
-- Tables: whatsapp_accounts, conversations, messages

-- whatsapp_accounts: one per shop, stores Meta Cloud API credentials
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

-- conversations: one thread per customer phone per shop
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_phone text not null,
  customer_name text,
  status text not null default 'active'
    check (status in ('active', 'needs_attention', 'resolved', 'closed')),
  automation_paused boolean not null default false,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_shop_phone_unique unique (shop_id, customer_phone)
);

-- messages: individual inbound/outbound messages
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

-- Indexes
create index if not exists whatsapp_accounts_phone_number_id_idx
  on public.whatsapp_accounts(phone_number_id);
create index if not exists conversations_shop_id_idx
  on public.conversations(shop_id, last_message_at desc);
create index if not exists conversations_shop_phone_idx
  on public.conversations(shop_id, customer_phone);
create index if not exists messages_conversation_id_idx
  on public.messages(conversation_id, created_at asc);
create index if not exists messages_wa_message_id_idx
  on public.messages(wa_message_id);

-- RLS
alter table public.whatsapp_accounts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- whatsapp_accounts policies
create policy "Owners can manage their whatsapp accounts"
  on public.whatsapp_accounts
  for all
  to authenticated
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

-- conversations policies
create policy "Owners can manage their conversations"
  on public.conversations
  for all
  to authenticated
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

-- messages policies
create policy "Owners can manage their messages"
  on public.messages
  for all
  to authenticated
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

-- Service role bypass policies for webhook writes
-- The webhook endpoint uses the service role key, which bypasses RLS by default.
-- No additional policies needed for service role.

-- Triggers for updated_at
drop trigger if exists set_whatsapp_accounts_updated_at on public.whatsapp_accounts;
create trigger set_whatsapp_accounts_updated_at
  before update on public.whatsapp_accounts
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
  before update on public.conversations
  for each row
  execute function public.set_updated_at();
