import {
  Field,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import type { Product } from "@/lib/db/types";

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  submitLabel: string;
}) {
  const sizes =
    product?.product_variants
      ?.filter((variant) => variant.name === "Size")
      .map((variant) => variant.value)
      .join(", ") ?? "";
  const colors =
    product?.product_variants
      ?.filter((variant) => variant.name === "Color")
      .map((variant) => variant.value)
      .join(", ") ?? "";

  return (
    <form action={action} className="mt-6 flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Content */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* General Information */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="mb-5 text-lg font-bold text-[#111B21]">Basic Details</h2>
            <div className="grid gap-5">
              <Field label="Product Name">
                <TextInput name="name" defaultValue={product?.name ?? ""} placeholder="e.g. Vintage Cotton T-Shirt" required />
              </Field>
              <Field label="Description">
                <TextArea
                  name="description"
                  defaultValue={product?.description ?? ""}
                  placeholder="Describe your product's features and benefits..."
                  required
                />
              </Field>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="mb-5 text-lg font-bold text-[#111B21]">Pricing & Inventory</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Price (USD)">
                <TextInput
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={product?.price ?? ""}
                  required
                />
              </Field>
              <Field label="Stock Quantity">
                <TextInput
                  name="stock_count"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={product?.stock_count ?? ""}
                  required
                />
              </Field>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="mb-5 text-lg font-bold text-[#111B21]">Media</h2>
            <div className="rounded-xl border border-dashed border-[#D1D7DB] bg-[#F5F7F9] p-6 text-center transition hover:border-[#25D366] hover:bg-[#E6F9F0]">
              <Field label="Product Image">
                <TextInput name="image" type="file" accept="image/*" className="mt-2" />
              </Field>
              <p className="mt-2 text-xs text-[#667781]">
                Upload a high-quality image of your product. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Status & Organization */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="mb-5 text-lg font-bold text-[#111B21]">Organization</h2>
            <div className="grid gap-5">
              <Field label="Status">
                <select
                  name="status"
                  defaultValue={product?.status ?? "active"}
                  className="mt-2 h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Draft / Inactive</option>
                </select>
              </Field>
              <Field label="Category">
                <TextInput name="category" placeholder="e.g. Clothing" defaultValue={product?.category ?? ""} />
              </Field>
              <Field label="Tags">
                <TextInput
                  name="tags"
                  placeholder="e.g. summer, cotton, new"
                  defaultValue={product?.tags?.join(", ") ?? ""}
                />
              </Field>
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="mb-5 text-lg font-bold text-[#111B21]">Variants</h2>
            <div className="grid gap-5">
              <Field label="Sizes (comma separated)">
                <TextInput name="sizes" placeholder="S, M, L, XL" defaultValue={sizes} />
              </Field>
              <Field label="Colors (comma separated)">
                <TextInput name="colors" placeholder="Red, Blue, Green" defaultValue={colors} />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-[#E0E6EA] py-4">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
