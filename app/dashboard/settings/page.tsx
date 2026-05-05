import {
  DashboardHeader,
  DashboardShell,
  Field,
  SubmitButton,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import { updateShopSettings } from "../shop/actions";

export default async function SettingsPage() {
  const { shop } = await requireShop();

  return (
    <DashboardShell active="settings" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Settings"
        title="Shop settings"
        description="Update your shop profile and the basic settings used by products and orders."
      />

      <form
        action={updateShopSettings}
        className="mt-6 grid gap-5 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)] md:grid-cols-2"
      >
        <Field label="Shop name">
          <TextInput name="name" defaultValue={shop.name} required />
        </Field>
        <Field label="Business type">
          <TextInput
            name="business_type"
            defaultValue={shop.business_type ?? ""}
            required
          />
        </Field>
        <Field label="WhatsApp number">
          <TextInput
            name="whatsapp_number"
            defaultValue={shop.whatsapp_number ?? ""}
            required
          />
        </Field>
        <Field label="Default currency">
          <TextInput
            name="default_currency"
            defaultValue={shop.settings?.default_currency ?? "LKR"}
            required
          />
        </Field>
        <Field label="Order prefix">
          <TextInput
            name="order_prefix"
            defaultValue={shop.settings?.order_prefix ?? "ORD"}
            required
          />
        </Field>
        <Field label="Low stock alert threshold">
          <TextInput
            name="low_stock_alert_threshold"
            type="number"
            min="0"
            defaultValue={shop.settings?.low_stock_alert_threshold ?? 5}
            required
          />
        </Field>
        <div className="md:col-span-2">
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </DashboardShell>
  );
}
