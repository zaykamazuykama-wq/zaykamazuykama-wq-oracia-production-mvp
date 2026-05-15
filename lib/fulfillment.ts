import crypto from 'node:crypto';
import type Stripe from 'stripe';
import { supabase } from './supabase';
import { composeReport, renderReportHtml } from './report-generator';
import { generatePdfBufferFromReport } from './pdf';
import { storeReportPdf } from './storage';
import { sendEmailWithLink } from './email';
import { safeErrorCode } from './utils';

export type Order = {
  id: string;
  email: string;
  name: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  stripe_session_id: string | null;
  status: string;
  report_html: string | null;
  report_pdf_path: string | null;
  download_token: string | null;
  email_sent_at: string | null;
};

function expectedAmount(): number {
  const raw = process.env.EXPECTED_PRICE_USD_CENTS || '1999';
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error('invalid_expected_price_config');
  return parsed;
}

function expectedCurrency(): string {
  return (process.env.EXPECTED_CURRENCY || 'usd').trim().toLowerCase();
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error || !data) throw new Error('order_not_found');
  return data as Order;
}

export async function validateCheckoutSession(session: Stripe.Checkout.Session, order: Order) {
  if (session.payment_status !== 'paid') throw new Error('payment_not_paid');
  if (session.mode !== 'payment') throw new Error('invalid_payment_mode');
  if (session.amount_total !== expectedAmount()) throw new Error('invalid_amount');
  if ((session.currency || '').toLowerCase() !== expectedCurrency()) throw new Error('invalid_currency');
  if (session.id !== order.stripe_session_id) throw new Error('session_mismatch');
}

async function markPaidIfNeeded(session: Stripe.Checkout.Session, order: Order): Promise<Order> {
  if (order.status !== 'pending_payment') return order;
  const { data } = await supabase.from('orders').update({
    status: 'paid',
    amount: session.amount_total,
    currency: session.currency,
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
  }).eq('id', order.id).eq('status', 'pending_payment').select('*').maybeSingle();
  const fresh = data ? data as Order : await getOrder(order.id);
  if (fresh.status === 'pending_payment') throw new Error('payment_mark_failed');
  return fresh;
}

async function generateAndStoreReportIfNeeded(order: Order): Promise<Order> {
  if (order.status === 'fulfilled' || order.report_pdf_path) return order;
  await supabase.from('orders').update({ status: 'generating_report' }).eq('id', order.id);
  try {
    const report = composeReport(order);
    const reportHtml = renderReportHtml(report);
    const pdf = await generatePdfBufferFromReport(report);
    const path = await storeReportPdf(order.id, pdf);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const { data, error } = await supabase.from('orders').update({
      status: 'report_generated',
      report_html: reportHtml,
      report_pdf_path: path,
      download_token: token,
      download_expires_at: expiresAt,
    }).eq('id', order.id).select('*').single();
    if (error || !data) throw new Error('report_store_failed');
    return data as Order;
  } catch (err) {
    await supabase.from('orders').update({
      status: 'report_failed',
      last_fulfillment_error_safe: safeErrorCode(err, 'report_failed'),
    }).eq('id', order.id);
    throw err;
  }
}

async function sendEmailIfNeeded(order: Order): Promise<Order> {
  if (order.email_sent_at) {
    if (order.status !== 'fulfilled') {
      await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', order.id);
      return await getOrder(order.id);
    }
    return order;
  }

  await supabase.from('orders').update({ status: 'sending_email' }).eq('id', order.id);
  const { data: inserted, error: insertError } = await supabase.from('email_deliveries').insert({
    order_id: order.id,
    email_type: 'full_report',
    status: 'pending',
  }).select('*').maybeSingle();

  let deliveryId = inserted?.id as string | undefined;
  if (insertError?.code === '23505') {
    const { data: existing } = await supabase.from('email_deliveries').select('*').eq('order_id', order.id).eq('email_type', 'full_report').single();
    if (!existing?.id) throw new Error('email_delivery_lock_missing');
    deliveryId = existing.id;
    if (existing.status === 'sent') {
      await supabase.from('orders').update({
        status: 'fulfilled',
        email_sent_at: existing.sent_at || new Date().toISOString(),
      }).eq('id', order.id);
      return await getOrder(order.id);
    }
  } else if (insertError) {
    throw new Error('email_delivery_lock_failed');
  }
  if (!deliveryId) throw new Error('email_delivery_lock_missing');

  const { data: locked, error: lockError } = await supabase.rpc('acquire_email_delivery_lock', { p_delivery_id: deliveryId });
  if (lockError) throw new Error('email_delivery_lock_failed');
  if (!locked) throw new Error('email_already_processing');

  try {
    const providerId = await sendEmailWithLink(order.email, order.name, order.id);
    const now = new Date().toISOString();
    await supabase.from('email_deliveries').update({ status: 'sent', sent_at: now, provider_message_id: providerId, locked_at: null }).eq('id', deliveryId);
    await supabase.from('orders').update({ status: 'fulfilled', email_sent_at: now }).eq('id', order.id);
    return await getOrder(order.id);
  } catch {
    await supabase.from('email_deliveries').update({ status: 'failed', error_message_safe: 'email_send_failed', locked_at: null }).eq('id', deliveryId);
    await supabase.from('orders').update({ status: 'email_failed', last_fulfillment_error_safe: 'email_send_failed' }).eq('id', order.id);
    throw new Error('email_send_failed');
  }
}

export async function resumeFulfillment(session: Stripe.Checkout.Session, orderId: string): Promise<Order> {
  let order = await getOrder(orderId);
  await validateCheckoutSession(session, order);
  order = await markPaidIfNeeded(session, order);
  order = await generateAndStoreReportIfNeeded(order);
  order = await sendEmailIfNeeded(order);
  if (order.status !== 'fulfilled') throw new Error(`fulfillment_incomplete_${order.status}`);
  return order;
}

export async function resumePaidOrderFulfillment(orderId: string): Promise<Order> {
  let order = await getOrder(orderId);
  if (order.status === 'pending_payment') throw new Error('payment_not_paid');
  if (order.status === 'refunded') throw new Error('order_refunded');
  order = await generateAndStoreReportIfNeeded(order);
  order = await sendEmailIfNeeded(order);
  if (order.status !== 'fulfilled') throw new Error(`fulfillment_incomplete_${order.status}`);
  return order;
}
