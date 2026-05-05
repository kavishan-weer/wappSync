import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";
import { parseInboundMessages, parseStatusUpdates } from "@/lib/whatsapp/webhook";
import { sendTextMessage } from "@/lib/whatsapp/client";
import { handleInboundMessage } from "@/lib/ai/handler";
import type { WebhookBody } from "@/lib/whatsapp/types";

/**
 * GET /api/whatsapp/webhook
 *
 * Meta webhook verification endpoint.
 * Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge.
 * We verify the token against any configured shop's verify_token.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return NextResponse.json(
      { error: "Missing verification parameters" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // Look up any shop that uses this verify_token
  const { data: account } = await supabase
    .from("whatsapp_accounts")
    .select("id")
    .eq("verify_token", token)
    .limit(1)
    .maybeSingle();

  if (!account) {
    return NextResponse.json(
      { error: "Invalid verify token" },
      { status: 403 },
    );
  }

  // Return the challenge as plain text (Meta requirement)
  return new NextResponse(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

/**
 * POST /api/whatsapp/webhook
 *
 * Receives inbound WhatsApp messages from Meta.
 * Identifies the shop by phone_number_id, stores the message,
 * runs AI classification + response, and sends auto-reply.
 */
export async function POST(request: NextRequest) {
  let body: WebhookBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Handle status updates ──────────────────────────────────────
  const statuses = parseStatusUpdates(body);
  for (const status of statuses) {
    await supabase
      .from("messages")
      .update({ status: status.status })
      .eq("wa_message_id", status.id);
  }

  // ── Handle inbound messages ────────────────────────────────────
  const messages = parseInboundMessages(body);

  for (const msg of messages) {
    // Find the shop by phone_number_id
    const { data: waAccount } = await supabase
      .from("whatsapp_accounts")
      .select("shop_id, phone_number_id, access_token")
      .eq("phone_number_id", msg.phoneNumberId)
      .maybeSingle();

    if (!waAccount) {
      console.warn(
        `[webhook] No shop found for phone_number_id: ${msg.phoneNumberId}`,
      );
      continue;
    }

    const shopId = waAccount.shop_id;

    // Upsert conversation (create if new customer, update if existing)
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .upsert(
        {
          shop_id: shopId,
          customer_phone: msg.customerPhone,
          customer_name: msg.customerName,
          status: "active",
          last_message_at: new Date().toISOString(),
          last_message_preview: msg.text.substring(0, 100),
        },
        {
          onConflict: "shop_id,customer_phone",
        },
      )
      .select("id, automation_paused")
      .single();

    if (convError) {
      console.error("[webhook] Failed to upsert conversation:", convError.message);
      continue;
    }

    // Store the inbound message
    const { error: msgError } = await supabase.from("messages").insert({
      shop_id: shopId,
      conversation_id: conversation.id,
      direction: "inbound",
      content: msg.text,
      wa_message_id: msg.waMessageId,
      status: "delivered",
      sender_type: "customer",
    });

    if (msgError) {
      console.error("[webhook] Failed to store message:", msgError.message);
      continue;
    }

    // ── AI auto-reply ────────────────────────────────────────────
    // Skip if automation is paused for this conversation
    if (conversation.automation_paused) {
      console.log(
        `[webhook] Automation paused for conversation ${conversation.id}, skipping AI reply`,
      );
      continue;
    }

    try {
      // Get shop name for personalization
      const { data: shop } = await supabase
        .from("shops")
        .select("name")
        .eq("id", shopId)
        .single();

      const shopName = shop?.name ?? "Our Shop";

      // Run AI handler
      const decision = await handleInboundMessage(
        supabase,
        shopId,
        shopName,
        msg.customerPhone,
        msg.text,
      );

      console.log(
        `[ai] Decision: intent=${decision.intent} confidence=${decision.confidence} escalate=${decision.shouldEscalate} | ${decision.reasoning}`,
      );

      // Send the auto-reply via WhatsApp
      const waMessageId = await sendTextMessage(
        waAccount.phone_number_id,
        waAccount.access_token,
        msg.customerPhone,
        decision.reply,
      );

      // Store the outbound AI message
      await supabase.from("messages").insert({
        shop_id: shopId,
        conversation_id: conversation.id,
        direction: "outbound",
        content: decision.reply,
        wa_message_id: waMessageId,
        status: "sent",
        sender_type: "ai",
      });

      // Update conversation with latest outbound message
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: decision.reply.substring(0, 100),
          // If AI decided to escalate, mark the conversation
          ...(decision.shouldEscalate
            ? { status: "needs_attention", automation_paused: true }
            : {}),
        })
        .eq("id", conversation.id);
    } catch (aiError) {
      console.error("[webhook] AI auto-reply failed:", aiError);
      // Don't fail the webhook — the inbound message is already stored
    }
  }

  return NextResponse.json({ status: "ok" });
}
