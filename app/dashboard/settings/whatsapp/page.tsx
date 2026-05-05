import { CheckCircle2, XCircle, MessageCircle } from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
  Field,
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
    <DashboardShell active="settings" shopName={shop.name}>
      <DashboardHeader
        eyebrow="WhatsApp"
        title="WhatsApp Cloud API"
        description="Connect your WhatsApp Business number using the Meta Cloud API to receive and send messages."
      />

      {/* Connection status badge */}
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-[#E0E6EA] bg-white p-4 shadow-[0_14px_34px_rgba(17,27,33,0.05)]">
        {account?.is_connected ? (
          <>
            <CheckCircle2 className="size-5 text-[#25D366]" />
            <div>
              <p className="text-sm font-bold text-[#111B21]">Connected</p>
              <p className="text-xs text-[#667781]">
                Phone: {account.display_phone ?? account.phone_number_id}
              </p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="size-5 text-[#8696A0]" />
            <div>
              <p className="text-sm font-bold text-[#111B21]">Not connected</p>
              <p className="text-xs text-[#667781]">
                Enter your API credentials below and test the connection.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Configuration form */}
      <form
        action={saveWhatsAppConfig}
        className="mt-6 grid gap-5 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)] md:grid-cols-2"
      >
        <Field label="Phone Number ID">
          <TextInput
            name="phone_number_id"
            defaultValue={account?.phone_number_id ?? ""}
            placeholder="e.g. 123456789012345"
            required
          />
        </Field>
        <Field label="WhatsApp Business Account ID (optional)">
          <TextInput
            name="waba_id"
            defaultValue={account?.waba_id ?? ""}
            placeholder="e.g. 987654321098765"
          />
        </Field>
        <Field label="Permanent Access Token">
          <TextInput
            name="access_token"
            type="password"
            defaultValue={account?.access_token ?? ""}
            placeholder="EAAxxxxxxx..."
            required
          />
        </Field>
        <Field label="Verify Token">
          <TextInput
            name="verify_token"
            defaultValue={account?.verify_token ?? ""}
            placeholder="A secret string you choose"
            required
          />
        </Field>

        <div className="md:col-span-2">
          <SubmitButton>Save configuration</SubmitButton>
        </div>
      </form>

      {/* Test connection */}
      <div className="mt-6 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]">
        <h2 className="text-lg font-bold text-[#111B21]">Test connection</h2>
        <p className="mt-2 text-sm text-[#667781]">
          After saving your credentials, click the button below to verify they
          work with the Meta API.
        </p>
        <div className="mt-4">
          <TestConnectionButton />
        </div>
      </div>

      {/* Webhook setup guide */}
      <div className="mt-6 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]">
        <h2 className="text-lg font-bold text-[#111B21]">Webhook setup</h2>
        <p className="mt-2 text-sm text-[#667781]">
          In the Meta Developer Dashboard, set the webhook URL to:
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#E0E6EA] bg-[#F0F2F5] p-3">
          <MessageCircle className="size-4 shrink-0 text-[#1DA851]" />
          <code className="break-all text-sm font-medium text-[#111B21]">
            {webhookUrl}
          </code>
        </div>
        <p className="mt-3 text-sm text-[#667781]">
          Use the <strong>Verify Token</strong> you entered above when
          configuring the webhook in Meta&apos;s dashboard.
        </p>

        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-bold text-[#111B21]">Quick setup steps:</h3>
          <ol className="list-inside list-decimal space-y-2 text-sm text-[#667781]">
            <li>
              Go to{" "}
              <a
                href="https://developers.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1DA851] underline"
              >
                developers.facebook.com
              </a>
            </li>
            <li>Open your app → WhatsApp → Configuration</li>
            <li>Under Webhook, click Edit and paste the URL above</li>
            <li>Enter your Verify Token and click Verify and save</li>
            <li>Subscribe to the <strong>messages</strong> field</li>
            <li>Generate a permanent access token from System Users</li>
          </ol>
        </div>
      </div>
    </DashboardShell>
  );
}
