// Renders one referral page (one site × one locale).
import { esc, md, plain } from '../scripts/lib.mjs';
import { icon } from './icons.mjs';
import { copyButton, ctaLink, footer, head, header, scripts, toast } from './layout.mjs';

const head2 = (id, s) =>
  `<div class="section__head">${s.kicker ? `<p class="kicker">${esc(s.kicker)}</p>` : ''}<h2 id="${id}">${md(s.title)}</h2>${s.intro ? `<p class="section__intro">${md(s.intro)}</p>` : ''}</div>`;

export function renderSitePage(x) {
  const { site, L, hub, H, siblings, P, assets, year } = x;
  const { c, ui } = L;
  const code = site.code;
  const link = L.vars.link;

  const hero = `
<section class="hero" aria-labelledby="h1">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      ${`<nav class="crumbs" aria-label="${esc(ui.breadcrumb)}"><ol><li><a href="${H.href}">${esc(hub.name)}</a></li><li aria-current="page">${esc(site.name)}</li></ol></nav>`}
      <p class="eyebrow"><span class="dot" aria-hidden="true"></span>${md(c.hero.eyebrow)}</p>
      <h1 id="h1">${md(c.hero.h1)}</h1>
      <p class="lead">${md(c.hero.lead)}</p>
      <div class="codebox" data-hero-code>
        <div class="codebox__txt"><span class="codebox__label">${esc(ui.codeLabel)}</span><code class="codebox__code">${esc(code)}</code></div>
        ${copyButton({ code, ui })}
      </div>
      <div class="cta-row">
        ${ctaLink({ href: link, label: c.hero.cta })}
        <a class="btn btn--ghost" href="#how">${esc(c.hero.ctaSecondary)}</a>
      </div>
      <p class="fineprint">${md(c.hero.note)}</p>
      <ul class="chips">${c.hero.chips.map((t) => `<li>${icon('check')}${md(t)}</li>`).join('')}</ul>
    </div>
    <div class="hero__art" aria-hidden="true">${mockup(c.mockup)}</div>
  </div>
</section>`;

  const facts = `
<section class="section section--alt" id="quick-answer" aria-labelledby="facts-h">
  <div class="wrap split">
    ${head2('facts-h', c.facts)}
    <dl class="facts card">${c.facts.items.map((f) => `<div><dt>${md(f.label)}</dt><dd>${md(f.value)}</dd></div>`).join('')}</dl>
  </div>
</section>`;

  const steps = `
<section class="section" id="how" aria-labelledby="how-h">
  <div class="wrap">
    ${head2('how-h', c.steps)}
    <ol class="steps">${c.steps.items
      .map((s, i) => `<li class="step card" id="step-${i + 1}"><h3>${md(s.title)}</h3><p>${md(s.text)}</p></li>`)
      .join('')}</ol>
    <div class="cta-row cta-row--center">${ctaLink({ href: link, label: c.hero.cta })}${copyButton({ code, ui, cls: 'copy--ghost' })}</div>
  </div>
</section>`;

  const existing = c.existing
    ? `
<section class="section section--alt" id="existing" aria-labelledby="existing-h">
  <div class="wrap">
    ${head2('existing-h', c.existing)}
    <div class="grid-2">${c.existing.cards
      .map(
        (card) => `<article class="card where"><div class="where__icon">${icon(card.icon || 'phone')}</div><h3>${md(card.title)}</h3><ol>${card.steps
          .map((s) => `<li>${md(s)}</li>`)
          .join('')}</ol></article>`,
      )
      .join('')}</div>
    ${c.existing.note ? `<p class="note">${icon('info')}<span>${md(c.existing.note)}</span></p>` : ''}
  </div>
</section>`
    : '';

  const rules = `
<section class="section" id="rules" aria-labelledby="rules-h">
  <div class="wrap split">
    ${head2('rules-h', c.rules)}
    <div>
      <ul class="rules card">${c.rules.items.map((r) => `<li>${icon('check')}<span>${md(r)}</span></li>`).join('')}</ul>
      ${c.rules.note ? `<p class="note">${icon('clock')}<span>${md(c.rules.note)}</span></p>` : ''}
    </div>
  </div>
</section>`;

  const features = c.features
    ? `
<section class="section section--alt" id="why" aria-labelledby="why-h">
  <div class="wrap">
    ${head2('why-h', c.features)}
    <ul class="features">${c.features.items
      .map((f) => `<li class="card feature"><span class="feature__icon">${icon(f.icon)}</span><h3>${md(f.title)}</h3><p>${md(f.text)}</p></li>`)
      .join('')}</ul>
  </div>
</section>`
    : '';

  const guides = site.guides.length
    ? `
<section class="section section--alt" id="guides" aria-labelledby="guides-h">
  <div class="wrap">
    ${head2('guides-h', { kicker: ui.guidesKicker, title: ui.guidesTitle, intro: ui.guidesIntro })}
    <ul class="guides">${site.guides.map((g) => guideCard(g.locales[L.loc] || g.locales[g.def], g, ui)).join('')}</ul>
  </div>
</section>`
    : '';

  const faq = `
<section class="section" id="faq" aria-labelledby="faq-h">
  <div class="wrap narrow">
    ${head2('faq-h', c.faq)}
    <div class="faq">${c.faq.items
      .map(
        (f, i) =>
          `<details class="faq__item"${i === 0 ? ' open' : ''}><summary><h3>${md(f.q)}</h3><span class="faq__chev">${icon('plus')}</span></summary><div class="faq__a"><p>${md(f.a)}</p></div></details>`,
      )
      .join('')}</div>
  </div>
</section>`;

  const others = siblings.length
    ? `
<section class="section${site.guides.length ? '' : ' section--alt'}" id="more-codes" aria-labelledby="more-h">
  <div class="wrap">
    <div class="section__head"><h2 id="more-h">${esc(ui.moreCodes)}</h2><p class="section__intro">${esc(ui.moreCodesIntro)}</p></div>
    <ul class="cards">${siblings.map((s) => miniCard(s, ui)).join('')}</ul>
  </div>
</section>`
    : '';

  const final = `
<section class="section final-wrap" aria-labelledby="final-h">
  <div class="wrap">
    <div class="final">
      <div>
        <h2 id="final-h">${md(c.finalCta.title)}</h2>
        <p>${md(c.finalCta.text)}</p>
      </div>
      <div class="final__actions">
        <div class="codebox codebox--inverse"><div class="codebox__txt"><span class="codebox__label">${esc(ui.codeLabel)}</span><code class="codebox__code">${esc(code)}</code></div>${copyButton({ code, ui })}</div>
        ${ctaLink({ href: link, label: c.finalCta.button, cls: 'btn btn--accent btn--block' })}
      </div>
    </div>
  </div>
</section>`;

  const otherLocales = site.locs.filter((l) => l !== L.loc).map((l) => site.locales[l]);
  const pageHeader = header({
    ui,
    homeHref: H.href,
    homeLabel: hub.name,
    logoHref: P.href(P.logoMark),
    nav: [
      { href: '#how', label: ui.nav.how },
      { href: '#rules', label: ui.nav.rules },
      { href: '#faq', label: ui.nav.faq },
    ],
    langLinks: otherLocales.map((o) => ({ href: o.href, lang: o.lang, label: o.meta.label, short: o.meta.short })),
  });

  const sticky = stickyBar(site, ui, link);
  const pageFooter = siteFooter(x, L, assets.markdown);

  const page = {
    lang: L.lang,
    title: c.seo.title,
    description: c.seo.description,
    keywords: c.seo.keywords,
    url: L.url,
    defaultUrl: site.locales[site.def].url,
    alternates: site.locs.map((l) => ({ lang: site.locales[l].lang, url: site.locales[l].url })),
    ogLocale: L.meta.og,
    ogAlternates: otherLocales.map((o) => o.meta.og),
    image: assets.og && { url: assets.og, width: 1200, height: 630, alt: c.seo.imageAlt || c.seo.title },
    icon: assets.icon,
    appleIcon: assets.appleIcon,
    markdownUrl: assets.markdown,
    sitemapUrl: P.href('/sitemap.xml'),
    theme: site.theme,
    jsonld: siteJsonLd(x),
    verification: hub.cfg.verification,
    analytics: hub.cfg.analytics,
    siteName: hub.name,
  };

  return `<!doctype html>
<html lang="${L.lang}">
${head(page)}
<body data-product="${esc(site.slug)}">
${pageHeader}
<main id="main">
${hero}
${facts}
${steps}
${existing}
${rules}
${features}
${faq}
${guides}
${others}
${final}
</main>
${pageFooter}
${sticky}
${toast()}
${scripts()}
</body>
</html>
`;
}

