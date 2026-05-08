# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Phase 7 complete

## Current Goal

- Phase 8 — AI Order Creation Flow

## Completed

- Design System and UI Primitive Components implementation (shadcn, lucide-react)
  - Installed and configured shadcn with Tailwind 4
  - Created base UI components (Button, Card, Input, Label, etc.)
  - Created custom UI components (Typography, Navbar, Layout, Chat)
  - Verified implementation with a test page and successful build
- Landing Page — Header / Navigation section
  - Implemented a sticky white header with wappSync chat-style logo
  - Added minimal nav links: Features, How it works, Pricing, FAQ
  - Added primary `Get Started` CTA and secondary `View Demo` CTA
  - Kept the page scoped to the header section only
- Landing Page — full marketing page from feature spec
  - Implemented Hero, Problem, Solution, Features, How It Works, Dashboard Preview, AI Knowledge, Target Users, Pricing, FAQ, Final CTA, and Footer sections
  - Added WhatsApp-style chat bubbles and dashboard preview visuals
  - Kept copy focused on online shop owners and avoided technical RAG/vector terminology in the UI
  - Verified production build and browser DOM content on `http://localhost:3001/`
- Landing Page — modular component refactor
  - Moved landing page implementation from `app/page.tsx` into `components/landing/landing-page.tsx`
  - Added `components/landing/index.ts` barrel export
  - Reduced `app/page.tsx` to a simple route-level render of `LandingPage`
  - Verified production build and browser DOM content after the refactor
- Phase 0 — Project Foundation
  - Installed Supabase SSR/client packages
  - Added Supabase browser, server, and proxy session utilities
  - Added login, signup, signout, and protected dashboard shell routes
  - Added Phase 0 database migration for `owner_profiles` and foundational `shops`
  - Added `.env.example` and kept real env files ignored
  - Verified production build, login/signup rendering, and unauthenticated dashboard redirect
- Phase 1 — Owner + Shop Setup
  - Added shop creation flow and editable shop settings page
  - Linked shop records to the authenticated owner account
  - Added `shop_settings` data foundation and scoped dashboard access through the owner shop
- Phase 2 — Product Management
  - Added product list, search, create, edit, and delete dashboard routes
  - Added product image upload support through Supabase Storage
  - Added stock, status, tags, category, and basic size/color variants
- Phase 3 — Order Management
  - Added manual order list, create, detail, and status update routes
  - Added customer reuse by shop phone number
  - Added atomic manual order creation database function with stock validation and stock deduction
- Phase 4 — WhatsApp Cloud API Integration
  - Added database migration `0003_phase4_whatsapp.sql` with `whatsapp_accounts`, `conversations`, and `messages` tables, RLS policies, indexes, and triggers
  - Added `lib/whatsapp/types.ts` — TypeScript types for Meta webhook payloads and send operations
  - Added `lib/whatsapp/webhook.ts` — parser for inbound text messages and status updates from Meta
  - Added `lib/whatsapp/client.ts` — Meta Cloud API client for sending text messages and verifying connections
  - Added `lib/whatsapp/send.ts` — high-level send function that sends via Meta API and stores outbound message in DB
  - Added `app/api/whatsapp/webhook/route.ts` — GET for Meta verification, POST for inbound message handling with shop identification by phone_number_id
  - Added `app/dashboard/settings/whatsapp/page.tsx` — WhatsApp settings page with credential form, connection status, test button, and webhook setup guide
  - Added `app/dashboard/settings/whatsapp/actions.ts` — server actions for saving config and testing connection
  - Added `app/dashboard/settings/whatsapp/test-connection.tsx` — client component for test connection button with visual feedback
  - Added service role Supabase client in `lib/supabase/server.ts` for webhook writes
  - Added `WhatsAppAccount`, `Conversation`, `Message`, and related types to `lib/db/types.ts`
  - Added WhatsApp nav item to dashboard sidebar
  - Updated `.env.example` with `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_APP_URL`
  - Verified production build: all routes compile, webhook route registered as dynamic
