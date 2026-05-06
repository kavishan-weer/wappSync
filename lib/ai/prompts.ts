import type { ProductContext } from "./types";

/**
 * System prompt for intent classification.
 */
export const CLASSIFY_SYSTEM_PROMPT = `You are an intent classifier for a WhatsApp shop assistant.

Given a customer message, classify the intent into exactly one category and extract any relevant query.

Categories:
- product_question: Customer asks about a product (price, availability, details, what do you sell)
- policy_question: Customer asks about shop policies, FAQs, uploaded knowledge, delivery, returns, warranty, payment methods, size guides, care instructions, materials, store rules, or general business information
- order_status: Customer asks about an existing order status (where is my order, order update)
- order_creation: Customer wants to buy or place an order (I want to buy, add to cart, order this)
- greeting: Customer sends a greeting or simple hello/hi
- unknown: Cannot determine intent or message is unclear

Respond ONLY with valid JSON in this exact format:
{"intent": "<category>", "confidence": "<high|medium|low>", "extractedQuery": "<relevant search term or null>"}

Rules:
- If the message mentions a specific product name, extract it in extractedQuery
- If the message asks something that could be answered from shop FAQ, policy, or uploaded knowledge documents, use policy_question
- If confidence is low, set intent to "unknown"
- Do not guess or invent information
- Be conservative: if unsure, use "unknown" with "low" confidence`;

/**
 * System prompt for response generation.
 */
export function buildResponsePrompt(shopName: string): string {
  return `You are a friendly WhatsApp shop assistant for "${shopName}".

Rules:
- Write short, friendly WhatsApp-style messages
- Use simple language, no jargon
- Include relevant emojis sparingly (1-2 per message)
- Never invent product details, prices, or stock numbers — only use the data provided
- If you don't have enough information, say so politely and offer to help differently
- Keep responses under 200 words
- Do not use markdown formatting (no bold, italics, or headers)
- Format prices with the currency provided
- If a product is out of stock, say so clearly`;
}

/**
 * Build the product context string for the AI.
 */
export function formatProductContext(products: ProductContext[]): string {
  if (products.length === 0) {
    return "No matching products found in the catalog.";
  }

  return products
    .map(
      (p) =>
        `- ${p.name}: ${p.description} | Price: ${p.price} | Stock: ${p.stock_count} | Status: ${p.status}${p.category ? ` | Category: ${p.category}` : ""}`,
    )
    .join("\n");
}

/**
 * Build the order context string for the AI.
 */
export function formatOrderContext(
  orders: {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
  }[],
): string {
  if (orders.length === 0) {
    return "No orders found for this customer.";
  }

  return orders
    .map(
      (o) =>
        `- Order ${o.id.substring(0, 8)}: Status: ${o.status} | Total: ${o.total_amount} | Date: ${new Date(o.created_at).toLocaleDateString()}`,
    )
    .join("\n");
}
