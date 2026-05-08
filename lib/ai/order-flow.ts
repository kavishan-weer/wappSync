import type { SupabaseClient } from "@supabase/supabase-js";

import type { AIDecision } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type MissingField = "product" | "quantity" | "name" | "address";

type PendingOrderState = {
  status: "collecting";
  productQuery: string | null;
  productId: string | null;
  productName: string | null;
  quantity: number | null;
  customerName: string | null;
  phone: string | null;
  address: string | null;
  lastAsked: MissingField | null;
};

type ExtractedOrderDetails = {
  productQuery: string | null;
  quantity: number | null;
  customerName: string | null;
  phone: string | null;
  address: string | null;
};

type OrderProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_count: number;
};

type ConversationMemoryMessage = {
  direction: string;
  sender_type: string;
  content: string;
};

const emptyState = (customerPhone: string): PendingOrderState => ({
  status: "collecting",
  productQuery: null,
  productId: null,
  productName: null,
  quantity: null,
  customerName: null,
  phone: customerPhone,
  address: null,
  lastAsked: null,
});

export async function shouldResumeOrderFlow(
  supabase: SupabaseClient,
  conversationId: string,
  message: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("conversations")
    .select("pending_order_state")
    .eq("id", conversationId)
    .maybeSingle();

  if (data?.pending_order_state) return true;

  if (isOrderIntent(message)) return true;

  const memory = await loadConversationMemory(supabase, conversationId);
  const recentMessages = memory.slice(-6);

  return recentMessages.some((item) => isOrderCollectionPrompt(item.content));
}

export async function handleOrderCreation(
  supabase: SupabaseClient,
  shopId: string,
  conversationId: string,
  customerPhone: string,
  message: string,
  confidence: "high" | "medium" | "low",
): Promise<AIDecision> {
  const products = await loadProducts(supabase, shopId);
  const currentState = await loadPendingOrderState(
    supabase,
    conversationId,
    customerPhone,
    products,
  );
  const details = await extractOrderDetails(message, currentState, products);
  const state = mergeOrderState(currentState, details);

  const productDecision = resolveProduct(state, products, message);

  if (productDecision.status === "unclear") {
    await clearPendingOrderState(supabase, conversationId);
    return {
      intent: "order_creation",
      confidence,
      reply:
        "I couldn't confidently match that product to the catalog. Let me connect you with the shop owner so they can help you place the order correctly. 😊",
      shouldEscalate: true,
      reasoning: productDecision.reason,
    };
  }

  if (productDecision.status === "missing") {
    state.lastAsked = "product";
    await savePendingOrderState(supabase, conversationId, state);
    return askFor("product", confidence, "Order started but product is missing");
  }

  const product = productDecision.product;
  state.productId = product.id;
  state.productName = product.name;
  state.productQuery = product.name;

  if (product.stock_count <= 0) {
    await clearPendingOrderState(supabase, conversationId);
    return {
      intent: "order_creation",
      confidence,
      reply: `${product.name} is currently out of stock. Let me connect you with the shop owner for the best alternative. 😊`,
      shouldEscalate: true,
      reasoning: `Product ${product.id} is out of stock`,
    };
  }

  if (!state.quantity) {
    state.lastAsked = "quantity";
    await savePendingOrderState(supabase, conversationId, state);
    return askFor(
      "quantity",
      confidence,
      `Product ${product.id} selected but quantity is missing`,
    );
  }

  if (state.quantity > product.stock_count) {
    state.quantity = null;
    state.lastAsked = "quantity";
    await savePendingOrderState(supabase, conversationId, state);
    return {
      intent: "order_creation",
      confidence,
      reply: `Sorry, we only have ${product.stock_count} of ${product.name} in stock. How many would you like to order?`,
      shouldEscalate: false,
      reasoning: `Requested quantity exceeds stock for product ${product.id}`,
    };
  }

  if (!state.customerName) {
    state.lastAsked = "name";
    await savePendingOrderState(supabase, conversationId, state);
    return askFor("name", confidence, "Order customer name is missing");
  }

  if (!state.address) {
    state.lastAsked = "address";
    await savePendingOrderState(supabase, conversationId, state);
    return askFor("address", confidence, "Order delivery address is missing");
  }

  const { data: currencySetting } = await supabase
    .from("shop_settings")
    .select("default_currency")
    .eq("shop_id", shopId)
    .maybeSingle();

  const currency = currencySetting?.default_currency ?? "LKR";
  const total = Number(product.price) * state.quantity;

  const { data: orderId, error } = await supabase.rpc("create_chat_order", {
    p_shop_id: shopId,
    p_customer_name: state.customerName,
    p_customer_phone: state.phone ?? customerPhone,
    p_customer_address: state.address,
    p_items: [{ product_id: product.id, quantity: state.quantity }],
    p_status: "pending",
  });

  if (error) {
    if (error.message.toLowerCase().includes("insufficient stock")) {
      state.quantity = null;
      state.lastAsked = "quantity";
      await savePendingOrderState(supabase, conversationId, state);
      return {
        intent: "order_creation",
        confidence,
        reply:
          "Sorry, stock changed while creating the order. Could you send the quantity again so I can recheck it?",
        shouldEscalate: false,
        reasoning: "Stock validation failed inside create_chat_order",
      };
    }

    if (error.message.toLowerCase().includes("schema cache")) {
      await savePendingOrderState(supabase, conversationId, state);
      return {
        intent: "order_creation",
        confidence,
        reply:
          "I have your order details, but I can't create the order automatically just yet. Let me connect you with the shop owner to confirm it. 😊",
        shouldEscalate: true,
        reasoning: `create_chat_order RPC is missing from Supabase schema cache: ${error.message}`,
      };
    }

    await clearPendingOrderState(supabase, conversationId);
    return {
      intent: "order_creation",
      confidence,
      reply:
        "I couldn't safely create the order right now. Let me connect you with the shop owner so they can help. 😊",
      shouldEscalate: true,
      reasoning: `create_chat_order failed: ${error.message}`,
    };
  }

  await clearPendingOrderState(supabase, conversationId);

  return {
    intent: "order_creation",
    confidence,
    reply: `Done! Your order has been created. 🛍️\n\nOrder: ${String(orderId).slice(0, 8)}\nProduct: ${product.name}\nQuantity: ${state.quantity}\nTotal: ${currency} ${total.toFixed(2)}\nDelivery to: ${state.address}\n\nThe shop will confirm and process it shortly.`,
    shouldEscalate: false,
    reasoning: `Created chat order ${orderId} for product ${product.id}`,
  };
}

