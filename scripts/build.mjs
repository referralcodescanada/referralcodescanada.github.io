// Static site generator: configs → dist/ (deployed to GitHub Pages by .github/workflows/deploy.yml).
// Usage: node scripts/build.mjs
//   env: PUBLISH=hub|<slug>  SITE_URL=<override public URL>  INCLUDE_DRAFTS=1  OFFLINE=1 (no network)
import fs from 'node:fs';
import path from 'node:path';
import { copyDir, write } from './lib.mjs';
import { loadProject, pickLocale, ROOT, siblingCards } from './load.mjs';
import { cardFromSummary, getText, productSummary } from './products.mjs';
import { renderSitePage } from '../template/site-page.mjs';
import { renderGuidePage } from '../template/guide-page.mjs';
import { render404, renderHubPage } from '../template/hub-page.mjs';
import { guideMarkdown, rootLlmsTxt, siteLlmsTxt, siteMarkdown } from '../template/markdown.mjs';

const DIST = path.join(ROOT, 'dist');
const t0 = Date.now();

const project = await loadProject();
const { hub, sites, products, P, year, warnings } = project;

// Empty dist/ (rather than deleting it) so a terminal or server sitting in it on Windows doesn't block the build.
fs.mkdirSync(DIST, { recursive: true });
for (const f of fs.readdirSync(DIST)) fs.rmSync(path.join(DIST, f), { recursive: true, force: true });

const out = (p, content) => write(path.join(DIST, p), content);
const exists = (dir, file) => fs.existsSync(path.join(dir, file));

// Pick the per-locale OG image if it exists (og-fr.png), else the default one.
function ogFor(dir, publicBase, loc, def) {
  for (const f of [`og-${loc}.png`, `og-${def}.png`, 'og.png']) if (exists(dir, f)) return P.abs(`${publicBase}${f}`);
  return null;
}

// ── public/: copied as-is to the site root (search-engine verification files, etc.) ──
copyDir(path.join(ROOT, 'public'), DIST);

// ── Shared assets ────────────────────────────────────────────
// Hub assets (logo, favicon) live in /assets/ — or /hub-assets/ when publishing a single product.
const hubAssetsDir = path.join(ROOT, 'hub', 'assets');
copyDir(hubAssetsDir, path.join(DIST, P.hubAssets));
if (exists(hubAssetsDir, 'favicon.ico')) fs.copyFileSync(path.join(hubAssetsDir, 'favicon.ico'), path.join(DIST, 'favicon.ico'));

// ── Referral pages + guides ──────────────────────────────────
const sitemapEntries = [];

for (const site of sites) {
  const assetsDir = path.join(site.dir, 'assets');
  const publicAssets = `${site.basePath}assets/`;
  copyDir(assetsDir, path.join(DIST, site.basePath, 'assets'));
  if (!exists(assetsDir, 'icon.svg')) warnings.push(`${site.slug}: assets/icon.svg is missing`);
  const appleIcon = exists(assetsDir, 'apple-touch-icon.png') ? P.href(`${publicAssets}apple-touch-icon.png`) : P.href(`${P.hubAssets}apple-touch-icon.png`);

  for (const loc of site.locs) {
    const L = site.locales[loc];
    const H = pickLocale(hub, loc);
    const og = ogFor(assetsDir, publicAssets, loc, site.def);
    if (!og) warnings.push(`${site.slug}: no og-${loc}.png — run "npm run og"`);
    const assets = { og, icon: P.href(`${publicAssets}icon.svg`), appleIcon, markdown: P.href(`${L.path}index.md`) };
    const siblings = siblingCards(project, site, loc);
    const x = { site, L, hub, H, siblings, P, assets, year };
    out(`${L.path}index.html`, renderSitePage(x));
    out(`${L.path}index.md`, siteMarkdown({ site, L, hub }));

    for (const guide of site.guides) {
      const G = guide.locales[loc];
      if (!G) continue;
      const gAssets = { ...assets, markdown: P.href(`${G.path}index.md`) };
      out(`${G.path}index.html`, renderGuidePage({ ...x, guide, G, assets: gAssets }));
      out(`${G.path}index.md`, guideMarkdown({ site, guide, G, hub }));
    }
  }
  sitemapEntries.push({ lastmod: site.lastVerified, pages: site.locs.map((l) => site.locales[l]), def: site.locales[site.def] });
  for (const g of site.guides) sitemapEntries.push({ lastmod: g.lastVerified, pages: Object.values(g.locales), def: g.locales[g.def] });

  // Removed pages → redirect (meta refresh 0 + canonical, treated by Google as a permanent redirect).
  for (const r of site.cfg.redirects || []) {
    const target = P.abs(`${site.basePath}${r.to || ''}`);
    out(
      `${site.basePath}${r.from.replace(/^\/+/, '').replace(/\/?$/, '/')}index.html`,
      `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting…</title><meta name="robots" content="noindex"><link rel="canonical" href="${target}"><meta http-equiv="refresh" content="0; url=${target}"></head><body><a href="${target}">${target}</a></body></html>
`,
    );
  }

  out(`${site.basePath}llms.txt`, siteLlmsTxt({ site, hub }));
  out(`${site.basePath}referral.json`, JSON.stringify(productSummary(site, P), null, 2));
  out(
    `${site.basePath}llms-full.txt`,
    site.locs
      .flatMap((loc) => [
        siteMarkdown({ site, L: site.locales[loc], hub }),
        ...site.guides.filter((g) => g.locales[loc]).map((guide) => guideMarkdown({ site, guide, G: guide.locales[loc], hub })),
      ])
      .join('\n\n---\n\n'),
  );
}

