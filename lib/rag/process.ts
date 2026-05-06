import type { SupabaseClient } from "@supabase/supabase-js";

import { chunkText } from "./chunker";
import { generateEmbeddings } from "./embeddings";

async function extractPdfText(buffer: Buffer): Promise<string> {
  // pdf-parse v2 relies on pdf.js DOM geometry globals even for text parsing.
  // The worker shim installs DOMMatrix/Path2D/ImageData for Node runtimes.
  await import("pdf-parse/worker");

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText({ pageJoiner: "\n\n" });
    return result.text;
  } finally {
    await parser.destroy();
  }
}

/**
 * Process an uploaded PDF document:
 * 1. Download from Supabase Storage
 * 2. Extract text
 * 3. Chunk the text
 * 4. Generate embeddings
 * 5. Store chunks + embeddings in the database
 *
 * @param supabase    - Supabase client (service role recommended)
 * @param shopId      - The shop that owns the document
 * @param documentId  - The document record ID
 * @param filePath    - Path in Supabase Storage
 */
export async function processDocument(
  supabase: SupabaseClient,
  shopId: string,
  documentId: string,
  filePath: string,
): Promise<void> {
  // Mark as processing
  await supabase
    .from("documents")
    .update({ status: "processing" })
    .eq("id", documentId);

  try {
    // 1. Download PDF from Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("documents")
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download PDF: ${downloadError?.message ?? "no data"}`);
    }

    // 2. Extract text from PDF
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const text = await extractPdfText(buffer);

    if (!text || text.trim().length < 20) {
      throw new Error("PDF contains no extractable text");
    }

    // 3. Chunk the text
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error("No valid chunks generated from PDF text");
    }

    // 4. Generate embeddings (batch)
    const embeddings = await generateEmbeddings(chunks);

    // 5. Store chunks with embeddings
    const chunkRecords = chunks.map((content, i) => ({
      shop_id: shopId,
      document_id: documentId,
      content,
      chunk_index: i,
      embedding: JSON.stringify(embeddings[i]),
    }));

    // Insert in batches of 20
    for (let i = 0; i < chunkRecords.length; i += 20) {
      const batch = chunkRecords.slice(i, i + 20);
      const { error: insertError } = await supabase
        .from("document_chunks")
        .insert(batch);

      if (insertError) {
        throw new Error(`Failed to insert chunks: ${insertError.message}`);
      }
    }

    // 6. Mark document as ready
    await supabase
      .from("documents")
      .update({
        status: "ready",
        chunk_count: chunks.length,
      })
      .eq("id", documentId);

    console.log(
      `[rag] Document ${documentId} processed: ${chunks.length} chunks, ${text.length} chars`,
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown processing error";

    console.error(`[rag] Document ${documentId} failed:`, errorMessage);

    await supabase
      .from("documents")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", documentId);
  }
}
