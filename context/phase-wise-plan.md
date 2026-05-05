# Phase-wise Project Build Plan

## Phase 0 — Project Foundation

### Goal

Set up the basic project structure, design system, database foundation, and documentation.

### Features

| Feature       | Details                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Design tokens | Add WhatsApp-inspired light theme                                                                         |
| Auth setup    | Enable Supabase Auth                                                                                      |
| Documentation | Add `architecture.md`, `project-overview.md`, `ai-workflow-rules.md`, `design-system.md`, `ui-context.md` |

### Tasks

- Create dashboard layout
- Create Supabase client
- Create base database schema
- Add protected routes
- Add login/signup pages

### Done When

- Owner can sign up and log in
- Dashboard shell loads after login
- Supabase connection works
- UI theme is applied

---

## Phase 1 — Owner + Shop Setup

### Goal

Allow one owner to create and manage one shop.

### Features

| Feature       | Details                                   |
| ------------- | ----------------------------------------- |
| Owner account | Supabase Auth user                        |
| Shop profile  | Shop name, business type, WhatsApp number |
| Shop settings | Basic editable shop settings              |
| Access model  | Every record belongs to `shop_id`         |

### Database Tables

| Table            | Purpose                   |
| ---------------- | ------------------------- |
| `shops`          | Store shop profile        |
| `shop_settings`  | Store automation settings |
| `owner_profiles` | Store owner metadata      |

### Tasks

- Create shop creation flow
- Create shop settings page
- Link owner account to shop
- Enforce `shop_id` in all queries
- Add middleware/protection for dashboard pages

### Done When

- Logged-in owner has one shop
- Owner can edit shop details
- All shop data is scoped by `shop_id`

---

## Phase 2 — Product Management

### Goal

Allow shop owners to manually add and manage products.

### Features

| Feature        | Details                               |
| -------------- | ------------------------------------- |
| Product CRUD   | Create, read, update, delete products |
| Product images | Upload images to Supabase Storage     |
| Stock tracking | Store available stock count           |
| Product status | Active / inactive                     |
| Variants       | Basic variants like size/color        |
| Search/filter  | Search products in dashboard          |

### Database Tables

| Table              | Purpose                      |
| ------------------ | ---------------------------- |
| `products`         | Main product data            |
| `product_images`   | Product image URLs           |
| `product_variants` | Size, color, variant options |

### Product Fields

| Field       | Required                 |
| ----------- | ------------------------ |
| Name        | Yes                      |
| Description | Yes                      |
| Price       | Yes                      |
| Stock count | Yes                      |
| Images      | Optional but recommended |
| Category    | Optional                 |
| Tags        | Optional                 |
| Status      | Yes                      |

### Tasks

- Build products page
- Build create product form
- Build edit product form
- Add image upload
- Add stock update logic
- Add product table/card view
- Add product search

### Done When

- Owner can create products
- Owner can upload product images
- Owner can update price and stock
- Products are stored under correct `shop_id`

---

## Phase 3 — Order Management

### Goal

Allow orders to be created, viewed, and tracked.

### Features

| Feature           | Details                                                   |
| ----------------- | --------------------------------------------------------- |
| Order creation    | Create order manually first                               |
| Order status      | Pending, confirmed, packed, shipped, delivered, cancelled |
| Customer details  | Name, phone, address                                      |
| Order items       | Products and quantities                                   |
| Stock deduction   | Reduce stock when order is created                        |
| Order dashboard   | View all orders                                           |
| Order detail page | View order details                                        |

### Database Tables

| Table         | Purpose                           |
| ------------- | --------------------------------- |
| `customers`   | Store phone number, name, address |
| `orders`      | Main order record                 |
| `order_items` | Products inside order             |

### Tasks

- Build orders page
- Build create order form
- Build order status update
- Build customer creation/reuse logic
- Add stock validation
- Prevent stock from going below zero

### Done When

- Owner can create an order
- Order appears in dashboard
- Stock updates correctly
- Order status can be changed

---

## Phase 4 — WhatsApp Cloud API Integration

### Goal

Connect the system to Meta WhatsApp Cloud API.

### Features

| Feature              | Details                              |
| -------------------- | ------------------------------------ |
| Webhook verification | Verify Meta webhook                  |
| Receive messages     | Store inbound WhatsApp messages      |
| Send messages        | Send outbound replies                |
| Message history      | Store all messages                   |
| WhatsApp settings    | Phone Number ID, token, verify token |

