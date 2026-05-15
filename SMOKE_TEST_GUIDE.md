# ORACIA Smoke Test Guide

Use this after deployment with Stripe test mode, Supabase, Resend, and Vercel environment variables configured.

## 0. Local verification

```bash
npm install
npm run typecheck
npm run smoke-test
npm run build
```

Expected local smoke output:

- `smoke-output/report.pdf` exists
- PDF has exactly 9 pages
- PDF metadata title is `ORACIA Private Symbolic Report`
- PDF author is `ORACIA`

`npm run verify-env` should fail when `.env.example` placeholders are still used. It should pass only with real local or deployment values.

## 1. Public pages

Open:

- `/`
- `/success`
- `/cancel`
- `/status`
- `/terms`
- `/privacy`
- `/help`

Expected:

- Pages render without server errors
- Safety framing is visible
- No placeholder support email is visible

## 2. Admin route auth

Call retry route without auth:

```bash
curl -i -X POST "$APP_BASE_URL/api/admin/retry-stalled"
```

Expected: `401` or `403`.

Call with auth:

```bash
curl -i -X POST "$APP_BASE_URL/api/admin/retry-stalled" \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

Expected: `200` with JSON summary, even if no stalled orders exist.

## 3. Stripe test purchase

Use Stripe test card:

```text
4242 4242 4242 4242
Any future expiry
Any CVC
Any postal code
```

Expected:

- Checkout completes
- Redirect lands on `/success`
- Order exists in Supabase
- Webhook event exists
- Email delivery exists
- Customer receives email
- Download link returns a PDF
- PDF has exactly 9 pages

## 4. Database inspection

Check Supabase tables:

- `orders.status` should become `fulfilled`
- `orders.report_pdf_path` should be populated
- `orders.download_token` should be populated
- `orders.email_sent_at` should be populated
- `webhook_events.status` should be `processed`
- `email_deliveries.status` should be `sent`

## 5. Idempotency check

Replay the same Stripe webhook event from Stripe dashboard or CLI.

Expected:

- No duplicate PDF storage path is required
- No duplicate customer email is sent
- Webhook event remains processed or exits safely

## 6. Failure recovery

Temporarily force an email or storage failure in a staging environment only, then restore credentials and call:

```bash
curl -i -X POST "$APP_BASE_URL/api/admin/retry-stalled" \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

Expected:

- Failed or stalled order resumes
- Final state becomes `fulfilled`

## 7. Safety checks

Submit purchase form with crisis-language content in optional fields.

Expected:

- Checkout is blocked or routed to help flow
- User sees crisis support framing
- No payment session is created

Submit without age/agency affirmation.

Expected:

- Browser blocks form submission or backend rejects request

## 8. Live mode switch

Only after all test-mode steps pass:

- Replace Stripe keys with live keys
- Replace Stripe price ID with live price
- Confirm `EXPECTED_PRICE_USD_CENTS` and `EXPECTED_CURRENCY` match the live Stripe price
- Confirm Resend domain is verified
- Run one low-value real purchase
- Confirm delivery
- Refund the transaction manually in Stripe if this was a test purchase
