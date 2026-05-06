import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Package,
  Phone,
  Receipt,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
  SubmitButton,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Order } from "@/lib/db/types";
import { orderStatuses } from "@/lib/orders/status";
import { updateOrderStatus } from "../actions";
import Link from "next/link";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE69A]/40 px-3 py-1.5 text-sm font-bold text-[#946800]">
          <Clock className="size-4" /> Pending
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#53BDEB]/10 px-3 py-1.5 text-sm font-bold text-[#53BDEB]">
          <CheckCircle2 className="size-4" /> Confirmed
        </span>
      );
    case "packed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F7F9] px-3 py-1.5 text-sm font-bold text-[#41525D]">
          <Package className="size-4" /> Packed
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F9F0] px-3 py-1.5 text-sm font-bold text-[#1DA851]">
          <Truck className="size-4" /> Shipped
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F9F0] px-3 py-1.5 text-sm font-bold text-[#1DA851]">
          <CheckCircle2 className="size-4" /> Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B6B]/10 px-3 py-1.5 text-sm font-bold text-[#B42318]">
          <XCircle className="size-4" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F2F5] px-3 py-1.5 text-sm font-bold text-[#667781]">
          {status}
        </span>
      );
  }
}

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
  const shortId = order.id.split("-")[0].toUpperCase();
  const date = new Date(order.created_at);

  return (
    <DashboardShell active="orders" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Order Details"
        title={`Order #${shortId}`}
        description={`Placed on ${date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      >
        <Link
          href="/dashboard/orders"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] transition hover:bg-[#F5F7F9]"
        >
          <ChevronLeft className="size-4" /> Back to Orders
        </Link>
      </DashboardHeader>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Items */}
        <section className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E0E6EA] pb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#111B21]">
                <Receipt className="size-5 text-[#8696A0]" />
                Order Items
              </h2>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="mt-2 divide-y divide-[#E0E6EA]">
              {(order.order_items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F7F9]">
                      <Package className="size-6 text-[#D1D7DB]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#111B21]">
                        {item.products?.name ?? "Unknown Product"}
                      </p>
                      <p className="mt-1 text-sm text-[#667781]">
                        ${Number(item.unit_price).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#111B21]">
                    ${Number(item.line_total).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F5F7F9] p-5">
              <span className="text-sm font-bold uppercase tracking-wider text-[#667781]">Total Amount</span>
              <span className="text-2xl font-bold text-[#25D366]">
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Customer & Status */}
        <aside className="flex flex-col gap-6">
          {/* Status Update Form */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="text-lg font-bold text-[#111B21]">Fulfillment Status</h2>
            <p className="mt-1 text-xs text-[#667781]">
              Update the status to track the order progress.
            </p>
            <form action={updateOrderStatus} className="mt-5">
              <input type="hidden" name="order_id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="h-12 w-full rounded-xl border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <div className="mt-4">
                <SubmitButton>Save Changes</SubmitButton>
              </div>
            </form>
          </div>

          {/* Customer Details */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#111B21]">
              <User className="size-5 text-[#8696A0]" />
              Customer Info
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E6F9F0] text-[#1DA851]">
                  <User className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8696A0]">Name</p>
                  <p className="mt-1 font-bold text-[#111B21]">{order.customers?.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E6F9F0] text-[#1DA851]">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8696A0]">Phone</p>
                  <a href={`tel:${order.customers?.phone}`} className="mt-1 font-bold text-[#111B21] transition hover:text-[#25D366]">
                    {order.customers?.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E6F9F0] text-[#1DA851]">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8696A0]">Delivery Address</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#111B21]">{order.customers?.address}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
