import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { signup } from "@/app/login/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5] px-5 py-12">
      <section className="w-full max-w-md rounded-lg border border-[#E0E6EA] bg-white p-8 shadow-[0_24px_70px_rgba(17,27,33,0.10)]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_14px_30px_rgba(37,211,102,0.28)]">
            <MessageCircle className="size-6" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#111B21]">wappSync</p>
            <p className="text-sm text-[#667781]">Owner signup</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold leading-tight text-[#111B21]">
          Create your owner account
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#667781]">
          Start with the Phase 0 dashboard foundation.
        </p>

        {params.error ? (
          <p className="mt-5 rounded-lg border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 px-4 py-3 text-sm font-medium text-[#B42318]">
            {params.error}
          </p>
        ) : null}

        <form action={signup} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-[#111B21]">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#111B21]">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-2 h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20"
            />
          </label>

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-[#25D366] text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.24)] transition hover:bg-[#1DA851]"
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#667781]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#1DA851]">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