- Phase 5 — Dashboard Inbox
  - Added `app/dashboard/inbox/page.tsx` — full inbox page with conversation sidebar (filters, status badges, conversation list) and chat view (message thread, reply composer, controls)
  - Added `app/dashboard/inbox/actions.ts` — server actions for sending replies, toggling automation pause/resume, and updating conversation status
  - Added `app/dashboard/inbox/reply-composer.tsx` — client component for reply input with Enter-to-send and form reset
  - Added `app/dashboard/inbox/inbox-client.tsx` — client components for conversation controls (Pause AI / Resume AI / Resolve / Reopen) and WhatsApp-style message thread with sender type indicators
  - Updated `components/dashboard/dashboard-shell.tsx` — changed Inbox nav to `/dashboard/inbox`, added `inbox` to active type union
  - Inbox features: filter by All / Active / Needs attention / AI paused, conversation status badges, message thread with customer/AI/owner labels, pause/resume automation per conversation, resolve/reopen actions
  - Verified production build: `/dashboard/inbox` registered as dynamic route
- Phase 6 — Basic AI Message Handling
  - Added `lib/ai/types.ts` — type definitions for Intent, ClassificationResult, AIDecision, ProductContext
  - Added `lib/ai/prompts.ts` — system prompts for intent classification and response generation, plus context formatters for products and orders
  - Added `lib/ai/classify.ts` — intent classifier using Groq API with llama-3.3-70b-versatile model, JSON structured output, graceful fallback
  - Added `lib/ai/respond.ts` — response generator using Groq API, produces friendly WhatsApp-style replies based on intent and context
  - Added `lib/ai/handler.ts` — AI orchestrator: classifies intent → fetches relevant DB data (products/orders) → generates response → decides escalation
  - Updated `app/api/whatsapp/webhook/route.ts` — webhook now triggers AI auto-reply after storing inbound messages, respects automation_paused, marks conversations as needs_attention on escalation
  - Updated `.env.example` with `GROQ_API_KEY`
  - Supported intents: greeting, product_question (searches product catalog), order_status (looks up customer orders by phone), order_creation (placeholder for Phase 8), policy_question (now RAG-powered via Phase 7), unknown (escalates)
  - AI respects conversation automation_paused flag and skips auto-reply when paused
  - On escalation, conversation is automatically marked as needs_attention and automation is paused
  - Verified production build: all AI library files compile, webhook route updated
- Phase 7 — RAG for Policies and FAQ
  - Added `supabase/migrations/0004_phase7_rag.sql` — pgvector extension, `documents` and `document_chunks` tables, IVFFlat index, `search_document_chunks` RPC function, RLS policies
  - Added `lib/rag/chunker.ts` — text chunking with paragraph/sentence boundary splitting and configurable overlap
  - Added `lib/rag/embeddings.ts` — Google Gemini embedding generation (gemini-embedding-001, 768 dims, free tier) with single and batch support
  - Added `lib/rag/search.ts` — vector similarity search via Supabase RPC, context formatting for AI
  - Added `lib/rag/process.ts` — full PDF processing pipeline: download from Storage → extract text → chunk → embed → store
  - Added `app/dashboard/documents/page.tsx` — document upload UI with status indicators, retry/delete actions, file size display
  - Added `app/dashboard/documents/actions.ts` — server actions for upload (triggers processing), delete (cleans up storage + DB), and reprocess
  - Updated `lib/ai/handler.ts` — policy_question now uses RAG: searches document chunks via vector similarity, generates AI response from retrieved context, escalates only if no relevant documents found
  - Added "AI Knowledge" nav item to dashboard sidebar
  - Added `Document` and `DocumentChunk` types to `lib/db/types.ts`
  - Updated `.env.example` with `GEMINI_API_KEY`
  - Installed `pdf-parse` and `@google/genai` npm packages (removed `openai` dependency)
  - Verified production build: `/dashboard/documents` registered as dynamic route
- Document upload reliability fix
  - Added Next server action body limit configuration so the 10 MB PDF upload UI is accepted by the server action request parser
  - Added migration `0005_phase7_documents_storage.sql` to create the private `documents` Supabase Storage bucket with owner-scoped upload/read/update/delete policies
  - Replaced the document upload box with a client upload form that displays the selected PDF, disables upload until a file is selected, and shows upload errors/success messages inline
  - Updated PDF text extraction to use `pdf-parse` v2 with its Node worker shim so server-side processing has the required DOM geometry globals
  - Explicitly set Gemini embedding output dimensionality to 768 so generated vectors match the `document_chunks.embedding` pgvector column
  - Improved uploaded-knowledge answering by classifying FAQ/document questions more broadly and trying RAG before escalating unknown messages
- AI Knowledge layout overflow fix
  - Updated the dashboard shell content grid to use shrink-safe columns so dashboard pages do not overflow horizontally
  - Tightened the AI Knowledge documents layout with `min-w-0`, wrapping headers, and shrink-safe document rows so the full UI stays visible in one viewport