// ── Home pages (hub mode) or 404 (single product) ────────────
if (!P.standalone) {
  for (const loc of hub.locs) {
    const H = hub.locales[loc];
    const assets = {
      og: ogFor(hubAssetsDir, P.hubAssets, loc, hub.def),
      icon: P.href(P.hubFavicon),
      appleIcon: P.href(`${P.hubAssets}apple-touch-icon.png`),
    };
    const cards = products.map((s) => cardFromSummary(s, loc));
    out(`${H.path}index.html`, renderHubPage({ hub, H, cards, P, assets, year }));
    if (loc === hub.def) out('404.html', render404({ hub, H, cards, P, assets, year }));
  }
  sitemapEntries.unshift({ lastmod: hub.lastVerified, pages: hub.locs.map((l) => hub.locales[l]), def: hub.locales[hub.def] });
  out('products.json', JSON.stringify({ name: hub.name, url: `${P.siteUrl}/`, updated: hub.lastVerified, products }, null, 2));
  if (hub.cfg.customDomain) out('CNAME', `${hub.cfg.customDomain}\n`);
} else {
  const site = sites[0];
  const L = site.locales[site.def];
  const H = { ...hub.locales[hub.def], href: L.href, url: L.url };
  const assets = { og: null, icon: P.href(P.hubFavicon), appleIcon: P.href(`${P.hubAssets}apple-touch-icon.png`) };
  out('404.html', render404({ hub, H, cards: [cardFromSummary(productSummary(site, P), site.def)], P, assets, year }));
}

// ── Sitemaps ─────────────────────────────────────────────────
const urlset = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .flatMap((e) =>
    e.pages.map(
      (p) => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
${e.pages.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.url}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${e.def.url}"/>
  </url>`,
    ),
  )
  .join('\n')}
</urlset>
`;

// Product sitemaps published by other repos (same domain) are referenced from the root sitemap index.
const remoteSitemaps = P.standalone ? [] : project.remote.map((p) => ({ loc: p.sitemap, lastmod: p.lastVerified }));
if (remoteSitemaps.length) {
  out('sitemap-pages.xml', urlset(sitemapEntries));
  const all = [{ loc: P.abs('/sitemap-pages.xml'), lastmod: hub.lastVerified }, ...remoteSitemaps];
  out(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((s) => `  <sitemap>\n    <loc>${s.loc}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>
`,
  );
} else {
  out('sitemap.xml', urlset(sitemapEntries));
}

// ── robots.txt / llms.txt / IndexNow ─────────────────────────
const aiBots = [
  'Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'DuckAssistBot', 'MistralAI-User',
  'CCBot', 'meta-externalagent', 'Amazonbot', 'YouBot',
];
out(
  'robots.txt',
  `# ${hub.name} — every crawler, search engine and AI assistant is welcome.
User-agent: *
Allow: /

${aiBots.map((b) => `User-agent: ${b}`).join('\n')}
Allow: /

Sitemap: ${P.abs('/sitemap.xml')}
`,
);

if (!P.standalone) {
  out('llms.txt', rootLlmsTxt({ hub, products, P }));
  const texts = [];
  for (const site of sites) texts.push(fs.readFileSync(path.join(DIST, site.basePath, 'llms-full.txt'), 'utf8'));
  for (const p of project.remote) {
    const t = await getText(p.llmsFull);
    if (t) texts.push(t);
    else warnings.push(`${p.llmsFull} unreachable — left out of llms-full.txt`);
  }
  out('llms-full.txt', texts.join('\n\n---\n\n'));
}
if (hub.cfg.indexNowKey) out(`${hub.cfg.indexNowKey}.txt`, hub.cfg.indexNowKey);
out('.nojekyll', '');

// ── Report ───────────────────────────────────────────────────
const count = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((n, d) => n + (d.isDirectory() ? count(path.join(dir, d.name)) : 1), 0);
console.log(`✔ Built ${count(DIST)} files → dist/  (${Date.now() - t0} ms)`);
console.log(`  mode: ${P.standalone ? `single product (${sites[0]?.slug})` : `hub (${products.length} product(s): ${products.map((p) => p.slug).join(', ')})`}`);
for (const e of sitemapEntries) for (const p of e.pages) console.log(`  ${p.url}`);
for (const w of warnings) console.warn(`  ⚠ ${w}`);
