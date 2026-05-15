import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { composeReport, renderReportHtml } from '../lib/report-generator';
import { generatePdfBufferFromReport } from '../lib/pdf';

const outputDir = path.join(process.cwd(), 'smoke-output');
fs.mkdirSync(outputDir, { recursive: true });

type SmokeOrder = Parameters<typeof composeReport>[0];

const baseOrder: SmokeOrder = {
  id: 'smoke_order_001',
  email: 'smoke@example.test',
  name: 'Smoke Tester',
  birth_date: '1993-08-17',
  birth_time: '14:35',
  birth_place: 'Ulaanbaatar, Mongolia',
};

async function main() {
  const report = composeReport(baseOrder);
  if (report.pages.length !== 9) throw new Error(`expected 9 logical pages, got ${report.pages.length}`);

  const html = renderReportHtml(report);
  if (!html.includes('ORACIA Report')) throw new Error('html missing title');
  if (!html.includes(report.archetype)) throw new Error('html missing archetype');

  const pdfBuffer = await generatePdfBufferFromReport(report);
  const pdf = await PDFDocument.load(pdfBuffer);
  if (pdf.getPageCount() !== 9) throw new Error(`expected 9 PDF pages, got ${pdf.getPageCount()}`);

  const title = pdf.getTitle();
  const author = pdf.getAuthor();
  if (title !== 'ORACIA Private Symbolic Report') throw new Error(`unexpected PDF title: ${title}`);
  if (author !== 'ORACIA') throw new Error(`unexpected PDF author: ${author}`);

  fs.writeFileSync(path.join(outputDir, 'report.html'), html);
  fs.writeFileSync(path.join(outputDir, 'report.pdf'), pdfBuffer);

  const archetypes = new Set<string>();
  for (let i = 0; i < 12; i++) {
    const variant = composeReport({
      ...baseOrder,
      id: `smoke_order_${i}`,
      email: `smoke+${i}@example.test`,
      birth_date: `199${i % 10}-0${(i % 9) + 1}-1${i % 9}`,
    });
    archetypes.add(variant.archetype);
  }

  if (archetypes.size < 4) throw new Error(`content variety too low: ${archetypes.size} distinct archetypes`);

  console.log('Smoke test passed.');
  console.log(`- PDF pages: ${pdf.getPageCount()}`);
  console.log(`- PDF bytes: ${pdfBuffer.length}`);
  console.log(`- Distinct archetypes across variants: ${archetypes.size}`);
  console.log(`- Output: ${path.relative(process.cwd(), path.join(outputDir, 'report.pdf'))}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
