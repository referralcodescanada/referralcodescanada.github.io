// Turns the validated content files into ready-to-print data: every placeholder resolved, every URL,
// language and product summary computed once. Pages, machine-readable files and scripts all read this model.
// Pure: no Astro import, so the scripts (npm run og…) can use it too.
import { BRAND_FILES, SITE, type Theme } from '../config/site.ts';
import { deepMerge, interpolateDeep, longDate, markSponsored, money, monthYear, plain, type Vars } from './format.ts';
import { parseGuideBody, type GuideSection } from './guide-body.ts';
import { LOCALE_META, UI, isLoc, type Loc, type UiStrings } from './i18n.ts';
import type { GuideFront, GuideMeta, HubTexts, ProductFacts, ProductTexts } from './schema.ts';

// ── Raw input (what src/content holds) ──
export interface RawGuide {
  id: string;
  meta: GuideMeta;
  texts: Partial<Record<Loc, { front: GuideFront; body: string; file: string }>>;
}
export interface RawProduct {
  slug: string;
  facts: ProductFacts;
  texts: Partial<Record<Loc, ProductTexts>>;
  guides: RawGuide[];
}
export interface RawContent {
  hub: Partial<Record<Loc, HubTexts>>;
  products: RawProduct[];
}

// ── URLs ──
// Every path starts and ends with "/" (e.g. /wealthsimple/fr/). href = link on the page, url = absolute.
const configuredRoot = SITE.customDomain ? `https://${SITE.customDomain}` : SITE.siteUrl;
const ROOT_URL = ((typeof process !== 'undefined' && process.env.SITE_URL) || configuredRoot).replace(/\/+$/, '');
const BASE = new URL(ROOT_URL).pathname.replace(/\/+$/, '');
export const URLS = {
  root: ROOT_URL,
  href: (p: string) => BASE + p,
  abs: (p: string) => ROOT_URL + p,
};
const localePath = (base: string, loc: Loc, def: Loc) => (loc === def ? base : `${base}${loc}/`);

// ── Resolved model ──
export interface Page {
  loc: Loc;
  lang: string;
  meta: (typeof LOCALE_META)[Loc];
  path: string;
  href: string;
  url: string;
}
export interface ProductLocale extends Page {
  ui: UiStrings;
  vars: Vars;
  c: ProductTexts;
}
export interface GuideLocale extends Page {
  ui: UiStrings;
  vars: Vars;
  c: GuideFront & { sections: GuideSection[] };
}
export interface Guide {
  id: string;
  order: number;
  icon: GuideMeta['icon'];
  published: string;
  lastVerified: string;
  def: Loc;
  locales: Partial<Record<Loc, GuideLocale>>;
}
export interface Product {
  slug: string;
  facts: ProductFacts;
  name: string;
  code: string;
  link: string;
  def: Loc;
  locs: Loc[];
  theme: Theme;
  lastVerified: string;
  firstPublished: string;
  basePath: string;
  locales: Record<string, ProductLocale>; // every language in `locs`
  guides: Guide[];
}
export interface HubLocale extends Page {
  ui: UiStrings;
  vars: Vars;
  c: HubTexts;
}
export interface Hub {
  name: string;
  def: Loc;
  locs: Loc[];
  theme: Theme;
  lastVerified: string;
  locales: Record<string, HubLocale>; // every language in `locs`
}

// Summary of a product: /<slug>/referral.json, /products.json, home-page cards, llms.txt.
export function productSummary(p: Product) {
  const r = p.facts.referral;
  return {
    slug: p.slug,
    name: p.name,
    code: p.code,
    url: p.link,
    bonus: { amount: r.bonus, currency: r.currency },
    minimumDeposit: { amount: r.minDeposit, currency: r.currency },
    lastVerified: p.lastVerified,
    accent: p.theme.light.accent,
    icon: URLS.abs(`${p.basePath}assets/icon.svg`),
    sitemap: URLS.abs('/sitemap.xml'),
    llms: URLS.abs(`${p.basePath}llms.txt`),
    llmsFull: URLS.abs(`${p.basePath}llms-full.txt`),
    defaultLocale: p.def,
    locales: Object.fromEntries(
      p.locs.map((l) => {
        const L = p.locales[l];
        return [l, { lang: L.lang, url: L.url, markdown: `${L.url}index.md`, title: plain(L.c.seo.title), summary: plain(L.c.hub.summary), terms: L.c.links.termsUrl }];
      }),
    ),
    guides: p.guides.flatMap((g) =>
      Object.values(g.locales).map((G) => ({ lang: G.lang, loc: G.loc, title: plain(G.c.title), url: G.url, markdown: `${G.url}index.md` })),
    ),
  };
}
export type ProductSummary = ReturnType<typeof productSummary>;

// Card data (one language) for the home page and the "more codes" sections.
export function cardFor(s: ProductSummary, loc: Loc) {
  const L = s.locales[loc] || s.locales[s.defaultLocale] || Object.values(s.locales)[0];
  // The icon is on this site: link it relatively (works in local preview too).
  const iconHref = s.icon.startsWith(URLS.root) ? URLS.href(s.icon.slice(URLS.root.length)) : s.icon;
  return { name: s.name, code: s.code, href: L.url, url: L.url, summary: L.summary, accent: s.accent, iconHref };
}
export type Card = ReturnType<typeof cardFor>;