async function loadPendingOrderState(
  supabase: SupabaseClient,
  conversationId: string,
  customerPhone: string,
  products: OrderProduct[],
) {
  const { data } = await supabase
    .from("conversations")
    .select("pending_order_state")
    .eq("id", conversationId)
    .maybeSingle();

  const stored = data?.pending_order_state as Partial<PendingOrderState> | null;

  if (stored && stored.status === "collecting") {
    return {
      ...emptyState(customerPhone),
      ...stored,
      phone: stored.phone ?? customerPhone,
    };
  }

  return rebuildOrderStateFromMemory(
    await loadConversationMemory(supabase, conversationId),
    customerPhone,
    products,
  );
}

async function savePendingOrderState(
  supabase: SupabaseClient,
  conversationId: string,
  state: PendingOrderState,
) {
  await supabase
    .from("conversations")
    .update({ pending_order_state: state })
    .eq("id", conversationId);
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

async function loadProducts(supabase: SupabaseClient, shopId: string) {
  const { data } = await supabase
    .from("products")
    .select("id, name, description, price, stock_count")
    .eq("shop_id", shopId)
    .eq("status", "active")
    .order("name", { ascending: true })
    .limit(100);

  return (data ?? []) as OrderProduct[];
}

async function loadConversationMemory(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data } = await supabase
    .from("messages")
    .select("direction, sender_type, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(12);

  return ((data ?? []) as ConversationMemoryMessage[]).reverse();
}

function rebuildOrderStateFromMemory(
  messages: ConversationMemoryMessage[],
  customerPhone: string,
  products: OrderProduct[],
) {
  let state = emptyState(customerPhone);

  for (const item of messages) {
    if (item.sender_type === "ai" && item.direction === "outbound") {
      state = {
        ...state,
        lastAsked: inferAskedField(item.content) ?? state.lastAsked,
      };
      continue;
    }

    if (item.sender_type !== "customer" || item.direction !== "inbound") {
      continue;
    }

    state = mergeOrderState(
      state,
      extractOrderDetailsHeuristically(item.content, state, products),
    );

    if (isOrderIntent(item.content) && !state.lastAsked) {
      state.lastAsked = "product";
    }
  }

  return state;
}

function mergeOrderState(
  state: PendingOrderState,
  details: ExtractedOrderDetails,
): PendingOrderState {
  return {
    ...state,
    productQuery: details.productQuery ?? state.productQuery,
    quantity: details.quantity ?? state.quantity,
    customerName: details.customerName ?? state.customerName,
    phone: details.phone ?? state.phone,
    address: details.address ?? state.address,
  };
}

function resolveProduct(
  state: PendingOrderState,
  products: OrderProduct[],
  message: string,
):
  | { status: "matched"; product: OrderProduct }
  | { status: "missing" }
  | { status: "unclear"; reason: string } {
  if (state.productId) {
    const product = products.find((item) => item.id === state.productId);
    if (product) return { status: "matched", product };
  }

  const searchText = state.productQuery ?? message;
  const matches = findProductMatches(searchText, products);

  if (matches.length === 1) {
    return { status: "matched", product: matches[0] };
  }

  if (state.productQuery && matches.length === 0) {
    return {
      status: "unclear",
      reason: `No product matched "${state.productQuery}"`,
    };
  }

  if (matches.length > 1) {
    return {
      status: "unclear",
      reason: `Multiple products matched "${searchText}": ${matches
        .map((item) => item.name)
        .join(", ")}`,
    };
  }

  return { status: "missing" };
}

function findProductMatches(query: string, products: OrderProduct[]) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return [];

  const exactMatches = products.filter(
    (product) => normalize(product.name) === normalizedQuery,
  );

  if (exactMatches.length > 0) return exactMatches;

  return products.filter((product) => {
    const name = normalize(product.name);
    return normalizedQuery.includes(name) || name.includes(normalizedQuery);
  });
}

