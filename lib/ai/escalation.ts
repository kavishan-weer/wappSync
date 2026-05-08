import type { SupabaseClient } from "@supabase/supabase-js";

import type { AIDecision } from "./types";
import { sendTextMessage } from "@/lib/whatsapp/client";
import { getAutomationSettings } from "@/lib/settings/automation";

type EscalationTrigger =
  | "low_confidence"
  | "missing_product_data"
  | "human_requested"
  | "complaint_or_refund"
  | "repeated_failed_understanding"
  | "order_approval_needed";

type EscalationRule = {
  trigger: EscalationTrigger;
  reply: string;
  reasoning: string;
};

type AlertInput = {
  shopId: string;
  conversationId: string;
  customerPhone: string;
  customerName: string | null;
  customerMessage: string;
  reason: string;
  phoneNumberId: string;
  accessToken: string;
};

const ESCALATION_REPLIES: Record<EscalationTrigger, string> = {
  low_confidence:
    "Thanks for your message. I want to make sure you get the right answer, so I'm connecting you with the shop owner. 😊",
  missing_product_data:
    "I couldn't confidently find that product in the catalog. Let me connect you with the shop owner so they can help you correctly. 😊",
  human_requested:
    "Sure, I'll connect you with the shop owner now. They’ll reply here as soon as possible. 😊",
  complaint_or_refund:
    "I'm sorry about that. I’ll pause the automated replies and connect you with the shop owner so they can help properly. 😊",
  repeated_failed_understanding:
    "I’m sorry, I’m not understanding this clearly enough. I’ll connect you with the shop owner so they can help directly. 😊",
  order_approval_needed:
    "Your order needs the shop owner to review it. I’ll alert them now and pause automated replies here. 😊",
};

export async function detectEscalationRule(
  supabase: SupabaseClient,
  conversationId: string,
  message: string,
): Promise<EscalationRule | null> {
  const normalized = message.toLowerCase();

  if (isHumanRequest(normalized)) {
    return buildRule("human_requested", "Customer explicitly asked for a human");
  }

  if (isComplaintOrRefund(normalized)) {
    return buildRule(
      "complaint_or_refund",
      "Customer message appears to be a complaint, refund, return, or cancellation issue",
    );
  }

  if (isOrderApprovalRequest(normalized)) {
    return buildRule(
      "order_approval_needed",
      "Customer asked for order approval, confirmation, or manual review",
    );
  }

  if (await hasRepeatedFailedUnderstanding(supabase, conversationId)) {
    return buildRule(
      "repeated_failed_understanding",
      "Recent AI replies already failed or escalated; avoiding another automated guess",
    );
  }

  return null;
}

export function escalationDecision(
  rule: EscalationRule,
  confidence: AIDecision["confidence"] = "high",
  fallbackMessage?: string,
): AIDecision {
  return {
    intent: "unknown",
    confidence,
    reply: fallbackMessage ?? rule.reply,
    shouldEscalate: true,
    reasoning: rule.reasoning,
  };
}

export async function sendOwnerEscalationAlert(
  supabase: SupabaseClient,
  input: AlertInput,
) {
  const [{ data: shop }, settings] = await Promise.all([
    supabase
    .from("shops")
    .select("name, whatsapp_number")
    .eq("id", input.shopId)
      .maybeSingle(),
    getAutomationSettings(supabase, input.shopId),
  ]);

  const ownerPhone = normalizePhone(
    settings.owner_alert_phone ?? shop?.whatsapp_number,
  );

  if (!ownerPhone) {
    console.warn(
      `[escalation] Owner alert skipped for ${input.conversationId}: shop whatsapp_number is missing`,
    );
    return;
  }

  if (ownerPhone === normalizePhone(input.customerPhone)) {
    console.warn(
      `[escalation] Owner alert skipped for ${input.conversationId}: owner phone matches customer phone`,
    );
    return;
  }

  const customerLabel =
    input.customerName && input.customerName !== input.customerPhone
      ? `${input.customerName} (${input.customerPhone})`
      : input.customerPhone;

  const alertText = `Needs attention in ${shop?.name ?? "your shop"}.\n\nCustomer: ${customerLabel}\nReason: ${input.reason}\nMessage: "${truncate(input.customerMessage, 180)}"\n\nOpen the dashboard inbox to reply. AI automation is paused for this chat.`;

  try {
    await sendTextMessage(
      input.phoneNumberId,
      input.accessToken,
      ownerPhone,
      alertText,
    );
  } catch (error) {
    console.error("[escalation] Owner WhatsApp alert failed:", error);
  }
}

function buildRule(trigger: EscalationTrigger, reasoning: string): EscalationRule {
  return {
    trigger,
    reply: ESCALATION_REPLIES[trigger],
    reasoning,
  };
}

function isHumanRequest(message: string) {
  return /\b(human|agent|owner|manager|person|someone|representative)\b/.test(
    message,
  );
}

function isComplaintOrRefund(message: string) {
  return (
    /\b(refund|return|cancel|cancellation|complain|complaint|damaged|broken|wrong item|not received|missing item|bad service)\b/.test(
      message,
    ) || /\b(i am|i'm|im)\s+(angry|upset|unhappy|disappointed)\b/.test(message)
  );
}

function isOrderApprovalRequest(message: string) {
  return /\b(approve|approval|confirm my order|confirm order|manual review|owner confirm)\b/.test(
    message,
  );
}

async function hasRepeatedFailedUnderstanding(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data } = await supabase
    .from("messages")
    .select("content, direction, sender_type")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(8);

  const failedReplies = (data ?? []).filter((message) => {
    if (message.direction !== "outbound" || message.sender_type !== "ai") {
      return false;
    }

    const content = String(message.content).toLowerCase();

    return (
      content.includes("not sure") ||
      content.includes("don't have specific information") ||
      content.includes("connect you with the shop owner") ||
      content.includes("couldn't confidently") ||
      content.includes("can't help with that")
    );
  });

  return failedReplies.length >= 2;
}

function normalizePhone(value: string | null | undefined) {
  const normalized = String(value ?? "").replace(/[^\d]/g, "");
  return normalized || null;
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength
    ? `${value.slice(0, Math.max(0, maxLength - 1))}…`
    : value;
}