export function stickyBar(site, ui, link = site.link) {
  return `
<div class="stickybar" role="region" aria-label="${esc(ui.quickActions)}">
  <div class="stickybar__code"><small>${esc(ui.codeLabel)}</small><code>${esc(site.code)}</code></div>
  ${copyButton({ code: site.code, ui, cls: 'copy--sm' })}
  ${ctaLink({ href: link, label: ui.signUp, cls: 'btn btn--primary btn--sm' })}
</div>`;
}

export function siteFooter({ site, hub, H, siblings, P, year }, L, markdownHref) {
  const { c, ui } = L;
  return footer({
    ui,
    homeHref: H.href,
    homeLabel: hub.name,
    logoHref: P.href(P.logoMark),
    disclaimer: c.footer.disclaimer,
    columns: [
      {
        title: ui.resources,
        links: [
          c.links?.officialUrl && { href: c.links.officialUrl, label: `${ui.officialSite} — ${site.name}`, rel: 'noopener' },
          c.links?.termsUrl && { href: c.links.termsUrl, label: ui.officialTerms, rel: 'noopener' },
          c.links?.promotionsUrl && { href: c.links.promotionsUrl, label: ui.promotions, rel: 'noopener' },
        ].filter(Boolean),
      },
      site.guides.length && {
        title: ui.guidesKicker,
        links: site.guides.map((g) => g.locales[L.loc] || g.locales[g.def]).map((G) => ({ href: G.href, label: plain(G.c.title) })),
      },
      {
        title: ui.allCodes,
        links: [{ href: H.href, label: hub.name }, ...siblings.map((s) => ({ href: s.href, label: `${s.name} — ${s.code}` }))],
      },
      {
        title: ui.machine,
        links: [
          { href: markdownHref, label: 'Markdown' },
          { href: P.href(`${site.basePath}llms.txt`), label: 'llms.txt' },
          { href: P.href(`${site.basePath}referral.json`), label: 'referral.json' },
        ],
      },
      {
        title: ui.language,
        links: site.locs.map((l) => ({ href: site.locales[l].href, label: site.locales[l].meta.label, lang: site.locales[l].lang })),
      },
    ].filter(Boolean),
    meta: `© ${year} ${esc(hub.name)} · ${esc(ui.lastVerified)}${ui.colon}<time datetime="${site.lastVerified}">${esc(L.vars.verifiedDate)}</time>`,
  });
}

