import { buildResponsePrompt } from "./prompts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Generate a customer-facing reply using Groq.
 *
 * @param shopName   - Shop name for personalization
 * @param context    - Relevant context (product data, order data, etc.)
 * @param message    - The customer's original message
 * @param intent     - The classified intent
 * @returns The generated reply text
 */
export async function generateReply(
  shopName: string,
  context: string,
  message: string,
  intent: string,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return "Thanks for your message! Our team will get back to you shortly. 😊";
  }

  try {
    const systemPrompt = buildResponsePrompt(shopName);

    const userPrompt = `Customer message: "${message}"
Intent: ${intent}

Available data:
${context}

Generate a helpful reply based on the available data. Do not invent information not present in the data above.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai] Groq response generation error:", errorText);
      return "Thanks for your message! Let me check that for you — one moment please. 😊";
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    return reply || "Thanks for reaching out! Our team will get back to you soon. 😊";
  } catch (error) {
    console.error("[ai] Response generation failed:", error);
    return "Thanks for your message! Our team will get back to you shortly. 😊";
  }
}
