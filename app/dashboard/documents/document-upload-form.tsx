"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";

import { uploadDocument } from "./actions";
import type { UploadDocumentState } from "./actions";

const initialUploadDocumentState: UploadDocumentState = {
  status: "idle",
  message: "",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadButton({ hasFile }: { hasFile: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!hasFile || pending}
      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.20)] transition hover:bg-[#1DA851] disabled:cursor-not-allowed disabled:bg-[#D1D7DB] disabled:shadow-none"
    >
      {pending ? "Uploading..." : "Upload & Process"}
    </button>
  );
}

export function DocumentUploadForm() {
  const [state, formAction] = useActionState(
    uploadDocument,
    initialUploadDocumentState,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      setSelectedFile(null);
      formRef.current?.reset();
    }
  }, [state.status]);

  function clearSelectedFile() {
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <form ref={formRef} action={formAction} className="mt-5">
      <label
        htmlFor="document-file"
        className="group block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-[#D1D7DB] bg-[#F5F7F9] transition-all hover:border-[#25D366] hover:bg-[#E6F9F0]"
      >
        <input
          ref={inputRef}
          id="document-file"
          type="file"
          name="file"
          accept=".pdf,application/pdf"
          required
          className="sr-only"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null);
          }}
        />

        <div className="p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
            {selectedFile ? (
              <FileText className="size-5 text-[#25D366]" />
            ) : (
              <Upload className="size-5 text-[#8696A0] group-hover:text-[#25D366]" />
            )}
          </div>
          <p className="mt-4 text-sm font-bold text-[#111B21] group-hover:text-[#1DA851]">
            {selectedFile ? selectedFile.name : "Click to select a PDF"}
          </p>
          <p className="mt-1 text-xs text-[#8696A0]">
            {selectedFile ? formatFileSize(selectedFile.size) : "Only PDF files. Max 10 MB."}
          </p>
        </div>
      </label>

      {selectedFile ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#D1D7DB] bg-white px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#111B21]">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[#667781]">
              Ready to upload
            </p>
          </div>
          <button
            type="button"
            onClick={clearSelectedFile}
            title="Remove selected file"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#D1D7DB] text-[#667781] transition hover:bg-[#F5F7F9] hover:text-[#111B21]"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {state.message ? (
        <div
          className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
            state.status === "success"
              ? "border-[#25D366]/30 bg-[#E6F9F0] text-[#1DA851]"
              : "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#B42318]"
          }`}
        >
          {state.status === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="mt-4">
        <UploadButton hasFile={Boolean(selectedFile)} />
      </div>
    </form>
  );
}
