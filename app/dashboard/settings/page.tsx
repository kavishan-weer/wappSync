import {
  Store,
  Briefcase,
  Phone,
  DollarSign,
  Hash,
  AlertTriangle,
  Building2,
  Settings as SettingsIcon,
  Bell,
  Bot,
  Clock,
  MessageSquare,
} from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
  Field,
  FormPanel,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import { updateShopSettings } from "../shop/actions";

export default async function SettingsPage() {
  const { shop } = await requireShop();
  const settings = shop.settings;

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
                    placeholder="+94771234567"
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
                    defaultValue={settings?.default_currency ?? "USD"}
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
                    defaultValue={settings?.order_prefix ?? "ORD"}
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
                    defaultValue={settings?.low_stock_alert_threshold ?? 5}
                    className="pl-10"
                    required
                  />
                </div>
              </Field>
          </FormPanel>

          <FormPanel
            icon={Bot}
            title="Automation Controls"
            description="Control when the AI can reply automatically."
          >
            <label className="flex items-start gap-3 rounded-lg border border-[#E0E6EA] bg-[#F8FAFB] p-4">
              <input
                type="checkbox"
                name="automation_enabled"
                defaultChecked={settings?.automation_enabled ?? true}
                className="mt-1 size-4 accent-[#25D366]"
              />
              <span>
                <span className="block text-sm font-bold text-[#111B21]">
                  Automation on
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-[#667781]">
                  When this is off, the webhook stores inbound messages but does not send AI replies.
                </span>
              </span>
            </label>

            <Field
              label="Owner Alert Number"
              hint="Escalation alerts are sent here. If empty, the shop contact number is used."
            >
              <div className="relative">
                <Bell className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                <TextInput
                  name="owner_alert_phone"
                  defaultValue={settings?.owner_alert_phone ?? ""}
                  className="pl-10"
                  placeholder="+94771234567"
                />
              </div>
            </Field>
          </FormPanel>

          <FormPanel
            icon={MessageSquare}
            title="Fallback Message"
            description="Used when AI pauses, escalates, or answers outside business hours."
          >
            <Field label="Fallback reply">
              <TextArea
                name="fallback_message"
                defaultValue={
                  settings?.fallback_message ??
                  "Thanks for your message. I want to make sure you get the right answer, so I'm connecting you with the shop owner. 😊"
                }
                maxLength={500}
                required
              />
            </Field>
          </FormPanel>

          <FormPanel
            icon={Clock}
            title="Business Hours"
            description="Optionally limit AI replies to a daily time window."
          >
            <label className="flex items-start gap-3 rounded-lg border border-[#E0E6EA] bg-[#F8FAFB] p-4">
              <input
                type="checkbox"
                name="business_hours_enabled"
                defaultChecked={settings?.business_hours_enabled ?? false}
                className="mt-1 size-4 accent-[#25D366]"
              />
              <span>
                <span className="block text-sm font-bold text-[#111B21]">
                  Use business hours
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-[#667781]">
                  Outside this window, customers receive the fallback message instead of an AI answer.
                </span>
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start time">
                <TextInput
                  name="business_hours_start"
                  type="time"
                  defaultValue={settings?.business_hours_start ?? "09:00"}
                  required
                />
              </Field>
              <Field label="End time">
                <TextInput
                  name="business_hours_end"
                  type="time"
                  defaultValue={settings?.business_hours_end ?? "17:00"}
                  required
                />
              </Field>
            </div>

            <Field label="Timezone">
              <TextInput
                name="business_hours_timezone"
                defaultValue={settings?.business_hours_timezone ?? "Asia/Colombo"}
                placeholder="Asia/Colombo"
                required
              />
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
