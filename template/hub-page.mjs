// Renders the collection home page (one per locale) and the 404 page.
import { esc, md, plain } from '../scripts/lib.mjs';
import { icon } from './icons.mjs';
import { coin, footer, head, header, scripts, toast } from './layout.mjs';
import { miniCard } from './site-page.mjs';

export function renderHubPage(x) {
  const { hub, H, cards, P, assets, year } = x;
  const { c, ui } = H;
  const otherLocales = hub.locs.filter((l) => l !== H.loc).map((l) => hub.locales[l]);

  const body = `
<section class="hero hero--hub" aria-labelledby="h1">
  <div class="wrap hub-hero">
    <div>
      <p class="eyebrow"><span class="dot" aria-hidden="true"></span>${md(c.hero.eyebrow)}</p>
      <h1 id="h1">${md(c.hero.h1)}</h1>
      <p class="lead">${md(c.hero.lead)}</p>
    </div>
    ${coin({ src: P.href(P.logoFull), alt: hub.name, legend: hub.cfg.coin })}
  </div>
</section>
<section class="section section--tight" id="codes" aria-labelledby="codes-h">
  <div class="wrap">
    <div class="section__head"><h2 id="codes-h">${md(c.listTitle)}</h2><p class="section__intro">${md(c.listIntro)}</p></div>
    <ul class="cards">${cards.map((s) => miniCard(s, ui)).join('')}</ul>
  </div>
</section>
<section class="section section--alt" aria-labelledby="about-h">
  <div class="wrap">
    <div class="section__head"><h2 id="about-h">${md(c.about.title)}</h2></div>
    <ul class="features">${c.about.items
      .map((f) => `<li class="card feature"><span class="feature__icon">${icon(f.icon)}</span><h3>${md(f.title)}</h3><p>${md(f.text)}</p></li>`)
      .join('')}</ul>
  </div>
</section>
<section class="section" id="faq" aria-labelledby="faq-h">
  <div class="wrap narrow">
    <div class="section__head"><h2 id="faq-h">${md(c.faq.title)}</h2></div>
    <div class="faq">${c.faq.items
      .map((f) => `<details class="faq__item"><summary><h3>${md(f.q)}</h3><span class="faq__chev">${icon('plus')}</span></summary><div class="faq__a"><p>${md(f.a)}</p></div></details>`)
      .join('')}</div>
  </div>
</section>`;

  const page = {
    lang: H.lang,
    title: c.seo.title,
    description: c.seo.description,
    keywords: c.seo.keywords,
    url: H.url,
    defaultUrl: hub.locales[hub.def].url,
    alternates: hub.locs.map((l) => ({ lang: hub.locales[l].lang, url: hub.locales[l].url })),
    ogLocale: H.meta.og,
    ogAlternates: otherLocales.map((o) => o.meta.og),
    image: assets.og && { url: assets.og, width: 1200, height: 630, alt: c.seo.title },
    icon: assets.icon,
    appleIcon: assets.appleIcon,
    markdownUrl: null,
    sitemapUrl: P.href('/sitemap.xml'),
    theme: hub.theme,
    verification: hub.cfg.verification,
    analytics: hub.cfg.analytics,
    siteName: hub.name,
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${P.siteUrl}/#organization`,
          name: hub.name,
          url: `${P.siteUrl}/`,
          logo: P.abs(P.logoFull),
          sameAs: hub.cfg.github ? [hub.cfg.github] : undefined,
        },
        {
          '@type': 'WebSite',
          '@id': `${P.siteUrl}/#website`,
          url: `${P.siteUrl}/`,
          name: hub.name,
          description: plain(c.seo.description),
          publisher: { '@id': `${P.siteUrl}/#organization` },
          inLanguage: hub.locs.map((l) => hub.locales[l].lang),
        },
        {
          '@type': 'CollectionPage',
          '@id': `${H.url}#webpage`,
          url: H.url,
          name: plain(c.seo.title),
          description: plain(c.seo.description),
          inLanguage: H.lang,
          isPartOf: { '@id': `${P.siteUrl}/#website` },
          dateModified: hub.lastVerified,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: cards.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: `${s.name} — ${s.code}`, url: s.url })),
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${H.url}#faq`,
          mainEntity: c.faq.items.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
        },
      ],
    },
  };

  return shell({ x, page, body, otherLocales, nav: [{ href: '#codes', label: ui.nav.codes }, { href: '#faq', label: ui.nav.faq }] });
}

export function render404(x) {
  const { hub, H, cards, P, assets } = x;
  const { ui } = H;
  const body = `
<section class="hero hero--hub" aria-labelledby="h1">
  <div class="wrap">
    <p class="eyebrow"><span class="dot" aria-hidden="true"></span>404</p>
    <h1 id="h1">${esc(ui.notFoundTitle)}</h1>
    <p class="lead">${esc(ui.notFoundText)}</p>
    <div class="cta-row"><a class="btn btn--primary" href="${H.href}">${esc(ui.backHome)}${icon('arrow')}</a></div>
  </div>
</section>
<section class="section section--tight"><div class="wrap"><ul class="cards">${cards.map((s) => miniCard(s, ui)).join('')}</ul></div></section>`;
  const page = {
    lang: H.lang,
    title: `${ui.notFoundTitle} — ${hub.name}`,
    description: ui.notFoundText,
    url: H.url,
    defaultUrl: H.url,
    alternates: [],
    ogLocale: H.meta.og,
    ogAlternates: [],
    image: null,
    icon: assets.icon,
    appleIcon: assets.appleIcon,
    sitemapUrl: P.href('/sitemap.xml'),
    theme: hub.theme,
    verification: {},
    siteName: hub.name,
    jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: ui.notFoundTitle },
  };
  return shell({ x, page, body, otherLocales: [], nav: [], noindex: true });
}

function shell({ x, page, body, otherLocales, nav, noindex }) {
  const { hub, H, cards, P, year } = x;
  const { ui } = H;
  let html = `<!doctype html>
<html lang="${H.lang}">
${head(page)}
<body>
${header({
  ui,
  homeHref: H.href,
  homeLabel: hub.name,
  logoHref: P.href(P.logoMark),
  nav,
  langLinks: otherLocales.map((o) => ({ href: o.href, lang: o.lang, label: o.meta.label, short: o.meta.short })),
})}
<main id="main">
${body}
</main>
${footer({
  ui,
  homeHref: H.href,
  homeLabel: hub.name,
  logoHref: P.href(P.logoMark),
  disclaimer: H.c.footer.disclaimer,
  columns: [
    { title: ui.allCodes, links: cards.map((s) => ({ href: s.href, label: `${s.name} — ${s.code}` })) },
    {
      title: ui.machine,
      links: [
        { href: P.href('/llms.txt'), label: 'llms.txt' },
        { href: P.href('/llms-full.txt'), label: 'llms-full.txt' },
        { href: P.href('/sitemap.xml'), label: 'sitemap.xml' },
      ],
    },
    { title: ui.language, links: hub.locs.map((l) => ({ href: hub.locales[l].href, label: hub.locales[l].meta.label, lang: hub.locales[l].lang })) },
  ],
  meta: `© ${year} ${esc(hub.name)}${hub.cfg.github ? ` · <a href="${hub.cfg.github}" rel="noopener" target="_blank">GitHub</a>` : ''}`,
})}
${toast()}
${scripts()}
</body>
</html>
`;
  if (noindex) {
    html = html
      .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow">')
      .replace(/<link rel="canonical"[^>]*>\n/, '');
  }
  return html;
}
