import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

let genaiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!genaiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genaiClient = new GoogleGenAI({ apiKey });
  }
  return genaiClient;
}

/**
 * Generate an embedding vector for a single text string.
 * Uses Google Gemini embedding model (768 dimensions).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient();

  const response = await client.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text.replace(/\n/g, " ").trim(),
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embedding = response.embeddings?.[0]?.values;
  if (!embedding) {
    throw new Error("No embedding returned from Google API");
  }

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} embedding dimensions, got ${embedding.length}`,
    );
  }

  return embedding;
}

/**
 * Generate embeddings for multiple text strings in batch.
 * Google API supports batching via the contents array.
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getClient();

  // Process in batches of 100 (Google API limit)
  const BATCH_SIZE = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch.map((t) => t.replace(/\n/g, " ").trim()),
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const embeddings = response.embeddings;
    if (!embeddings || embeddings.length !== batch.length) {
      throw new Error(
        `Expected ${batch.length} embeddings, got ${embeddings?.length ?? 0}`,
      );
    }

    for (const emb of embeddings) {
      if (!emb.values) {
        throw new Error("Empty embedding values from Google API");
      }
      if (emb.values.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Expected ${EMBEDDING_DIMENSIONS} embedding dimensions, got ${emb.values.length}`,
        );
      }
      allEmbeddings.push(emb.values);
    }
  }

  return allEmbeddings;
}
