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

export function header({ ui, homeHref, homeLabel, logoHref, nav, langLinks }) {
  return `<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="topbar">
  <div class="wrap topbar__in">
    <a class="logo" href="${homeHref}"><img src="${logoHref}" alt="" width="36" height="36"><span>${esc(homeLabel)}</span></a>
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
        <a class="logo" href="${homeHref}"><img src="${logoHref}" alt="" width="36" height="36" loading="lazy"><span>${esc(homeLabel)}</span></a>
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
