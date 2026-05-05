import Link from "next/link";

import {
  DashboardHeader,
  DashboardShell,
  PrimaryLink,
  SubmitButton,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Product } from "@/lib/db/types";
import { deleteProduct } from "./actions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { supabase, shop } = await requireShop();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  let productsQuery = supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  if (query) {
    productsQuery = productsQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await productsQuery;

  if (error) {
    throw new Error(error.message);
  }

  const products = (data ?? []) as Product[];

  return (
    <DashboardShell active="products" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Products"
        title="Product catalog"
        description="Create, search, edit, and manage products with stock tracked under your shop."
      >
        <PrimaryLink href="/dashboard/products/new">Add product</PrimaryLink>
      </DashboardHeader>

      <form className="mt-6 rounded-lg border border-[#E0E6EA] bg-white p-4 shadow-[0_14px_34px_rgba(17,27,33,0.05)]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <TextInput
            name="q"
            defaultValue={query}
            placeholder="Search products"
            className="mt-0"
          />
          <button
            type="submit"
            className="h-11 rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] transition hover:bg-[#F5F7F9]"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-4">
        {products.length === 0 ? (
          <section className="rounded-lg border border-[#E0E6EA] bg-white p-8 text-center shadow-[0_14px_34px_rgba(17,27,33,0.05)]">
            <h2 className="text-xl font-bold">No products yet</h2>
            <p className="mt-2 text-sm text-[#667781]">
              Add your first product to start creating manual orders.
            </p>
          </section>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              className="grid gap-4 rounded-lg border border-[#E0E6EA] bg-white p-5 shadow-[0_14px_34px_rgba(17,27,33,0.05)] lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">{product.name}</h2>
                  <span className="rounded-full bg-[#E6F9F0] px-3 py-1 text-xs font-bold text-[#1DA851]">
                    {product.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#667781]">
                  {product.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[#667781]">
                  <span>Price: {Number(product.price).toFixed(2)}</span>
                  <span>Stock: {product.stock_count}</span>
                  {product.category ? <span>{product.category}</span> : null}
                </div>
                {product.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#F0F2F5] px-3 py-1 text-xs font-semibold text-[#667781]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 lg:justify-end">
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="inline-flex h-10 items-center rounded-lg border border-[#D1D7DB] px-4 text-sm font-bold text-[#111B21] hover:bg-[#F5F7F9]"
                >
                  Edit
                </Link>
                <form action={deleteProduct}>
                  <input type="hidden" name="product_id" value={product.id} />
                  <SubmitButton>Delete</SubmitButton>
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
