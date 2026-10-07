// Languages and interface strings shared by every page ("Copy", "Copied!"…).
// Product copy lives in src/content/products/<slug>/<lang>.yaml; a product can override any string
// below with `ui:` in its own file (e.g. Fizz says « code de référence »).
// Both languages must define every key: TypeScript (npm run check) fails otherwise.

export const LOCALE_META = {
  en: { lang: 'en-CA', og: 'en_CA', label: 'English', short: 'EN' },
  fr: { lang: 'fr-CA', og: 'fr_CA', label: 'Français', short: 'FR' },
} as const;

export type Loc = keyof typeof LOCALE_META;
export const LOCS = Object.keys(LOCALE_META) as Loc[];
export const isLoc = (s: string): s is Loc => s in LOCALE_META;

const en = {
  skip: 'Skip to content',
  copy: 'Copy',
  copied: 'Copied!',
  copiedToast: 'Code {code} copied',
  codeLabel: 'Referral code',
  signUp: 'Sign up',
  nav: { how: 'How it works', rules: 'Rules', faq: 'FAQ', codes: 'Codes' },
  breadcrumb: 'Breadcrumb',
  quickActions: 'Referral code shortcut',
  moreCodes: 'More Canadian referral codes',
  moreCodesIntro: 'Other verified sign-up bonuses from the same collection.',
  allCodes: 'All referral codes',
  seeGuide: 'Code & guide',
  resources: 'Official sources',
  officialSite: 'Official website',
  officialTerms: 'Referral terms',
  promotions: 'Current promotions',
  machine: 'Machine-readable',
  language: 'Language',
  lastVerified: 'Last verified',
  bonus: 'Bonus',
  colon: ': ',
  guide: 'Guide',
  guidesKicker: 'Guides',
  guidesTitle: '{brand} guides',
  guidesIntro: 'Practical answers to the questions people ask after signing up.',
  readGuide: 'Read the guide',
  relatedGuides: 'Related guides',
  onThisPage: 'On this page',
  updated: 'Updated',
  backToCode: '{brand} referral code',
  calloutTitle: 'New to {brand}?',
  calloutText: 'Use referral code **{code}** to get a **{bonus} cash bonus** when you deposit {minDeposit} or more.',
  notFoundTitle: 'Page not found',
  notFoundText: 'This page doesn’t exist (anymore). All referral codes are listed on the home page.',
  backHome: 'See all referral codes',
};

export type UiStrings = typeof en;

const fr: UiStrings = {
  skip: 'Aller au contenu',
  copy: 'Copier',
  copied: 'Copié!',
  copiedToast: 'Code {code} copié',
  codeLabel: 'Code de parrainage',
  signUp: 'S’inscrire',
  nav: { how: 'Fonctionnement', rules: 'Règles', faq: 'FAQ', codes: 'Codes' },
  breadcrumb: 'Fil d’Ariane',
  quickActions: 'Raccourci du code de parrainage',
  moreCodes: 'Autres codes de parrainage canadiens',
  moreCodesIntro: 'D’autres primes d’inscription vérifiées de la même collection.',
  allCodes: 'Tous les codes de parrainage',
  seeGuide: 'Code et guide',
  resources: 'Sources officielles',
  officialSite: 'Site officiel',
  officialTerms: 'Conditions du parrainage',
  promotions: 'Promotions en cours',
  machine: 'Format lisible par machine',
  language: 'Langue',
  lastVerified: 'Dernière vérification',
  bonus: 'Prime',
  colon: ' : ',
  guide: 'Guide',
  guidesKicker: 'Guides',
  guidesTitle: 'Guides {brand}',
  guidesIntro: 'Des réponses concrètes aux questions qu’on se pose après l’inscription.',
  readGuide: 'Lire le guide',
  relatedGuides: 'Guides connexes',
  onThisPage: 'Sur cette page',
  updated: 'Mis à jour le',
  backToCode: 'Code de parrainage {brand}',
  calloutTitle: 'Nouveau chez {brand}?',
  calloutText: 'Utilisez le code de parrainage **{code}** pour obtenir une **prime de {bonus} en argent** en déposant {minDeposit} ou plus.',
  notFoundTitle: 'Page introuvable',
  notFoundText: 'Cette page n’existe pas (ou plus). Tous les codes de parrainage sont sur la page d’accueil.',
  backHome: 'Voir tous les codes de parrainage',
};

export const UI: Record<Loc, UiStrings> = { en, fr };
