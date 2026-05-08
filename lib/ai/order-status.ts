import type { SupabaseClient } from "@supabase/supabase-js";

import type { AIDecision } from "./types";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

type CustomerRecord = {
  id: string;
  name: string;
};

type StatusOrder = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items?: {
    quantity: number;
    products?: {
      name: string;
    } | { name: string }[] | null;
  }[];
};

type ConversationMessage = {
  direction: string;
  sender_type: string;
  content: string;
};

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
];

const STATUS_COPY: Record<OrderStatus, string> = {
  pending: "pending and waiting for confirmation",
  confirmed: "confirmed and ready for processing",
  packed: "packed and getting ready for delivery",
  shipped: "shipped and on the way",
  delivered: "marked as delivered",
  cancelled: "cancelled",
};

export function isOrderStatusQuestion(message: string) {
  const normalized = message.toLowerCase();

  return (
    /\bstatus\b/.test(normalized) ||
    /\btrack(?:ing)?\b/.test(normalized) ||
    /\bwhere(?:'s| is)?\s+(?:my\s+)?order\b/.test(normalized) ||
    /\border\s+(?:update|details|progress)\b/.test(normalized) ||
    /\bi\s+ordered\s+previously\b/.test(normalized) ||
    /\bprevious\s+order\b/.test(normalized)
  );
}

export async function shouldResumeOrderStatusFlow(
  supabase: SupabaseClient,
  conversationId: string,
  message: string,
): Promise<boolean> {
  if (!looksLikeOrderSelection(message)) return false;

  const memory = await loadRecentMessages(supabase, conversationId);

  return memory.some(
    (item) =>
      item.direction === "outbound" &&
      item.sender_type === "ai" &&
      isOrderChoicePrompt(item.content),
  );
}

export async function handleOrderStatus(
  supabase: SupabaseClient,
  shopId: string,
  conversationId: string,
  customerPhone: string,
  message: string,
  confidence: "high" | "medium" | "low",
): Promise<AIDecision> {
  await clearPendingOrderState(supabase, conversationId);

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name")
    .eq("shop_id", shopId)
    .eq("phone", customerPhone)
    .maybeSingle();

  if (customerError) {
    return {
      intent: "order_status",
      confidence,
      reply:
        "I couldn't check your order safely right now. Let me connect you with the shop owner for help. 😊",
      shouldEscalate: true,
      reasoning: `Customer lookup failed for phone ${customerPhone}: ${customerError.message}`,
    };
  }

  if (!customer) {
    return {
      intent: "order_status",
      confidence,
      reply:
        "I couldn't find any orders linked to this WhatsApp number. If you ordered using another number, please send that order ID or contact the shop owner. 😊",
      shouldEscalate: false,
      reasoning: "No customer record found for this shop-scoped phone number",
    };
  }

  const activeOrders = await loadActiveOrders(supabase, shopId, customer.id);

  if (activeOrders.error) {
    return {
      intent: "order_status",
      confidence,
      reply:
        "I couldn't check your order safely right now. Let me connect you with the shop owner for help. 😊",
      shouldEscalate: true,
      reasoning: `Order lookup failed for customer ${customer.id}: ${activeOrders.error}`,
    };
  }

  if (activeOrders.orders.length === 0) {
    return {
      intent: "order_status",
      confidence,
      reply:
        "I couldn't find an active order linked to this WhatsApp number right now. If you have an order ID, please send it and the shop owner can check it for you. 😊",
      shouldEscalate: false,
      reasoning: `No active orders found for customer ${customer.id}`,
    };
  }

  const selectedOrder = selectOrderFromMessage(message, activeOrders.orders);

  if (selectedOrder) {
    return {
      intent: "order_status",
      confidence,
      reply: buildStatusReply(customer, selectedOrder),
      shouldEscalate: false,
      reasoning: `Customer selected active order ${selectedOrder.id}`,
    };
  }

  if (activeOrders.orders.length === 1) {
    return {
      intent: "order_status",
      confidence,
      reply: buildStatusReply(customer, activeOrders.orders[0]),
      shouldEscalate: false,
      reasoning: `Returned single active order ${activeOrders.orders[0].id}`,
    };
  }

  return {
    intent: "order_status",
    confidence,
    reply: buildMultipleOrdersReply(activeOrders.orders),
    shouldEscalate: false,
    reasoning: `Found ${activeOrders.orders.length} active orders; asked customer to choose`,
  };
}

async function loadActiveOrders(
  supabase: SupabaseClient,
  shopId: string,
  customerId: string,
): Promise<{ orders: StatusOrder[]; error: string | null }> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at, order_items(quantity, products(name))")
    .eq("shop_id", shopId)
    .eq("customer_id", customerId)
    .in("status", ACTIVE_ORDER_STATUSES)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return { orders: [], error: error.message };
  }

  return {
    orders: (data ?? []) as unknown as StatusOrder[],
    error: null,
  };
}

