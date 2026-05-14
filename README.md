# ORACIA Production MVP

ORACIA creates private symbolic self-reflection reports from birth details, numerology-inspired patterns, lunar archetypes, and optional palm-based reflection.

This is a standalone production MVP scaffold. Keep this repository separate from other projects.

## Core flow

1. Customer enters email and birth details.
2. App creates an order with `pending_payment` status.
3. App creates Stripe Checkout Session for $19.99.
4. Stripe sends `checkout.session.completed` webhook.
5. Backend validates payment, amount, currency, mode, and session ID.
6. Backend generates report HTML/PDF.
7. PDF is stored in private Supabase Storage.
8. Email delivery is locked idempotently and sent once.
9. Order becomes `fulfilled`.

## Safety principles

- No prediction guarantees.
- No medical, financial, legal, psychological, relationship, or professional advice.
- No PII in analytics or logs.
- No report fulfillment from the success page.
- No public report storage.
- No duplicate emails from duplicate webhooks.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Run `supabase/schema.sql` in Supabase SQL editor and create a private Storage bucket named `reports`.

## Stripe local webhook test

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## Required tests before launch

See `docs/TEST_PLAN.md`.
