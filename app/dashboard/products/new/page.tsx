import {
  DashboardHeader,
  DashboardShell,
  SecondaryLink,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const { shop } = await requireShop();

  return (
    <DashboardShell active="products" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Products"
        title="Add product"
        description="Create a product with price, stock, optional image, and basic variants."
      >
        <SecondaryLink href="/dashboard/products">Back</SecondaryLink>
      </DashboardHeader>
      <ProductForm action={createProduct} submitLabel="Create product" />
    </DashboardShell>
  );
}
