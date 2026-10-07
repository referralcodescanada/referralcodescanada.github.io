// Shared page chrome: <head>, header, footer, copy button, scripts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, interpolate, jsonLd, md } from '../scripts/lib.mjs';
import { icon } from './icons.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CSS = fs.readFileSync(path.join(HERE, 'styles.css'), 'utf8');
const JS = fs.readFileSync(path.join(HERE, 'app.js'), 'utf8');

const minifyCss = (s) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
const minifyJs = (s) => s.replace(/^\s*\/\/.*$/gm, '').replace(/\n\s*/g, '\n').trim();

const STYLE = minifyCss(CSS);
const SCRIPT = minifyJs(JS);

const kebab = (k) => k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const tokens = (obj) => Object.entries(obj).map(([k, v]) => `--${kebab(k)}:${v}`).join(';');

function themeCss(theme) {
  const f = theme.fonts;
  const base = `--font-display:${f.display};--font-body:${f.body};--font-mono:${f.mono};--radius:${theme.radius}`;
  return (
    `:root{color-scheme:light dark;${base};${tokens(theme.light)}}` +
    `@media (prefers-color-scheme:dark){:root{${tokens(theme.dark)}}}`
  );
}

/**
 * page = {
 *   lang, title, description, keywords[], url, alternates:[{lang,url}], defaultUrl,
 *   ogLocale, ogAlternates[], image:{url,alt,width,height}, icon, appleIcon,
 *   markdownUrl, theme, jsonld, verification, siteName, type
 * }
 */
export function head(page) {
  const alts = page.alternates
    .map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${a.url}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${page.defaultUrl}">`)
    .join('\n');
  const v = page.verification || {};
  const img = page.image;
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.keywords?.length ? `<meta name="keywords" content="${esc(page.keywords.join(', '))}">` : ''}
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="${esc(page.siteName)}">
<link rel="canonical" href="${page.url}">
${alts}
<meta name="theme-color" content="${page.theme.light.bg}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${page.theme.dark.bg}" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${page.type || 'website'}">
<meta property="og:site_name" content="${esc(page.siteName)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${page.url}">
<meta property="og:locale" content="${page.ogLocale}">
${page.ogAlternates.map((l) => `<meta property="og:locale:alternate" content="${l}">`).join('\n')}
${img ? `<meta property="og:image" content="${img.url}">
<meta property="og:image:width" content="${img.width}">
<meta property="og:image:height" content="${img.height}">
<meta property="og:image:alt" content="${esc(img.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${img.url}">
<meta name="twitter:image:alt" content="${esc(img.alt)}">` : '<meta name="twitter:card" content="summary">'}
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
${v.google ? `<meta name="google-site-verification" content="${esc(v.google)}">` : ''}
${v.bing ? `<meta name="msvalidate.01" content="${esc(v.bing)}">` : ''}
<link rel="icon" href="${page.icon}" type="${page.icon.endsWith('.svg') ? 'image/svg+xml' : 'image/png'}">
${page.appleIcon ? `<link rel="apple-touch-icon" href="${page.appleIcon}">` : ''}
${page.markdownUrl ? `<link rel="alternate" type="text/markdown" href="${page.markdownUrl}" title="Markdown version">` : ''}
<link rel="sitemap" type="application/xml" href="${page.sitemapUrl}">
${page.analytics?.goatcounter ? `<script data-goatcounter="https://${esc(page.analytics.goatcounter)}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${page.theme.fonts.googleFonts}">
<style>${themeCss(page.theme)}${STYLE}</style>
<script type="application/ld+json">${jsonLd(page.jsonld)}</script>
</head>`;
}

// Small logo in the header and footer: a coin that flips to its gold "$" side on hover (styles.css).
const logoCoin = (src, lazy = false) =>
  `<span class="logo__coin" aria-hidden="true"><img src="${src}" alt="" width="36" height="36"${lazy ? ' loading="lazy"' : ''}></span>`;

const LEAF =
  'M50 2l6 11.5c.7 1.2 2.2 1.5 3.3.8L64.5 11l-3.2 22.5c-.3 1.9 1.9 3.1 3.3 1.8l7.6-8.2 1.8 4.4c.4.9 1.4 1.4 2.4 1.2l9.6-2-3.3 10.2c-.3.9.1 1.9 1 2.3l3.6 1.7-16.4 13.3c-.6.5-.8 1.3-.6 2l2 5.6-15.2-2.7c-1.1-.2-2.1.7-2 1.8l.8 15.6h-3.4l.8-15.6c.1-1.1-.9-2-2-1.8l-15.2 2.7 2-5.6c.2-.7 0-1.5-.6-2L13.4 44l3.6-1.7c.9-.4 1.3-1.4 1-2.3l-3.3-10.2 9.6 2c1 .2 2-.3 2.4-1.2l1.8-4.4 7.6 8.2c1.4 1.3 3.6.1 3.3-1.8L35.5 11l5.2 3.3c1.1.7 2.6.4 3.3-.8z';

