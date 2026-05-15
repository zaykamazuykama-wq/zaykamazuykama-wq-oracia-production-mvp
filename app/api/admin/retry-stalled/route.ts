import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resumePaidOrderFulfillment } from '@/lib/fulfillment';
import { safeErrorCode } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RETRYABLE_STATUSES = [
  'paid',
  'generating_report',
  'report_failed',
  'report_generated',
  'sending_email',
  'email_failed',
];

function isAuthorized(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const header = req.headers.get('authorization') || '';
  return header === `Bearer ${adminKey}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id,status,created_at')
    .in('status', RETRYABLE_STATUSES)
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) return NextResponse.json({ error: 'retry_query_failed' }, { status: 500 });

  const results: Array<{ orderId: string; status: 'fulfilled' | 'failed'; code?: string }> = [];

  for (const order of orders || []) {
    try {
      const fulfilled = await resumePaidOrderFulfillment(order.id);
      results.push({ orderId: order.id, status: fulfilled.status === 'fulfilled' ? 'fulfilled' : 'failed' });
    } catch (err) {
      const code = safeErrorCode(err, 'retry_failed');
      await supabase
        .from('orders')
        .update({ last_fulfillment_error_safe: code })
        .eq('id', order.id);
      results.push({ orderId: order.id, status: 'failed', code });
    }
  }

  return NextResponse.json({ checked: orders?.length || 0, results });
}
