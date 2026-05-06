import {
  DashboardHeader,
  DashboardShell,
  Field,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Product } from "@/lib/db/types";
import { orderStatuses } from "@/lib/orders/status";
import { createOrder } from "../actions";
import Link from "next/link";
import { ChevronLeft, Package, User } from "lucide-react";

export default async function NewOrderPage() {
  const { supabase, shop } = await requireShop();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, stock_count, price")
    .eq("shop_id", shop.id)
    .eq("status", "active")
    .gt("stock_count", 0)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  const products = (data ?? []) as Pick<
    Product,
    "id" | "name" | "stock_count" | "price"
  >[];

  return (
    <DashboardShell active="orders" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Orders"
        title="Create Manual Order"
        description="Collect customer details, choose products, and deduct stock safely."
      >
        <Link
          href="/dashboard/orders"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] transition hover:bg-[#F5F7F9]"
        >
          <ChevronLeft className="size-4" /> Back to Orders
        </Link>
      </DashboardHeader>

      <form action={createOrder} className="mt-8 flex flex-col gap-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* Main Content: Order Items */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#111B21]">
                <Package className="size-5 text-[#8696A0]" />
                Order Items
              </h2>
              <p className="mt-1 text-sm text-[#667781]">
                Add up to three products. Empty rows are ignored.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-[#E0E6EA] p-4 bg-[#F5F7F9]/50 transition-colors focus-within:bg-white focus-within:border-[#25D366]"
                  >
                    <div className="flex-1">
                      <select
                        name={`product_id_${index}`}
                        className="h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm font-semibold text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
                        defaultValue=""
                        required={index === 0}
                      >
                        <option value="">Select product...</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} — ${Number(product.price).toFixed(2)} ({product.stock_count} in stock)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:w-32">
                      <TextInput
                        name={`quantity_${index}`}
                        type="number"
                        min="1"
                        placeholder="Qty"
                        required={index === 0}
                        className="mt-0 h-11 w-full font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
              <h2 className="text-lg font-bold text-[#111B21]">Initial Status</h2>
              <p className="mt-1 text-sm text-[#667781]">
                Set the fulfillment state for this new order.
              </p>
              <div className="mt-5">
                <select
                  name="status"
                  defaultValue="pending"
                  className="h-12 w-full rounded-xl border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sidebar: Customer Details */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#111B21]">
                <User className="size-5 text-[#8696A0]" />
                Customer Details
              </h2>
              <div className="mt-6 flex flex-col gap-5">
                <Field label="Full Name">
                  <TextInput name="customer_name" placeholder="John Doe" required />
                </Field>
                <Field label="Phone Number">
                  <TextInput name="customer_phone" placeholder="+1234567890" required />
                </Field>
                <Field label="Delivery Address">
                  <TextArea 
                    name="customer_address" 
                    placeholder="123 Main St, Apt 4B&#10;City, State 12345"
                    className="h-28 resize-none"
                    required 
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-[#E0E6EA] py-4">
          <SubmitButton>Create Order</SubmitButton>
        </div>
      </form>
    </DashboardShell>
  );
}
