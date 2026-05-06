"use server";

import { revalidatePath } from "next/cache";

import { requireShop } from "@/lib/auth/dashboard";
import { createServiceClient } from "@/lib/supabase/server";
import { processDocument } from "@/lib/rag/process";

/**
 * Upload a PDF document and trigger processing.
 */
export async function uploadDocument(formData: FormData) {
  const { supabase, shop } = await requireShop();

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Please select a PDF file to upload.");
  }

  if (!file.type.includes("pdf")) {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size must be under 10 MB.");
  }

  const fileName = `${shop.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(fileName, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Create document record
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      shop_id: shop.id,
      name: file.name,
      file_path: fileName,
      file_size: file.size,
      status: "pending",
    })
    .select("id")
    .single();

  if (docError) {
    throw new Error(docError.message);
  }

  // Trigger processing (uses service role for embedding writes)
  const serviceClient = createServiceClient();

  // Process async — don't await to avoid timeout, but for MVP we'll await
  try {
    await processDocument(serviceClient, shop.id, doc.id, fileName);
  } catch (err) {
    console.error("[documents] Processing error:", err);
  }

  revalidatePath("/dashboard/documents");
}

/**
 * Delete a document and all its chunks.
 */
export async function deleteDocument(formData: FormData) {
  const { supabase, shop } = await requireShop();

  const documentId = String(formData.get("document_id") ?? "").trim();

  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  // Get file path for storage cleanup
  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .eq("shop_id", shop.id)
    .single();

  if (doc) {
    // Delete chunks first (cascade handles this, but be explicit)
    await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId);

    // Delete document record
    await supabase.from("documents").delete().eq("id", documentId);

    // Delete file from storage
    await supabase.storage.from("documents").remove([doc.file_path]);
  }

  revalidatePath("/dashboard/documents");
}

/**
 * Re-process a failed document.
 */
export async function reprocessDocument(formData: FormData) {
  const { supabase, shop } = await requireShop();

  const documentId = String(formData.get("document_id") ?? "").trim();

  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .eq("shop_id", shop.id)
    .single();

  if (!doc) {
    throw new Error("Document not found.");
  }

  // Delete existing chunks
  await supabase
    .from("document_chunks")
    .delete()
    .eq("document_id", documentId);

  // Re-process
  const serviceClient = createServiceClient();
  try {
    await processDocument(serviceClient, shop.id, documentId, doc.file_path);
  } catch (err) {
    console.error("[documents] Reprocessing error:", err);
  }

  revalidatePath("/dashboard/documents");
}
