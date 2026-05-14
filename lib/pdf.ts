import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generatePdfBuffer(reportHtml: string): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const text = reportHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 3500);
  page.drawText('ORACIA Report', { x: 48, y: 730, size: 28, font, color: rgb(0.1, 0.09, 0.08) });
  const lines = text.match(/.{1,86}(\s|$)/g) || [];
  let y = 690;
  for (const line of lines.slice(0, 42)) {
    page.drawText(line.trim(), { x: 48, y, size: 11, font, color: rgb(0.15, 0.14, 0.12) });
    y -= 15;
  }
  return Buffer.from(await pdf.save());
}
