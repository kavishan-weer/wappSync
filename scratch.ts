import { createClient } from "@supabase/supabase-js";
import { searchDocuments } from "./lib/rag/search";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const shopId = "9f2735d4-ccbe-45fc-ae69-a35fbe105eec"; // Need an actual shop ID!
  const { data } = await supabase.from('shops').select('id').limit(1).single();
  if (!data) return console.log("No shop found");
  console.log("Searching for shop:", data.id);
  const results = await searchDocuments(supabase, data.id, "how to refund", 5, 0); // threshold 0 for testing
  console.log("RESULTS:", results);
}
test().catch(console.error);