- Landing Page — Untitled UI + GSAP upgrade
  - Rebuilt the landing page into modular sections for header, hero, metrics, pain points, features, workflow, dashboard showcase, pricing, FAQ, final CTA, and footer
  - Added Untitled UI icon usage and free Untitled-style marketing components adapted to the existing WhatsApp-inspired design tokens
  - Added GSAP-powered hero, scroll reveal, floating mockup, and counter animations through a small client-only animation component with reduced-motion support
  - Updated primary landing CTAs to route to `/signup` while keeping the dashboard demo anchor and login access
  - Verified production build and local `/` route content after the upgrade
- Dashboard UI/UX — Untitled-style full dashboard refresh
  - Added a shared dashboard UI layer for the shell, page headers, cards, stat tiles, badges, empty states, form panels, table shells, links, buttons, inputs, and selects
  - Refreshed the dashboard shell with Untitled UI icons, premium sidebar active states, compact app context, consistent spacing, and mobile-safe layout constraints
  - Added subtle client-only GSAP dashboard reveal animation with reduced-motion support
  - Migrated dashboard overview, products, orders, order creation/detail, AI Knowledge, WhatsApp settings, shop settings, setup-required, and shop creation screens toward the shared dashboard primitives
  - Preserved existing server actions, Supabase queries, auth redirects, and business workflows while improving UI consistency and maintainability
  - Cleaned up dashboard-related React lint issues in document upload state reset and the shared mobile hook
- Dashboard sidebar navigation visibility fix
  - Updated the dashboard GSAP helper to rerun on App Router pathname changes
  - Added stale-animation cancellation and cleanup of inline opacity, visibility, and transform styles so client-side sidebar navigation does not leave page sections hidden
- Landing page navigation visibility fix
  - Updated the landing page GSAP helper to rerun on App Router pathname changes
  - Replaced `autoAlpha` reveal animations with opacity-based reveals and explicit cleanup of opacity, visibility, and transform styles
  - Added stale-animation cancellation, ScrollTrigger cleanup, counter reset, and floating hero cleanup so returning to the landing page through client navigation renders fully

## In Progress

- None.

## Next Up

- Phase 8 — AI Order Creation Flow: multi-turn conversation, detail extraction, stock validation, order placement via WhatsApp

## Open Questions

