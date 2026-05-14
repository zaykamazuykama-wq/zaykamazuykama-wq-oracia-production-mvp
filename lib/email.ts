import { Resend } from 'resend';
import { supabase } from './supabase';
import { escapeHtml, noPiiLog } from './utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailWithLink(to: string, name: string | null, orderId: string): Promise<string> {
  if (!process.env.APP_BASE_URL) throw new Error('app_base_url_missing');
  if (!process.env.REPORT_FROM_EMAIL) throw new Error('report_from_email_missing');

  const { data: order, error } = await supabase.from('orders').select('download_token').eq('id', orderId).single();
  if (error || !order?.download_token) throw new Error('download_token_missing');

  const baseUrl = process.env.APP_BASE_URL.replace(/\/$/, '');
  const downloadUrl = `${baseUrl}/report/${encodeURIComponent(orderId)}?token=${encodeURIComponent(order.download_token)}`;
  const safeUrl = escapeHtml(downloadUrl);
  const safeName = escapeHtml(name || 'there');

  const html = `
    <h2>Hello ${safeName},</h2>
    <p>Thank you for purchasing the ORACIA full report. Your symbolic blueprint is ready.</p>
    <p><a href="${safeUrl}" style="background:#c6a355;padding:12px 24px;color:white;border-radius:40px;text-decoration:none;">Download your report</a></p>
    <p>If the link does not work, copy and paste this URL:<br>${safeUrl}</p>
    <p><em>ORACIA is for entertainment and self-reflection only.</em></p>
  `;

  const { data, error: sendError } = await resend.emails.send({
    from: process.env.REPORT_FROM_EMAIL,
    to,
    subject: 'Your ORACIA Report is ready',
    html,
  });

  if (sendError) {
    noPiiLog('Resend email error', { orderId, errorCode: sendError.name || 'resend_error' });
    throw new Error('email_send_failed');
  }
  return data?.id || 'unknown';
}
