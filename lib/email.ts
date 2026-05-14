import { Resend } from 'resend';
import { SELF_REFLECTION_DISCLAIMER, AGENCY_FRAME } from './safety';
import { supabase } from './supabase';
import { escapeHtml, noPiiLog } from './utils';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('resend_api_key_missing');
  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendEmailWithLink(to: string, name: string | null, orderId: string): Promise<string> {
  if (!process.env.APP_BASE_URL) throw new Error('app_base_url_missing');
  if (!process.env.REPORT_FROM_EMAIL) throw new Error('report_from_email_missing');

  const { data: order, error } = await supabase.from('orders').select('download_token').eq('id', orderId).single();
  if (error || !order?.download_token) throw new Error('download_token_missing');

  const baseUrl = process.env.APP_BASE_URL.replace(/\/$/, '');
  const downloadUrl = `${baseUrl}/report/${encodeURIComponent(orderId)}?token=${encodeURIComponent(order.download_token)}`;
  const helpUrl = `${baseUrl}/help`;
  const safeUrl = escapeHtml(downloadUrl);
  const safeHelpUrl = escapeHtml(helpUrl);
  const safeName = escapeHtml(name || 'there');

  const html = `
    <h2>Hello ${safeName},</h2>
    <p>Thank you for purchasing the ORACIA full report. Your symbolic blueprint is ready.</p>
    <p><strong>Before reading:</strong> ${escapeHtml(AGENCY_FRAME)}</p>
    <p><a href="${safeUrl}" style="background:#c6a355;padding:12px 24px;color:white;border-radius:40px;text-decoration:none;">Download your report</a></p>
    <p>If the link does not work, copy and paste this URL:<br>${safeUrl}</p>
    <p><em>${escapeHtml(SELF_REFLECTION_DISCLAIMER)}</em></p>
    <p>If you feel unsafe or at risk of harming yourself or someone else, contact local emergency services or a crisis hotline. ORACIA is not crisis support. Resources: <a href="${safeHelpUrl}">${safeHelpUrl}</a></p>
  `;

  const { data, error: sendError } = await getResendClient().emails.send({
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
