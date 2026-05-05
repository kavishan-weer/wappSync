import type {
  WebhookBody,
  ParsedInboundMessage,
  WebhookStatus,
} from "./types";

/**
 * Extract text messages from a Meta webhook payload.
 *
 * Returns an array of parsed inbound messages. Non-text message
 * types (images, audio, etc.) are ignored for now.
 */
export function parseInboundMessages(
  body: WebhookBody,
): ParsedInboundMessage[] {
  const results: ParsedInboundMessage[] = [];

  if (body.object !== "whatsapp_business_account") {
    return results;
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const value = change.value;
      const phoneNumberId = value.metadata.phone_number_id;
      const displayPhone = value.metadata.display_phone_number;

      const contactMap = new Map<string, string>();
      for (const contact of value.contacts ?? []) {
        contactMap.set(contact.wa_id, contact.profile?.name ?? contact.wa_id);
      }

      for (const msg of value.messages ?? []) {
        if (msg.type !== "text" || !msg.text?.body) continue;

        results.push({
          phoneNumberId,
          displayPhone,
          customerPhone: msg.from,
          customerName: contactMap.get(msg.from) ?? msg.from,
          waMessageId: msg.id,
          timestamp: msg.timestamp,
          text: msg.text.body,
        });
      }
    }
  }

  return results;
}

/**
 * Extract status updates from a Meta webhook payload.
 */
export function parseStatusUpdates(body: WebhookBody): WebhookStatus[] {
  const results: WebhookStatus[] = [];

  if (body.object !== "whatsapp_business_account") {
    return results;
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      for (const status of change.value.statuses ?? []) {
        results.push(status);
      }
    }
  }

  return results;
}
