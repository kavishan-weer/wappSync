import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Order } from "@/lib/db/types";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE69A]/40 px-2.5 py-1 text-xs font-bold text-[#946800]">
          <Clock className="size-3.5" /> Pending
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#53BDEB]/10 px-2.5 py-1 text-xs font-bold text-[#53BDEB]">
          <CheckCircle2 className="size-3.5" /> Confirmed
        </span>
      );
    case "packed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F7F9] px-2.5 py-1 text-xs font-bold text-[#41525D]">
          <Package className="size-3.5" /> Packed
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F9F0] px-2.5 py-1 text-xs font-bold text-[#1DA851]">
          <Truck className="size-3.5" /> Shipped
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F9F0] px-2.5 py-1 text-xs font-bold text-[#1DA851]">
          <CheckCircle2 className="size-3.5" /> Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B6B]/10 px-2.5 py-1 text-xs font-bold text-[#B42318]">
          <XCircle className="size-3.5" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F2F5] px-2.5 py-1 text-xs font-bold text-[#667781]">
          {status}
        </span>
      );
  }
}

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
        title="Order Management"
        description="Create orders manually, track customer purchases, and manage fulfillment status."
      >
        <Link
          href="/dashboard/orders/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(37,211,102,0.3)] transition hover:bg-[#1DA851] hover:shadow-[0_6px_16px_rgba(37,211,102,0.4)]"
        >
          <Plus className="size-4" /> Create Order
        </Link>
      </DashboardHeader>

      <div className="mt-8 flex flex-col gap-4">
        {orders.length === 0 ? (
          <section className="rounded-2xl border border-[#E0E6EA] bg-white p-12 text-center shadow-[0_14px_34px_rgba(17,27,33,0.05)]">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#F0F2F5]">
              <ShoppingCart className="size-8 text-[#8696A0]" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#111B21]">No orders yet</h2>
            <p className="mt-2 text-sm text-[#667781]">
              Create your first manual order after adding products to your catalog.
            </p>
            <Link
              href="/dashboard/orders/new"
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(37,211,102,0.3)] transition hover:bg-[#1DA851]"
            >
              <Plus className="size-4" /> Create Order
            </Link>
          </section>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E0E6EA] bg-white shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E0E6EA] bg-[#F5F7F9]">
                  <tr>
                    <th className="px-6 py-4 font-bold text-[#667781]">Order ID</th>
                    <th className="px-6 py-4 font-bold text-[#667781]">Customer</th>
                    <th className="px-6 py-4 font-bold text-[#667781]">Date</th>
                    <th className="px-6 py-4 font-bold text-[#667781]">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-[#667781]">Total</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E6EA]">
                  {orders.map((order) => {
                    const shortId = order.id.split("-")[0].toUpperCase();
                    const date = new Date(order.created_at);
                    
                    return (
                      <tr
                        key={order.id}
                        className="group bg-white transition hover:bg-[#F5F7F9]"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/orders/${order.id}`} className="block">
                            <span className="font-mono font-bold text-[#111B21]">
                              #{shortId}
                            </span>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8696A0]">
                              <Package className="size-3" />
                              {order.order_items?.length ?? 0} item(s)
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/orders/${order.id}`} className="block">
                            <div className="flex items-center gap-2">
                              <div className="flex size-8 items-center justify-center rounded-full bg-[#E6F9F0] text-[#1DA851]">
                                <User className="size-4" />
                              </div>
                              <div>
                                <p className="font-bold text-[#111B21]">
                                  {order.customers?.name ?? "Unknown Customer"}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-[#667781]">
                                  <Phone className="size-3" />
                                  {order.customers?.phone}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/orders/${order.id}`} className="block">
                            <div className="flex items-center gap-1.5 text-[#667781]">
                              <Calendar className="size-4" />
                              <span>
                                {date.toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/orders/${order.id}`} className="block">
                            {getStatusBadge(order.status)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/orders/${order.id}`} className="block">
                            <span className="text-base font-bold text-[#111B21]">
                              ${Number(order.total_amount).toFixed(2)}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="inline-flex size-8 items-center justify-center rounded-full text-[#8696A0] transition group-hover:bg-white group-hover:text-[#111B21] group-hover:shadow-sm"
                          >
                            <ChevronRight className="size-5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