### Database Tables

| Table               | Purpose                            |
| ------------------- | ---------------------------------- |
| `whatsapp_accounts` | Store WhatsApp API config          |
| `conversations`     | One conversation per customer/shop |
| `messages`          | Inbound and outbound messages      |

### Tasks

- Create webhook endpoint
- Verify webhook with Meta
- Receive incoming messages
- Store message in database
- Build send message function
- Store outbound messages
- Add WhatsApp setup guide page
- Add “test connection” button

### Done When

- Customer can send WhatsApp message
- Message appears in dashboard
- Owner can send reply from system
- Outbound message reaches WhatsApp

---

## Phase 5 — Dashboard Inbox

### Goal

Build a simple inbox so owners can manage customer conversations.

### Features

| Feature           | Details                            |
| ----------------- | ---------------------------------- |
| Conversation list | Shows customers and latest message |
| Chat view         | Shows message thread               |
| Reply box         | Owner can reply from dashboard     |
| Needs attention   | Highlight escalated chats          |
| Pause automation  | Stop AI replies for a conversation |
| Resume automation | Re-enable AI replies               |

### Tasks

- Build inbox page
- Build conversation sidebar
- Build message thread UI
- Build reply composer
- Add conversation statuses
- Add filters:
  - All
  - Needs attention
  - AI paused
  - Active
- Add pause/resume toggle

### Done When

- Owner can view WhatsApp conversations
- Owner can reply from dashboard
- Escalated conversations are visible
- Automation can be paused/resumed

---

## Phase 6 — Basic AI Message Handling

### Goal

Use AI to classify messages and generate simple responses.

### AI Responsibilities

| Responsibility        | Details                                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| Intent classification | Product question, policy question, order status, order creation, unknown |
| Response generation   | Generate friendly WhatsApp-style replies                                 |
| Detail extraction     | Extract product name, quantity, name, address                            |
| Escalation decision   | Detect uncertainty                                                       |

### Tasks

- Add Groq API integration
- Create AI prompt structure
- Create intent classifier
- Create response generator
- Add fallback behavior
- Add confidence handling
- Log AI decisions

### Supported Intents

| Intent             | Action                     |
| ------------------ | -------------------------- |
| `product_question` | Search structured products |
| `policy_question`  | Use RAG later              |
| `order_status`     | Query order DB             |
| `order_creation`   | Collect details            |
| `unknown`          | Escalate                   |

### Done When

- AI can classify incoming messages
- AI can answer simple product questions
- AI escalates unknown messages
- AI does not invent missing data

---

## Phase 7 — RAG for Policies and FAQ

### Goal

Allow AI to answer shop policy and FAQ questions using uploaded documents.

### Features

| Feature         | Details                               |
| --------------- | ------------------------------------- |
| PDF upload      | Owner uploads policy PDFs             |
| Text extraction | Extract text from PDF                 |
| Chunking        | Split text into searchable chunks     |
| Embeddings      | Use OpenAI embeddings                 |
| Vector search   | Store/search using Supabase pgvector  |
| RAG answers     | AI answers based on retrieved content |

### Database Tables

| Table             | Purpose                    |
| ----------------- | -------------------------- |
| `documents`       | Uploaded PDF metadata      |
| `document_chunks` | Text chunks and embeddings |

### Tasks

- Build document upload UI
- Store PDFs in Supabase Storage
- Extract PDF text
- Chunk text
- Generate embeddings
- Store embeddings in pgvector
- Build retrieval function
- Add RAG context into AI responses

### Done When

- Owner can upload policy PDF
- System embeds document content
- Customer can ask policy question
- AI answers using uploaded policy
- AI escalates if no relevant policy is found

---

## Phase 8 — AI Order Creation Flow

### Goal

Allow customers to place orders through WhatsApp.

### Flow

1. Customer asks to buy a product
2. AI identifies product
3. AI checks stock
4. AI asks for missing details
5. AI collects:
   - name
   - phone
   - address
   - product
   - quantity
6. System validates details
7. Order is created
8. Stock is reduced
9. Customer receives confirmation

### Tasks

- Build conversation state handling
- Store pending order state
- Extract order details from messages
- Validate product and quantity
- Create order from chat
- Reduce stock
- Send confirmation message
- Escalate if product is unclear

