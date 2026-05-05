# Architecture

## Product Summary

A low-cost WhatsApp automation platform for online shop owners. The system helps shops answer product and policy questions, collect customer details, create orders, check order status, and escalate uncertain conversations to the owner.

The MVP focuses on simplicity, reliability, and productivity.

---

## Stack

| Layer              | Technology                           | Role                                                                   |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------- |
| Frontend Dashboard | Next.js / React                      | Owner dashboard, inbox, product management, order management, settings |
| Backend/API        | Next.js API routes or Node.js server | Webhooks, WhatsApp message handling, AI orchestration, order actions   |
| Database           | Supabase Postgres                    | Shops, owners, products, customers, orders, messages                   |
| Vector Search      | Supabase pgvector                    | Store and search embeddings for FAQ/policy documents                   |
| File Storage       | Supabase Storage                     | Product images, uploaded policy PDFs, catalog assets                   |
| Authentication     | Supabase Auth                        | Owner login and session management                                     |
| AI Chat Model      | Groq                                 | Intent classification, response generation, customer detail extraction |
| Embeddings         | OpenAI Embeddings                    | Generate vectors for FAQ/policy chunks                                 |
| WhatsApp           | Meta WhatsApp Cloud API              | Receive and send WhatsApp messages                                     |
| Background Jobs    | Server cron / queue worker           | PDF processing, embedding generation, retrying failed messages         |

---

## System Boundaries

| Folder            | Responsibility                                                             |
| ----------------- | -------------------------------------------------------------------------- |
| `app/`            | Frontend routes, dashboard pages, inbox UI, product/order/settings screens |
| `app/api/`        | API endpoints, Meta webhook handler, dashboard actions                     |
| `components/`     | Reusable UI components                                                     |
| `lib/auth/`       | Auth helpers, session checks, owner/shop access validation                 |
| `lib/db/`         | Database clients, typed queries, repository functions                      |
| `lib/whatsapp/`   | Meta Cloud API client, webhook verification, message send/receive logic    |
| `lib/ai/`         | Groq prompts, intent classification, response generation, extraction logic |
| `lib/rag/`        | Chunking, embedding, vector search, context building                       |
| `lib/orders/`     | Order creation, order status lookup, stock updates                         |
| `lib/products/`   | Product CRUD, product availability, image mapping                          |
| `lib/escalation/` | Low-confidence handling, owner alerts, pause/resume automation             |
| `workers/`        | Background jobs for PDF processing, embeddings, retries                    |
| `supabase/`       | Migrations, policies, seed data, database functions                        |
| `types/`          | Shared TypeScript types                                                    |

---

## Storage Model

### Database

Use Supabase Postgres for structured business data.

| Data                   | Stored In DB? | Notes                                                             |
| ---------------------- | ------------: | ----------------------------------------------------------------- |
| Owners                 |           Yes | Created through Supabase Auth                                     |
| Shops                  |           Yes | Each owner owns one shop in MVP                                   |
| WhatsApp number config |           Yes | Phone Number ID, business account info, encrypted token reference |
| Products               |           Yes | Name, price, stock, variants, tags, image references              |
| Customers              |           Yes | Phone number as primary customer identity                         |
| Orders                 |           Yes | Order items, status, customer phone, address, timestamps          |
| Messages               |           Yes | Inbound/outbound chat history for dashboard inbox                 |
| Conversations          |           Yes | Status, last message, needs attention, automation paused          |
| RAG chunks             |           Yes | Text chunks, metadata, embedding vector                           |
| Escalations            |           Yes | Reason, conversation ID, resolved status                          |

### File Storage

Use Supabase Storage for large or binary files.

| File Type             | Storage          |
| --------------------- | ---------------- |
| Product images        | Supabase Storage |
| Uploaded policy PDFs  | Supabase Storage |
| Catalog images/assets | Supabase Storage |

### Vector Storage

Use Supabase `pgvector`.

Store embeddings only for unstructured knowledge:

- FAQ documents
- Return policies
- Delivery policies
- Size guides
- General shop rules

Do **not** store product price, stock, order status, or customer data only as vector data.

### Cache

Cache is optional for MVP.

Possible cache later:

| Cached Data               | Why                               |
| ------------------------- | --------------------------------- |
| Recent conversation state | Faster message handling           |
| Recent RAG results        | Lower embedding/vector query cost |
| WhatsApp API metadata     | Avoid repeated config lookups     |

---

## Auth and Access Model

### MVP Access

