import {
  DashboardHeader,
  DashboardShell,
  Field,
  SecondaryLink,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Product } from "@/lib/db/types";
import { orderStatuses } from "@/lib/orders/status";
import { createOrder } from "../actions";

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
        title="Create manual order"
        description="Collect customer details, choose products, and deduct stock safely."
      >
        <SecondaryLink href="/dashboard/orders">Back</SecondaryLink>
      </DashboardHeader>

      <form
        action={createOrder}
        className="mt-6 grid gap-5 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)] md:grid-cols-2"
      >
        <Field label="Customer name">
          <TextInput name="customer_name" required />
        </Field>
        <Field label="Customer phone">
          <TextInput name="customer_phone" required />
        </Field>
        <div className="md:col-span-2">
          <Field label="Customer address">
            <TextArea name="customer_address" required />
          </Field>
        </div>
        <Field label="Initial status">
          <select
            name="status"
            defaultValue="pending"
            className="mt-2 h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold">Order items</h2>
          <p className="mt-1 text-sm text-[#667781]">
            Add up to three products. Empty rows are ignored.
          </p>
          <div className="mt-4 grid gap-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-[#E0E6EA] p-4 md:grid-cols-[1fr_160px]"
              >
                <select
                  name={`product_id_${index}`}
                  className="h-11 rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20"
                  defaultValue=""
                  required={index === 0}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · Stock {product.stock_count} ·{" "}
                      {Number(product.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                <TextInput
                  name={`quantity_${index}`}
                  type="number"
                  min="1"
                  placeholder="Qty"
                  required={index === 0}
                  className="mt-0"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <SubmitButton>Create order</SubmitButton>
        </div>
      </form>
    </DashboardShell>
  );
}
