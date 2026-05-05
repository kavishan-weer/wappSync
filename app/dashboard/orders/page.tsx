import Link from "next/link";

import {
  DashboardHeader,
  DashboardShell,
  PrimaryLink,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Order } from "@/lib/db/types";

export default async function OrdersPage() {
  const { supabase, shop } = await requireShop();
  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(*), order_items(*, products(id, name))")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const orders = (data ?? []) as Order[];

  return (
    <DashboardShell active="orders" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Orders"
        title="Manual orders"
        description="Create orders manually, deduct stock, and track order status."
      >
        <PrimaryLink href="/dashboard/orders/new">Create order</PrimaryLink>
      </DashboardHeader>

      <div className="mt-6 grid gap-4">
        {orders.length === 0 ? (
          <section className="rounded-lg border border-[#E0E6EA] bg-white p-8 text-center shadow-[0_14px_34px_rgba(17,27,33,0.05)]">
            <h2 className="text-xl font-bold">No orders yet</h2>
            <p className="mt-2 text-sm text-[#667781]">
              Create your first manual order after adding products.
            </p>
          </section>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="grid gap-4 rounded-lg border border-[#E0E6EA] bg-white p-5 shadow-[0_14px_34px_rgba(17,27,33,0.05)] transition hover:-translate-y-0.5 md:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {order.customers?.name ?? "Customer"}
                  </h2>
                  <span className="rounded-full bg-[#E6F9F0] px-3 py-1 text-xs font-bold text-[#1DA851]">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#667781]">
                  {order.customers?.phone} · {order.order_items?.length ?? 0} item(s)
                </p>
              </div>
              <p className="text-lg font-bold text-[#111B21]">
                {Number(order.total_amount).toFixed(2)}
              </p>
            </Link>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
