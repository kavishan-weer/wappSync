import {
  Store,
  Briefcase,
  Phone,
  DollarSign,
  Hash,
  AlertTriangle,
  Building2,
  Settings as SettingsIcon,
} from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
  Field,
  FormPanel,
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
        title="Shop Settings"
        description="Update your shop profile and the basic settings used by products and orders."
      />

      <form action={updateShopSettings} className="flex flex-col gap-6">
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Shop Profile */}
          <FormPanel
            icon={Building2}
            title="Shop Profile"
            description="Basic information about your business."
          >
              <Field label="Shop Name">
                <div className="relative">
                  <Store className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput name="name" defaultValue={shop.name} className="pl-10" required />
                </div>
              </Field>
              <Field label="Business Type">
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput
                    name="business_type"
                    defaultValue={shop.business_type ?? ""}
                    className="pl-10"
                    placeholder="e.g. Clothing & Apparel"
                    required
                  />
                </div>
              </Field>
              <Field label="Contact Number">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput
                    name="whatsapp_number"
                    defaultValue={shop.whatsapp_number ?? ""}
                    className="pl-10"
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </Field>
          </FormPanel>

          {/* System Preferences */}
          <FormPanel
            icon={SettingsIcon}
            title="System Preferences"
            description="Defaults for orders, inventory, and localization."
          >
              <Field label="Default Currency">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput
                    name="default_currency"
                    defaultValue={shop.settings?.default_currency ?? "USD"}
                    className="pl-10"
                    required
                  />
                </div>
              </Field>
              <Field label="Order Prefix">
                <div className="relative">
                  <Hash className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput
                    name="order_prefix"
                    defaultValue={shop.settings?.order_prefix ?? "ORD"}
                    className="pl-10"
                    placeholder="e.g. ORD"
                    required
                  />
                </div>
              </Field>
              <Field label="Low Stock Alert Threshold">
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput
                    name="low_stock_alert_threshold"
                    type="number"
                    min="0"
                    defaultValue={shop.settings?.low_stock_alert_threshold ?? 5}
                    className="pl-10"
                    required
                  />
                </div>
              </Field>
          </FormPanel>
        </div>

        <div className="flex items-center justify-end border-t border-[#E0E6EA] py-4">
          <SubmitButton>Save Settings</SubmitButton>
        </div>
      </form>
    </DashboardShell>
  );
}
