// Text helpers shared by the pages, the machine-readable files and the scripts. No dependencies.

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export type Vars = Record<string, string | number>;

/**
 * Replaces {placeholders} with values from `vars`.
 * An unknown placeholder is an error (it would otherwise go live as "{typo}"): `where` names the text.
 */
export function interpolate(str: string, vars: Vars, where = 'text'): string {
  return String(str).replace(/\{(\w+)\}/g, (_m, k: string) => {
    if (!(k in vars)) throw new Error(`[content] unknown placeholder {${k}} in ${where}. Available: ${Object.keys(vars).join(', ')}`);
    return String(vars[k]);
  });
}

export function interpolateDeep<T>(value: T, vars: Vars, where = 'text'): T {
  if (typeof value === 'string') return interpolate(value, vars, where) as T;
  if (Array.isArray(value)) return value.map((v, i) => interpolateDeep(v, vars, `${where}[${i}]`)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolateDeep(v, vars, `${where}.${k}`)])) as T;
  }
  return value;
}

export function deepMerge<T>(base: T, over: unknown): T {
  if (Array.isArray(over) || typeof over !== 'object' || over === null) return (over ?? base) as T;
  const out: Record<string, unknown> = { ...((base as Record<string, unknown>) || {}) };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(out[k], v);
  return out as T;
}

// Links pointing to these URLs get rel="sponsored" (Google's guidance for referral links).
const SPONSORED = new Set<string>();
export const markSponsored = (url: string) => SPONSORED.add(url);
export const relFor = (href: string) => {
  if (!/^https?:\/\//.test(href)) return '';
  return SPONSORED.has(href) ? 'sponsored noopener' : 'noopener';
};

// Tiny inline markdown: **bold**, *italic*, `code`, ==highlight==, [text](url). Returns HTML.
export function md(str: unknown): string {
  let s = esc(str);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/==(.+?)==/g, '<mark class="hl">$1</mark>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) => {
    const rel = relFor(href.replace(/&amp;/g, '&'));
    const ext = rel ? ` rel="${rel}" target="_blank"` : '';
    return `<a href="${href}"${ext}>${text}</a>`;
  });
  return s;
}

// Inline markdown → plain text (meta tags, JSON-LD).
export const plain = (str: unknown) =>
  String(str ?? '')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
    .replace(/==(.+?)==/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1');

// Our inline markdown → standard markdown (for .md / llms files).
export const toStdMd = (str: unknown) => String(str ?? '').replace(/==(.+?)==/g, '**$1**');

export const money = (amount: number, currency: string, lang: string, digits = 0) =>
  new Intl.NumberFormat(lang, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

const asDate = (iso: string) => new Date(`${iso}T12:00:00Z`);
export const longDate = (iso: string, lang: string) =>
  new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(asDate(iso));
export const monthYear = (iso: string, lang: string) =>
  new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(asDate(iso));

// JSON for a <script type="application/ld+json"> (no "</script>" breakout).
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
