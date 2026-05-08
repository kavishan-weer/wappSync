"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5] px-4 py-10 text-[#111B21]">
      <div className="w-full max-w-xl rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_24px_80px_rgba(17,27,33,0.12)]">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[#FF6B6B]/10 text-[#B42318]">
          <AlertTriangle className="size-6" />
        </div>

        <h1 className="mt-5 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-[#667781]">
          The dashboard could not load this view. Your stored messages and orders
          are not affected. Try again, and if it keeps happening, check the setup
          and webhook logs.
        </p>

        {error.message ? (
          <p className="mt-4 rounded-lg border border-[#E0E6EA] bg-[#F5F7F9] p-3 text-sm text-[#41525D]">
            {error.message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white transition hover:bg-[#1DA851]"
        >
          <RefreshCw className="size-4" /> Try again
        </button>
      </div>
    </main>
  );
}
