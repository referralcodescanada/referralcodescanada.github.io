// Loads hub/hub.config.mjs + sites/*/site.config.mjs and resolves every placeholder,
// URL and locale so the renderers only deal with ready-to-print data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deepMerge, interpolateDeep, longDate, markSponsored, money, monthYear } from './lib.mjs';
import { LOCALE_META, UI } from '../template/i18n.mjs';
import { cardFromSummary, fetchCached, productSummary } from './products.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const importFresh = async (file) => (await import(`${pathToFileURL(file).href}?t=${Date.now()}`)).default;

const localePath = (base, loc, def) => (loc === def ? base : `${base}${loc}/`);

function fail(msg) {
  throw new Error(`[config] ${msg}`);
}

export async function loadProject({ year = new Date().getUTCFullYear() } = {}) {
  const hubCfg = await importFresh(path.join(ROOT, 'hub', 'hub.config.mjs'));

  // publish = 'hub'   → repo "<account>.github.io": home page + every site under /<slug>/
  // publish = '<slug>' → repo named after one product: only that site, at the repo root
  //                      (served by GitHub at https://<account>.github.io/<slug>/ — same public URL).
  const publish = process.env.PUBLISH || hubCfg.publish || 'hub';
  const standalone = publish !== 'hub';
  const configuredRoot = hubCfg.customDomain ? `https://${hubCfg.customDomain}` : hubCfg.siteUrl;
  const rootUrl = (process.env.SITE_URL || configuredRoot).replace(/\/+$/, '');
  const siteUrl = standalone && !process.env.SITE_URL ? `${rootUrl}/${publish}` : rootUrl;
  const basePath = new URL(siteUrl).pathname.replace(/\/+$/, '');
  const P = {
    rootUrl: standalone ? rootUrl : siteUrl,
    siteUrl,
    basePath,
    standalone,
    hubAssets: standalone ? '/hub-assets/' : '/assets/',
    href: (p) => basePath + p,
    abs: (p) => siteUrl + p,
  };

  const sitesDir = path.join(ROOT, 'sites');
  const slugs = (fs.existsSync(sitesDir) ? fs.readdirSync(sitesDir, { withFileTypes: true }) : [])
    .filter((d) => d.isDirectory() && !/^[._]/.test(d.name))
    .map((d) => d.name)
    .filter((s) => !standalone || s === publish);
  if (standalone && !slugs.length) fail(`publish: "${publish}" but sites/${publish}/ does not exist`);

  const sites = [];
  for (const slug of slugs) {
    const file = path.join(sitesDir, slug, 'site.config.mjs');
    if (!fs.existsSync(file)) continue;
    const cfg = await importFresh(file);
    if (cfg.draft && !process.env.INCLUDE_DRAFTS) {
      console.log(`  · skipping draft site "${slug}"`);
      continue;
    }
    sites.push(await prepareSite(slug, cfg, hubCfg, P, year));
  }
  sites.sort((a, b) => (a.cfg.order ?? 99) - (b.cfg.order ?? 99) || a.name.localeCompare(b.name));

  // Products hosted in other repos (hub mode: listed on the home page; standalone: linked as siblings).
  const warnings = [];
  const local = sites.map((s) => productSummary(s, P));
  const remote = [];
  if (!process.env.OFFLINE) {
    if (standalone) {
      const list = await fetchCached('products', `${rootUrl}/products.json`, warnings, (d) => Array.isArray(d?.products));
      remote.push(...(list?.products || []).filter((p) => p.slug !== publish));
    } else {
      for (const slug of hubCfg.products || []) {
        if (sites.some((s) => s.slug === slug)) continue;
        const data = await fetchCached(`product-${slug}`, `${rootUrl}/${slug}/referral.json`, warnings, (d) => !!d?.locales);
        if (data) remote.push(data);
      }
    }
  }
  const products = [...local, ...remote];

  const hub = prepareHub(hubCfg, products, P, year);
  return { hub, sites, products, remote, P, year, warnings };
}

// Cards of the other products, for a page written in `loc`.
export const siblingCards = (project, site, loc) =>
  project.products.filter((p) => p.slug !== site.slug).map((p) => cardFromSummary(p, loc));

