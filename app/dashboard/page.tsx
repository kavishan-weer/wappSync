import { redirect } from "next/navigation";
import { CheckCircle2, Package, ShoppingCart, Store } from "lucide-react";

import {
  DashboardCard,
  DashboardCardHeader,
  DashboardHeader,
  DashboardSection,
  DashboardShell,
  PrimaryLink,
  SecondaryButton,
  StatCard,
} from "@/components/dashboard/dashboard-shell";
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
        description="Manage your shop profile, product catalog, order flow, and WhatsApp automation readiness."
      >
        <form action="/auth/signout" method="post">
          <SecondaryButton type="submit">Sign out</SecondaryButton>
        </form>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Shop profile"
          value={shop.business_type ?? "Not set"}
          icon={Store}
          detail="Business category"
        />
        <StatCard
          label="Products"
          value={String(productCount ?? 0)}
          icon={Package}
          tone="blue"
          detail="Catalog items"
        />
        <StatCard
          label="Orders"
          value={String(orderCount ?? 0)}
          icon={ShoppingCart}
          tone="yellow"
          detail="Manual and chat orders"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardSection>
          <DashboardCardHeader
            icon={CheckCircle2}
            title="Next best actions"
            description="Keep your shop ready for WhatsApp automation by completing the core setup flow."
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryLink href="/dashboard/products/new">Add product</PrimaryLink>
            <PrimaryLink href="/dashboard/orders/new">Create order</PrimaryLink>
            <PrimaryLink href="/dashboard/documents">Upload policy</PrimaryLink>
          </div>
        </DashboardSection>

        <DashboardCard>
          <DashboardCardHeader
            title="Operational focus"
            description="The assistant uses structured shop data for critical answers and pauses when owner attention is needed."
          />
          <div className="mt-5 grid gap-3 text-sm font-semibold text-[#667781]">
            <div className="rounded-lg bg-[#F5F7F9] px-4 py-3">
              Add products before enabling full AI sales flows.
            </div>
            <div className="rounded-lg bg-[#F5F7F9] px-4 py-3">
              Upload policies so AI can answer FAQ and delivery questions.
            </div>
            <div className="rounded-lg bg-[#F5F7F9] px-4 py-3">
              Watch inbox escalations before resuming automation.
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardShell>
  );
}
