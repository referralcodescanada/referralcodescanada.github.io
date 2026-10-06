// Checks the PUBLISHED site (GitHub Pages) against what this repo should publish:
// every page, guide, machine-readable file and verification file answers 200, canonicals are right,
// the sitemap lists exactly the expected pages, and the home page / product data are linked.
//
//   npm run check            → live site
//   npm run check -- --local → http://localhost:4321 (run "npm run serve" first)
//
// GitHub Pages caches for ~10 minutes: right after a deploy, run it again if something looks stale.
import fs from 'node:fs';
import path from 'node:path';
import { loadProject, ROOT } from './load.mjs';

const local = process.argv.includes('--local');
const { hub, sites, P } = await loadProject();
const toTarget = (url) => (local ? url.replace(P.rootUrl, 'http://localhost:4321') : url);

const results = [];
const ok = (msg) => results.push(['✔', msg]);
const bad = (msg) => results.push(['✖', msg]);
const warn = (msg) => results.push(['⚠', msg]);

async function get(url) {
  try {
    const res = await fetch(toTarget(url), { redirect: 'manual', headers: { 'user-agent': 'referral-site-check' } });
    return { status: res.status, type: res.headers.get('content-type') || '', text: res.status === 200 ? await res.text() : '' };
  } catch (e) {
    return { status: 0, type: '', text: '', error: e.cause?.code || e.message };
  }
}

const pages = []; // { url, code }
for (const site of sites) {
  for (const l of site.locs) pages.push({ url: site.locales[l].url, code: site.code });
  for (const g of site.guides) for (const G of Object.values(g.locales)) pages.push({ url: G.url, code: site.code });
}
if (!P.standalone) for (const l of hub.locs) pages.push({ url: hub.locales[l].url });

// 1. HTML pages
for (const p of pages) {
  const r = await get(p.url);
  if (r.status !== 200) {
    bad(`${r.status || r.error}  ${p.url}`);
    continue;
  }
  const canonical = r.text.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const problems = [];
  if (canonical !== p.url) problems.push(`canonical=${canonical}`);
  if (!/<title>[^<]{10,}<\/title>/.test(r.text)) problems.push('title missing');
  if ((r.text.match(/<h1/g) || []).length !== 1) problems.push('not exactly one <h1>');
  if (!/application\/ld\+json/.test(r.text)) problems.push('no JSON-LD');
  if (p.code && !r.text.includes(p.code)) problems.push(`code ${p.code} missing`);
  if (problems.length) bad(`${p.url} — ${problems.join(', ')}`);
  else ok(`200  ${p.url}`);
  const md = await get(`${p.url}index.md`);
  if (p.code && md.status !== 200) bad(`${md.status}  ${p.url}index.md`);
}

// 2. Machine-readable files of this repo
const files = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt'];
if (P.standalone) files.push('/referral.json');
else files.push('/products.json');
if (hub.cfg.indexNowKey) files.push(`/${hub.cfg.indexNowKey}.txt`);
const pub = path.join(ROOT, 'public');
if (fs.existsSync(pub)) for (const f of fs.readdirSync(pub)) files.push(`/${f}`);
for (const f of files) {
  const r = await get(P.abs(f));
  if (r.status === 200) ok(`200  ${P.abs(f)}`);
  else bad(`${r.status || r.error}  ${P.abs(f)}`);
}

// 3. Sitemap = exactly the expected pages
const sm = await get(P.abs('/sitemap.xml'));
if (sm.text) {
  let locs = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (sm.text.includes('<sitemapindex')) {
    const children = locs;
    locs = [];
    for (const c of children) {
      const r = await get(c);
      if (r.status !== 200) bad(`sitemap index → ${r.status} ${c}`);
      else if (c.startsWith(P.siteUrl) && c.endsWith('sitemap-pages.xml')) locs.push(...[...r.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    }
    ok(`sitemap index → ${children.length} sitemap(s)`);
  }
  const expected = pages.map((p) => p.url);
  const missing = expected.filter((u) => !locs.includes(u));
  const extra = locs.filter((u) => !expected.includes(u));
  if (missing.length || extra.length) bad(`sitemap: missing [${missing.join(', ')}] extra [${extra.join(', ')}]`);
  else ok(`sitemap lists the ${expected.length} expected pages`);
}

// 4. Network links (home page ⇄ products)
const rootFiles = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/products.json'].map((f) => `${P.rootUrl}${f}`);
if (P.standalone) {
  for (const u of rootFiles) {
    const r = await get(u);
    if (r.status === 200) ok(`200  ${u} (home-page repo)`);
    else warn(`${r.status}  ${u} — the home-page repo "referralcodescanada.github.io" isn't live`);
  }
  const list = await get(`${P.rootUrl}/products.json`);
  if (list.text) {
    const slugs = JSON.parse(list.text).products.map((p) => p.slug);
    if (slugs.includes(sites[0].slug)) ok(`home page lists ${sites[0].slug}`);
    else warn(`home page doesn't list ${sites[0].slug} yet — add it to products in the home-page repo (it rebuilds daily)`);
  }
} else {
  for (const slug of hub.cfg.products || []) {
    const r = await get(`${P.rootUrl}/${slug}/referral.json`);
    if (r.status !== 200) bad(`${r.status}  ${P.rootUrl}/${slug}/referral.json — product repo "${slug}" isn't live`);
    else if (!JSON.parse(r.text).locales) bad(`${slug}/referral.json is in an old format — redeploy that repo`);
    else ok(`product ${slug} is live and readable`);
  }
}

// Report
for (const [s, m] of results) console.log(`${s} ${m}`);
const failed = results.filter((r) => r[0] === '✖').length;
const warned = results.filter((r) => r[0] === '⚠').length;
console.log(`\n${failed ? '✖' : '✔'} ${results.length - failed - warned} ok, ${warned} warning(s), ${failed} problem(s)${local ? ' (local)' : ''}`);
if (failed) process.exitCode = 1;
