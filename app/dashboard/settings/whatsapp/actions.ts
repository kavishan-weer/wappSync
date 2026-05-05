"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireShop } from "@/lib/auth/dashboard";
import { verifyConnection } from "@/lib/whatsapp/client";

function requiredText(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

export async function saveWhatsAppConfig(formData: FormData) {
  const { supabase, shop } = await requireShop();

  const phoneNumberId = requiredText(
    formData,
    "phone_number_id",
    "Phone Number ID",
  );
  const accessToken = requiredText(
    formData,
    "access_token",
    "Access Token",
  );
  const verifyToken = requiredText(
    formData,
    "verify_token",
    "Verify Token",
  );
  const wabaId = String(formData.get("waba_id") ?? "").trim() || null;

  const { error } = await supabase.from("whatsapp_accounts").upsert(
    {
      shop_id: shop.id,
      phone_number_id: phoneNumberId,
      access_token: accessToken,
      verify_token: verifyToken,
      waba_id: wabaId,
      is_connected: false,
    },
    { onConflict: "shop_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/settings/whatsapp");
  redirect("/dashboard/settings/whatsapp");
}

export async function testWhatsAppConnection() {
  const { supabase, shop } = await requireShop();

  const { data: account, error } = await supabase
    .from("whatsapp_accounts")
    .select("phone_number_id, access_token")
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (error || !account) {
    return {
      success: false,
      message: "WhatsApp account not configured. Save your credentials first.",
    };
  }

  try {
    const displayPhone = await verifyConnection(
      account.phone_number_id,
      account.access_token,
    );

    // Update connection status and display phone
    await supabase
      .from("whatsapp_accounts")
      .update({
        is_connected: true,
        display_phone: displayPhone,
      })
      .eq("shop_id", shop.id);

    revalidatePath("/dashboard/settings/whatsapp");

    return {
      success: true,
      message: `Connected successfully! Phone: ${displayPhone}`,
    };
  } catch (err) {
    // Mark as disconnected
    await supabase
      .from("whatsapp_accounts")
      .update({ is_connected: false })
      .eq("shop_id", shop.id);

    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Connection test failed. Check your credentials.",
    };
  }
}
