// Small helpers shared by the build scripts. No dependencies.
import fs from 'node:fs';
import path from 'node:path';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Replace {placeholders} with values from `vars`. Unknown placeholders are left as-is.
export const interpolate = (str, vars) =>
  String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

export function interpolateDeep(value, vars) {
  if (typeof value === 'string') return interpolate(value, vars);
  if (Array.isArray(value)) return value.map((v) => interpolateDeep(v, vars));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolateDeep(v, vars)]));
  }
  return value;
}

export function deepMerge(base, over) {
  if (Array.isArray(over) || typeof over !== 'object' || over === null) return over ?? base;
  const out = { ...(base || {}) };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(out[k], v);
  return out;
}

// Links pointing to these URLs get rel="sponsored" (Google's guidance for referral links).
const SPONSORED = new Set();
export const markSponsored = (url) => SPONSORED.add(url);
export const relFor = (href) => {
  if (!/^https?:\/\//.test(href)) return '';
  return SPONSORED.has(href) ? 'sponsored noopener' : 'noopener';
};

// Tiny inline markdown: **bold**, *italic*, `code`, ==highlight==, [text](url).
export function md(str) {
  let s = esc(str);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/==(.+?)==/g, '<mark class="hl">$1</mark>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, href) => {
    const raw = href.replace(/&amp;/g, '&');
    const rel = relFor(raw);
    const ext = rel ? ` rel="${rel}" target="_blank"` : '';
    return `<a href="${href}"${ext}>${text}</a>`;
  });
  return s;
}

// Markdown → plain text (meta tags, JSON-LD).
export const plain = (str) =>
  String(str ?? '')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
    .replace(/==(.+?)==/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1');

// Our inline markdown → standard markdown (for .md / llms files).
export const toStdMd = (str) => String(str ?? '').replace(/==(.+?)==/g, '**$1**');

export const money = (amount, currency, lang, digits = 0) =>
  new Intl.NumberFormat(lang, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

const asDate = (iso) => new Date(`${iso}T12:00:00Z`);
export const longDate = (iso, lang) =>
  new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(asDate(iso));
export const monthYear = (iso, lang) =>
  new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(asDate(iso));

export function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
}

export const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
