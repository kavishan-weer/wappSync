import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  Box,
  Image as ImageIcon,
} from "lucide-react";

import {
  DashboardBadge,
  DashboardHeader,
  DashboardShell,
  EmptyState,
  PrimaryLink,
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
        title="Product Catalog"
        description="Create, search, edit, and manage products with stock tracked under your shop."
      >
        <PrimaryLink href="/dashboard/products/new">
          <Plus className="size-4" /> Add Product
        </PrimaryLink>
      </DashboardHeader>

      {/* Search Bar */}
      <form>
        <div className="relative flex max-w-md items-center">
          <Search className="absolute left-3 size-5 text-[#8696A0]" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search products by name..."
            className="h-12 w-full rounded-xl border border-[#E0E6EA] bg-white pl-10 pr-24 text-sm text-[#111B21] shadow-[0_2px_8px_rgba(17,27,33,0.04)] outline-none transition focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
          />
          <button
            type="submit"
            className="absolute right-2 h-8 rounded-lg bg-[#F0F2F5] px-3 text-xs font-bold text-[#111B21] transition hover:bg-[#E9ECEF]"
          >
            Search
          </button>
        </div>
      </form>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              query
                ? `No products match "${query}". Try a different search term.`
                : "Add your first product to start building your catalog."
            }
            className="col-span-full"
          >
            {!query && (
              <PrimaryLink href="/dashboard/products/new">
                <Plus className="size-4" /> Create Product
              </PrimaryLink>
            )}
          </EmptyState>
        ) : (
          products.map((product) => {
            const imageUrl =
              product.product_images && product.product_images.length > 0
                ? product.product_images[0].public_url
                : null;

            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E0E6EA] bg-white shadow-[0_4px_12px_rgba(17,27,33,0.04)] transition hover:shadow-[0_8px_24px_rgba(17,27,33,0.08)]"
              >
                {/* Image Area */}
                <div className="relative aspect-[4/3] w-full bg-[#F0F2F5]">
                  {imageUrl ? (
                    // Product images can come from a shop-owned Supabase Storage URL that is not known at build time.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <ImageIcon className="size-10 text-[#D1D7DB]" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute right-3 top-3">
                    {product.status === "active" ? (
                      <DashboardBadge tone="green" className="shadow-sm backdrop-blur-md">
                        <span className="size-1.5 rounded-full bg-[#1DA851]" />
                        Active
                      </DashboardBadge>
                    ) : (
                      <DashboardBadge tone="neutral" className="bg-white/90 shadow-sm backdrop-blur-md">
                        <span className="size-1.5 rounded-full bg-[#667781]" />
                        Inactive
                      </DashboardBadge>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-1 text-lg font-bold text-[#111B21]" title={product.name}>
                      {product.name}
                    </h2>
                    <span className="shrink-0 text-lg font-bold text-[#25D366]">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#667781]" title={product.description}>
                    {product.description || "No description provided."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-[#667781]">
                    <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F7F9] px-2.5 py-1.5">
                      <Box className="size-3.5 text-[#8696A0]" />
                      <span>{product.stock_count} in stock</span>
                    </div>
                    {product.category && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F7F9] px-2.5 py-1.5">
                        <Tag className="size-3.5 text-[#8696A0]" />
                        <span className="truncate">{product.category}</span>
                      </div>
                    )}
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#E0E6EA] px-2 py-0.5 text-[10px] font-bold text-[#8696A0]"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="rounded-full border border-[#E0E6EA] px-2 py-0.5 text-[10px] font-bold text-[#8696A0]">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <div className="flex items-center gap-2 border-t border-[#F0F2F5] pt-4">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#D1D7DB] bg-white text-xs font-bold text-[#111B21] transition hover:bg-[#F5F7F9]"
                      >
                        <Edit2 className="size-3.5" /> Edit
                      </Link>
                      
                      <form action={deleteProduct} className="shrink-0">
                        <input type="hidden" name="product_id" value={product.id} />
                        <button
                          type="submit"
                          title="Delete product"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1D7DB] bg-white text-[#667781] transition hover:border-[#FF6B6B]/50 hover:bg-[#FF6B6B]/10 hover:text-[#B42318]"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}
