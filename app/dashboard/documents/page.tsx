import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  Database,
  BrainCircuit
} from "lucide-react";

import {
  DashboardHeader,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Document } from "@/lib/db/types";

import { deleteDocument, reprocessDocument } from "./actions";
import { DocumentUploadForm } from "./document-upload-form";

function statusDisplay(status: string) {
  switch (status) {
    case "ready":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F9F0] px-3 py-1.5 text-xs font-bold text-[#1DA851] shadow-sm">
          <CheckCircle2 className="size-4" /> Ready
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#53BDEB]/10 px-3 py-1.5 text-xs font-bold text-[#53BDEB] shadow-sm">
          <Loader2 className="size-4 animate-spin" /> Processing
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B6B]/10 px-3 py-1.5 text-xs font-bold text-[#B42318] shadow-sm">
          <AlertTriangle className="size-4" /> Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F2F5] px-3 py-1.5 text-xs font-bold text-[#667781] shadow-sm">
          <Clock className="size-4" /> Pending
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
    <DashboardShell active="documents" shopName={shop.name}>
      <DashboardHeader
        eyebrow="Knowledge Base"
        title="AI Training Documents"
        description="Upload policy PDFs, FAQ documents, or any business information to train your AI assistant."
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6 order-2 xl:order-1">
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E0E6EA] pb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#111B21]">
                <Database className="size-5 text-[#8696A0]" />
                Uploaded Knowledge
              </h2>
              <span className="rounded-full bg-[#F5F7F9] px-3 py-1 text-xs font-bold text-[#667781]">
                {docs.length} Document{docs.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D1D7DB] bg-[#F5F7F9]/50 py-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
                    <FileText className="size-8 text-[#D1D7DB]" />
                  </div>
                  <p className="mt-4 text-base font-bold text-[#111B21]">
                    No documents yet
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-[#667781]">
                    Upload your first PDF to start building your AI&apos;s brain.
                  </p>
                </div>
              ) : (
                docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-xl border border-[#E0E6EA] bg-white p-4 shadow-sm transition hover:border-[#25D366]/30 hover:shadow-md"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#FF6B6B]/10 text-[#FF6B6B]">
                        <FileText className="size-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-[#111B21]">
                          {doc.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#667781]">
                          <span className="font-semibold">{formatFileSize(doc.file_size)}</span>
                          <span className="size-1 rounded-full bg-[#D1D7DB]" />
                          {doc.chunk_count > 0 && (
                            <>
                              <span>{doc.chunk_count} chunks</span>
                              <span className="size-1 rounded-full bg-[#D1D7DB]" />
                            </>
                          )}
                          <span>
                            {new Date(doc.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {doc.error_message && (
                          <p className="mt-2 truncate text-xs font-semibold text-[#B42318]">
                            Error: {doc.error_message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="shrink-0">{statusDisplay(doc.status)}</div>

                      <div className="flex items-center gap-2">
                        {doc.status === "failed" && (
                          <form action={reprocessDocument}>
                            <input type="hidden" name="document_id" value={doc.id} />
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
                          <input type="hidden" name="document_id" value={doc.id} />
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="order-1 flex flex-col gap-6 xl:order-2">
          {/* Upload Widget */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-white p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#111B21]">
              <UploadCloud className="size-5 text-[#8696A0]" />
              Upload Document
            </h2>
            <p className="mt-1 text-sm text-[#667781]">
              Add new knowledge to your AI assistant.
            </p>
            
            <DocumentUploadForm />
          </div>

          {/* AI Info Card */}
          <div className="rounded-2xl border border-[#E0E6EA] bg-gradient-to-br from-white to-[#F5F7F9] p-6 shadow-[0_4px_12px_rgba(17,27,33,0.04)]">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-[0_4px_12px_rgba(37,211,102,0.3)]">
                <BrainCircuit className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111B21]">How it works</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#667781]">
                  When a customer asks a question, the AI searches through these documents to find the most relevant information and formulates an accurate reply automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
