import { escapeHtml } from './utils';

export type OrderForReport = {
  id: string;
  name: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
};

function calculateLifePath(dateStr: string): number {
  let sum = dateStr.replace(/-/g, '').split('').map(Number).reduce((a, b) => a + b, 0);
  while (sum >= 10 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function pick(seed: string, items: string[]) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  return items[Math.abs(hash) % items.length];
}

export function generateReportHtml(order: OrderForReport): string {
  const safeName = escapeHtml(order.name || 'Seeker');
  const lifePath = calculateLifePath(order.birth_date);
  const archetype = pick(order.birth_date, ['The Stargazer', 'The Silent Weaver', 'The Flame Carrier', 'The Obsidian Mirror', 'The Sun Singer']);
  const rhythm = pick(order.birth_date, ['Builder Flame', 'Focused Guide', 'Dynamic Catalyst', 'Mirror Field']);

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>ORACIA Report</title>
<style>body{font-family:Georgia,serif;color:#191714;line-height:1.6;padding:48px;max-width:820px;margin:0 auto}h1{font-size:44px}h2{margin-top:36px;color:#4a1f2b}.note{color:#666;font-size:13px;border-top:1px solid #ddd;margin-top:48px;padding-top:18px}</style></head>
<body>
<h1>ORACIA Report</h1>
<p><strong>Prepared for:</strong> ${safeName}</p>
<p><strong>Report type:</strong> Private symbolic self-reflection report</p>
<h2>Core Pattern</h2><p>Your ORACIA pattern centers on <strong>${escapeHtml(archetype)}</strong>, a symbolic lens for reflection and journaling.</p>
<h2>Life Path Reflection</h2><p>Your Life Path number is <strong>${lifePath}</strong>. Use this as a reflective theme, not a prediction.</p>
<h2>Energy Rhythm</h2><p>Your symbolic rhythm is <strong>${escapeHtml(rhythm)}</strong>. This section is designed to help you notice work, rest, and decision patterns.</p>
<h2>Relationship Reflection</h2><p>Observe how you communicate needs, boundaries, and timing. This is not relationship advice or compatibility diagnosis.</p>
<h2>Work & Creative Flow</h2><p>Use this section for planning creative energy, not for financial or career guarantees.</p>
<h2>Shadow Pattern</h2><p>Reflect on over-adaptation, avoidance, or urgency patterns. Treat this as a journaling prompt.</p>
<h2>90-Day Reflection Plan</h2><ul><li>Week 1-2: observe repeating patterns.</li><li>Week 3-6: test one boundary or rhythm change.</li><li>Week 7-12: journal outcomes and refine.</li></ul>
<p class="note">ORACIA is for entertainment and self-reflection only. It is not medical, psychological, legal, financial, relationship, or professional advice. ORACIA does not guarantee future outcomes and should not be used to make major life decisions.</p>
</body></html>`;
}
