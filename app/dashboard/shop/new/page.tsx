import { redirect } from "next/navigation";

import {
  DashboardHeader,
  DashboardShell,
  Field,
  FormPanel,
  SubmitButton,
  TextInput,
} from "@/components/dashboard/dashboard-shell";
import { getOwnerShop, requireUser } from "@/lib/auth/dashboard";
import { createShop } from "../actions";

export default async function NewShopPage() {
  const { supabase, user } = await requireUser();
  const existingShop = await getOwnerShop(supabase, user.id);

  if (existingShop) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell active="dashboard" shopName="Setup">
      <div className="mx-auto w-full max-w-3xl">
        <DashboardHeader
          eyebrow="Shop setup"
          title="Create your shop profile"
          description="Add the basic shop details needed before products and orders can be managed."
        />

        <form action={createShop} className="mt-6">
          <FormPanel title="Shop details">
          <Field label="Owner name">
            <TextInput name="full_name" defaultValue="" />
          </Field>
          <Field label="Shop name">
            <TextInput name="name" required />
          </Field>
          <Field label="Business type">
            <TextInput
              name="business_type"
              placeholder="Clothing, beauty, home business"
              required
            />
          </Field>
          <Field label="WhatsApp number">
            <TextInput name="whatsapp_number" placeholder="+94771234567" required />
          </Field>
          <SubmitButton>Create shop</SubmitButton>
          </FormPanel>
        </form>
      </div>
    </DashboardShell>
  );
}
