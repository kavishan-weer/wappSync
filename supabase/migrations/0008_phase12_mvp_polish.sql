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

create index if not exists app_logs_shop_created_idx
  on public.app_logs(shop_id, created_at desc);

create index if not exists app_logs_conversation_created_idx
  on public.app_logs(conversation_id, created_at desc);

alter table public.app_logs enable row level security;

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

notify pgrst, 'reload schema';
