import { CheckCircle2, XCircle, MessageCircle, Phone, Fingerprint, Key, ShieldCheck, HelpCircle } from "lucide-react";

import {
  DashboardCard,
  DashboardCardHeader,
  DashboardHeader,
  DashboardShell,
  Field,
  FormPanel,
  SubmitButton,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import { saveWhatsAppConfig } from "./actions";
import { TestConnectionButton } from "./test-connection";

export default async function WhatsAppSettingsPage() {
  const { supabase, shop } = await requireShop();

  const { data: account } = await supabase
    .from("whatsapp_accounts")
    .select("*")
    .eq("shop_id", shop.id)
    .maybeSingle();

  const webhookUrl =
    process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`
      : "https://your-domain.com/api/whatsapp/webhook";

  return (
    <DashboardShell active="whatsapp" shopName={shop.name}>
      <DashboardHeader
        eyebrow="WhatsApp"
        title="WhatsApp Cloud API"
        description="Connect your WhatsApp Business number using the Meta Cloud API to receive and send messages automatically."
      />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex flex-1 flex-col gap-6">
          {/* Connection status badge */}
          <DashboardCard>
            <DashboardCardHeader title="Connection Status" />
            <div className={`flex items-center gap-4 rounded-xl border p-4 ${account?.is_connected ? 'border-[#25D366]/30 bg-[#E6F9F0]/50' : 'border-[#E0E6EA] bg-[#F5F7F9]'}`}>
              {account?.is_connected ? (
                <>
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111B21]">Active & Connected</p>
                    <p className="text-sm text-[#667781]">
                      Phone: <span className="font-mono font-medium">{account.display_phone ?? account.phone_number_id}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#8696A0] shadow-sm border border-[#D1D7DB]">
                    <XCircle className="size-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111B21]">Not Connected</p>
                    <p className="text-sm text-[#667781]">
                      Enter your API credentials below and test the connection.
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {!account?.is_connected && (
              <div className="mt-5">
                <TestConnectionButton />
              </div>
            )}
            {account?.is_connected && (
              <div className="mt-5 flex items-center justify-between border-t border-[#E0E6EA] pt-5">
                <p className="text-sm text-[#667781]">Re-verify connection if you encounter issues.</p>
                <TestConnectionButton />
              </div>
            )}
          </DashboardCard>

          {/* Configuration form */}
          <form action={saveWhatsAppConfig}>
            <FormPanel
              title="API Credentials"
              description="Enter the details from your Meta Developer app dashboard."
            >
            
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Phone Number ID">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput
                    name="phone_number_id"
                    defaultValue={account?.phone_number_id ?? ""}
                    placeholder="e.g. 123456789012345"
                    className="pl-10 font-mono text-sm"
                    required
                  />
                </div>
              </Field>
              <Field label="WhatsApp Business Account ID (Optional)">
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                  <TextInput
                    name="waba_id"
                    defaultValue={account?.waba_id ?? ""}
                    placeholder="e.g. 987654321098765"
                    className="pl-10 font-mono text-sm"
                  />
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Permanent Access Token">
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                    <TextInput
                      name="access_token"
                      type="password"
                      defaultValue={account?.access_token ?? ""}
                      placeholder="EAAxxxxxxx..."
                      className="pl-10 font-mono text-sm"
                      required
                    />
                  </div>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Verify Token (For Webhook)">
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3.5 size-4 text-[#8696A0]" />
                    <TextInput
                      name="verify_token"
                      defaultValue={account?.verify_token ?? ""}
                      placeholder="A secret string you choose"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[#8696A0]">You will need this token when setting up the webhook in Meta.</p>
                </Field>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end border-t border-[#E0E6EA] pt-5">
              <SubmitButton>Save Configuration</SubmitButton>
            </div>
            </FormPanel>
          </form>
        </div>

        {/* Sidebar: Webhook setup guide */}
        <div className="flex w-full flex-col gap-6 xl:w-96">
          <DashboardCard>
            <DashboardCardHeader icon={HelpCircle} title="Webhook Setup Guide" />
            <p className="mt-2 text-sm leading-relaxed text-[#667781]">
              To receive inbound messages, configure your webhook in the Meta Developer Dashboard with this URL:
            </p>
            
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#E6F9F0]/30 p-3 shadow-sm">
              <MessageCircle className="size-5 shrink-0 text-[#1DA851]" />
              <code className="break-all text-sm font-bold text-[#111B21]">
                {webhookUrl}
              </code>
            </div>

            <div className="mt-6 rounded-xl bg-[#F5F7F9] p-5">
              <h3 className="text-sm font-bold text-[#111B21]">Quick Steps</h3>
              <ul className="mt-3 flex flex-col gap-3 text-sm text-[#667781]">
                <li className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#111B21] shadow-sm">1</span>
                  <span>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="font-bold text-[#25D366] hover:underline">developers.facebook.com</a></span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#111B21] shadow-sm">2</span>
                  <span>Open your app → WhatsApp → Configuration</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#111B21] shadow-sm">3</span>
                  <span>Under Webhook, click Edit and paste the URL above</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#111B21] shadow-sm">4</span>
                  <span>Enter your Verify Token and click Verify</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-xs font-bold text-white shadow-sm">5</span>
                  <span className="font-semibold text-[#111B21]">Subscribe to the messages field</span>
                </li>
              </ul>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardShell>
  );
}
