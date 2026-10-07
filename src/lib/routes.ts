// THE list of every address of the site. Pages ([...path].astro), their .md versions, the sitemap,
// hreflang links, llms files and IndexNow all derive from it, so they can't disagree.
import type { Loc } from './i18n.ts';
import { URLS, type Model, type Page } from './model.ts';

export type Route =
  | { kind: 'hub'; path: string; loc: Loc }
  | { kind: 'product'; path: string; slug: string; loc: Loc }
  | { kind: 'guide'; path: string; slug: string; guide: string; loc: Loc }
  | { kind: 'redirect'; path: string; to: string };

// "/wealthsimple/fr/" → "wealthsimple/fr" (Astro rest parameter; undefined = home page).
export const param = (path: string) => path.replace(/^\/+|\/+$/g, '') || undefined;

export function pageRoutes(m: Model): Route[] {
  const routes: Route[] = [];
  for (const loc of m.hub.locs) routes.push({ kind: 'hub', path: m.hub.locales[loc].path, loc });
  for (const p of m.products) {
    for (const loc of p.locs) routes.push({ kind: 'product', path: p.locales[loc].path, slug: p.slug, loc });
    for (const g of p.guides) for (const G of Object.values(g.locales)) routes.push({ kind: 'guide', path: G.path, slug: p.slug, guide: g.id, loc: G.loc });
    // Removed pages: meta refresh + canonical (Google treats it as a permanent redirect).
    for (const r of p.facts.redirects) {
      routes.push({ kind: 'redirect', path: `${p.basePath}${r.from.replace(/^\/+/, '').replace(/\/?$/, '/')}`, to: URLS.abs(`${p.basePath}${r.to}`) });
    }
  }
  const seen = new Set<string>();
  for (const r of routes) {
    if (seen.has(r.path)) throw new Error(`[routes] two pages share the address ${r.path}`);
    seen.add(r.path);
  }
  return routes;
}

// Pages that have a Markdown version (<page>index.md) for AI assistants.
export const markdownRoutes = (m: Model) => pageRoutes(m).filter((r) => r.kind === 'product' || r.kind === 'guide');

// Sitemap groups: a page + its translations (hreflang), with the date of its content.
export function sitemapGroups(m: Model) {
  const groups: { lastmod: string; pages: Page[]; def: Page }[] = [{ lastmod: m.hub.lastVerified, pages: m.hub.locs.map((l) => m.hub.locales[l]), def: m.hub.locales[m.hub.def] }];
  for (const p of m.products) {
    groups.push({ lastmod: p.lastVerified, pages: p.locs.map((l) => p.locales[l]), def: p.locales[p.def] });
    for (const g of p.guides) groups.push({ lastmod: g.lastVerified, pages: Object.values(g.locales), def: g.locales[g.def]! });
  }
  return groups;
}