async function extractOrderDetails(
  message: string,
  state: PendingOrderState,
  products: OrderProduct[],
): Promise<ExtractedOrderDetails> {
  const heuristicDetails = extractOrderDetailsHeuristically(message, state, products);
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return heuristicDetails;
  }

  try {
    const productNames = products.map((product) => product.name).join(", ");
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Extract order details from a WhatsApp message. Return only JSON. Use null for fields not explicitly present. Do not invent data.",
          },
          {
            role: "user",
            content: `Known products: ${productNames || "none"}
Previously asked field: ${state.lastAsked ?? "none"}
Message: "${message}"

Return this exact shape:
{"productQuery": string|null, "quantity": number|null, "customerName": string|null, "phone": string|null, "address": string|null}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return heuristicDetails;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content) as Partial<ExtractedOrderDetails>;

    return normalizeExtractedDetails(message, state, products, {
      productQuery: cleanText(parsed.productQuery) ?? heuristicDetails.productQuery,
      quantity: parsePositiveInteger(parsed.quantity) ?? heuristicDetails.quantity,
      customerName: cleanText(parsed.customerName) ?? heuristicDetails.customerName,
      phone: cleanText(parsed.phone) ?? heuristicDetails.phone,
      address: cleanText(parsed.address) ?? heuristicDetails.address,
    });
  } catch (error) {
    console.error("[ai] Order detail extraction failed:", error);
    return heuristicDetails;
  }
}

function extractOrderDetailsHeuristically(
  message: string,
  state: PendingOrderState,
  products: OrderProduct[],
): ExtractedOrderDetails {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const phone = trimmed.match(/\+?\d[\d\s-]{6,}\d/)?.[0]?.replace(/\s|-/g, "") ?? null;
  const quantity =
    state.lastAsked === "quantity"
      ? extractQuantityAnswer(trimmed)
      : extractExplicitQuantity(trimmed);
  const productQuery =
    products.find((product) => lower.includes(product.name.toLowerCase()))?.name ??
    (state.lastAsked === "product" ? cleanText(trimmed) : null);
  const customerName =
    extractNamedValue(trimmed, ["my name is", "name is", "i am", "i'm", "im"]) ??
    (state.lastAsked === "name" ? cleanText(trimmed) : null);
  const address =
    extractNamedValue(trimmed, [
      "address is",
      "my address is",
      "deliver to",
      "delivery address is",
      "send to",
    ]) ?? (state.lastAsked === "address" ? cleanText(trimmed) : null);

  return normalizeExtractedDetails(message, state, products, {
    productQuery,
    quantity,
    customerName,
    phone,
    address,
  });
}

function normalizeExtractedDetails(
  message: string,
  state: PendingOrderState,
  products: OrderProduct[],
  details: ExtractedOrderDetails,
): ExtractedOrderDetails {
  const explicitProduct = findMentionedProduct(message, products)?.name ?? null;
  const explicitQuantity = extractExplicitQuantity(message);
  const explicitName = extractNamedValue(message, [
    "my name is",
    "name is",
    "i am",
    "i'm",
    "im",
  ]);
  const explicitAddress = extractNamedValue(message, [
    "address is",
    "my address is",
    "deliver to",
    "delivery address is",
    "send to",
  ]);

  return {
    productQuery:
      explicitProduct ??
      (state.lastAsked === "product" ? details.productQuery : null),
    quantity:
      explicitQuantity ??
      (state.lastAsked === "quantity" ? details.quantity : null),
    customerName:
      explicitName ?? (state.lastAsked === "name" ? details.customerName : null),
    phone: details.phone,
    address:
      explicitAddress ??
      (state.lastAsked === "address" ? details.address : null),
  };
}

function findMentionedProduct(message: string, products: OrderProduct[]) {
  const lower = message.toLowerCase();

  return products.find((product) => lower.includes(product.name.toLowerCase()));
}

function extractExplicitQuantity(message: string) {
  const patterns = [
    /\b(?:qty|quantity)\s*[:=-]?\s*(\d+)\b/i,
    /\b(\d+)\s*(?:pcs|pieces|items|units)\b/i,
    /\bx\s*(\d+)\b/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    const quantity = parsePositiveInteger(match?.[1]);
    if (quantity) return quantity;
  }

  return null;
}

function extractQuantityAnswer(message: string) {
  const explicitQuantity = extractExplicitQuantity(message);

  if (explicitQuantity) return explicitQuantity;

  const standaloneNumbers = [...message.matchAll(/\b([1-9]\d{0,2})\b/g)]
    .map((match) => parsePositiveInteger(match[1]))
    .filter((value): value is number => Boolean(value));

  if (standaloneNumbers.length === 1) {
    return standaloneNumbers[0];
  }

  return null;
}

function extractNamedValue(message: string, prefixes: string[]) {
  const lower = message.toLowerCase();

  for (const prefix of prefixes) {
    const index = lower.indexOf(prefix);
    if (index >= 0) {
      return cleanText(message.slice(index + prefix.length));
    }
  }

  return null;
}

function askFor(
  field: MissingField,
  confidence: "high" | "medium" | "low",
  reasoning: string,
): AIDecision {
  const replies: Record<MissingField, string> = {
    product: "Sure, I can help you place an order. Which product would you like?",
    quantity: "Great. How many would you like to order?",
    name: "Almost there. What name should I put on the order?",
    address: "Thanks. What delivery address should I use?",
  };

  return {
    intent: "order_creation",
    confidence,
    reply: replies[field],
    shouldEscalate: false,
    reasoning,
  };
}

function inferAskedField(message: string): MissingField | null {
  const normalized = normalize(message);

  if (
    normalized.includes("which product") ||
    normalized.includes("what product") ||
    normalized.includes("product would you like")
  ) {
    return "product";
  }

  if (
    normalized.includes("how many") ||
    normalized.includes("quantity") ||
    normalized.includes("how much would you like")
  ) {
    return "quantity";
  }

  if (
    normalized.includes("what name") ||
    normalized.includes("put on the order") ||
    normalized.includes("full name")
  ) {
    return "name";
  }

  if (
    normalized.includes("delivery address") ||
    normalized.includes("what address") ||
    normalized.includes("address should i use")
  ) {
    return "address";
  }

  return null;
}

function isOrderCollectionPrompt(message: string) {
  return inferAskedField(message) !== null;
}

function isOrderIntent(message: string) {
  const normalized = normalize(message);

  if (isOrderStatusIntent(normalized)) {
    return false;
  }

  const orderWords = [
    "buy",
    "purchase",
    "place an order",
    "want to order",
    "need to order",
    "send me one",
    "send me 1",
    "take one",
    "take 1",
  ];

  return orderWords.some((word) => normalized.includes(word));
}

function isOrderStatusIntent(normalizedMessage: string) {
  return (
    normalizedMessage.includes("status") ||
    normalizedMessage.includes("track") ||
    normalizedMessage.includes("where is my order") ||
    normalizedMessage.includes("wheres my order") ||
    normalizedMessage.includes("order update") ||
    normalizedMessage.includes("ordered previously") ||
    normalizedMessage.includes("previous order")
  );
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function parsePositiveInteger(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? "").trim(), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) return null;

  return parsed;
}
