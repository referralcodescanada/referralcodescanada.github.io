// Renders one guide (article) of a site, in one language.
import { esc, md, plain } from '../scripts/lib.mjs';
import { icon } from './icons.mjs';
import { copyButton, ctaLink, head, header, scripts, toast } from './layout.mjs';
import { guideCard, siteFooter, stickyBar } from './site-page.mjs';

function section(s, i) {
  const parts = [`<h2 id="s${i + 1}">${md(s.h2)}</h2>`];
  for (const p of s.paragraphs || []) parts.push(`<p>${md(p)}</p>`);
  if (s.list?.length) parts.push(`<ul>${s.list.map((li) => `<li>${md(li)}</li>`).join('')}</ul>`);
  if (s.steps?.length) parts.push(`<ol class="steps-list">${s.steps.map((li) => `<li>${md(li)}</li>`).join('')}</ol>`);
  for (const p of s.after || []) parts.push(`<p>${md(p)}</p>`);
  if (s.note) parts.push(`<p class="note">${icon('info')}<span>${md(s.note)}</span></p>`);
  return `<section aria-labelledby="s${i + 1}">${parts.join('\n')}</section>`;
}

export function renderGuidePage(x) {
  const { site, guide, G, hub, H, P, assets } = x;
  const S = site.locales[G.loc];
  const { c, ui } = G;
  const code = site.code;
  const others = site.guides.filter((g) => g !== guide);
  const otherLocales = Object.values(guide.locales).filter((o) => o.loc !== G.loc);
  const dateText = new Intl.DateTimeFormat(G.lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${guide.lastVerified}T12:00:00Z`));

  const body = `
<section class="hero article-hero" aria-labelledby="h1">
  <div class="wrap">
    <nav class="crumbs" aria-label="${esc(ui.breadcrumb)}"><ol><li><a href="${H.href}">${esc(hub.name)}</a></li><li><a href="${S.href}">${esc(site.name)}</a></li><li aria-current="page">${esc(plain(c.title))}</li></ol></nav>
    <p class="eyebrow"><span class="dot" aria-hidden="true"></span>${esc(ui.guide)} · ${esc(site.name)}</p>
    <h1 id="h1">${md(c.title)}</h1>
    <p class="lead">${md(c.lead)}</p>
    <p class="article-meta"><span>${esc(ui.updated)} <time datetime="${guide.lastVerified}">${esc(dateText)}</time></span><span>${esc(hub.name)}</span></p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap article-grid">
    <article class="prose">
      ${c.sections.map(section).join('\n')}
      ${c.faq?.length ? `<section class="article-faq" aria-labelledby="faq-h"><h2 id="faq-h">FAQ</h2><div class="faq">${c.faq
        .map((f) => `<details class="faq__item"><summary><h3>${md(f.q)}</h3><span class="faq__chev">${icon('plus')}</span></summary><div class="faq__a"><p>${md(f.a)}</p></div></details>`)
        .join('')}</div></section>` : ''}
    </article>
    <aside class="aside">
      <nav class="card toc" aria-label="${esc(ui.onThisPage)}"><h2>${esc(ui.onThisPage)}</h2><ol>${c.sections
        .map((s, i) => `<li><a href="#s${i + 1}">${md(s.h2)}</a></li>`)
        .join('')}${c.faq?.length ? '<li><a href="#faq-h">FAQ</a></li>' : ''}</ol></nav>
      <div class="card callout" data-hero-code>
        <h2>${md(ui.calloutTitle)}</h2>
        <p>${md(ui.calloutText)}</p>
        <div class="codebox codebox--inverse"><div class="codebox__txt"><span class="codebox__label">${esc(ui.codeLabel)}</span><code class="codebox__code">${esc(code)}</code></div>${copyButton({ code, ui, cls: 'copy--sm' })}</div>
        ${ctaLink({ href: G.vars.link, label: S.c.hero.cta, cls: 'btn btn--accent' })}
      </div>
    </aside>
  </div>
</section>
<section class="section section--alt" aria-labelledby="related-h">
  <div class="wrap">
    <div class="section__head"><h2 id="related-h">${esc(ui.relatedGuides)}</h2></div>
    <ul class="guides">
      <li class="card guide-card"><span class="feature__icon">${icon('gift')}</span><h3><a href="${S.href}">${esc(ui.backToCode)}${ui.colon}${esc(code)}</a></h3><p>${md(S.c.hub?.summary || '')}</p><span class="mini__link">${esc(ui.seeGuide)} ${icon('arrow')}</span></li>
      ${others.map((g) => guideCard(g.locales[G.loc] || g.locales[g.def], g, ui)).join('')}
    </ul>
  </div>
</section>`;

  const url = G.url;
  const org = { '@id': `${P.siteUrl}/#organization` };
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': org['@id'], name: hub.name, url: `${P.rootUrl}/`, logo: P.abs(P.logoFull) },
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: plain(c.title),
        description: plain(c.seo.description),
        inLanguage: G.lang,
        url,
        mainEntityOfPage: url,
        datePublished: guide.published,
        dateModified: guide.lastVerified,
        author: org,
        publisher: org,
        image: assets.og || undefined,
        about: { '@type': 'Organization', name: site.name, sameAs: site.cfg.brand.sameAs },
        isPartOf: { '@id': `${S.url}#webpage` },
        keywords: c.seo.keywords?.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: hub.name, item: H.url },
          { '@type': 'ListItem', position: 2, name: site.name, item: S.url },
          { '@type': 'ListItem', position: 3, name: plain(c.title), item: url },
        ],
      },
      c.faq?.length && {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
      },
    ].filter(Boolean),
  };

  const page = {
    lang: G.lang,
    title: c.seo.title,
    description: c.seo.description,
    keywords: c.seo.keywords,
    url,
    defaultUrl: guide.locales[guide.def].url,
    alternates: Object.values(guide.locales).map((o) => ({ lang: o.lang, url: o.url })),
    ogLocale: G.meta.og,
    ogAlternates: otherLocales.map((o) => o.meta.og),
    image: assets.og && { url: assets.og, width: 1200, height: 630, alt: S.c.seo.imageAlt || c.seo.title },
    icon: assets.icon,
    appleIcon: assets.appleIcon,
    markdownUrl: assets.markdown,
    sitemapUrl: P.href('/sitemap.xml'),
    theme: site.theme,
    jsonld,
    verification: hub.cfg.verification,
    analytics: hub.cfg.analytics,
    siteName: hub.name,
    type: 'article',
  };

  const nav = header({
    ui,
    homeHref: H.href,
    homeLabel: hub.name,
    logoHref: P.href(P.logoMark),
    nav: [{ href: S.href, label: `${site.name} — ${code}` }],
    langLinks: otherLocales.map((o) => ({ href: o.href, lang: o.lang, label: o.meta.label, short: o.meta.short })),
  });

  return `<!doctype html>
<html lang="${G.lang}">
${head(page)}
<body data-product="${esc(site.slug)}">
${nav}
<main id="main">
${body}
</main>
${siteFooter(x, S, assets.markdown)}
${stickyBar(site, ui, G.vars.link)}
${toast()}
${scripts()}
</body>
</html>
`;
}
