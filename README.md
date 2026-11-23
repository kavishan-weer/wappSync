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



## Operational Notes

- Product price, stock, orders, and customer identity always come from structured database tables.
- Uploaded documents are only used for FAQ/policy style answers.
- If AI escalates, automation stays paused until the owner resumes it.
- Basic webhook and AI events are written to `public.app_logs` for debugging.
