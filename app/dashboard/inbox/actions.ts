"use server";

import { revalidatePath } from "next/cache";

import { requireShop } from "@/lib/auth/dashboard";
import { sendAndStoreMessage } from "@/lib/whatsapp/send";

/**
 * Send a reply to a conversation from the dashboard inbox.
 */
export async function sendReply(formData: FormData) {
  const { supabase, shop } = await requireShop();

  const conversationId = String(formData.get("conversation_id") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!conversationId || !customerPhone || !message) {
    throw new Error("Conversation, phone, and message are required.");
  }

  await sendAndStoreMessage(
    supabase,
    shop.id,
    conversationId,
    customerPhone,
    message,
    "owner",
  );

  revalidatePath("/dashboard/inbox");
}

/**
 * Toggle automation pause/resume for a conversation.
 */
export async function toggleAutomation(formData: FormData) {
  const { supabase, shop } = await requireShop();

  const conversationId = String(formData.get("conversation_id") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();

  if (!conversationId || !action) {
    throw new Error("Conversation ID and action are required.");
  }

  const paused = action === "pause";
  const updates =
    action === "resume"
      ? { automation_paused: false, status: "active" }
      : { automation_paused: paused };

  const { error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversationId)
    .eq("shop_id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inbox");
}

/**
 * Update conversation status (resolve, reopen, etc.).
 */
export async function updateConversationStatus(formData: FormData) {
  const { supabase, shop } = await requireShop();

  const conversationId = String(formData.get("conversation_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!conversationId || !status) {
    throw new Error("Conversation ID and status are required.");
  }

  const validStatuses = ["active", "needs_attention", "resolved", "closed"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status.");
  }

  const updates =
    status === "active"
      ? { status, automation_paused: false }
      : { status };

  const { error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversationId)
    .eq("shop_id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inbox");
}
