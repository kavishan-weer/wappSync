import type { ClassificationResult, Intent } from "./types";
import { CLASSIFY_SYSTEM_PROMPT } from "./prompts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Classify the intent of a customer message using Groq.
 */
export async function classifyIntent(
  message: string,
): Promise<ClassificationResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn("[ai] GROQ_API_KEY not set, defaulting to unknown intent");
    return { intent: "unknown", confidence: "low", extractedQuery: null };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai] Groq classification error:", errorText);
      return { intent: "unknown", confidence: "low", extractedQuery: null };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { intent: "unknown", confidence: "low", extractedQuery: null };
    }

    const parsed = JSON.parse(content) as {
      intent?: string;
      confidence?: string;
      extractedQuery?: string | null;
    };

    const validIntents: Intent[] = [
      "product_question",
      "policy_question",
      "order_status",
      "order_creation",
      "greeting",
      "unknown",
    ];

    const intent = validIntents.includes(parsed.intent as Intent)
      ? (parsed.intent as Intent)
      : "unknown";

    const confidence = ["high", "medium", "low"].includes(
      parsed.confidence ?? "",
    )
      ? (parsed.confidence as "high" | "medium" | "low")
      : "low";

    return {
      intent,
      confidence,
      extractedQuery: parsed.extractedQuery ?? null,
    };
  } catch (error) {
    console.error("[ai] Classification failed:", error);
    return { intent: "unknown", confidence: "low", extractedQuery: null };
  }
}
