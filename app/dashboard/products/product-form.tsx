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
    <form
      action={action}
      className="mt-6 grid gap-5 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)] md:grid-cols-2"
    >
      <Field label="Name">
        <TextInput name="name" defaultValue={product?.name ?? ""} required />
      </Field>
      <Field label="Status">
        <select
          name="status"
          defaultValue={product?.status ?? "active"}
          className="mt-2 h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>
      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea
            name="description"
            defaultValue={product?.description ?? ""}
            required
          />
        </Field>
      </div>
      <Field label="Price">
        <TextInput
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.price ?? ""}
          required
        />
      </Field>
      <Field label="Stock count">
        <TextInput
          name="stock_count"
          type="number"
          min="0"
          defaultValue={product?.stock_count ?? ""}
          required
        />
      </Field>
      <Field label="Category">
        <TextInput name="category" defaultValue={product?.category ?? ""} />
      </Field>
      <Field label="Tags">
        <TextInput
          name="tags"
          placeholder="dress, cotton, COD"
          defaultValue={product?.tags?.join(", ") ?? ""}
        />
      </Field>
      <Field label="Sizes">
        <TextInput name="sizes" placeholder="S, M, L" defaultValue={sizes} />
      </Field>
      <Field label="Colors">
        <TextInput name="colors" placeholder="Red, Blue" defaultValue={colors} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Product image">
          <TextInput name="image" type="file" accept="image/*" />
        </Field>
      </div>
      <div className="md:col-span-2">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
