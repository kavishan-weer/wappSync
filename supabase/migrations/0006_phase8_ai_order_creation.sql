-- Phase 8: AI Order Creation Flow
-- Adds pending order state to conversations and an atomic chat order RPC.

alter table public.conversations
  add column if not exists pending_order_state jsonb;

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

notify pgrst, 'reload schema';