async function prepareSite(slug, cfg, hubCfg, P, year) {
  if (!/^[a-z0-9-]+$/.test(slug)) fail(`site folder "${slug}" must be lowercase letters, digits and dashes`);
  if (LOCALE_META[slug]) fail(`site folder "${slug}" collides with a language code`);
  const r = cfg.referral || fail(`${slug}: missing "referral"`);
  for (const k of ['code', 'url', 'bonus', 'currency']) if (r[k] == null) fail(`${slug}: missing referral.${k}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cfg.lastVerified || '')) fail(`${slug}: lastVerified must be YYYY-MM-DD`);

  markSponsored(r.url);
  const locs = Object.keys(cfg.locales || {});
  if (!locs.length) fail(`${slug}: at least one locale is required`);
  const def = cfg.defaultLocale || locs[0];
  const dir = path.join(ROOT, 'sites', slug);
  const base = P.standalone ? '/' : `/${slug}/`;

  const site = {
    kind: 'site',
    slug,
    dir,
    cfg,
    name: cfg.brand.name,
    code: r.code,
    link: r.url,
    def,
    locs,
    theme: deepMerge(hubCfg.theme, cfg.theme || {}),
    lastVerified: cfg.lastVerified,
    firstPublished: cfg.firstPublished || cfg.lastVerified,
    basePath: base,
    locales: {},
    guides: [],
  };

  for (const loc of locs) {
    const meta = LOCALE_META[loc] || fail(`${slug}: unsupported locale "${loc}" (add it to template/i18n.mjs)`);
    const lang = meta.lang;
    const raw = cfg.locales[loc];
    const vars = {
      brand: cfg.brand.name,
      code: r.code,
      codeSpelled: r.codeSpelled?.[loc] ?? r.code.split('').join(' · '),
      link: r.url,
      linkDisplay: r.url.replace(/^https?:\/\/(www\.)?/, ''),
      bonus: money(r.bonus, r.currency, lang),
      bonusCents: money(r.bonus, r.currency, lang, 2),
      minDeposit: money(r.minDeposit ?? 0, r.currency, lang),
      minDepositCents: money(r.minDeposit ?? 0, r.currency, lang, 2),
      balanceDemo: money((r.minDeposit ?? 0) + r.bonus, r.currency, lang, 2),
      year,
      verifiedDate: longDate(cfg.lastVerified, lang),
      month: monthYear(cfg.lastVerified, lang),
      ...(raw.links || {}),
      ...(cfg.vars || {}),
      ...(raw.vars || {}),
    };
    const p = localePath(base, loc, def);
    site.locales[loc] = {
      loc,
      lang,
      meta,
      ui: interpolateDeep(UI[loc], vars),
      vars,
      c: interpolateDeep(raw, vars),
      path: p,
      href: P.href(p),
      url: P.abs(p),
    };
  }

  // Guides: sites/<slug>/guides/*.mjs — one file per article, with a version per language.
  const guidesDir = path.join(dir, 'guides');
  const files = fs.existsSync(guidesDir) ? fs.readdirSync(guidesDir).filter((f) => f.endsWith('.mjs')) : [];
  for (const file of files) {
    const g = await importFresh(path.join(guidesDir, file));
    if (g.draft && !process.env.INCLUDE_DRAFTS) continue;
    const guide = {
      id: g.id || file.replace(/\.mjs$/, ''),
      order: g.order ?? 99,
      icon: g.icon || 'info',
      published: g.published || site.firstPublished,
      lastVerified: g.lastVerified || site.lastVerified,
      locales: {},
    };
    for (const loc of locs) {
      const raw = g.locales?.[loc];
      if (!raw) continue;
      if (!/^[a-z0-9-]+$/.test(raw.slug || '')) fail(`${slug}/guides/${file}: locales.${loc}.slug is required (a-z, 0-9, -)`);
      const S = site.locales[loc];
      const vars = { ...S.vars, ...(raw.links || {}) };
      const p = `${S.path}guides/${raw.slug}/`;
      guide.locales[loc] = { loc, lang: S.lang, meta: S.meta, ui: S.ui, vars, c: interpolateDeep(raw, vars), path: p, href: P.href(p), url: P.abs(p) };
    }
    guide.def = guide.locales[def] ? def : Object.keys(guide.locales)[0];
    if (guide.def) site.guides.push(guide);
  }
  site.guides.sort((a, b) => a.order - b.order);
  return site;
}

function prepareHub(cfg, products, P, year) {
  const locs = Object.keys(cfg.locales);
  const def = cfg.defaultLocale || locs[0];
  const latest = products.map((s) => s.lastVerified).sort().at(-1) || new Date().toISOString().slice(0, 10);
  const hub = {
    kind: 'hub',
    cfg,
    name: cfg.name,
    def,
    locs,
    theme: cfg.theme,
    lastVerified: latest,
    basePath: '/',
    locales: {},
  };
  for (const loc of locs) {
    const meta = LOCALE_META[loc];
    const vars = { name: cfg.name, count: products.length, year, month: monthYear(latest, meta.lang) };
    const p = localePath('/', loc, def);
    hub.locales[loc] = {
      loc,
      lang: meta.lang,
      meta,
      ui: UI[loc],
      vars,
      c: interpolateDeep(cfg.locales[loc], vars),
      path: p,
      // In a single-product repo the home page lives in the "<account>.github.io" repo → absolute links.
      href: P.standalone ? P.rootUrl + p : P.href(p),
      url: P.standalone ? P.rootUrl + p : P.abs(p),
    };
  }
  return hub;
}

// The best locale of `site` to link to from a page written in `loc`.
export const pickLocale = (site, loc) => site.locales[loc] || site.locales[site.def];
