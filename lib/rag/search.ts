import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";

export type SearchResult = {
  id: string;
  content: string;
  document_id: string;
  similarity: number;
};

/**
 * Search for relevant document chunks using vector similarity.
 *
 * @param supabase        - Supabase client (service role for webhook, authenticated for dashboard)
 * @param shopId          - The shop to search within
 * @param query           - The user's question
 * @param matchCount      - Maximum number of results to return
 * @param matchThreshold  - Minimum cosine similarity (0–1)
 * @returns Array of matching chunks with similarity scores
 */
export async function searchDocuments(
  supabase: SupabaseClient,
  shopId: string,
  query: string,
  matchCount = 5,
  matchThreshold = 0.5,
): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("search_document_chunks", {
      p_shop_id: shopId,
      p_query_embedding: JSON.stringify(queryEmbedding),
      p_match_count: matchCount,
      p_match_threshold: matchThreshold,
    });

    if (error) {
      console.error("[rag] Vector search error:", error.message);
      return [];
    }

    return (data ?? []) as SearchResult[];
  } catch (err) {
    console.error("[rag] Search failed:", err);
    return [];
  }
}

/**
 * Format search results as context for the AI.
 */
export function formatRAGContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No relevant policy or FAQ documents found.";
  }

  return results
    .map(
      (r, i) =>
        `[Source ${i + 1} | Relevance: ${Math.round(r.similarity * 100)}%]\n${r.content}`,
    )
    .join("\n\n---\n\n");
}
