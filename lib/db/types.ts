export type Shop = {
  id: string;
  owner_id: string;
  name: string;
  business_type: string | null;
  whatsapp_number: string | null;
  created_at: string;
  updated_at: string;
};

export type ShopSettings = {
  id: string;
  shop_id: string;
  default_currency: string;
  order_prefix: string;
  low_stock_alert_threshold: number;
};

export type ProductStatus = "active" | "inactive";

export type Product = {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  stock_count: number;
  category: string | null;
  tags: string[];
  status: ProductStatus;
  created_at: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export type ProductImage = {
  id: string;
  shop_id: string;
  product_id: string;
  storage_path: string;
  public_url: string | null;
  alt_text: string | null;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  shop_id: string;
  product_id: string;
  name: string;
  value: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Customer = {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  address: string;
};

export type Order = {
  id: string;
  shop_id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  customers?: Customer;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  shop_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  products?: Pick<Product, "id" | "name">;
};
