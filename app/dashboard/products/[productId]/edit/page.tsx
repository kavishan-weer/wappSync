import { notFound } from "next/navigation";

import {
  DashboardHeader,
  DashboardShell,
  SecondaryLink,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Product } from "@/lib/db/types";
import { updateProduct } from "../../actions";
import { ProductForm } from "../../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { supabase, shop } = await requireShop();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("shop_id", shop.id)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const product = data as Product;
  const action = updateProduct.bind(null, product.id);

  return (
    <DashboardShell active="products" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Products"
        title={`Edit ${product.name}`}
        description="Update product details, stock, status, variants, and optional image."
      >
        <SecondaryLink href="/dashboard/products">Back</SecondaryLink>
      </DashboardHeader>
      <ProductForm
        action={action}
        product={product}
        submitLabel="Save product"
      />
    </DashboardShell>
  );
}
