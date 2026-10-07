// Checks the PUBLISHED site against what this repo should publish: every page and its .md version answers 200
// with the right canonical, one <h1>, JSON-LD and its code; machine-readable and verification files answer 200;
// the sitemap lists exactly the expected pages.
//
//   npm run check            → live site (GitHub Pages caches ~10 min: re-run right after a deploy if stale)
//   npm run check -- --local → http://localhost:4321 (run "npm run build" then "npm run preview" first)
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '../src/config/site.ts';
import { URLS } from '../src/lib/model.ts';
import { pageRoutes } from '../src/lib/routes.ts';
import { loadModel, ROOT } from './content.mjs';

const local = process.argv.includes('--local');
const m = loadModel();
const toTarget = (url) => (local ? url.replace(URLS.root, 'http://localhost:4321') : url);

const results = [];
const ok = (msg) => results.push(['✔', msg]);
const bad = (msg) => results.push(['✖', msg]);

async function get(url) {
  try {
    const res = await fetch(toTarget(url), { redirect: 'manual', headers: { 'user-agent': 'referral-site-check' } });
    return { status: res.status, text: res.status === 200 ? await res.text() : '' };
  } catch (e) {
    return { status: 0, text: '', error: e.cause?.code || e.message };
  }
}

const codeOf = (slug) => m.products.find((p) => p.slug === slug)?.code;
const pages = pageRoutes(m)
  .filter((r) => r.kind !== 'redirect')
  .map((r) => ({ url: URLS.abs(r.path), code: 'slug' in r ? codeOf(r.slug) : undefined }));

// 1. HTML pages (+ their Markdown version)
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
  if (p.code) {
    const md = await get(`${p.url}index.md`);
    if (md.status !== 200) bad(`${md.status}  ${p.url}index.md`);
  }
}

// 2. Machine-readable files + everything in public/ (verification files…)
const files = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/products.json'];
for (const p of m.products) files.push(`${p.basePath}referral.json`, `${p.basePath}llms.txt`);
if (SITE.indexNowKey) files.push(`/${SITE.indexNowKey}.txt`);
for (const f of fs.readdirSync(path.join(ROOT, 'public'))) if (!f.startsWith('.') && fs.statSync(path.join(ROOT, 'public', f)).isFile()) files.push(`/${f}`);
for (const f of files) {
  const r = await get(URLS.abs(f));
  if (r.status === 200) ok(`200  ${URLS.abs(f)}`);
  else bad(`${r.status || r.error}  ${URLS.abs(f)}`);
}

// 3. Sitemap = exactly the expected pages
const sm = await get(URLS.abs('/sitemap.xml'));
if (sm.text) {
  const locs = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
  const expected = pages.map((p) => p.url);
  const missing = expected.filter((u) => !locs.includes(u));
  const extra = locs.filter((u) => !expected.includes(u));
  if (missing.length || extra.length) bad(`sitemap: missing [${missing.join(', ')}] extra [${extra.join(', ')}]`);
  else ok(`sitemap lists the ${expected.length} expected pages`);
}

for (const [s, msg] of results) console.log(`${s} ${msg}`);
const failed = results.filter((r) => r[0] === '✖').length;
console.log(`\n${failed ? '✖' : '✔'} ${results.length - failed} ok, ${failed} problem(s)${local ? ' (local)' : ''}`);
if (failed) process.exitCode = 1;
