/**
 * AI types for intent classification and response generation.
 */

export type Intent =
  | "product_question"
  | "policy_question"
  | "order_status"
  | "order_creation"
  | "greeting"
  | "unknown";

export type ClassificationResult = {
  intent: Intent;
  confidence: "high" | "medium" | "low";
  /** Extracted entity (product name, order keyword, etc.) */
  extractedQuery: string | null;
};

export type AIDecision = {
  intent: Intent;
  confidence: "high" | "medium" | "low";
  reply: string;
  shouldEscalate: boolean;
  /** Reasoning for logging/debugging */
  reasoning: string;
};

export type ProductContext = {
  name: string;
  description: string;
  price: number;
  stock_count: number;
  status: string;
  category: string | null;
};
