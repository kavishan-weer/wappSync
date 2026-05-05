import { redirect } from "next/navigation";
import { Package, ShoppingCart, Store } from "lucide-react";

import { DashboardHeader, DashboardShell, PrimaryLink } from "@/components/dashboard/dashboard-shell";
import { getOwnerShop, requireUser } from "@/lib/auth/dashboard";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const shop = await getOwnerShop(supabase, user.id);

  if (!shop) {
    redirect("/dashboard/shop/new");
  }

  const [{ count: productCount }, { count: orderCount }] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id),
  ]);

  return (
    <DashboardShell active="dashboard" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Dashboard"
        title={`Welcome to ${shop.name}`}
        description="Manage your shop profile, product catalog, and manual orders from this dashboard."
      >
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="h-10 rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] transition hover:bg-[#F5F7F9]"
          >
            Sign out
          </button>
        </form>
      </DashboardHeader>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Shop profile",
            value: shop.business_type ?? "Not set",
            icon: Store,
          },
          {
            label: "Products",
            value: String(productCount ?? 0),
            icon: Package,
          },
          {
            label: "Orders",
            value: String(orderCount ?? 0),
            icon: ShoppingCart,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-lg border border-[#E0E6EA] bg-white p-5 shadow-[0_14px_34px_rgba(17,27,33,0.05)]"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[#E6F9F0] text-[#1DA851]">
                <Icon className="size-5" />
              </div>
              <p className="text-sm font-semibold text-[#667781]">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-[#111B21]">
                {item.value}
              </p>
            </article>
          );
        })}
      </div>

      <section className="mt-6 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]">
        <h2 className="text-xl font-bold">Next steps</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <PrimaryLink href="/dashboard/products/new">Add product</PrimaryLink>
          <PrimaryLink href="/dashboard/orders/new">Create order</PrimaryLink>
        </div>
      </section>
    </DashboardShell>
  );
}