### Done When

- Customer can complete order through WhatsApp
- Missing details are asked one by one
- Invalid product/stock issues are handled safely
- Order appears in dashboard

---

## Phase 9 — Order Status via WhatsApp

### Goal

Allow customers to check order status by messaging the shop.

### Flow

1. Customer asks “Where is my order?”
2. System identifies customer by phone number
3. System fetches latest active order
4. If one order exists, AI replies with status
5. If multiple orders exist, AI asks customer to choose

### Tasks

- Add order lookup by phone number
- Add active order filtering
- Add multiple order handling
- Add status reply templates
- Prevent exposure of another customer’s order

### Done When

- Customer can ask order status
- Correct order status is returned
- Multiple orders are handled safely

---

## Phase 10 — Escalation + Owner Alerts

### Goal

Notify owner when AI cannot handle a conversation.

### Escalation Triggers

| Trigger                       | Action               |
| ----------------------------- | -------------------- |
| Low confidence                | Mark needs attention |
| Missing product data          | Mark needs attention |
| Customer asks for human       | Mark needs attention |
| Complaint/refund issue        | Mark needs attention |
| Repeated failed understanding | Mark needs attention |
| Order approval needed         | Alert owner          |

### Tasks

- Add escalation rules
- Add `needs_attention` status
- Send owner WhatsApp alert
- Pause AI automation
- Add resolve button in dashboard
- Add resume automation action

### Done When

- AI stops replying after escalation
- Owner receives alert
- Conversation appears in dashboard filter
- Owner can resolve and resume automation

---

## Phase 11 — Settings and Controls

### Goal

Give the owner simple control over automation behavior.

### Features

| Feature            | Details                       |
| ------------------ | ----------------------------- |
| Automation on/off  | Global shop automation toggle |
| Conversation pause | Per-chat pause/resume         |
| Owner alert number | WhatsApp number for alerts    |
| Business hours     | Optional basic availability   |
| Fallback message   | Editable fallback message     |

### Tasks

- Build settings page
- Add automation toggle
- Add alert number setting
- Add fallback message editor
- Add simple business hours option

### Done When

- Owner can control automation
- AI respects shop settings
- Fallback message is editable

---

## Phase 12 — MVP Polish and Testing

### Goal

Make the app usable by one real online shop.

### Features

| Feature           | Details                          |
| ----------------- | -------------------------------- |
| Empty states      | Friendly empty screens           |
| Loading states    | Skeletons/spinners               |
| Error messages    | Clear user-facing messages       |
| Mobile responsive | Dashboard works on mobile/tablet |
| Logs              | Basic logs for debugging         |
| Test data         | Seed data for demo shop          |

### Tasks

- Improve UI consistency
- Add error handling
- Add loading states
- Test complete flows
- Fix edge cases
- Add setup instructions
- Prepare demo account

### Done When

- One real shop can use the system daily
- Messages are not lost
- Orders are created correctly
- AI escalates safely
- Owner can manage chats from dashboard

---

# V2 Features

## Phase 13 — Better Onboarding

### Features

- Easier Meta setup guide
- Step-by-step onboarding wizard
- Connection status checker
- Automatic webhook test
- Setup progress checklist

---

## Phase 14 — Staff Accounts

### Features

- Staff login
- Roles and permissions
- Assign conversations
- Internal notes

---

## Phase 15 — Advanced Product Import

### Features

- CSV import
- Excel import
- Bulk product upload
- Bulk image mapping

---

## Phase 16 — Analytics

### Features

- Number of conversations
- AI handled percentage
- Escalation rate
- Order conversion rate
- Top asked products
- Common unanswered questions

---

## Phase 17 — Delivery Integration

### Features

- Delivery fee calculation
- Delivery status updates
- Courier integration
- Tracking link support

---

## Phase 18 — Payments

### Features

- Payment link generation
- Paid/unpaid status
- Payment confirmation
- Payment provider integration

---

# MVP Priority Order

Build in this exact order:

1. Project foundation
2. Auth and shop setup
3. Product management
4. Order management
5. WhatsApp integration
6. Inbox
7. Basic AI handling
8. RAG for policies
9. AI order creation
10. Order status
11. Escalation
12. Settings and polish

Do not build V2 features before completing the MVP.
