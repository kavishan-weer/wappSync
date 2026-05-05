# Project Overview

## Overview

This application is a low-cost WhatsApp automation platform designed for small online shop owners. It connects to their WhatsApp Business number and automatically handles customer conversations, including answering product and policy questions, sending product details, collecting customer information, creating orders, and checking order status. The system uses AI (Groq) combined with retrieval (OpenAI embeddings + Supabase) to provide accurate responses, while escalating uncertain conversations to the shop owner through a simple dashboard inbox.

---

## Goals

1. Enable small online shops to handle WhatsApp conversations without hiring additional staff
2. Reduce repetitive customer queries (price, availability, delivery, policies)
3. Provide a simple system for creating and tracking orders directly from chat
4. Maintain high response accuracy using structured data + RAG
5. Keep onboarding and usage simple enough for non-technical users
6. Build a reliable system that avoids incorrect answers and escalates when unsure
7. Deliver a functional MVP with minimal cost and complexity

---

## Core User Flow

1. Shop owner signs up and logs into the dashboard
2. Owner connects their WhatsApp Business number using Meta setup
3. Owner adds products manually in the dashboard (name, price, stock, images)
4. Owner uploads policy documents (PDFs) for FAQ, returns, delivery, etc.
5. System processes PDFs → chunks content → generates embeddings → stores in vector DB

---

### Customer Interaction Flow

6. Customer sends a message to the shop on WhatsApp
7. Webhook receives the message via Meta API
8. System identifies the shop using WhatsApp Phone Number ID
9. Message is stored in the database

---

### AI Handling

10. AI classifies the message intent:

- product question
- policy question
- order creation
- order status
- unknown

11. System retrieves:

- product data from database (if relevant)
- policy/FAQ data via RAG (if relevant)

12. AI generates a response using Groq

---

### Possible Outcomes

**A. AI confidently answers**

- Reply is sent to customer automatically

**B. Customer wants to buy**

- AI collects:
  - name
  - address
  - product
  - quantity
- System validates data
- Order is created
- Stock is updated
- Confirmation message is sent

**C. Customer asks order status**

- System fetches orders using phone number
- Responds with status

**D. AI is unsure**

- Send fallback message to customer
- Mark conversation as “Needs attention”
- Send WhatsApp alert to owner
- Pause automation

---

### Owner Flow

13. Owner opens dashboard inbox
14. Owner sees flagged conversations
15. Owner replies directly from dashboard
16. Owner can resume automation if needed

---

## Features

### 1. WhatsApp Automation

- Receive and send messages via Meta Cloud API
- Automatic AI replies
- Fallback and escalation system
- Conversation state handling

### 2. AI + RAG System

- Intent classification
- Response generation using Groq
- Retrieval of FAQ/policy content via embeddings
- Confidence-based fallback

### 3. Product Management

- Manual product creation
- Price and stock management
- Image upload and association
- Basic categorization

### 4. Order Management

- Order creation from chat
- Order status tracking
- Stock updates on order creation
- Customer order lookup via phone number

### 5. Customer Handling

- Identify customers by phone number
- Store customer details (name, address)
- Reuse previous customer data

### 6. Dashboard Inbox

- View all conversations
- Message history (inbound/outbound)
- “Needs attention” filter
- Reply from dashboard
- Pause/resume automation

### 7. Document & Knowledge Management

- Upload PDFs for policies and FAQs
- Automatic text extraction and chunking
- Embedding generation and storage
- Retrieval for AI responses

### 8. Notifications

- WhatsApp alerts to owner for escalations
- Triggered on low confidence or human-needed cases

---

## In Scope (MVP)

- WhatsApp integration using Meta Cloud API
- AI-powered auto replies for common queries
- RAG for FAQ and policy documents
- Manual product management dashboard
- Order creation and status handling
- Customer detail collection
- Dashboard inbox for conversations
- Escalation system with owner alerts
- Single owner per shop (no staff accounts)
- Basic onboarding with guided setup

---

## Out of Scope (MVP)

- Payments integration
- Shopify or e-commerce platform sync
- Smart product recommendations
- Staff roles and permissions
- Voice message handling
- Marketing or broadcast messaging
- Delivery/logistics integrations
- Advanced analytics or reporting
- Fully automated WhatsApp onboarding

---

## Success Criteria

The MVP is considered successful when:

1. A shop owner can connect their WhatsApp number and receive messages in the dashboard
2. The system can automatically respond to at least 70–80% of common customer queries correctly
3. Customers can complete an order entirely through WhatsApp without manual intervention
4. Orders are correctly stored and visible in the dashboard
5. Product data is consistently used (no incorrect price/stock responses)
6. Escalations are triggered correctly when AI is unsure
7. The owner can reply to conversations from the dashboard without friction
8. At least one real shop can use the system end-to-end for daily operations
9. The system runs reliably without message loss or major failures

---
