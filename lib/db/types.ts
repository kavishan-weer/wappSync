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

// ── Phase 4: WhatsApp types ──────────────────────────────────────

export type WhatsAppAccount = {
  id: string;
  shop_id: string;
  phone_number_id: string;
  waba_id: string | null;
  access_token: string;
  verify_token: string;
  display_phone: string | null;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
};

export type ConversationStatus =
  | "active"
  | "needs_attention"
  | "resolved"
  | "closed";

export type Conversation = {
  id: string;
  shop_id: string;
  customer_phone: string;
  customer_name: string | null;
  status: ConversationStatus;
  automation_paused: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageDirection = "inbound" | "outbound";

export type MessageStatus = "sent" | "delivered" | "read" | "failed";

export type SenderType = "customer" | "ai" | "owner";

export type Message = {
  id: string;
  shop_id: string;
  conversation_id: string;
  direction: MessageDirection;
  content: string;
  wa_message_id: string | null;
  status: MessageStatus;
  sender_type: SenderType;
  created_at: string;
};

// ── Phase 7: RAG types ───────────────────────────────────────────

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

export type Document = {
  id: string;
  shop_id: string;
  name: string;
  file_path: string;
  file_size: number;
  status: DocumentStatus;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentChunk = {
  id: string;
  shop_id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  created_at: string;
};
