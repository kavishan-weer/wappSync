import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
  SubmitButton,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Document } from "@/lib/db/types";

import { deleteDocument, reprocessDocument, uploadDocument } from "./actions";

function statusDisplay(status: string) {
  switch (status) {
    case "ready":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F9F0] px-2.5 py-1 text-xs font-bold text-[#1DA851]">
          <CheckCircle2 className="size-3" /> Ready
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#53BDEB]/10 px-2.5 py-1 text-xs font-bold text-[#53BDEB]">
          <Loader2 className="size-3 animate-spin" /> Processing
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B6B]/10 px-2.5 py-1 text-xs font-bold text-[#B42318]">
          <AlertTriangle className="size-3" /> Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F2F5] px-2.5 py-1 text-xs font-bold text-[#667781]">
          <Clock className="size-3" /> Pending
        </span>
      );
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentsPage() {
  const { supabase, shop } = await requireShop();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  const docs = (documents ?? []) as Document[];

  return (
    <DashboardShell active="settings" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Knowledge Base"
        title="AI Training Documents"
        description="Upload policy PDFs, FAQ documents, or any business information. The AI will use these to answer customer questions accurately."
      />

      {/* Upload form */}
      <form
        action={uploadDocument}
        className="mt-6 rounded-xl border border-dashed border-[#25D366]/40 bg-[#E6F9F0]/30 p-6 transition hover:border-[#25D366]/60 hover:bg-[#E6F9F0]/50"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10">
            <Upload className="size-6 text-[#25D366]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-[#111B21]">
              Upload a PDF document
            </p>
            <p className="mt-1 text-xs text-[#667781]">
              Max 10 MB. The document will be processed automatically — text
              extracted, split into chunks, and embedded for AI search.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              name="file"
              accept=".pdf,application/pdf"
              required
              className="w-56 text-sm text-[#667781] file:mr-3 file:rounded-lg file:border-0 file:bg-[#25D366] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:shadow-[0_6px_16px_rgba(37,211,102,0.2)] file:transition hover:file:bg-[#1DA851]"
            />
            <SubmitButton>Upload</SubmitButton>
          </div>
        </div>
      </form>

      {/* Document list */}
      <div className="mt-6 space-y-3">
        {docs.length === 0 ? (
          <div className="rounded-xl border border-[#E0E6EA] bg-white p-10 text-center shadow-[0_14px_34px_rgba(17,27,33,0.05)]">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#F0F2F5]">
              <FileText className="size-7 text-[#8696A0]" />
            </div>
            <p className="mt-4 text-sm font-bold text-[#111B21]">
              No documents yet
            </p>
            <p className="mt-1 text-xs text-[#667781]">
              Upload your first PDF to start training your AI assistant.
            </p>
          </div>
        ) : (
          docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 rounded-xl border border-[#E0E6EA] bg-white p-4 shadow-[0_4px_12px_rgba(17,27,33,0.04)] transition hover:shadow-[0_8px_24px_rgba(17,27,33,0.08)]"
            >
              {/* Icon */}
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#FF6B6B]/10">
                <FileText className="size-5 text-[#FF6B6B]" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#111B21]">
                  {doc.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#667781]">
                  <span>{formatFileSize(doc.file_size)}</span>
                  {doc.chunk_count > 0 && (
                    <span>{doc.chunk_count} chunks</span>
                  )}
                  <span>
                    {new Date(doc.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {doc.error_message && (
                  <p className="mt-1 truncate text-xs text-[#B42318]">
                    {doc.error_message}
                  </p>
                )}
              </div>

              {/* Status */}
              {statusDisplay(doc.status)}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {doc.status === "failed" && (
                  <form action={reprocessDocument}>
                    <input
                      type="hidden"
                      name="document_id"
                      value={doc.id}
                    />
                    <button
                      type="submit"
                      title="Retry processing"
                      className="flex size-9 items-center justify-center rounded-lg border border-[#D1D7DB] bg-white text-[#667781] transition hover:bg-[#F5F7F9] hover:text-[#111B21]"
                    >
                      <RefreshCw className="size-4" />
                    </button>
                  </form>
                )}
                <form action={deleteDocument}>
                  <input
                    type="hidden"
                    name="document_id"
                    value={doc.id}
                  />
                  <button
                    type="submit"
                    title="Delete document"
                    className="flex size-9 items-center justify-center rounded-lg border border-[#D1D7DB] bg-white text-[#667781] transition hover:border-[#FF6B6B]/50 hover:bg-[#FF6B6B]/10 hover:text-[#B42318]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
