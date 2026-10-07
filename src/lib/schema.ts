// Schemas of every content file. A file that doesn't match (missing field, misspelled key, bad URL,
// bonus that isn't a number…) stops the build with a message naming the file and the field.
// Used by src/content.config.ts (Astro) and by the scripts (npm run og, npm run new-product).
import { z } from 'astro/zod';
import { ICON_NAMES } from './icons.ts';

const text = z.string().min(1); // inline markdown: **bold** *italic* `code` ==highlight== [text](url) + {placeholders}
// YYYY-MM-DD. Some YAML parsers turn an unquoted date into a Date object: accept both, keep the text.
const date = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD ("2026-10-07")'),
);
const url = z.url();
const icon = z.enum(ICON_NAMES);
const vars = z.record(z.string(), z.union([z.string(), z.number()]));
const links = z.record(z.string(), url);
const color = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'expected a #RRGGBB color');
const colors = z.strictObject({
  bg: color, surface: color, ink: color, muted: color, line: color, brand: color, brandInk: color,
  accent: color, accentInk: color, accentSoft: color, highlight: color,
}).partial();
const sectionHead = { kicker: text.optional(), title: text, intro: text.optional() };
const faqItem = z.strictObject({ q: text, a: text });
// `ui:` overrides interface strings of src/lib/i18n.ts for one product (one level of nesting, e.g. nav.how).
const uiOverride = z.record(z.string(), z.union([text, z.record(z.string(), text)]));

// ── src/content/products/<slug>/product.yaml — the facts, written once for every language ──
export const productFacts = z.strictObject({
  draft: z.boolean().default(false),
  order: z.number().int().default(99), // position on the home page
  defaultLocale: z.enum(['en', 'fr']).default('en'),
  lastVerified: date, // bump only after re-checking the offer against the official terms
  firstPublished: date.optional(),
  // Removed pages → redirect stubs (paths relative to /<slug>/).
  redirects: z.array(z.strictObject({ from: z.string().min(1), to: z.string().default('') })).default([]),
  brand: z.strictObject({ name: text, sameAs: z.array(url).default([]) }),
  referral: z.strictObject({
    code: z.string().regex(/^[A-Z0-9]{3,20}$/, 'uppercase letters and digits'),
    url, // invite link (or the sign-up page when the product has no invite link)
    urls: z.strictObject({ en: url, fr: url }).partial().optional(), // per-language sign-up pages
    bonus: z.number().positive(),
    minDeposit: z.number().nonnegative().optional(),
    currency: z.string().length(3),
    codeSpelled: z.strictObject({ en: text, fr: text }).partial().optional(),
  }),
  theme: z.strictObject({ light: colors.optional(), dark: colors.optional() }).optional(),
  vars: vars.optional(),
});

// ── src/content/products/<slug>/<lang>.yaml — the copy of one language ──
export const productTexts = z.strictObject({
  links: links.default({}), // officialUrl, termsUrl, promotionsUrl (footer) + any {placeholder} link
  vars: vars.optional(),
  ui: uiOverride.optional(),
  seo: z.strictObject({ title: text, description: text, keywords: z.array(text).default([]), imageAlt: text.optional() }),
  og: z.strictObject({ eyebrow: text, line1: text, line2: text, badgeTop: text, badgeBottom: text }).partial().optional(),
  hub: z.strictObject({ summary: text }),
  hero: z.strictObject({ eyebrow: text, h1: text, lead: text, cta: text, ctaSecondary: text, note: text, chips: z.array(text) }),
  mockup: z
    .strictObject({
      account: text, balanceLabel: text, balance: text, notifTitle: text, notifBody: text, amount: text,
      rows: z.array(z.strictObject({ label: text, value: text })).default([]),
      sticker: text.optional(), stickerSub: text.optional(),
    })
    .optional(),
  facts: z.strictObject({ ...sectionHead, items: z.array(z.strictObject({ label: text, value: text })).min(1) }),
  steps: z.strictObject({ ...sectionHead, totalTime: z.string().optional(), items: z.array(z.strictObject({ title: text, text })).min(1) }),
  existing: z
    .strictObject({ ...sectionHead, cards: z.array(z.strictObject({ icon: icon.optional(), title: text, steps: z.array(text) })), note: text.optional() })
    .optional(),
  rules: z.strictObject({ ...sectionHead, items: z.array(text).min(1), note: text.optional() }),
  features: z.strictObject({ ...sectionHead, items: z.array(z.strictObject({ icon, title: text, text })) }).optional(),
  faq: z.strictObject({ ...sectionHead, items: z.array(faqItem).min(1) }),
  finalCta: z.strictObject({ title: text, text, button: text }),
  footer: z.strictObject({ disclaimer: text }),
});

// ── src/content/products/<slug>/guides/<id>/guide.yaml — shared by both languages ──
export const guideMeta = z.strictObject({
  draft: z.boolean().default(false),
  order: z.number().int().default(99),
  icon: icon.default('info'),
  published: date.optional(), // defaults to the product's firstPublished
  lastVerified: date.optional(), // defaults to the product's lastVerified
});

// ── src/content/products/<slug>/guides/<id>/<lang>.md — front matter (the body is the article) ──
export const guideFront = z.strictObject({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'a-z, 0-9 and dashes'),
  links: links.default({}),
  seo: z.strictObject({ title: text, description: text, keywords: z.array(text).default([]) }),
  title: text,
  lead: text,
  card: text.optional(), // shorter text for the guide cards (defaults to lead)
  faq: z.array(faqItem).default([]),
});

// ── src/content/hub/<lang>.yaml — home page copy ──
export const hubTexts = z.strictObject({
  seo: z.strictObject({ title: text, description: text, keywords: z.array(text).default([]) }),
  hero: z.strictObject({ eyebrow: text, h1: text, lead: text }),
  og: z.strictObject({ eyebrow: text, line1: text, line2: text, badgeTop: text, badgeBottom: text }).partial().optional(),
  listTitle: text,
  listIntro: text,
  about: z.strictObject({ title: text, items: z.array(z.strictObject({ icon, title: text, text })) }),
  faq: z.strictObject({ title: text, items: z.array(faqItem) }),
  footer: z.strictObject({ disclaimer: text }),
});

export type ProductFacts = z.infer<typeof productFacts>;
export type ProductTexts = z.infer<typeof productTexts>;
export type GuideMeta = z.infer<typeof guideMeta>;
export type GuideFront = z.infer<typeof guideFront>;
export type HubTexts = z.infer<typeof hubTexts>;
