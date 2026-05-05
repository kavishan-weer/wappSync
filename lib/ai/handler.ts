import type { SupabaseClient } from "@supabase/supabase-js";

import { classifyIntent } from "./classify";
import { generateReply } from "./respond";
import { formatProductContext, formatOrderContext } from "./prompts";
import type { AIDecision, ProductContext } from "./types";

const ESCALATION_MESSAGE =
  "Thanks for your message! I'm not sure I can help with that right now. Let me connect you with the shop owner who will get back to you shortly. 😊";

const GREETING_REPLIES = [
  "Hi there! 👋 Welcome! How can I help you today?",
  "Hello! 😊 Welcome to our shop! What can I help you with?",
  "Hey! 👋 Thanks for reaching out. How can I assist you?",
];

/**
 * Handle an inbound message with AI.
 *
 * This is the main orchestrator:
 * 1. Classify the intent
 * 2. Fetch relevant data from the database
 * 3. Generate a response
 * 4. Decide whether to escalate
 *
 * @param supabase       - Service role Supabase client
 * @param shopId         - The shop receiving the message
 * @param shopName       - Shop name for personalization
 * @param customerPhone  - The customer's phone number
 * @param message        - The customer's message text
 * @returns An AIDecision with the reply and escalation decision
 */
export async function handleInboundMessage(
  supabase: SupabaseClient,
  shopId: string,
  shopName: string,
  customerPhone: string,
  message: string,
): Promise<AIDecision> {
  // Step 1: Classify
  const classification = await classifyIntent(message);

  console.log(
    `[ai] Intent: ${classification.intent} | Confidence: ${classification.confidence} | Query: ${classification.extractedQuery}`,
  );

  // Step 2: Handle based on intent
  switch (classification.intent) {
    case "greeting":
      return {
        intent: "greeting",
        confidence: classification.confidence,
        reply:
          GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)],
        shouldEscalate: false,
        reasoning: "Simple greeting detected",
      };

    case "product_question":
      return handleProductQuestion(
        supabase,
        shopId,
        shopName,
        message,
        classification.extractedQuery,
        classification.confidence,
      );

    case "order_status":
      return handleOrderStatus(
        supabase,
        shopId,
        shopName,
        customerPhone,
        message,
        classification.confidence,
      );

    case "order_creation":
      return {
        intent: "order_creation",
        confidence: classification.confidence,
        reply:
          "I'd love to help you place an order! 🛍️ Could you please tell me:\n\n1. Which product you'd like?\n2. How many?\n3. Your full name\n4. Your delivery address\n\nI'll get your order sorted right away!",
        shouldEscalate: false,
        reasoning:
          "Order creation intent detected, asking for details. Full AI order creation is in Phase 8.",
      };

    case "policy_question":
      return {
        intent: "policy_question",
        confidence: classification.confidence,
        reply:
          "Great question! Let me check our policies for you. 📋 I'll connect you with the shop owner who can give you the most accurate answer. One moment please!",
        shouldEscalate: true,
        reasoning:
          "Policy question detected. RAG not yet implemented (Phase 7), escalating to owner.",
      };

    case "unknown":
    default:
      return {
        intent: "unknown",
        confidence: "low",
        reply: ESCALATION_MESSAGE,
        shouldEscalate: true,
        reasoning: `Could not classify intent. Confidence: ${classification.confidence}`,
      };
  }
}

/**
 * Handle a product question by searching the product catalog.
 */
async function handleProductQuestion(
  supabase: SupabaseClient,
  shopId: string,
  shopName: string,
  message: string,
  extractedQuery: string | null,
  confidence: "high" | "medium" | "low",
): Promise<AIDecision> {
  // Search for products matching the query
  let query = supabase
    .from("products")
    .select("name, description, price, stock_count, status, category")
    .eq("shop_id", shopId)
    .eq("status", "active")
    .limit(5);

  if (extractedQuery) {
    query = query.ilike("name", `%${extractedQuery}%`);
  }

  const { data: products } = await query;
  const productList = (products ?? []) as ProductContext[];

  // If no products found by name, try fetching all active products
  if (productList.length === 0 && extractedQuery) {
    const { data: allProducts } = await supabase
      .from("products")
      .select("name, description, price, stock_count, status, category")
      .eq("shop_id", shopId)
      .eq("status", "active")
      .limit(10);

    const allList = (allProducts ?? []) as ProductContext[];
    const context = formatProductContext(allList);

    const reply = await generateReply(shopName, context, message, "product_question");

    return {
      intent: "product_question",
      confidence,
      reply,
      shouldEscalate: allList.length === 0,
      reasoning: `Product search for "${extractedQuery}" returned 0 results. Showed all ${allList.length} active products instead.`,
    };
  }

  const context = formatProductContext(productList);
  const reply = await generateReply(shopName, context, message, "product_question");

  return {
    intent: "product_question",
    confidence,
    reply,
    shouldEscalate: productList.length === 0,
    reasoning: `Found ${productList.length} matching products for query "${extractedQuery ?? "general"}"`,
  };
}

/**
 * Handle an order status query by looking up the customer's orders.
 */
async function handleOrderStatus(
  supabase: SupabaseClient,
  shopId: string,
  shopName: string,
  customerPhone: string,
  message: string,
  confidence: "high" | "medium" | "low",
): Promise<AIDecision> {
  // Find the customer by phone
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("shop_id", shopId)
    .eq("phone", customerPhone)
    .maybeSingle();

  if (!customer) {
    return {
      intent: "order_status",
      confidence,
      reply:
        "I couldn't find any orders linked to your phone number. 🤔 If you placed an order, please contact the shop owner for assistance!",
      shouldEscalate: false,
      reasoning: "No customer record found for this phone number",
    };
  }

  // Get recent orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at")
    .eq("shop_id", shopId)
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const orderList = (orders ?? []) as {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
  }[];

  const context = formatOrderContext(orderList);
  const reply = await generateReply(shopName, context, message, "order_status");

  return {
    intent: "order_status",
    confidence,
    reply,
    shouldEscalate: false,
    reasoning: `Found ${orderList.length} orders for customer phone ${customerPhone}`,
  };
}