/**
 * The network logo as a 3D gold coin (home page): logo on the front, "$" + maple leaf and a
 * bilingual legend on the back, a reeded edge made of stacked discs. Animated by app.js
 * (drop-in, idle spin, pointer tilt, tap to toss); static when the visitor prefers reduced motion.
 */
export function coin({ src, alt, legend = {} }) {
  const edge = Array.from({ length: 16 }, (_, i) => `<i style="--i:${i}"></i>`).join('');
  const back = `<svg viewBox="0 0 200 200" width="240" height="240" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="coin-f" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#1f4f93"/><stop offset=".6" stop-color="#0f2f63"/><stop offset="1" stop-color="#081a3c"/></radialGradient>
<linearGradient id="coin-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c2"/><stop offset=".4" stop-color="#f0c75a"/><stop offset=".75" stop-color="#c8922b"/><stop offset="1" stop-color="#8f6114"/></linearGradient>
<path id="coin-top" d="M28 100a72 72 0 0 1 144 0"/><path id="coin-bot" d="M19 100a81 81 0 0 0 162 0"/></defs>
<circle cx="100" cy="100" r="100" fill="url(#coin-f)"/>
<g fill="none" stroke="url(#coin-g)"><circle cx="100" cy="100" r="92" stroke-width="1.4"/><circle cx="100" cy="100" r="61" stroke-width="1.2"/></g>
<g fill="url(#coin-g)" style="font-family:var(--font-display)" font-weight="700" font-size="12" letter-spacing="1.1" text-anchor="middle">
<text><textPath href="#coin-top" startOffset="50%">${esc((legend.top || '').toUpperCase())}</textPath></text>
<text><textPath href="#coin-bot" startOffset="50%">${esc((legend.bottom || '').toUpperCase())}</textPath></text>
<circle cx="23" cy="100" r="2.6"/><circle cx="177" cy="100" r="2.6"/>
<text x="100" y="141" font-size="64" font-weight="800" letter-spacing="0">$</text></g>
<path transform="translate(83 49) scale(.34)" fill="#e0262f" d="${LEAF}"/>
</svg>`;
  return `<div class="coin" data-coin>
  <span class="coin__shadow" aria-hidden="true"><i></i></span>
  <div class="coin__float"><div class="coin__toss"><div class="coin__spin"><div class="coin__tilt">
    <div class="coin__edge" aria-hidden="true">${edge}</div>
    <div class="coin__face coin__face--back" aria-hidden="true">${back}</div>
    <div class="coin__face coin__face--front"><img src="${src}" width="240" height="240" alt="${esc(alt)}" draggable="false"><span class="coin__sheen" aria-hidden="true"></span><span class="coin__band" aria-hidden="true"></span></div>
    <span class="coin__glint" aria-hidden="true"></span>
  </div></div></div></div>
</div>`;
}

export function header({ ui, homeHref, homeLabel, logoHref, nav, langLinks }) {
  return `<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="topbar">
  <div class="wrap topbar__in">
    <a class="logo" href="${homeHref}">${logoCoin(logoHref)}<span>${esc(homeLabel)}</span></a>
    <nav class="nav" aria-label="Main">
      ${nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('')}
      ${langLinks.map((l) => `<a class="lang" href="${l.href}" hreflang="${l.lang}" lang="${l.lang}" title="${esc(l.label)}">${esc(l.short)}</a>`).join('')}
    </nav>
  </div>
</header>`;
}

export function copyButton({ code, ui, cls = '' }) {
  const toast = interpolate(ui.copiedToast, { code });
  return `<button class="copy ${cls}" type="button" data-copy="${esc(code)}" data-copied="${esc(ui.copied)}" data-toast="${esc(toast)}" aria-label="${esc(`${ui.copy} ${code}`)}">${icon('copy')}<span data-label="${esc(ui.copy)}">${esc(ui.copy)}</span></button>`;
}

export function ctaLink({ href, label, cls = 'btn btn--primary' }) {
  return `<a class="${cls}" href="${href}" rel="sponsored noopener" target="_blank">${esc(label)}${icon('arrow')}</a>`;
}

export function footer({ ui, disclaimer, columns, meta, logoHref, homeLabel, homeHref }) {
  const cols = columns
    .filter((c) => c.links.length)
    .map(
      (c) => `<nav aria-label="${esc(c.title)}"><h2 class="footer__h">${esc(c.title)}</h2><ul>${c.links
        .map((l) => `<li><a href="${l.href}"${l.rel ? ` rel="${l.rel}" target="_blank"` : ''}${l.lang ? ` hreflang="${l.lang}" lang="${l.lang}"` : ''}>${esc(l.label)}</a></li>`)
        .join('')}</ul></nav>`,
    )
    .join('');
  return `<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">
        <a class="logo" href="${homeHref}">${logoCoin(logoHref, true)}<span>${esc(homeLabel)}</span></a>
        <p class="footer__disc">${md(disclaimer)}</p>
      </div>
      ${cols}
    </div>
    <p class="footer__meta">${meta}</p>
  </div>
</footer>`;
}

export const toast = () => `<div class="toast" role="status" aria-live="polite"></div>`;
export const scripts = () => `<script>${SCRIPT}</script>`;
