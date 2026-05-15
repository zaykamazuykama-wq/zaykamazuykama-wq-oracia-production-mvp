import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { OraciaReport, ReportPage } from './report-generator';
import { SELF_REFLECTION_DISCLAIMER } from './safety';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 54;
const TOP_Y = 724;
const FOOTER_Y = 38;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const COLORS = {
  ink: rgb(0.09, 0.08, 0.07),
  muted: rgb(0.42, 0.36, 0.3),
  brand: rgb(0.34, 0.13, 0.19),
  gold: rgb(0.64, 0.42, 0.18),
  soft: rgb(0.96, 0.91, 0.81),
  rule: rgb(0.84, 0.76, 0.63),
  white: rgb(1, 0.985, 0.945),
};

type PdfFonts = {
  regular: PDFFont;
  italic: PDFFont;
  bold: PDFFont;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  size: number,
  lineHeight: number,
  color = COLORS.ink,
): number {
  const lines = wrapText(text, font, size, maxWidth);
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

function drawFooter(page: PDFPage, fonts: PdfFonts, pageNumber: number, totalPages: number) {
  page.drawLine({ start: { x: MARGIN_X, y: 58 }, end: { x: PAGE_WIDTH - MARGIN_X, y: 58 }, thickness: 0.5, color: COLORS.rule });
  page.drawText('ORACIA / symbolic self-reflection only', { x: MARGIN_X, y: FOOTER_Y, size: 8, font: fonts.italic, color: COLORS.muted });
  page.drawText(`${pageNumber} / ${totalPages}`, { x: PAGE_WIDTH - MARGIN_X - 28, y: FOOTER_Y, size: 8, font: fonts.regular, color: COLORS.muted });
}

function drawPromptBox(page: PDFPage, fonts: PdfFonts, prompts: string[], y: number): number {
  const boxHeight = Math.min(124, 34 + prompts.length * 22);
  page.drawRectangle({ x: MARGIN_X, y: y - boxHeight, width: CONTENT_WIDTH, height: boxHeight, color: COLORS.soft, borderColor: COLORS.rule, borderWidth: 0.7 });
  page.drawText('Reflection prompts', { x: MARGIN_X + 18, y: y - 24, size: 12, font: fonts.bold, color: COLORS.brand });
  let cursor = y - 47;
  prompts.slice(0, 4).forEach((prompt, index) => {
    page.drawText(`${index + 1}.`, { x: MARGIN_X + 18, y: cursor, size: 10, font: fonts.bold, color: COLORS.gold });
    cursor = drawWrappedText(page, prompt, MARGIN_X + 38, cursor, CONTENT_WIDTH - 58, fonts.regular, 10, 13, COLORS.ink) - 5;
  });
  return y - boxHeight - 18;
}

function drawContentPage(pdf: PDFDocument, fonts: PdfFonts, report: OraciaReport, reportPage: ReportPage, totalPages: number) {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.white });
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 18, width: PAGE_WIDTH, height: 18, color: COLORS.brand });
  page.drawText(reportPage.eyebrow.toUpperCase(), { x: MARGIN_X, y: TOP_Y, size: 9, font: fonts.bold, color: COLORS.gold });
  page.drawText(reportPage.title, { x: MARGIN_X, y: TOP_Y - 34, size: reportPage.pageNumber === 1 ? 30 : 26, font: fonts.bold, color: COLORS.brand });

  let y = TOP_Y - 76;
  if (reportPage.pageNumber === 1) {
    page.drawRectangle({ x: MARGIN_X, y: y - 86, width: CONTENT_WIDTH, height: 86, color: COLORS.soft, borderColor: COLORS.rule, borderWidth: 0.8 });
    page.drawText(`Prepared for: ${report.preparedFor}`, { x: MARGIN_X + 18, y: y - 28, size: 13, font: fonts.bold, color: COLORS.ink });
    page.drawText(`Birth date: ${report.birthDate}    Birth time: ${report.birthTime}`, { x: MARGIN_X + 18, y: y - 50, size: 10, font: fonts.regular, color: COLORS.muted });
    page.drawText(`Birth place: ${report.birthPlace}`, { x: MARGIN_X + 18, y: y - 68, size: 10, font: fonts.regular, color: COLORS.muted });
    y -= 116;
  }

  for (const paragraph of reportPage.paragraphs) {
    y = drawWrappedText(page, paragraph, MARGIN_X, y, CONTENT_WIDTH, fonts.regular, 11.2, 16.5, COLORS.ink) - 11;
    if (y < 195) break;
  }

  drawPromptBox(page, fonts, reportPage.prompts, 176);
  drawFooter(page, fonts, reportPage.pageNumber, totalPages);
}

export async function generatePdfBufferFromReport(report: OraciaReport): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle('ORACIA Private Symbolic Report');
  pdf.setAuthor('ORACIA');
  pdf.setSubject('Private symbolic self-reflection report');
  pdf.setKeywords(['ORACIA', 'symbolic report', 'self-reflection']);
  pdf.setCreationDate(new Date(report.generatedAt));

  const fonts: PdfFonts = {
    regular: await pdf.embedFont(StandardFonts.TimesRoman),
    italic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
    bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
  };

  const pages = report.pages.slice(0, 9);
  if (pages.length !== 9) throw new Error(`invalid_report_page_count_${pages.length}`);
  pages.forEach((page) => drawContentPage(pdf, fonts, report, page, 9));

  if (pdf.getPageCount() !== 9) throw new Error(`pdf_page_count_mismatch_${pdf.getPageCount()}`);
  return Buffer.from(await pdf.save());
}

export async function generatePdfBuffer(input: OraciaReport | string): Promise<Buffer> {
  if (typeof input !== 'string') return generatePdfBufferFromReport(input);

  // Backward-compatible fallback for old callers. New fulfillment code passes OraciaReport.
  const pdf = await PDFDocument.create();
  pdf.setTitle('ORACIA Report');
  pdf.setAuthor('ORACIA');
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const text = stripHtml(input).slice(0, 3300);
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawText('ORACIA Report', { x: MARGIN_X, y: 730, size: 28, font: bold, color: COLORS.ink });
  let y = 690;
  for (const line of wrapText(text, font, 11, CONTENT_WIDTH).slice(0, 39)) {
    page.drawText(line, { x: MARGIN_X, y, size: 11, font, color: COLORS.ink });
    y -= 15;
  }
  page.drawText(SELF_REFLECTION_DISCLAIMER.slice(0, 115), { x: MARGIN_X, y: 52, size: 8, font, color: COLORS.muted });
  return Buffer.from(await pdf.save());
}
