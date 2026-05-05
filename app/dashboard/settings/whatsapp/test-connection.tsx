"use client";

import { useState, useTransition } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

import { testWhatsAppConnection } from "./actions";

export function TestConnectionButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  function handleTest() {
    startTransition(async () => {
      const res = await testWhatsAppConnection();
      setResult(res);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleTest}
        disabled={isPending}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] transition hover:bg-[#F5F7F9] disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Wifi className="size-4" />
        )}
        {isPending ? "Testing…" : "Test Connection"}
      </button>

      {result ? (
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
            result.success
              ? "border-[#25D366]/30 bg-[#E6F9F0] text-[#1DA851]"
              : "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#B42318]"
          }`}
        >
          {result.success ? (
            <Wifi className="size-4 shrink-0" />
          ) : (
            <WifiOff className="size-4 shrink-0" />
          )}
          {result.message}
        </div>
      ) : null}
    </div>
  );
}