function mockup(m) {
  if (!m) return '';
  return `<div class="art">
  <div class="phone">
    <div class="phone__screen">
      <span class="phone__notch"></span>
      <div class="phone__top"><span>${esc(m.account)}</span><span class="phone__avatar"></span></div>
      <div><div class="phone__label">${esc(m.balanceLabel)}</div><div class="phone__balance">${esc(m.balance)}</div></div>
      <div class="notif"><span class="notif__icon">${icon('gift')}</span><span class="notif__txt"><strong>${esc(m.notifTitle)}</strong><small>${esc(m.notifBody)}</small></span><span class="notif__amt">${esc(m.amount)}</span></div>
      <ul class="prows">${(m.rows || []).map((r) => `<li><span>${esc(r.label)}</span><b>${esc(r.value)}</b></li>`).join('')}</ul>
      <span class="phone__bar"></span>
    </div>
  </div>
  ${m.sticker ? `<div class="sticker"><b>${esc(m.sticker)}</b><span>${esc(m.stickerSub || '')}</span></div>` : ''}
</div>`;
}

export function guideCard(G, g, ui) {
  return `<li class="card guide-card"><span class="feature__icon">${icon(g.icon)}</span><h3><a href="${G.href}">${md(G.c.title)}</a></h3><p>${md(G.c.card || G.c.lead)}</p><span class="mini__link">${esc(ui.readGuide)} ${icon('arrow')}</span></li>`;
}

export function miniCard(s, ui) {
  return `<li class="card mini" style="--card-accent:${s.accent}">
  <div class="mini__top"><img src="${s.iconHref}" alt="" width="44" height="44" loading="lazy"><div><h3><a href="${s.href}">${esc(s.name)}</a></h3><p class="mini__bonus">${md(s.summary)}</p></div></div>
  <div class="mini__code"><span class="codebox__label">${esc(ui.codeLabel)}</span><code>${esc(s.code)}</code>${copyButton({ code: s.code, ui, cls: 'copy--sm' })}</div>
  <a class="mini__link" href="${s.href}">${esc(ui.seeGuide)} ${icon('arrow')}</a>
</li>`;
}

function siteJsonLd({ site, L, hub, H, P, assets }) {
  const c = L.c;
  const url = L.url;
  const org = { '@id': `${P.siteUrl}/#organization` };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': org['@id'],
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
        publisher: org,
        inLanguage: hub.locs.map((l) => hub.locales[l].lang),
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: plain(c.seo.title),
        headline: plain(c.hero.h1),
        description: plain(c.seo.description),
        inLanguage: L.lang,
        isPartOf: { '@id': `${P.siteUrl}/#website` },
        publisher: org,
        datePublished: site.firstPublished,
        dateModified: site.lastVerified,
        breadcrumb: { '@id': `${url}#breadcrumb` },
        primaryImageOfPage: assets.og ? { '@type': 'ImageObject', url: assets.og, width: 1200, height: 630 } : undefined,
        about: { '@type': 'Organization', name: site.name, sameAs: site.cfg.brand.sameAs },
        mainEntity: { '@id': `${url}#faq` },
        keywords: c.seo.keywords?.join(', '),
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.lead', '#quick-answer'] },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: hub.name, item: H.url },
          { '@type': 'ListItem', position: 2, name: site.name, item: url },
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: plain(c.steps.title),
        description: plain(c.steps.intro),
        inLanguage: L.lang,
        totalTime: c.steps.totalTime,
        estimatedCost: { '@type': 'MonetaryAmount', currency: site.cfg.referral.currency, value: 0 },
        step: c.steps.items.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: plain(s.title),
          text: plain(s.text),
          url: `${url}#step-${i + 1}`,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: L.lang,
        mainEntity: c.faq.items.map((f) => ({
          '@type': 'Question',
          name: plain(f.q),
          acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
        })),
      },
    ].filter(Boolean),
  };
}
