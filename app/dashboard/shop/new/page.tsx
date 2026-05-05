import { redirect } from "next/navigation";

import {
  DashboardHeader,
  Field,
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
    <main className="min-h-screen bg-[#F0F2F5] px-5 py-10 text-[#111B21]">
      <div className="mx-auto max-w-3xl">
        <DashboardHeader
          eyebrow="Shop setup"
          title="Create your shop profile"
          description="Add the basic shop details needed before products and orders can be managed."
        />

        <form
          action={createShop}
          className="mt-6 space-y-5 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]"
        >
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
        </form>
      </div>
    </main>
  );
}
