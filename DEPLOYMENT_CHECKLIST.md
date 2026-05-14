# ORACIA Production Deployment Checklist

Use this checklist before switching Stripe to live mode or sending paid traffic.

## 1. Supabase

- [ ] Create a production Supabase project.
- [ ] Run `supabase/schema.sql` against the production database.
- [ ] Confirm tables exist: `orders`, `webhook_events`, `email_deliveries`, and any cleanup/audit tables added by hardening.
- [ ] Confirm storage bucket for report PDFs exists and is private.
- [ ] Confirm service-role key is stored only in server-side deployment environment variables.
- [ ] Confirm Row Level Security posture is deliberate. Service-role server routes may bypass RLS; public client access must not expose orders or report PDFs.

## 2. Stripe

- [ ] Create or confirm the ORACIA product and one-time price.
- [ ] Set `STRIPE_PRICE_ID` to the production price ID.
- [ ] Confirm the amount is USD 19.99 or update `validateCheckoutSession` to match the real amount.
- [ ] Configure checkout success URL as `/success?session_id={CHECKOUT_SESSION_ID}` or project-equivalent.
- [ ] Configure cancel URL as `/cancel`.
- [ ] Set checkout session expiry to the hardened value, currently 30 minutes.

## 3. Stripe webhook

- [ ] Add production webhook endpoint: `/api/stripe-webhook`.
- [ ] Subscribe at minimum to `checkout.session.completed`.
- [ ] If hardening routes are present, also subscribe to refund and dispute events used by the code, such as `charge.refunded` and `charge.dispute.created`.
- [ ] Store the production webhook secret as `STRIPE_WEBHOOK_SECRET`.
- [ ] Run one test event from Stripe Dashboard after deploy.

## 4. Resend / email

- [ ] Verify the sender domain in Resend.
- [ ] Set `RESEND_API_KEY`.
- [ ] Set `REPORT_FROM_EMAIL` to a verified sender.
- [ ] Send a live test email to a controlled inbox.
- [ ] Confirm the report download link opens only with the tokenized URL.

## 5. Deployment environment variables

Required production variables:

```bash
APP_BASE_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_BASE_URL=https://your-production-domain.com
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
RESEND_API_KEY=re_...
REPORT_FROM_EMAIL=ORACIA <reports@your-domain.com>
ADMIN_API_KEY=<openssl rand -hex 32>
```

Rules:

- [ ] Do not use placeholder values in production.
- [ ] Generate `ADMIN_API_KEY` with `openssl rand -hex 32`.
- [ ] Confirm auth helpers reject default placeholder secrets.
- [ ] Never expose service-role, Stripe secret, webhook secret, Resend API key, or admin key to the browser.

## 6. Vercel / hosting

- [ ] Import GitHub repository into Vercel or selected Next.js host.
- [ ] Set framework preset to Next.js.
- [ ] Add all production environment variables.
- [ ] Deploy from `main`.
- [ ] Confirm the build command is `npm run build`.
- [ ] Confirm Node runtime supports the Next.js and dependency versions in `package.json`.

## 7. Security checks

- [ ] `.gitignore` includes `.env`, `.env.local`, `.env.*.local`, logs, build output, and dependency folders.
- [ ] No secrets exist in git history or current tracked files.
- [ ] Admin routes require `ADMIN_API_KEY`.
- [ ] Admin auth uses constant-time comparison where implemented.
- [ ] Security headers are present if hardening middleware/config has been applied.
- [ ] Rate limiting is enabled for checkout/order creation where implemented.

## 8. Smoke test: happy path

Run with a real test inbox and Stripe test mode first.

- [ ] Open home page.
- [ ] Submit order form with valid name, email, birth date, optional birth time/place.
- [ ] Confirm Stripe Checkout opens.
- [ ] Pay with a Stripe test card.
- [ ] Confirm redirect to success page.
- [ ] Confirm order row becomes `paid`, then `report_generated`, then `fulfilled`.
- [ ] Confirm PDF exists in private storage.
- [ ] Confirm email is delivered.
- [ ] Confirm tokenized report link downloads the PDF.
- [ ] Confirm report link fails without token.
- [ ] Confirm `/api/report-status/[orderId]` returns safe status data only.

## 9. Smoke test: failure and recovery

- [ ] Test invalid birth date is rejected.
- [ ] Test future birth date is rejected if hardening validation is present.
- [ ] Test invalid email is rejected.
- [ ] Test duplicate webhook delivery does not duplicate email.
- [ ] Test retry endpoint on a stalled order in staging.
- [ ] Test abandoned pending order cleanup in staging.
- [ ] Test customer data deletion endpoint in staging if present.

## 10. Cron / operations

- [ ] Add uptime monitor for `/api/health` if present.
- [ ] Add scheduled inspection for `/api/admin/retry-stalled` with admin key.
- [ ] Add scheduled cleanup for abandoned carts if present.
- [ ] Alert on `report_failed`, `email_failed`, and stuck `processing` states.
- [ ] Keep webhook delivery failure alerts enabled in Stripe.

## 11. Legal and review pages

- [ ] Privacy Policy page is reachable.
- [ ] Terms page is reachable.
- [ ] Product page clearly says ORACIA is for entertainment and self-reflection, not medical, legal, financial, or deterministic advice.
- [ ] Refund policy is clear enough for Stripe review.

## 12. Known product risks before paid traffic

- [ ] `lib/pdf.ts` currently produces a basic PDF implementation unless upgraded. If the sales copy promises a premium long-form report, upgrade PDF rendering before scale.
- [ ] `lib/report-generator.ts` should use enough entropy in its seed. Avoid generating identical reports for all users with the same birth date.
- [ ] Add analytics only after privacy policy covers it.

## 13. Live-mode cutover

- [ ] Replace Stripe test keys with live keys.
- [ ] Replace test price ID with live price ID.
- [ ] Replace webhook secret with live webhook secret.
- [ ] Deploy production.
- [ ] Run one low-risk live transaction.
- [ ] Confirm fulfillment completes end-to-end.
- [ ] Archive the deployment evidence: build log, Stripe event ID, order ID, email message ID, and PDF storage path.
