/**
 * Split text into chunks of roughly `chunkSize` characters,
 * breaking at paragraph or sentence boundaries.
 *
 * Each chunk overlaps the previous by `overlap` characters
 * to preserve context across chunk boundaries.
 */
export function chunkText(
  text: string,
  chunkSize = 800,
  overlap = 150,
): string[] {
  // Clean up the text
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + chunkSize;

    if (end >= cleaned.length) {
      chunks.push(cleaned.substring(start).trim());
      break;
    }

    // Try to break at a paragraph boundary
    const paragraphBreak = cleaned.lastIndexOf("\n\n", end);
    if (paragraphBreak > start + chunkSize * 0.3) {
      end = paragraphBreak;
    } else {
      // Try to break at a sentence boundary
      const sentenceBreak = cleaned.lastIndexOf(". ", end);
      if (sentenceBreak > start + chunkSize * 0.3) {
        end = sentenceBreak + 1;
      }
    }

    chunks.push(cleaned.substring(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter((c) => c.length > 20);
}
