// Product summaries shared between repos.
//
// Every product site publishes /<slug>/referral.json (= productSummary below). The collection home page
// (repo "<account>.github.io") downloads them at build time to list every product, and publishes
// /products.json, which each product site downloads in turn to link to its siblings.
// Network failures fall back to the last good copy saved in .cache/ (committed), so a build never breaks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { plain } from './lib.mjs';

const CACHE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.cache');

export function productSummary(site, P) {
  const r = site.cfg.referral;
  const abs = (p) => P.abs(p);
  return {
    slug: site.slug,
    name: site.name,
    code: site.code,
    url: site.link,
    bonus: { amount: r.bonus, currency: r.currency },
    minimumDeposit: { amount: r.minDeposit, currency: r.currency },
    lastVerified: site.lastVerified,
    accent: site.theme.light.accent,
    icon: abs(`${site.basePath}assets/icon.svg`),
    sitemap: abs(`${site.basePath}sitemap.xml`),
    llms: abs(`${site.basePath}llms.txt`),
    llmsFull: abs(`${site.basePath}llms-full.txt`),
    defaultLocale: site.def,
    locales: Object.fromEntries(
      site.locs.map((l) => {
        const L = site.locales[l];
        return [
          l,
          {
            lang: L.lang,
            url: L.url,
            markdown: `${L.url}index.md`,
            title: plain(L.c.seo.title),
            summary: plain(L.c.hub?.summary || ''),
            terms: L.c.links?.termsUrl,
          },
        ];
      }),
    ),
    guides: site.guides.flatMap((g) =>
      Object.values(g.locales).map((G) => ({ lang: G.lang, loc: G.loc, title: plain(G.c.title), url: G.url, markdown: `${G.url}index.md` })),
    ),
  };
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'referral-site-builder' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getText(url) {
  try {
    const res = await fetch(url);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

// Fetch with a committed on-disk fallback.
export async function fetchCached(name, url, warnings, valid = () => true) {
  const file = path.join(CACHE, `${name}.json`);
  try {
    const data = await getJson(url);
    if (!valid(data)) throw new Error('unexpected format');
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    if (fs.existsSync(file)) {
      warnings?.push(`${url} unreachable (${e.message}) — using .cache/${name}.json`);
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    warnings?.push(`${url} unreachable (${e.message}) — skipped`);
    return null;
  }
}

// Card data (one locale) used by the home page and "more codes" sections.
export function cardFromSummary(s, loc) {
  const L = s.locales[loc] || s.locales[s.defaultLocale] || Object.values(s.locales)[0];
  return { name: s.name, code: s.code, href: L.url, url: L.url, summary: L.summary, accent: s.accent, iconHref: s.icon };
}
