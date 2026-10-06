// Plain-markdown versions of each page, plus llms.txt files, for LLMs and AI search crawlers.
import { plain, toStdMd as m } from '../scripts/lib.mjs';

export function siteMarkdown({ site, L, hub }) {
  const c = L.c;
  const out = [];
  out.push(`# ${plain(c.hero.h1)}`, '');
  out.push(`> ${m(c.hero.lead)}`, '');
  out.push(`- **${L.ui.codeLabel}:** \`${site.code}\``);
  out.push(`- **Link:** ${site.link}`);
  out.push(`- **${L.ui.lastVerified}:** ${site.lastVerified}`);
  out.push(`- **URL:** ${L.url}`, '');

  out.push(`## ${plain(c.facts.title)}`, '', m(c.facts.intro), '');
  for (const f of c.facts.items) out.push(`- **${plain(f.label)}:** ${m(f.value)}`);
  out.push('');

  out.push(`## ${plain(c.steps.title)}`, '', m(c.steps.intro), '');
  c.steps.items.forEach((s, i) => out.push(`${i + 1}. **${plain(s.title)}** — ${m(s.text)}`));
  out.push('');

  if (c.existing) {
    out.push(`## ${plain(c.existing.title)}`, '', m(c.existing.intro), '');
    for (const card of c.existing.cards) {
      out.push(`### ${plain(card.title)}`, '');
      card.steps.forEach((s, i) => out.push(`${i + 1}. ${m(s)}`));
      out.push('');
    }
    if (c.existing.note) out.push(m(c.existing.note), '');
  }

  out.push(`## ${plain(c.rules.title)}`, '', m(c.rules.intro), '');
  for (const r of c.rules.items) out.push(`- ${m(r)}`);
  out.push('', m(c.rules.note || ''), '');

  if (c.features) {
    out.push(`## ${plain(c.features.title)}`, '', m(c.features.intro), '');
    for (const f of c.features.items) out.push(`- **${plain(f.title)}** — ${m(f.text)}`);
    out.push('');
  }

  out.push(`## ${plain(c.faq.title)}`, '');
  for (const f of c.faq.items) out.push(`### ${plain(f.q)}`, '', m(f.a), '');

  const guides = site.guides.map((g) => g.locales[L.loc]).filter(Boolean);
  if (guides.length) {
    out.push(`## ${L.ui.guidesKicker}`, '');
    for (const G of guides) out.push(`- [${plain(G.c.title)}](${G.url}index.md)`);
    out.push('');
  }

  out.push('---', '', m(c.footer.disclaimer), '', `${hub.name} — ${L.url}`, '');
  return out.join('\n');
}

export function guideMarkdown({ site, guide, G, hub }) {
  const c = G.c;
  const S = site.locales[G.loc];
  const out = [`# ${plain(c.title)}`, '', `> ${m(c.lead)}`, ''];
  out.push(`- **${G.ui.codeLabel}:** \`${site.code}\` — ${site.link}`);
  out.push(`- **${G.ui.updated}:** ${guide.lastVerified}`);
  out.push(`- **URL:** ${G.url}`, '');
  for (const sec of c.sections) {
    out.push(`## ${plain(sec.h2)}`, '');
    for (const p of sec.paragraphs || []) out.push(m(p), '');
    if (sec.list?.length) out.push(...sec.list.map((li) => `- ${m(li)}`), '');
    if (sec.steps?.length) out.push(...sec.steps.map((li, i) => `${i + 1}. ${m(li)}`), '');
    for (const p of sec.after || []) out.push(m(p), '');
    if (sec.note) out.push(`> ${m(sec.note)}`, '');
  }
  if (c.faq?.length) {
    out.push('## FAQ', '');
    for (const f of c.faq) out.push(`### ${plain(f.q)}`, '', m(f.a), '');
  }
  out.push('---', '', m(S.c.footer.disclaimer), '', `${hub.name} — ${G.url}`, '');
  return out.join('\n');
}

const SECTION = { en: 'Referral codes (English)', fr: 'Codes de parrainage (français)' };

// products = summaries (local sites + products published from other repos, see scripts/products.mjs).
export function rootLlmsTxt({ hub, products, P }) {
  const H = hub.locales[hub.def];
  const out = [`# ${hub.name}`, '', `> ${plain(H.c.seo.description)}`, ''];
  out.push(
    'Each page lists one Canadian referral code with its official invite link, the exact sign-up bonus, eligibility rules, step-by-step instructions, guides and an FAQ, in English and French. Codes are personal referral codes; this site is independent and not affiliated with the companies listed.',
    '',
  );
  for (const loc of hub.locs) {
    out.push(`## ${SECTION[loc] || loc}`, '');
    for (const p of products) {
      const L = p.locales[loc];
      if (!L) continue;
      out.push(`- [${L.title}](${L.markdown}): ${L.summary} Code: ${p.code}. Link: ${p.url}. Last verified: ${p.lastVerified}.`);
      for (const g of (p.guides || []).filter((g) => g.loc === loc)) out.push(`  - [${g.title}](${g.markdown})`);
    }
    out.push('');
  }
  out.push('## Optional', '');
  out.push(`- [Full text of every page](${P.abs('/llms-full.txt')})`);
  out.push(`- [All products as JSON](${P.abs('/products.json')})`);
  out.push(`- [Sitemap](${P.abs('/sitemap.xml')})`);
  out.push('');
  return out.join('\n');
}

export function siteLlmsTxt({ site, hub }) {
  const D = site.locales[site.def];
  const out = [`# ${plain(D.c.seo.title)}`, '', `> ${plain(D.c.seo.description)}`, ''];
  for (const f of D.c.facts.items) out.push(`- ${plain(f.label)}: ${plain(f.value)}`);
  out.push('', '## Pages', '');
  for (const loc of site.locs) {
    const L = site.locales[loc];
    out.push(`- [${plain(L.c.seo.title)}](${L.url}) ([markdown](${L.url}index.md))`);
  }
  if (site.guides.length) {
    out.push('', '## Guides', '');
    for (const g of site.guides) for (const G of Object.values(g.locales)) out.push(`- [${plain(G.c.title)}](${G.url}) ([markdown](${G.url}index.md))`);
  }
  out.push('', `Part of ${hub.name}: ${hub.locales[hub.def].url}`, '');
  return out.join('\n');
}
