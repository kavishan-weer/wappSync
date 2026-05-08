import type { SupabaseClient } from "@supabase/supabase-js";

export type AutomationSettings = {
  automation_enabled: boolean;
  owner_alert_phone: string | null;
  fallback_message: string;
  business_hours_enabled: boolean;
  business_hours_start: string;
  business_hours_end: string;
  business_hours_timezone: string;
};

export const DEFAULT_FALLBACK_MESSAGE =
  "Thanks for your message. I want to make sure you get the right answer, so I'm connecting you with the shop owner. 😊";

const DEFAULT_SETTINGS: AutomationSettings = {
  automation_enabled: true,
  owner_alert_phone: null,
  fallback_message: DEFAULT_FALLBACK_MESSAGE,
  business_hours_enabled: false,
  business_hours_start: "09:00",
  business_hours_end: "17:00",
  business_hours_timezone: "Asia/Colombo",
};

export async function getAutomationSettings(
  supabase: SupabaseClient,
  shopId: string,
): Promise<AutomationSettings> {
  const { data, error } = await supabase
    .from("shop_settings")
    .select(
      "automation_enabled, owner_alert_phone, fallback_message, business_hours_enabled, business_hours_start, business_hours_end, business_hours_timezone",
    )
    .eq("shop_id", shopId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn("[settings] Could not load automation settings:", error.message);
    }

    return DEFAULT_SETTINGS;
  }

  return {
    automation_enabled: data.automation_enabled ?? DEFAULT_SETTINGS.automation_enabled,
    owner_alert_phone: data.owner_alert_phone ?? null,
    fallback_message:
      cleanFallback(data.fallback_message) ?? DEFAULT_SETTINGS.fallback_message,
    business_hours_enabled:
      data.business_hours_enabled ?? DEFAULT_SETTINGS.business_hours_enabled,
    business_hours_start:
      normalizeTime(data.business_hours_start) ??
      DEFAULT_SETTINGS.business_hours_start,
    business_hours_end:
      normalizeTime(data.business_hours_end) ?? DEFAULT_SETTINGS.business_hours_end,
    business_hours_timezone:
      data.business_hours_timezone ?? DEFAULT_SETTINGS.business_hours_timezone,
  };
}

export function isWithinBusinessHours(
  settings: AutomationSettings,
  date = new Date(),
) {
  if (!settings.business_hours_enabled) return true;

  const currentMinutes = getMinutesInTimezone(
    date,
    settings.business_hours_timezone,
  );
  const startMinutes = timeToMinutes(settings.business_hours_start);
  const endMinutes = timeToMinutes(settings.business_hours_end);

  if (startMinutes === endMinutes) return true;

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function cleanFallback(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function normalizeTime(value: unknown) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return `${match[1]}:${match[2]}`;
}

function getMinutesInTimezone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  return hour * 60 + minute;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
