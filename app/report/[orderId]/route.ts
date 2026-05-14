import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createReportSignedUrl } from '@/lib/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: order, error } = await supabase
      .from('orders')
      .select('id,status,report_pdf_path,download_token,download_expires_at')
      .eq('id', orderId)
      .single();

    if (error || !order || order.download_token !== token) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.status !== 'fulfilled' || !order.report_pdf_path) return NextResponse.json({ error: 'Not ready' }, { status: 409 });
    if (order.download_expires_at && new Date(order.download_expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'Expired' }, { status: 410 });

    await supabase.rpc('increment_download_count', { p_order_id: order.id });
    const signedUrl = await createReportSignedUrl(order.report_pdf_path);
    return NextResponse.redirect(signedUrl);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
