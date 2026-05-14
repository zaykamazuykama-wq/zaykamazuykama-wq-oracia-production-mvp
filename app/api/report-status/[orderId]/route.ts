import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const { data, error } = await supabase
      .from('orders')
      .select('status,email_sent_at,created_at,updated_at')
      .eq('id', orderId)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
