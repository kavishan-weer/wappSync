-- wappSync demo seed data
-- Run after creating at least one shop.
-- This script is rerunnable and seeds the first shop in public.shops.

do $$
declare
  v_shop_id uuid;
  v_customer_id uuid;
  v_product_id uuid;
  v_order_id uuid;
begin
  select id into v_shop_id
  from public.shops
  order by created_at asc
  limit 1;

  if v_shop_id is null then
    raise notice 'No shop found. Create a shop first, then rerun seed_demo.sql.';
    return;
  end if;

  insert into public.shop_settings (
    shop_id,
    default_currency,
    order_prefix,
    low_stock_alert_threshold,
    automation_enabled,
    owner_alert_phone,
    fallback_message,
    business_hours_enabled,
    business_hours_start,
    business_hours_end,
    business_hours_timezone
  )
  values (
    v_shop_id,
    'LKR',
    'ORD',
    5,
    true,
    null,
    'Thanks for your message. I want to make sure you get the right answer, so I''m connecting you with the shop owner. 😊',
    false,
    '09:00',
    '17:00',
    'Asia/Colombo'
  )
  on conflict (shop_id) do nothing;

  insert into public.products (
    shop_id,
    name,
    description,
    price,
    stock_count,
    category,
    tags,
    status
  )
  select
    v_shop_id,
    product.name,
    product.description,
    product.price,
    product.stock_count,
    product.category,
    product.tags,
    'active'::public.product_status
  from (
    values
      (
        'Classic Cotton T-Shirt',
        'Soft everyday cotton t-shirt available in basic colors.',
        2500.00::numeric,
        24,
        'Clothing',
        array['t-shirt', 'cotton', 'casual']::text[]
      ),
      (
        'Linen Summer Dress',
        'Light linen dress suitable for warm weather and casual outings.',
        6900.00::numeric,
        8,
        'Clothing',
        array['dress', 'linen', 'summer']::text[]
      ),
      (
        'Canvas Tote Bag',
        'Durable reusable tote bag with reinforced handles.',
        1800.00::numeric,
        18,
        'Accessories',
        array['bag', 'canvas', 'tote']::text[]
      )
  ) as product(name, description, price, stock_count, category, tags)
  where not exists (
    select 1 from public.products
    where products.shop_id = v_shop_id
      and products.name = product.name
  );

  insert into public.customers (shop_id, name, phone, address)
  values (
    v_shop_id,
    'Demo Customer',
    '94770000001',
    '123 Demo Street, Colombo'
  )
  on conflict (shop_id, phone)
  do update set
    name = excluded.name,
    address = excluded.address,
    updated_at = now()
  returning id into v_customer_id;

  select id into v_product_id
  from public.products
  where shop_id = v_shop_id
    and name = 'Classic Cotton T-Shirt'
  limit 1;

  if v_product_id is null then
    raise notice 'Demo product was not found. Skipping demo order.';
    return;
  end if;

  if not exists (
    select 1
    from public.orders
    where shop_id = v_shop_id
      and customer_id = v_customer_id
      and status in ('pending', 'confirmed', 'packed', 'shipped')
  ) then
    insert into public.orders (shop_id, customer_id, status, total_amount)
    values (v_shop_id, v_customer_id, 'confirmed', 5000.00)
    returning id into v_order_id;

    insert into public.order_items (
      shop_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      line_total
    )
    values (
      v_shop_id,
      v_order_id,
      v_product_id,
      2,
      2500.00,
      5000.00
    );
  end if;

  raise notice 'Demo data is ready for shop %.', v_shop_id;
end $$;
