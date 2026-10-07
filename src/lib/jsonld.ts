// Structured data (schema.org JSON-LD). Nodes reference each other by @id across the page:
// the page graph lives in <head>; the FAQ and step components add their own FAQPage / HowTo node
// next to what they display, so the visible text and the data for Google can't diverge.
import { SITE, BRAND_FILES } from '../config/site.ts';
import { plain } from './format.ts';
import { URLS, type Card, type Guide, type GuideLocale, type Hub, type HubLocale, type Product, type ProductLocale } from './model.ts';

const ORG_ID = `${URLS.root}/#organization`;
const WEBSITE_ID = `${URLS.root}/#website`;
const org = { '@id': ORG_ID };

const organization = (withSameAs = true) => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE.name,
  url: `${URLS.root}/`,
  logo: URLS.abs(BRAND_FILES.full),
  ...(withSameAs && SITE.github ? { sameAs: [SITE.github] } : {}),
});

export const graph = (...nodes: unknown[]) => ({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });

export function faqPageNode(id: string, items: { q: string; a: string }[], inLanguage?: string) {
  return {
    '@type': 'FAQPage',
    '@id': id,
    ...(inLanguage ? { inLanguage } : {}),
    mainEntity: items.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
  };
}

export interface HowToInput {
  id: string;
  name: string;
  description?: string;
  inLanguage: string;
  totalTime?: string;
  currency: string;
  pageUrl: string;
  steps: { title: string; text: string }[];
}
export function howToNode(h: HowToInput) {
  return {
    '@type': 'HowTo',
    '@id': h.id,
    name: plain(h.name),
    description: plain(h.description),
    inLanguage: h.inLanguage,
    totalTime: h.totalTime,
    estimatedCost: { '@type': 'MonetaryAmount', currency: h.currency, value: 0 },
    step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: plain(s.title), text: plain(s.text), url: `${h.pageUrl}#step-${i + 1}` })),
  };
}

export function hubGraph(hub: Hub, H: HubLocale, cards: Card[]) {
  const c = H.c;
  return graph(
    organization(),
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${URLS.root}/`,
      name: SITE.name,
      description: plain(c.seo.description),
      publisher: org,
      inLanguage: hub.locs.map((l) => hub.locales[l].lang),
    },
    {
      '@type': 'CollectionPage',
      '@id': `${H.url}#webpage`,
      url: H.url,
      name: plain(c.seo.title),
      description: plain(c.seo.description),
      inLanguage: H.lang,
      isPartOf: { '@id': WEBSITE_ID },
      dateModified: hub.lastVerified,
      mainEntity: { '@type': 'ItemList', itemListElement: cards.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: `${s.name} — ${s.code}`, url: s.url })) },
    },
  );
}

export function productGraph(p: Product, L: ProductLocale, hub: Hub, H: HubLocale, og: string | null) {
  const c = L.c;
  const url = L.url;
  return graph(
    organization(),
    { '@type': 'WebSite', '@id': WEBSITE_ID, url: `${URLS.root}/`, name: SITE.name, publisher: org, inLanguage: hub.locs.map((l) => hub.locales[l].lang) },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: plain(c.seo.title),
      headline: plain(c.hero.h1),
      description: plain(c.seo.description),
      inLanguage: L.lang,
      isPartOf: { '@id': WEBSITE_ID },
      publisher: org,
      datePublished: p.firstPublished,
      dateModified: p.lastVerified,
      breadcrumb: { '@id': `${url}#breadcrumb` },
      primaryImageOfPage: og ? { '@type': 'ImageObject', url: og, width: 1200, height: 630 } : undefined,
      about: { '@type': 'Organization', name: p.name, sameAs: p.facts.brand.sameAs },
      mainEntity: { '@id': `${url}#faq` },
      keywords: c.seo.keywords.join(', ') || undefined,
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.lead', '#quick-answer'] },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: H.url },
        { '@type': 'ListItem', position: 2, name: p.name, item: url },
      ],
    },
  );
}

export function guideGraph(p: Product, g: Guide, G: GuideLocale, H: HubLocale, og: string | null) {
  const c = G.c;
  const S = p.locales[G.loc];
  const url = G.url;
  return graph(
    organization(false),
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: plain(c.title),
      description: plain(c.seo.description),
      inLanguage: G.lang,
      url,
      mainEntityOfPage: url,
      datePublished: g.published,
      dateModified: g.lastVerified,
      author: org,
      publisher: org,
      image: og || undefined,
      about: { '@type': 'Organization', name: p.name, sameAs: p.facts.brand.sameAs },
      isPartOf: { '@id': `${S.url}#webpage` },
      keywords: c.seo.keywords.join(', ') || undefined,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: H.url },
        { '@type': 'ListItem', position: 2, name: p.name, item: S.url },
        { '@type': 'ListItem', position: 3, name: plain(c.title), item: url },
      ],
    },
  );
}