async function loadRecentMessages(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data } = await supabase
    .from("messages")
    .select("direction, sender_type, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(6);

  return (data ?? []) as ConversationMessage[];
}

async function clearPendingOrderState(
  supabase: SupabaseClient,
  conversationId: string,
) {
  await supabase
    .from("conversations")
    .update({ pending_order_state: null })
    .eq("id", conversationId);
}

function buildStatusReply(customer: CustomerRecord, order: StatusOrder) {
  const shortId = shortOrderId(order.id);
  const itemSummary = summarizeItems(order);

  return `Hi ${customer.name}! Order #${shortId} is ${STATUS_COPY[order.status]}. 📦\n\n${itemSummary}\nPlaced: ${formatDate(order.created_at)}\nTotal: ${formatAmount(order.total_amount)}\n\nI'll keep using only this WhatsApp number to check your orders.`;
}

function buildMultipleOrdersReply(orders: StatusOrder[]) {
  const orderLines = orders
    .map((order, index) => {
      const itemSummary = summarizeItems(order);
      return `${index + 1}. #${shortOrderId(order.id)} - ${STATUS_COPY[order.status]} - ${itemSummary}`;
    })
    .join("\n");

  return `I found a few active orders linked to this WhatsApp number. Which one should I check? 😊\n\n${orderLines}\n\nReply with the number or order ID.`;
}

function selectOrderFromMessage(message: string, orders: StatusOrder[]) {
  const normalized = message.trim().toLowerCase();
  const numberMatch = normalized.match(/(?:^|\s|#)([1-5])(?:\s|$|\.)/);

  if (numberMatch) {
    const selectedIndex = Number(numberMatch[1]) - 1;
    return orders[selectedIndex] ?? null;
  }

  const compactMessage = normalized.replace(/[^a-z0-9]/g, "");

  return (
    orders.find((order) => {
      const fullId = order.id.replace(/-/g, "").toLowerCase();
      return (
        compactMessage.includes(fullId) ||
        compactMessage.includes(fullId.slice(0, 8))
      );
    }) ?? null
  );
}

function looksLikeOrderSelection(message: string) {
  const normalized = message.trim().toLowerCase();
  return (
    /^[1-5]$/.test(normalized) ||
    /^#?[a-f0-9]{8,}$/i.test(normalized) ||
    /\border\s*#?[a-f0-9]{8,}/i.test(normalized)
  );
}

function isOrderChoicePrompt(content: string) {
  const normalized = content.toLowerCase();
  return (
    normalized.includes("which one should i check") ||
    normalized.includes("reply with the number or order id")
  );
}

function summarizeItems(order: StatusOrder) {
  const items = order.order_items ?? [];

  if (items.length === 0) {
    return "Items: order details unavailable";
  }

  return `Items: ${items
    .map((item) => {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;
      const name = product?.name ?? "Product";
      return `${item.quantity} x ${name}`;
    })
    .join(", ")}`;
}

function shortOrderId(orderId: string) {
  return orderId.split("-")[0].toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatAmount(value: number) {
  return Number(value).toFixed(2);
}
