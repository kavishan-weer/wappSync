"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getOwnerShop, requireUser } from "@/lib/auth/dashboard";

function requiredText(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

export async function createShop(formData: FormData) {
  const { supabase, user } = await requireUser();
  const existingShop = await getOwnerShop(supabase, user.id);

  if (existingShop) {
    redirect("/dashboard");
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const name = requiredText(formData, "name", "Shop name");
  const businessType = requiredText(
    formData,
    "business_type",
    "Business type",
  );
  const whatsappNumber = requiredText(
    formData,
    "whatsapp_number",
    "WhatsApp number",
  );

  const { error: profileError } = await supabase.from("owner_profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: fullName || null,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .insert({
      owner_id: user.id,
      name,
      business_type: businessType,
      whatsapp_number: whatsappNumber,
    })
    .select("id")
    .single();

  if (shopError) {
    throw new Error(shopError.message);
  }

  const { error: settingsError } = await supabase.from("shop_settings").insert({
    shop_id: shop.id,
  });

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function updateShopSettings(formData: FormData) {
  const { supabase, shop } = await requireUser().then(async (context) => {
    const ownerShop = await getOwnerShop(context.supabase, context.user.id);

    if (!ownerShop) {
      redirect("/dashboard/shop/new");
    }

    return { ...context, shop: ownerShop };
  });

  const name = requiredText(formData, "name", "Shop name");
  const businessType = requiredText(
    formData,
    "business_type",
    "Business type",
  );
  const whatsappNumber = requiredText(
    formData,
    "whatsapp_number",
    "WhatsApp number",
  );
  const defaultCurrency = requiredText(
    formData,
    "default_currency",
    "Default currency",
  ).toUpperCase();
  const orderPrefix = requiredText(
    formData,
    "order_prefix",
    "Order prefix",
  ).toUpperCase();
  const threshold = Number.parseInt(
    String(formData.get("low_stock_alert_threshold") ?? ""),
    10,
  );

  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error("Low stock threshold must be zero or greater.");
  }

  const { error: shopError } = await supabase
    .from("shops")
    .update({
      name,
      business_type: businessType,
      whatsapp_number: whatsappNumber,
    })
    .eq("id", shop.id);

  if (shopError) {
    throw new Error(shopError.message);
  }

  const { error: settingsError } = await supabase
    .from("shop_settings")
    .upsert({
      shop_id: shop.id,
      default_currency: defaultCurrency,
      order_prefix: orderPrefix,
      low_stock_alert_threshold: threshold,
    })
    .eq("shop_id", shop.id);

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/settings");
}
