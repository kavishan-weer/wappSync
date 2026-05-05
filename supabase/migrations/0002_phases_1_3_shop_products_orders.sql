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

alter table public.owner_profiles
  add column if not exists full_name text;

alter table public.shops
  add column if not exists business_type text,
  add column if not exists whatsapp_number text;

create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null unique references public.shops(id) on delete cascade,
  default_currency text not null default 'LKR',
  order_prefix text not null default 'ORD',
  low_stock_alert_threshold integer not null default 5 check (low_stock_alert_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  created_at timestamptz not null default now()
);

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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  status public.order_status not null default 'pending',
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists products_shop_id_idx on public.products(shop_id);
create index if not exists products_shop_search_idx on public.products(shop_id, name);
create index if not exists orders_shop_created_idx on public.orders(shop_id, created_at desc);
create index if not exists customers_shop_phone_idx on public.customers(shop_id, phone);

alter table public.shop_settings enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Owners can manage their shop settings"
  on public.shop_settings
  for all
  to authenticated
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

create policy "Owners can manage their products"
  on public.products
  for all
  to authenticated
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

create policy "Owners can manage their product images"
  on public.product_images
  for all
  to authenticated
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

create policy "Owners can manage their product variants"
  on public.product_variants
  for all
  to authenticated
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

create policy "Owners can manage their customers"
  on public.customers
  for all
  to authenticated
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

create policy "Owners can manage their orders"
  on public.orders
  for all
  to authenticated
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

create policy "Owners can manage their order items"
  on public.order_items
  for all
  to authenticated
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

drop trigger if exists set_shop_settings_updated_at on public.shop_settings;
create trigger set_shop_settings_updated_at
  before update on public.shop_settings
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Owners can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

create policy "Owners can update product images"
  on storage.objects
  for update
  to authenticated
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

create policy "Owners can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

create policy "Product images are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');

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
