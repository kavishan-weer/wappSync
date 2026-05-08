# wappSync

WhatsApp automation dashboard for small online shops.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

3. Run the app:

```bash
npm run dev
```

## Supabase Setup

For a fresh or repaired database, run:

```txt
supabase/full_project_setup.sql
```

For incremental setup, apply migrations in order from:

```txt
supabase/migrations/
```

Demo data for the first shop can be seeded with:

```txt
supabase/seed_demo.sql
```

## WhatsApp Setup

1. In the dashboard, create your shop.
2. Go to `Settings -> WhatsApp`.
3. Add Meta Cloud API credentials:
   - Phone Number ID
   - Access Token
   - Verify Token
   - WABA ID, if available
4. Set the webhook URL in Meta:

```txt
https://your-public-url.com/api/whatsapp/webhook
```

5. Use the same verify token in Meta and the dashboard.

For local testing, expose the app with a public tunnel and set `NEXT_PUBLIC_APP_URL` to that tunnel URL.

## MVP Test Checklist

- Sign up and create a shop.
- Add at least one active product with stock.
- Configure WhatsApp credentials and test the connection.
- Send a customer WhatsApp message asking about a product.
- Place an order through WhatsApp and verify stock decreases.
- Ask for order status from the same customer number.
- Ask for a human, refund, or complaint and verify:
  - AI sends the fallback message.
  - Conversation appears under `Attention`.
  - AI automation is paused.
  - Owner receives an alert when an alert number is configured.
- Resolve the chat in the inbox.
- Resume automation and verify AI replies again.

## Operational Notes

- Product price, stock, orders, and customer identity always come from structured database tables.
- Uploaded documents are only used for FAQ/policy style answers.
- If AI escalates, automation stays paused until the owner resumes it.
- Basic webhook and AI events are written to `public.app_logs` for debugging.