function prepareProduct(raw: RawProduct, year: number): Product {
  const { slug, facts: f } = raw;
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`[content] product folder "${slug}" must be lowercase letters, digits and dashes`);
  if (isLoc(slug)) throw new Error(`[content] product folder "${slug}" collides with a language code`);
  const r = f.referral;
  for (const u of [r.url, ...Object.values(r.urls || {})]) if (u) markSponsored(u);
  const locs = (Object.keys(raw.texts) as Loc[]).filter((l) => raw.texts[l]);
  if (!locs.length) throw new Error(`[content] ${slug}: add at least one language file (en.yaml / fr.yaml)`);
  const def = locs.includes(f.defaultLocale) ? f.defaultLocale : locs[0];
  const basePath = `/${slug}/`;
  const product: Product = {
    slug,
    facts: f,
    name: f.brand.name,
    code: r.code,
    link: r.url,
    def,
    locs,
    theme: deepMerge(SITE.theme, f.theme || {}),
    lastVerified: f.lastVerified,
    firstPublished: f.firstPublished || f.lastVerified,
    basePath,
    locales: {},
    guides: [],
  };

  for (const loc of locs) {
    const meta = LOCALE_META[loc];
    const lang = meta.lang;
    const T = raw.texts[loc]!;
    const link = r.urls?.[loc] || r.url;
    const vars: Vars = {
      brand: f.brand.name,
      code: r.code,
      codeSpelled: r.codeSpelled?.[loc] ?? r.code.split('').join(' · '),
      link,
      linkDisplay: link.replace(/^https?:\/\/(www\.)?/, ''),
      bonus: money(r.bonus, r.currency, lang),
      bonusCents: money(r.bonus, r.currency, lang, 2),
      minDeposit: money(r.minDeposit ?? 0, r.currency, lang),
      minDepositCents: money(r.minDeposit ?? 0, r.currency, lang, 2),
      balanceDemo: money((r.minDeposit ?? 0) + r.bonus, r.currency, lang, 2),
      year,
      verifiedDate: longDate(f.lastVerified, lang),
      month: monthYear(f.lastVerified, lang),
      ...T.links,
      ...(f.vars || {}),
      ...(T.vars || {}),
    };
    const where = `src/content/products/${slug}/${loc}.yaml`;
    const p = localePath(basePath, loc, def);
    product.locales[loc] = {
      loc,
      lang,
      meta,
      ui: interpolateDeep(deepMerge(UI[loc], T.ui || {}), vars, `${where} (ui)`),
      vars,
      c: interpolateDeep(T, vars, where),
      path: p,
      href: URLS.href(p),
      url: URLS.abs(p),
    };
  }

  for (const g of raw.guides) {
    if (g.meta.draft && !process.env.INCLUDE_DRAFTS) continue;
    const guide: Guide = {
      id: g.id,
      order: g.meta.order,
      icon: g.meta.icon,
      published: g.meta.published || product.firstPublished,
      lastVerified: g.meta.lastVerified || product.lastVerified,
      def,
      locales: {},
    };
    for (const loc of locs) {
      const t = g.texts[loc];
      if (!t) continue;
      const S = product.locales[loc];
      const vars = { ...S.vars, ...t.front.links };
      const sections = parseGuideBody(t.body, t.file);
      const p = `${S.path}guides/${t.front.slug}/`;
      guide.locales[loc] = {
        loc,
        lang: S.lang,
        meta: S.meta,
        ui: S.ui,
        vars,
        c: interpolateDeep({ ...t.front, sections }, vars, t.file),
        path: p,
        href: URLS.href(p),
        url: URLS.abs(p),
      };
    }
    guide.def = guide.locales[def] ? def : (Object.keys(guide.locales)[0] as Loc);
    if (guide.def) product.guides.push(guide);
  }
  product.guides.sort((a, b) => a.order - b.order);
  return product;
}

function prepareHub(raw: RawContent['hub'], summaries: ProductSummary[], year: number): Hub {
  const locs = (Object.keys(raw) as Loc[]).filter((l) => raw[l]);
  const def = locs.includes(SITE.defaultLocale) ? SITE.defaultLocale : locs[0];
  const latest = summaries.map((s) => s.lastVerified).sort().at(-1) || new Date().toISOString().slice(0, 10);
  const hub: Hub = { name: SITE.name, def, locs, theme: SITE.theme, lastVerified: latest, locales: {} };
  for (const loc of locs) {
    const meta = LOCALE_META[loc];
    const vars: Vars = { name: SITE.name, count: summaries.length, year, month: monthYear(latest, meta.lang) };
    const p = localePath('/', loc, def);
    hub.locales[loc] = {
      loc,
      lang: meta.lang,
      meta,
      ui: UI[loc],
      vars,
      c: interpolateDeep(raw[loc]!, vars, `src/content/hub/${loc}.yaml`),
      path: p,
      href: URLS.href(p),
      url: URLS.abs(p),
    };
  }
  return hub;
}

export function buildModel(raw: RawContent, year = new Date().getUTCFullYear()) {
  const products = raw.products
    .filter((p) => !p.facts.draft || process.env.INCLUDE_DRAFTS)
    .map((p) => prepareProduct(p, year))
    .sort((a, b) => a.facts.order - b.facts.order || a.name.localeCompare(b.name));
  const summaries = products.map(productSummary);
  const hub = prepareHub(raw.hub, summaries, year);
  return { hub, products, summaries, year, brand: BRAND_FILES };
}
export type Model = ReturnType<typeof buildModel>;

// The best language of a product to link to from a page written in `loc`.
export const pickLocale = <T>(locales: { [loc: string]: T | undefined }, loc: Loc, def: Loc): T => (locales[loc] || locales[def])!;

// Cards of the other products, for a page written in `loc`.
export const siblingCards = (m: Model, product: Product, loc: Loc) =>
  m.summaries.filter((s) => s.slug !== product.slug).map((s) => cardFor(s, loc));
