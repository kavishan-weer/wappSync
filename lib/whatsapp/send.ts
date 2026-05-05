import type { SupabaseClient } from "@supabase/supabase-js";
import { sendTextMessage } from "./client";

/**
 * Send a text message to a customer and store the outbound message.
 *
 * This is the primary function used by the inbox reply and
 * AI auto-reply features to send WhatsApp messages.
 *
 * @param supabase        - Supabase client (authenticated or service role)
 * @param shopId          - The shop that owns the conversation
 * @param conversationId  - The conversation to attach the message to
 * @param customerPhone   - Recipient phone number
 * @param text            - Message body
 * @param senderType      - Who is sending: "owner" or "ai"
 * @returns The stored message id
 */
export async function sendAndStoreMessage(
  supabase: SupabaseClient,
  shopId: string,
  conversationId: string,
  customerPhone: string,
  text: string,
  senderType: "owner" | "ai" = "owner",
): Promise<string> {
  // Fetch the shop's WhatsApp account config
  const { data: waAccount, error: waError } = await supabase
    .from("whatsapp_accounts")
    .select("phone_number_id, access_token")
    .eq("shop_id", shopId)
    .single();

  if (waError || !waAccount) {
    throw new Error("WhatsApp account not configured for this shop.");
  }

  // Send through Meta Cloud API
  const waMessageId = await sendTextMessage(
    waAccount.phone_number_id,
    waAccount.access_token,
    customerPhone,
    text,
  );

  // Store the outbound message
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      shop_id: shopId,
      conversation_id: conversationId,
      direction: "outbound",
      content: text,
      wa_message_id: waMessageId,
      status: "sent",
      sender_type: senderType,
    })
    .select("id")
    .single();

  if (msgError) {
    throw new Error(msgError.message);
  }

  // Update conversation with latest message info
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: text.substring(0, 100),
    })
    .eq("id", conversationId);

  return message.id;
}
