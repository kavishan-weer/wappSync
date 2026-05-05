import { Database } from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/dashboard";

export default async function SetupRequiredPage() {
  await requireUser();

  return (
    <DashboardShell active="dashboard">
      <DashboardHeader
        eyebrow="Database setup"
        title="Apply the Supabase migrations"
        description="Your Supabase project is connected, but the required database tables are not available yet."
      />

      <section className="mt-6 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]">
        <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-[#E6F9F0] text-[#1DA851]">
          <Database className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-[#111B21]">
          Database tables are missing
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667781]">
          Supabase returned that `public.shops` is missing from the schema
          cache. Apply the project migrations in order, then refresh the
          dashboard.
        </p>

        <div className="mt-5 rounded-lg bg-[#F0F2F5] p-4 font-mono text-sm leading-7 text-[#111B21]">
          <p>supabase/migrations/0001_phase0_foundation.sql</p>
          <p>supabase/migrations/0002_phases_1_3_shop_products_orders.sql</p>
        </div>

        <p className="mt-5 text-sm leading-6 text-[#667781]">
          If you are using the Supabase SQL editor, paste and run both files in
          order. If you are using the Supabase CLI, link the project and push the
          migrations.
        </p>
      </section>
    </DashboardShell>
  );
}
