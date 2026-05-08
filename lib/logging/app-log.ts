import type { SupabaseClient } from "@supabase/supabase-js";

type LogLevel = "info" | "warn" | "error";

type LogInput = {
  shopId?: string | null;
  conversationId?: string | null;
  source: string;
  level?: LogLevel;
  event: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export async function writeAppLog(
  supabase: SupabaseClient,
  input: LogInput,
) {
  try {
    await supabase.from("app_logs").insert({
      shop_id: input.shopId ?? null,
      conversation_id: input.conversationId ?? null,
      source: input.source,
      level: input.level ?? "info",
      event: input.event,
      message: input.message,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    console.error("[logs] Failed to write app log:", error);
  }
}