- Owner needs to add `GEMINI_API_KEY` to `.env.local` for RAG embeddings (get it free from https://aistudio.google.com/apikey)
- Owner needs to run migration `0004_phase7_rag.sql` in Supabase SQL Editor to enable pgvector and create document tables
- Owner needs to run migration `0005_phase7_documents_storage.sql` in Supabase SQL Editor to create the `documents` storage bucket and storage policies
- Owner needs to add `GROQ_API_KEY` to `.env.local` (get it from https://console.groq.com)
- Owner needs to add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` for the webhook to work (get it from Supabase Dashboard → Settings → API)
- Owner needs to run migration `0003_phase4_whatsapp.sql` in Supabase SQL Editor before using WhatsApp features
- For production, the app needs a public URL (e.g. via ngrok or deployment) for Meta to reach the webhook

## Architecture Decisions

- Webhook route uses a **service role Supabase client** to bypass RLS, since Meta webhook calls have no user session. This is safe because the webhook validates payloads by matching `phone_number_id` to a registered shop.
- Conversations are identified by `(shop_id, customer_phone)` unique constraint — one thread per customer per shop. This matches the WhatsApp model.
- Access tokens are stored in the `whatsapp_accounts` table. For MVP this is acceptable since Supabase encrypts data at rest. A dedicated secrets manager would be a V2 improvement.
- Status updates from Meta (sent/delivered/read) update the `messages.status` field by matching on `wa_message_id`.
- AI uses **Groq with llama-3.3-70b-versatile** for both classification and response generation. Classification uses JSON structured output with low temperature (0.1) for determinism; response generation uses moderate temperature (0.6) for natural language.
- AI **never invents product data** — it only responds based on structured data fetched from the database. If no products match, it says so clearly.
- On low confidence or unknown intent, the AI **auto-escalates**: sends a polite holding message, marks the conversation as `needs_attention`, and pauses automation. Owner must resolve from the dashboard.
- Policy questions now use **RAG with pgvector** instead of auto-escalating. The AI searches uploaded document chunks by cosine similarity, retrieves the top 5 matches above 0.5 threshold, and generates a response from retrieved context. Only escalates if no relevant documents are found.
- Embeddings use **Google Gemini gemini-embedding-001** (768 dimensions) — completely free with generous rate limits. Uses RETRIEVAL_QUERY task type for search queries and RETRIEVAL_DOCUMENT for document chunks. The IVFFlat index on pgvector provides fast approximate nearest neighbor search.
- PDF processing is synchronous in MVP (runs during the upload request). For production, this should be moved to a background job/queue.
- Document chunks use **800-character chunks with 150-character overlap** to balance context quality and embedding accuracy.
- Document uploads use a private Supabase Storage bucket named `documents`. Object paths start with the owning `shop_id`, and storage policies enforce that only the owner of that shop can manage those files.

## Session Notes

- Header / Navigation build passed with network access enabled for Google font fetching.
- `npm run lint` currently fails on existing `hooks/use-mobile.ts` React compiler lint rule outside this task scope.
- Full landing page build passed with network access enabled for Google font fetching.
- Browser DOM verification confirmed the key landing page sections and CTA/footer content are present.
- Landing page modular refactor build passed with network access enabled for Google font fetching.
- Phase 0 build passed with network access enabled for Google font fetching.
- `npm run lint` still fails only on the existing `hooks/use-mobile.ts` React compiler lint rule.
- Local route checks used `next start -- --port 3003`: `/login` and `/signup` returned 200, `/dashboard` returned a 307 redirect to `/login?redirectedFrom=%2Fdashboard` without Supabase env values.
- Phases 1-3 build passed with network access enabled for Google font fetching.
- Local route checks used `next start -- --port 3004`: `/login` returned 200, `/dashboard` redirected to login, and `/dashboard/products` redirected to login for unauthenticated requests.
- Authenticated shop/product/order CRUD requires applying Supabase migrations and using real `.env.local` Supabase values.
- Added `/dashboard/setup-required` fallback for missing Supabase schema cache errors so an authenticated owner sees migration instructions instead of a raw 500 when `public.shops` has not been applied.
- Phase 4 build passed. All new routes compile. Webhook registered as dynamic at `/api/whatsapp/webhook`. WhatsApp settings page accessible at `/dashboard/settings/whatsapp`.
- Phase 5 build passed. Inbox page at `/dashboard/inbox` registered as dynamic. Sidebar Inbox link updated. Four filter tabs, conversation sidebar with status badges, WhatsApp-style message thread, reply composer with Enter-to-send, pause/resume AI and resolve/reopen conversation controls all compile and render.
- Phase 6 build passed. AI library (`lib/ai/`) compiles with all 4 modules. Webhook route updated to trigger AI auto-reply. Groq integration uses llama-3.3-70b-versatile for classification and response generation.
- Phase 7 build passed. RAG library (`lib/rag/`) compiles with all 4 modules. Documents page at `/dashboard/documents` registered as dynamic. AI handler updated with RAG-powered policy question handling. Switched from OpenAI to Google Gemini embeddings (gemini-embedding-001, 768 dims, free). Installed @google/genai, removed openai package.
- AI Knowledge layout overflow fix build passed after enabling network access for Google font fetching.
- Landing page Untitled UI + GSAP upgrade build passed after enabling network access for Google font fetching. Local route check on `http://127.0.0.1:3006/` returned 200 and confirmed the hero, `/signup` CTA, Features, How it works, dashboard preview, Pricing, and FAQ anchors are present.
- Earlier `npm run lint` failures in `app/dashboard/documents/document-upload-form.tsx` and `hooks/use-mobile.ts` were resolved during the dashboard UI/UX refresh.
- Dashboard UI/UX refresh build passed after enabling network access for Google font fetching.
- Targeted lint across changed dashboard files passed. Full `npm run lint` exits successfully with only the existing untracked `scratch.ts` unused-variable warning.
- Local unauthenticated route checks on `http://127.0.0.1:3007` confirmed `/dashboard`, `/dashboard/products`, `/dashboard/orders`, `/dashboard/documents`, `/dashboard/settings`, and `/dashboard/settings/whatsapp` all return 307 redirects to the correct login URLs.
- Dashboard sidebar navigation visibility fix passed targeted lint, full lint, and production build after enabling network access for Google font fetching.
- Landing page navigation visibility fix passed targeted lint, full lint, and production build after enabling network access for Google font fetching.
