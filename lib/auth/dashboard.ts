import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Shop, ShopSettings } from "@/lib/db/types";

type DashboardContext = {
  supabase: SupabaseClient;
  user: User;
};

export async function requireUser(): Promise<DashboardContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  return { supabase, user };
}

export async function getOwnerShop(supabase: SupabaseClient, ownerId: string) {
  const { data, error } = await supabase
    .from("shops")
    .select("*, shop_settings(*)")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    if (
      error.message.includes("public.shops") ||
      error.message.includes("schema cache")
    ) {
      redirect("/dashboard/setup-required");
    }

    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    ...(data as Shop & { shop_settings?: ShopSettings[] }),
    settings: (data.shop_settings?.[0] ?? null) as ShopSettings | null,
  };
}

export async function requireShop() {
  const { supabase, user } = await requireUser();
  const shop = await getOwnerShop(supabase, user.id);

  if (!shop) {
    redirect("/dashboard/shop/new");
  }

  return { supabase, user, shop };
}
