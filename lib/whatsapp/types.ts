/**
 * WhatsApp Cloud API types.
 *
 * These types represent the subset of the Meta Cloud API payload
 * structure that wappSync uses for receiving and sending messages.
 */

// ── Inbound webhook payload ──────────────────────────────────────

export type WebhookBody = {
  object: string;
  entry?: WebhookEntry[];
};

export type WebhookEntry = {
  id: string;
  changes?: WebhookChange[];
};

export type WebhookChange = {
  value: WebhookChangeValue;
  field: string;
};

export type WebhookChangeValue = {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WebhookContact[];
  messages?: WebhookMessage[];
  statuses?: WebhookStatus[];
};

export type WebhookContact = {
  profile?: { name: string };
  wa_id: string;
};

export type WebhookMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};

export type WebhookStatus = {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
};

// ── Outbound send payload ────────────────────────────────────────

export type SendTextPayload = {
  messaging_product: "whatsapp";
  to: string;
  type: "text";
  text: { body: string };
};

export type SendMessageResponse = {
  messaging_product: string;
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
};

// ── Parsed inbound message (app-level) ───────────────────────────

export type ParsedInboundMessage = {
  phoneNumberId: string;
  displayPhone: string;
  customerPhone: string;
  customerName: string;
  waMessageId: string;
  timestamp: string;
  text: string;
};