- One owner account owns one shop.
- Owner logs in through Supabase Auth.
- No staff accounts in MVP.
- Staff roles are explicitly out of scope for MVP.

### Ownership Rules

Every shop-owned record must include `shop_id`.

Examples:

- `products.shop_id`
- `orders.shop_id`
- `customers.shop_id`
- `messages.shop_id`
- `rag_chunks.shop_id`
- `conversations.shop_id`

All queries must be scoped by `shop_id`.

### WhatsApp Customer Identity

Customers are identified by WhatsApp phone number.

For MVP:

- No customer login
- No OTP verification
- Returning customers can reuse previous details
- If multiple active orders exist, the system asks the customer to choose the correct order

### Dashboard Access

The dashboard must only show data belonging to the authenticated owner’s shop.

---

## AI Model

### AI Responsibilities

Groq is used for:

- Classifying customer intent
- Generating replies
- Extracting order details
- Deciding whether escalation is needed

OpenAI embeddings are used for:

- Embedding FAQ/policy chunks
- Searching relevant shop knowledge using Supabase pgvector

### RAG Responsibilities

RAG should answer questions from:

- FAQ
- Policies
- Delivery rules
- Size guides
- General shop information

RAG should **not** be the source of truth for:

- Product stock
- Product price
- Order status
- Customer details

Those must come from structured database queries.

### AI Fallback Flow

If AI confidence is low or required data is missing:

1. Send polite holding reply to customer
2. Mark conversation as `needs_attention`
3. Send WhatsApp alert to owner
4. Pause automation for that conversation until owner handles it

---

## Background Tasks

| Task                    | Trigger                          | Responsibility                                   |
| ----------------------- | -------------------------------- | ------------------------------------------------ |
| PDF processing          | Owner uploads policy PDF         | Extract text, chunk content, generate embeddings |
| Embedding generation    | New/updated FAQ or policy        | Store vector in pgvector                         |
| Message retry           | WhatsApp send failure            | Retry safely without duplicates                  |
| Conversation escalation | Low confidence / human requested | Notify owner and mark chat                       |
| Stock update            | Order created                    | Reduce product stock if enabled                  |

---

## Core User Flows

### Product Question Flow

1. Customer sends WhatsApp message
2. Webhook receives message
3. System identifies shop by WhatsApp Phone Number ID
4. System stores inbound message
5. AI classifies intent
6. Product data is retrieved from database
7. Policy/FAQ data is retrieved using RAG if needed
8. AI generates response
9. Response is sent through Meta Cloud API
10. Outbound message is stored

### Order Creation Flow

1. Customer says they want to buy
2. AI collects required details:
   - name
   - phone number
   - address
   - product
   - quantity
3. System validates product and stock
4. Order is created
5. Stock is reduced
6. Customer receives confirmation or pending confirmation message

### Order Status Flow

1. Customer asks for order status
2. System identifies customer by phone number
3. System queries orders by `shop_id` and customer phone
4. If one active order exists, return status
5. If multiple orders exist, ask customer to choose

### Escalation Flow

1. AI cannot confidently answer
2. Conversation is marked `needs_attention`
3. Customer receives holding message
4. Owner receives WhatsApp alert
5. Owner replies from dashboard
6. Automation remains paused until resumed

---

## Explicitly Out of Scope for MVP

- Payments integration
- Shopify sync
- Smart product recommendations
- Staff roles
- Voice messages
- Marketing or broadcast campaigns
- Delivery company integration
- Advanced analytics
- Fully automated Meta onboarding

---

## Invariants

The codebase must never violate these rules:

1. **Every shop-owned database query must be scoped by `shop_id`.**  
   No owner should ever see or modify another shop’s data.

2. **RAG must never be the source of truth for stock, price, order status, or customer identity.**  
   These must always come from structured database tables.

3. **The AI must not create or confirm an order unless required customer details and product data are validated.**

4. **If confidence is low, data is missing, or the request is outside scope, the system must escalate instead of guessing.**

5. **Every inbound and outbound WhatsApp message must be stored.**  
   The dashboard inbox depends on complete conversation history.

6. **Automation must pause for conversations marked `needs_attention`.**  
   The AI should not continue replying until the owner resolves or resumes automation.

7. **Product stock must not go below zero.**  
   Order creation must check availability before reducing stock.

8. **WhatsApp access tokens and sensitive credentials must never be exposed to the frontend.**

9. **Uploaded files must belong to a shop and must not be accessible across shops.**

10. **Changing the embedding model requires re-embedding existing RAG content.**
