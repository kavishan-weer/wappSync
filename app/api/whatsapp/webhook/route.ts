import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";
import { parseInboundMessages, parseStatusUpdates } from "@/lib/whatsapp/webhook";
import { sendTextMessage } from "@/lib/whatsapp/client";
import { handleInboundMessage } from "@/lib/ai/handler";
import { sendOwnerEscalationAlert } from "@/lib/ai/escalation";
import {
  getAutomationSettings,
  isWithinBusinessHours,
} from "@/lib/settings/automation";
import { writeAppLog } from "@/lib/logging/app-log";
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
      await writeAppLog(supabase, {
        source: "whatsapp_webhook",
        level: "warn",
        event: "unknown_phone_number_id",
        message: "No shop found for inbound WhatsApp phone_number_id.",
        metadata: { phoneNumberId: msg.phoneNumberId },
      });
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
          last_message_at: new Date().toISOString(),
          last_message_preview: msg.text.substring(0, 100),
        },
        {
          onConflict: "shop_id,customer_phone",
        },
      )
      .select("id, automation_paused, status, customer_name")
      .single();

    if (convError) {
      console.error("[webhook] Failed to upsert conversation:", convError.message);
      await writeAppLog(supabase, {
        shopId,
        source: "whatsapp_webhook",
        level: "error",
        event: "conversation_upsert_failed",
        message: convError.message,
        metadata: { customerPhone: msg.customerPhone },
      });
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
      await writeAppLog(supabase, {
        shopId,
        conversationId: conversation.id,
        source: "whatsapp_webhook",
        level: "error",
        event: "inbound_message_store_failed",
        message: msgError.message,
        metadata: { customerPhone: msg.customerPhone },
      });
      continue;
    }

    await writeAppLog(supabase, {
      shopId,
      conversationId: conversation.id,
      source: "whatsapp_webhook",
      event: "inbound_message_stored",
      message: "Inbound WhatsApp message stored.",
      metadata: {
        customerPhone: msg.customerPhone,
        waMessageId: msg.waMessageId,
      },
    });

    // ── AI auto-reply ────────────────────────────────────────────
    // Skip if automation is paused for this conversation
    if (
      conversation.automation_paused ||
      conversation.status === "needs_attention"
    ) {
      console.log(
        `[webhook] Automation paused or needs attention for conversation ${conversation.id}, skipping AI reply`,
      );
      await writeAppLog(supabase, {
        shopId,
        conversationId: conversation.id,
        source: "whatsapp_webhook",
        event: "ai_reply_skipped",
        message: "AI reply skipped because automation is paused or the conversation needs attention.",
        metadata: {
          automationPaused: conversation.automation_paused,
          status: conversation.status,
        },
      });
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
      const settings = await getAutomationSettings(supabase, shopId);

      if (!settings.automation_enabled) {
        console.log(
          `[webhook] Global automation disabled for shop ${shopId}, skipping AI reply`,
        );
        await writeAppLog(supabase, {
          shopId,
          conversationId: conversation.id,
          source: "whatsapp_webhook",
          event: "global_automation_disabled",
          message: "Inbound message stored, but global automation is disabled.",
        });
        continue;
      }

      if (!isWithinBusinessHours(settings)) {
        const waMessageId = await sendTextMessage(
          waAccount.phone_number_id,
          waAccount.access_token,
          msg.customerPhone,
          settings.fallback_message,
        );

        await supabase.from("messages").insert({
          shop_id: shopId,
          conversation_id: conversation.id,
          direction: "outbound",
          content: settings.fallback_message,
          wa_message_id: waMessageId,
          status: "sent",
          sender_type: "ai",
        });

        await supabase
          .from("conversations")
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: settings.fallback_message.substring(0, 100),
          })
          .eq("id", conversation.id);

        await writeAppLog(supabase, {
          shopId,
          conversationId: conversation.id,
          source: "whatsapp_webhook",
          event: "business_hours_fallback_sent",
          message: "Fallback message sent because inbound message arrived outside business hours.",
          metadata: {
            timezone: settings.business_hours_timezone,
            start: settings.business_hours_start,
            end: settings.business_hours_end,
          },
        });

        continue;
      }

      // Run AI handler
      const decision = await handleInboundMessage(
        supabase,
        shopId,
        shopName,
        conversation.id,
        msg.customerPhone,
        msg.text,
      );

      console.log(
        `[ai] Decision: intent=${decision.intent} confidence=${decision.confidence} escalate=${decision.shouldEscalate} | ${decision.reasoning}`,
      );
      await writeAppLog(supabase, {
        shopId,
        conversationId: conversation.id,
        source: "ai_handler",
        level: decision.shouldEscalate ? "warn" : "info",
        event: "ai_decision",
        message: decision.reasoning,
        metadata: {
          intent: decision.intent,
          confidence: decision.confidence,
          shouldEscalate: decision.shouldEscalate,
        },
      });

      const shouldAlertOwner =
        decision.shouldEscalate &&
        conversation.status !== "needs_attention" &&
        !conversation.automation_paused;

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

      if (shouldAlertOwner) {
        await sendOwnerEscalationAlert(supabase, {
          shopId,
          conversationId: conversation.id,
          customerPhone: msg.customerPhone,
          customerName: msg.customerName ?? conversation.customer_name ?? null,
          customerMessage: msg.text,
          reason: decision.reasoning,
          phoneNumberId: waAccount.phone_number_id,
          accessToken: waAccount.access_token,
        });
        await writeAppLog(supabase, {
          shopId,
          conversationId: conversation.id,
          source: "escalation",
          level: "warn",
          event: "owner_alert_attempted",
          message: "Owner alert attempted for escalated conversation.",
          metadata: { reason: decision.reasoning },
        });
      }
    } catch (aiError) {
      console.error("[webhook] AI auto-reply failed:", aiError);
      await writeAppLog(supabase, {
        shopId,
        conversationId: conversation.id,
        source: "whatsapp_webhook",
        level: "error",
        event: "ai_auto_reply_failed",
        message:
          aiError instanceof Error ? aiError.message : "Unknown AI auto-reply error",
      });
      // Don't fail the webhook — the inbound message is already stored
    }
  }

  return NextResponse.json({ status: "ok" });
}
