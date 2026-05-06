import {
  Field,
  FormPanel,
  SelectInput,
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
          <FormPanel title="Basic Details">
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
          </FormPanel>

          {/* Pricing & Inventory */}
          <FormPanel title="Pricing & Inventory">
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
          </FormPanel>

          {/* Media */}
          <FormPanel title="Media">
            <div className="rounded-xl border border-dashed border-[#D1D7DB] bg-[#F5F7F9] p-6 text-center transition hover:border-[#25D366] hover:bg-[#E6F9F0]">
              <Field label="Product Image">
                <TextInput name="image" type="file" accept="image/*" className="mt-2" />
              </Field>
              <p className="mt-2 text-xs text-[#667781]">
                Upload a high-quality image of your product. Max 5MB.
              </p>
            </div>
          </FormPanel>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Status & Organization */}
          <FormPanel title="Organization">
              <Field label="Status">
                <SelectInput
                  name="status"
                  defaultValue={product?.status ?? "active"}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Draft / Inactive</option>
                </SelectInput>
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
          </FormPanel>

          {/* Variants */}
          <FormPanel title="Variants">
              <Field label="Sizes (comma separated)">
                <TextInput name="sizes" placeholder="S, M, L, XL" defaultValue={sizes} />
              </Field>
              <Field label="Colors (comma separated)">
                <TextInput name="colors" placeholder="Red, Blue, Green" defaultValue={colors} />
              </Field>
          </FormPanel>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-[#E0E6EA] py-4">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
