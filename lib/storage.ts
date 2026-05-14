import { supabase } from './supabase';

export async function storeReportPdf(orderId: string, pdf: Buffer): Promise<string> {
  const path = `${orderId}.pdf`;
  const { error } = await supabase.storage.from('reports').upload(path, pdf, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (error) throw new Error('pdf_storage_failed');
  return path;
}

export async function createReportSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('reports').createSignedUrl(path, 60 * 10);
  if (error || !data?.signedUrl) throw new Error('signed_url_failed');
  return data.signedUrl;
}
