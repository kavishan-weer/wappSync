"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireShop } from "@/lib/auth/dashboard";
import { isOrderStatus } from "@/lib/orders/status";

function requiredText(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

export async function createOrder(formData: FormData) {
  const { supabase, shop } = await requireShop();
  const customerName = requiredText(formData, "customer_name", "Customer name");
  const customerPhone = requiredText(
    formData,
    "customer_phone",
    "Customer phone",
  );
  const customerAddress = requiredText(
    formData,
    "customer_address",
    "Customer address",
  );
  const status = String(formData.get("status") ?? "pending");

  if (!isOrderStatus(status)) {
    throw new Error("Order status is invalid.");
  }

  const items = [0, 1, 2]
    .map((index) => {
      const productId = String(formData.get(`product_id_${index}`) ?? "");
      const quantity = Number.parseInt(
        String(formData.get(`quantity_${index}`) ?? ""),
        10,
      );

      if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        return null;
      }

      return {
        product_id: productId,
        quantity,
      };
    })
    .filter((item): item is { product_id: string; quantity: number } =>
      Boolean(item),
    );

  if (items.length === 0) {
    throw new Error("Add at least one product to create an order.");
  }

  const { data: orderId, error } = await supabase.rpc("create_manual_order", {
    p_shop_id: shop.id,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_address: customerAddress,
    p_items: items,
    p_status: status,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${orderId}`);
}

export async function updateOrderStatus(formData: FormData) {
  const { supabase, shop } = await requireShop();
  const orderId = requiredText(formData, "order_id", "Order");
  const status = requiredText(formData, "status", "Status");

  if (!isOrderStatus(status)) {
    throw new Error("Order status is invalid.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("shop_id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
}
