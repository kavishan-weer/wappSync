import { notFound } from "next/navigation";

import {
  DashboardHeader,
  DashboardShell,
  SecondaryLink,
  SubmitButton,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Order } from "@/lib/db/types";
import { orderStatuses } from "@/lib/orders/status";
import { updateOrderStatus } from "../actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const { supabase, shop } = await requireShop();
  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(*), order_items(*, products(id, name))")
    .eq("shop_id", shop.id)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const order = data as Order;

  return (
    <DashboardShell active="orders" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Orders"
        title={`Order for ${order.customers?.name ?? "customer"}`}
        description="View order details and update its fulfillment status."
      >
        <SecondaryLink href="/dashboard/orders">Back</SecondaryLink>
      </DashboardHeader>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]">
          <h2 className="text-xl font-bold">Items</h2>
          <div className="mt-4 divide-y divide-[#E0E6EA]">
            {(order.order_items ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-bold">
                    {item.products?.name ?? "Product"}
                  </p>
                  <p className="mt-1 text-sm text-[#667781]">
                    Qty {item.quantity} × {Number(item.unit_price).toFixed(2)}
                  </p>
                </div>
                <p className="font-bold">
                  {Number(item.line_total).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between rounded-lg bg-[#F0F2F5] p-4 text-lg font-bold">
            <span>Total</span>
            <span>{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]">
            <h2 className="text-xl font-bold">Customer</h2>
            <div className="mt-4 space-y-2 text-sm text-[#667781]">
              <p className="font-semibold text-[#111B21]">
                {order.customers?.name}
              </p>
              <p>{order.customers?.phone}</p>
              <p>{order.customers?.address}</p>
            </div>
          </section>

          <form
            action={updateOrderStatus}
            className="rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]"
          >
            <input type="hidden" name="order_id" value={order.id} />
            <h2 className="text-xl font-bold">Status</h2>
            <select
              name="status"
              defaultValue={order.status}
              className="mt-4 h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="mt-4">
              <SubmitButton>Update status</SubmitButton>
            </div>
          </form>
        </aside>
      </div>
    </DashboardShell>
  );
}
