import type { SupabaseClient } from "@supabase/supabase-js";

import { classifyIntent } from "./classify";
import { generateReply } from "./respond";
import { formatProductContext } from "./prompts";
import { handleOrderCreation, shouldResumeOrderFlow } from "./order-flow";
import {
  handleOrderStatus,
  isOrderStatusQuestion,
  shouldResumeOrderStatusFlow,
} from "./order-status";
import { detectEscalationRule, escalationDecision } from "./escalation";
import { searchDocuments, formatRAGContext } from "@/lib/rag/search";
import { getAutomationSettings } from "@/lib/settings/automation";
import type { AIDecision, ProductContext } from "./types";

const GREETING_REPLIES = [
  "Hi there! 👋 Welcome! How can I help you today?",
  "Hello! 😊 Welcome to our shop! What can I help you with?",
  "Hey! 👋 Thanks for reaching out. How can I assist you?",
];

const DOCUMENT_SEARCH_THRESHOLD = 0.35;

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
  conversationId: string,
  customerPhone: string,
  message: string,
): Promise<AIDecision> {
  const settings = await getAutomationSettings(supabase, shopId);
  const escalationRule = await detectEscalationRule(
    supabase,
    conversationId,
    message,
  );

  if (escalationRule) {
    return escalationDecision(
      escalationRule,
      "high",
      settings.fallback_message,
    );
  }

  if (isOrderStatusQuestion(message)) {
    return handleOrderStatus(
      supabase,
      shopId,
      conversationId,
      customerPhone,
      message,
      "high",
    );
  }

  if (await shouldResumeOrderFlow(supabase, conversationId, message)) {
    return handleOrderCreation(
      supabase,
      shopId,
      conversationId,
      customerPhone,
      message,
      "high",
    );
  }

  if (await shouldResumeOrderStatusFlow(supabase, conversationId, message)) {
    return handleOrderStatus(
      supabase,
      shopId,
      conversationId,
      customerPhone,
      message,
      "high",
    );
  }

  // Step 1: Classify
  const classification = await classifyIntent(message);

  console.log(
    `[ai] Intent: ${classification.intent} | Confidence: ${classification.confidence} | Query: ${classification.extractedQuery}`,
  );

  if (classification.confidence === "low") {
    return {
      intent: classification.intent,
      confidence: "low",
      reply: settings.fallback_message,
      shouldEscalate: true,
      reasoning: `Low confidence intent classification: ${classification.intent}`,
    };
  }

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
        conversationId,
        customerPhone,
        message,
        classification.confidence,
      );

    case "order_creation":
      return handleOrderCreation(
        supabase,
        shopId,
        conversationId,
        customerPhone,
        message,
        classification.confidence,
      );

    case "policy_question":
      return handlePolicyQuestion(
        supabase,
        shopId,
        shopName,
        message,
        classification.confidence,
      );

    case "unknown":
    default:
      return handleUnknownMessage(
        supabase,
        shopId,
        shopName,
        message,
        classification.confidence,
      );
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

    if (allList.length === 0) {
      return {
        intent: "product_question",
        confidence,
        reply: (await getAutomationSettings(supabase, shopId)).fallback_message,
        shouldEscalate: true,
        reasoning: `Missing product data: no active products available for query "${extractedQuery}"`,
      };
    }

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

  if (productList.length === 0) {
    return {
      intent: "product_question",
      confidence,
      reply: (await getAutomationSettings(supabase, shopId)).fallback_message,
      shouldEscalate: true,
      reasoning: `Missing product data: no active products matched query "${extractedQuery ?? "general"}"`,
    };
  }

  const reply = await generateReply(shopName, context, message, "product_question");

  return {
    intent: "product_question",
    confidence,
      reply,
      shouldEscalate: productList.length === 0,
      reasoning:
        productList.length === 0
          ? `Missing product data: no active products matched query "${extractedQuery ?? "general"}"`
          : `Found ${productList.length} matching products for query "${extractedQuery ?? "general"}"`,
  };
}

/**
 * Handle a policy/FAQ question using RAG.
 */
async function handlePolicyQuestion(
  supabase: SupabaseClient,
  shopId: string,
  shopName: string,
  message: string,
  confidence: "high" | "medium" | "low",
): Promise<AIDecision> {
  // Search for relevant document chunks
  const results = await searchDocuments(
    supabase,
    shopId,
    message,
    5,
    DOCUMENT_SEARCH_THRESHOLD,
  );

  if (results.length === 0) {
    // No documents found — escalate to owner
    return {
      intent: "policy_question",
      confidence,
      reply:
        "Great question! 📋 I don't have specific information about that right now. Let me connect you with the shop owner who can give you the most accurate answer!",
      shouldEscalate: true,
      reasoning:
        "Policy question detected but no relevant documents found via RAG. Escalating to owner.",
    };
  }

  const context = formatRAGContext(results);
  const reply = await generateReply(shopName, context, message, "policy_question");

  return {
    intent: "policy_question",
    confidence,
    reply,
    shouldEscalate: false,
    reasoning: `RAG search returned ${results.length} relevant chunks. Top similarity: ${Math.round(results[0].similarity * 100)}%`,
  };
}

/**
 * For unclear messages, try uploaded knowledge before escalating.
 */
async function handleUnknownMessage(
  supabase: SupabaseClient,
  shopId: string,
  shopName: string,
  message: string,
  confidence: "high" | "medium" | "low",
): Promise<AIDecision> {
  const results = await searchDocuments(
    supabase,
    shopId,
    message,
    5,
    DOCUMENT_SEARCH_THRESHOLD,
  );

  if (results.length > 0) {
    const context = formatRAGContext(results);
    const reply = await generateReply(shopName, context, message, "policy_question");

    return {
      intent: "policy_question",
      confidence,
      reply,
      shouldEscalate: false,
      reasoning: `Unknown intent answered from uploaded knowledge. RAG returned ${results.length} chunks. Top similarity: ${Math.round(results[0].similarity * 100)}%`,
    };
  }

  return {
    intent: "unknown",
    confidence: "low",
    reply: (await getAutomationSettings(supabase, shopId)).fallback_message,
    shouldEscalate: true,
    reasoning: `Could not classify intent and no uploaded knowledge matched. Confidence: ${confidence}`,
  };
}
