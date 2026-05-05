import type { SendTextPayload, SendMessageResponse } from "./types";

const META_API_BASE = "https://graph.facebook.com/v21.0";

/**
 * Send a text message through the WhatsApp Cloud API.
 *
 * @param phoneNumberId - The Phone Number ID from the WhatsApp account
 * @param accessToken   - The permanent or temporary access token
 * @param to            - Recipient phone number in international format (e.g. "94771234567")
 * @param text          - Message body
 * @returns The wa_message_id of the sent message
 */
export async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string,
): Promise<string> {
  const payload: SendTextPayload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  const response = await fetch(
    `${META_API_BASE}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `WhatsApp API error (${response.status}): ${errorBody}`,
    );
  }

  const data: SendMessageResponse = await response.json();
  return data.messages[0].id;
}

/**
 * Verify that a WhatsApp access token is valid by calling the
 * phone number endpoint.
 *
 * @returns The display phone number if valid, or throws on failure
 */
export async function verifyConnection(
  phoneNumberId: string,
  accessToken: string,
): Promise<string> {
  const response = await fetch(
    `${META_API_BASE}/${phoneNumberId}?fields=display_phone_number,verified_name`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `WhatsApp API verification failed (${response.status}): ${errorBody}`,
    );
  }

  const data = await response.json();
  return data.display_phone_number ?? data.verified_name ?? "Connected";
}
