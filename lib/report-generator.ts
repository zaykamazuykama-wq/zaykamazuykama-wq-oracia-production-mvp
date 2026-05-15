import { AGENCY_FRAME, SELF_REFLECTION_DISCLAIMER } from './safety';
import { ARCHETYPE_BANK, RHYTHM_BANK, lifePathMeaning } from './report-content';
import { escapeHtml } from './utils';

export type OrderForReport = {
  id: string;
  email?: string;
  name: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
};

export type ReportPage = {
  pageNumber: number;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  prompts: string[];
};

export type OraciaReport = {
  orderId: string;
  preparedFor: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  generatedAt: string;
  archetype: string;
  rhythm: string;
  lifePath: number;
  signals: string[];
  pages: ReportPage[];
  disclaimer: string;
  agencyFrame: string;
};

export function calculateLifePath(dateStr: string): number {
  let sum = dateStr.replace(/-/g, '').split('').map(Number).reduce((a, b) => a + b, 0);
  while (sum >= 10 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  return Math.abs(hash);
}

function pick<T>(seed: string, items: T[]): T {
  return items[hashSeed(seed) % items.length];
}

function seedFor(order: OrderForReport): string {
  return `${order.birth_date}|${order.birth_time || ''}|${order.birth_place || ''}|${order.name || ''}|${order.email || ''}`;
}

export function composeReport(order: OrderForReport): OraciaReport {
  const seed = seedFor(order);
  const archetype = pick(seed, ARCHETYPE_BANK);
  const rhythm = pick(`${seed}:rhythm`, RHYTHM_BANK);
  const lifePath = calculateLifePath(order.birth_date);
  const preparedFor = order.name?.trim() || 'Seeker';

  const pages: ReportPage[] = [
    {
      pageNumber: 1,
      eyebrow: 'Cover / symbolic profile',
      title: 'ORACIA Private Report',
      paragraphs: [
        `Prepared for ${preparedFor}. This report translates birth-data inputs into a symbolic self-reflection profile. It is intentionally written as a mirror, not an authority.`,
        `Primary archetype: ${archetype.name}. Energy rhythm: ${rhythm.name}. Life Path reflection number: ${lifePath}.`,
        AGENCY_FRAME,
        SELF_REFLECTION_DISCLAIMER,
      ],
      prompts: ['Read once without deciding. Read again and underline only what your real life supports.'],
    },
    {
      pageNumber: 2,
      eyebrow: 'Orientation / how to read this',
      title: 'The Reading Frame',
      paragraphs: [
        'ORACIA works best when treated as structured journaling. The value is not whether every sentence feels mystical. The value is whether a sentence helps you observe a behavior with more precision.',
        'The report uses archetypal language because symbolic language can compress emotional and behavioral patterns quickly. Compression is useful only when it returns you to evidence.',
        'Do not use this report to override medical, psychological, financial, legal, relationship, career, or safety judgment. Keep the distinction between reflection and advice clean.',
      ],
      prompts: ['What part of my life needs observation rather than immediate interpretation?', 'Where do I need evidence before making meaning?'],
    },
    {
      pageNumber: 3,
      eyebrow: 'Core pattern / archetype',
      title: archetype.name,
      paragraphs: [
        ...archetype.core,
        `Signal words for this pattern: ${archetype.signals.join(', ')}. Use these as tags for journaling, not labels that restrict identity.`,
      ],
      prompts: ['Which signal word describes a current strength?', 'Which signal word describes a pattern I may overuse?'],
    },
    {
      pageNumber: 4,
      eyebrow: 'Relationship field / contact',
      title: 'How the Pattern Meets Others',
      paragraphs: [
        ...archetype.relationship,
        'Relationship reflection should increase responsibility and communication clarity. It should never be used to diagnose another person, excuse harm, or create fatalistic compatibility claims.',
        'The cleanest use is to identify one sentence you can say more directly and one expectation you can stop hiding inside performance.',
      ],
      prompts: ['What boundary can I state without accusation?', 'What request have I been hoping someone would guess?'],
    },
    {
      pageNumber: 5,
      eyebrow: 'Work and creative flow / output',
      title: 'Where Energy Becomes Form',
      paragraphs: [
        ...archetype.work,
        rhythm.text,
        'For work, creative, and money-related decisions, treat this section as pattern reflection only. Use real numbers, contracts, qualified advice, and market evidence for consequential choices.',
      ],
      prompts: ['What smaller artifact can I produce this week?', 'What condition reliably improves my output?'],
    },
    {
      pageNumber: 6,
      eyebrow: 'Shadow and gift / pressure response',
      title: 'Distortion and Medicine',
      paragraphs: [
        ...archetype.shadow,
        ...archetype.gift,
        'Shadow does not mean defect. It means a protective strategy has become too expensive. The task is to reduce the cost without shaming the part of you that learned the strategy.',
      ],
      prompts: ['What do I do when I feel unseen, rushed, or cornered?', 'What would a lower-cost response look like?'],
    },
    {
      pageNumber: 7,
      eyebrow: 'Life path / numeric mirror',
      title: `Life Path ${lifePath}`,
      paragraphs: [
        lifePathMeaning(lifePath),
        'A Life Path number is best used as a reflective theme. It does not determine your future, your worth, your relationships, or your decisions.',
        'The useful question is not what the number makes you. The useful question is what behavior this theme helps you examine today.',
      ],
      prompts: ['Where does this theme already show up?', 'What one behavior would make this theme healthier?'],
    },
    {
      pageNumber: 8,
      eyebrow: '90-day integration / practice',
      title: 'A Low-Risk Reflection Plan',
      paragraphs: [
        'Days 1-14: observe repeating patterns without making major decisions from this report. Track actual behavior, not mood alone.',
        'Days 15-45: choose one low-risk rhythm change. Keep it small enough that you can evaluate it honestly.',
        'Days 46-90: keep what works, discard what flatters the ego but fails in reality, and refine one boundary or creative routine.',
      ],
      prompts: ['What will I track weekly?', 'What result would prove this experiment useful?', 'What will I stop doing if it produces no real benefit?'],
    },
    {
      pageNumber: 9,
      eyebrow: 'Closing / agency return',
      title: 'Keep Your Authority',
      paragraphs: [
        'A good symbolic system returns you to your own life with more precision, not more dependency. Keep your authority. Test everything against reality.',
        AGENCY_FRAME,
        SELF_REFLECTION_DISCLAIMER,
        'If you feel at risk of harming yourself or someone else, contact local emergency services or a crisis hotline. ORACIA is not crisis support.',
      ],
      prompts: ['What do I choose to keep?', 'What do I choose to ignore?', 'What real-world action is safe, small, and measurable?'],
    },
  ];

  return {
    orderId: order.id,
    preparedFor,
    birthDate: order.birth_date,
    birthTime: order.birth_time || 'Not provided',
    birthPlace: order.birth_place || 'Not provided',
    generatedAt: new Date().toISOString(),
    archetype: archetype.name,
    rhythm: rhythm.name,
    lifePath,
    signals: archetype.signals,
    pages,
    disclaimer: SELF_REFLECTION_DISCLAIMER,
    agencyFrame: AGENCY_FRAME,
  };
}

function pageToHtml(page: ReportPage): string {
  return `<section class="page"><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h2>${escapeHtml(page.title)}</h2>${page.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}<h3>Reflection prompts</h3><ul>${page.prompts.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul></section>`;
}

export function renderReportHtml(report: OraciaReport): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>ORACIA Report</title>
<style>
body{font-family:Georgia,serif;color:#191714;line-height:1.6;padding:48px;max-width:860px;margin:0 auto;background:#fffaf1}
h1{font-size:46px;margin-bottom:8px}.meta{color:#6f6256}.safety{background:#f8f0df;border:1px solid #dfc99c;border-radius:18px;padding:18px;margin:24px 0}.eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8a5a2b}h2{margin-top:36px;color:#4a1f2b}h3{font-size:15px;color:#6b2e3d}.page{border-top:1px solid #e3d3b8;padding-top:18px;margin-top:26px}.note{color:#666;font-size:13px;border-top:1px solid #ddd;margin-top:48px;padding-top:18px}
</style></head>
<body>
<h1>ORACIA Report</h1>
<p class="meta"><strong>Prepared for:</strong> ${escapeHtml(report.preparedFor)}<br><strong>Birth date:</strong> ${escapeHtml(report.birthDate)}<br><strong>Birth time:</strong> ${escapeHtml(report.birthTime)}<br><strong>Birth place:</strong> ${escapeHtml(report.birthPlace)}<br><strong>Archetype:</strong> ${escapeHtml(report.archetype)}<br><strong>Rhythm:</strong> ${escapeHtml(report.rhythm)}</p>
<div class="safety"><p><strong>Before reading:</strong> ${escapeHtml(report.agencyFrame)}</p><p>${escapeHtml(report.disclaimer)}</p></div>
${report.pages.map(pageToHtml).join('\n')}
<p class="note">If you feel at risk of harming yourself or someone else, contact local emergency services or a crisis hotline. ORACIA is not crisis support.</p>
</body></html>`;
}

export function generateReportHtml(order: OrderForReport): string {
  return renderReportHtml(composeReport(order));
}
