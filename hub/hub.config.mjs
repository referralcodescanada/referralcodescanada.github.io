// Configuration of the collection home page (https://referralcodescanada.github.io/).
// The theme defined here is the default for every site; each site can override any token.
//
// Placeholders available in the text: {name} {count} {year} {month} (latest verification)
export default {
  name: 'Referral Codes Canada',
  // Public URL of the GitHub Pages site (repo "referralcodescanada.github.io").
  // Can be overridden at build time with the SITE_URL environment variable.
  siteUrl: 'https://referralcodescanada.github.io',

  // Which GitHub repo this folder is pushed to:
  //   'wealthsimple' → repo "wealthsimple": publishes only sites/wealthsimple at
  //                    https://referralcodescanada.github.io/wealthsimple/ (one repo per product)
  //   'hub'          → repo "referralcodescanada.github.io": home page listing every site
  //                    + each site under /<slug>/ (one repo for everything)
  // Can be overridden with the PUBLISH environment variable.
  publish: 'hub',

  // Hub mode only: products published from their own repos (https://<account>.github.io/<slug>/).
  // Their data is read from /<slug>/referral.json at build time.
  products: ['wealthsimple', 'fizz'],

  // Optional custom domain (e.g. 'codesparrainage.ca'), set on the "<account>.github.io" repo.
  // Changes every URL — decide early. Same value in every repo.
  customDomain: '',

  // Optional cookie-free analytics: create a free site on https://www.goatcounter.com and put its
  // code here (e.g. 'referralcodescanada' for referralcodescanada.goatcounter.com). Same value in every repo.
  // Counts page views + "copy-code/<slug>" and "signup-click/<slug>" events.
  analytics: { goatcounter: '' },
  github: 'https://github.com/referralcodescanada',
  defaultLocale: 'en',

  // Bing / Yandex / Seznam instant indexing (ChatGPT search relies on Bing's index).
  // The key file is published at /<key>.txt and pinged after each deploy. Leave '' to disable.
  indexNowKey: '420047cf19eb1251e214e92c08b05afd',

  // Paste the content="" value of the verification meta tags (optional).
  verification: { google: '', bing: '' },

  theme: {
    light: {
      bg: '#F7F5F0',
      surface: '#FFFFFF',
      ink: '#16181D',
      muted: '#5D6069',
      line: '#E5E1D8',
      brand: '#16181D',
      brandInk: '#FFFFFF',
      accent: '#C8102E',
      accentInk: '#FFFFFF',
      accentSoft: '#FBE4E7',
      highlight: '#FFD166',
    },
    dark: {
      bg: '#0F1013',
      surface: '#181A1F',
      ink: '#F2F1EC',
      muted: '#A3A6AE',
      line: '#2A2D34',
      brand: '#F2F1EC',
      brandInk: '#16181D',
      accent: '#FF5A6E',
      accentInk: '#16181D',
      accentSoft: '#3A1C22',
      highlight: '#E0A82E',
    },
    fonts: {
      display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
      body: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
      googleFonts:
        'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600..800&family=Inter:wght@400..700&family=JetBrains+Mono:wght@700&display=swap',
    },
    radius: '20px',
  },

  locales: {
    en: {
      seo: {
        title: 'Canadian Referral Codes {year} — Verified Sign-Up Bonuses',
        description:
          'Working Canadian referral codes and invite links with verified sign-up bonuses. Step-by-step guides, eligibility rules and FAQs, updated regularly.',
        keywords: ['referral code Canada', 'sign up bonus Canada', 'invite code', 'promo code Canada'],
      },
      hero: {
        eyebrow: 'Updated {month}',
        h1: 'Canadian referral codes that ==actually work==',
        lead: 'Real referral codes from a real Canadian user. Each page gives you the code, where to enter it, the exact bonus, the rules and the steps — nothing else.',
      },
      og: { eyebrow: 'VERIFIED SIGN-UP BONUSES', line1: 'Canadian', line2: 'referral codes', badgeBottom: 'bonus' },
      listTitle: 'Referral codes',
      listIntro: 'Pick a service to see the code, the bonus and how to claim it.',
      about: {
        title: 'How this site works',
        items: [
          { icon: 'shield', title: 'Personal codes', text: 'Every code is issued by the company to a real client. When you use one, you get the new-client bonus and the referrer gets one too — that’s how referral programs work.' },
          { icon: 'clock', title: 'Checked against official terms', text: 'Bonus amounts, deposits and deadlines are summarized from each company’s public referral terms, with the verification date on every page.' },
          { icon: 'globe', title: 'English & French', text: 'Every guide is available in English and in French for Quebec and the rest of Canada.' },
        ],
      },
      faq: {
        title: 'Questions',
        items: [
          { q: 'Are these referral codes free to use?', a: 'Yes. Using a referral code never costs you anything — it only unlocks the sign-up bonus offered by the company.' },
          { q: 'Is this site affiliated with the companies listed?', a: 'No. {name} is an independent site. The codes are personal referral codes; brand names belong to their respective owners.' },
          { q: 'How often are the codes checked?', a: 'Each page shows its last verification date. Codes and bonuses are re-checked against the official terms regularly.' },
        ],
      },
      footer: {
        disclaimer:
          'Independent site, not affiliated with or endorsed by the companies mentioned. Brand names are trademarks of their respective owners. Pages share personal referral codes: both the new client and the referrer may receive a bonus. Not financial advice.',
      },
    },
    fr: {
      seo: {
        title: 'Codes de parrainage canadiens {year} — primes vérifiées',
        description:
          'Codes de parrainage canadiens vérifiés : le code, où l’entrer, la prime exacte, les règles et les étapes. Mis à jour régulièrement.',
        keywords: ['code de parrainage', 'code de référence', 'prime d’inscription', 'code promo Canada', 'code parrainage Québec'],
      },
      hero: {
        eyebrow: 'Mis à jour en {month}',
        h1: 'Des codes de parrainage canadiens ==qui fonctionnent==',
        lead: 'De vrais codes de parrainage d’un vrai utilisateur canadien. Chaque page vous donne le code, où l’entrer, la prime exacte, les règles et les étapes — rien de plus.',
      },
      og: { eyebrow: 'PRIMES VÉRIFIÉES', line1: 'Codes de parrainage', line2: 'canadiens', badgeBottom: 'de prime' },
      listTitle: 'Codes de parrainage',
      listIntro: 'Choisissez un service pour voir le code, la prime et comment l’obtenir.',
      about: {
        title: 'Comment fonctionne ce site',
        items: [
          { icon: 'shield', title: 'Codes personnels', text: 'Chaque code est émis par l’entreprise à un vrai client. En l’utilisant, vous obtenez la prime de nouveau client et le parrain en reçoit une aussi — c’est le principe du parrainage.' },
          { icon: 'clock', title: 'Vérifiés selon les conditions officielles', text: 'Les montants, dépôts et délais sont résumés à partir des conditions publiques de chaque entreprise, avec la date de vérification sur chaque page.' },
          { icon: 'globe', title: 'Français et anglais', text: 'Chaque guide est offert en français et en anglais, pour le Québec et le reste du Canada.' },
        ],
      },
      faq: {
        title: 'Questions',
        items: [
          { q: 'Est-ce que ces codes de parrainage sont gratuits?', a: 'Oui. Utiliser un code de parrainage ne coûte rien — il débloque seulement la prime d’inscription offerte par l’entreprise.' },
          { q: 'Ce site est-il affilié aux entreprises mentionnées?', a: 'Non. {name} est un site indépendant. Les codes sont des codes de parrainage personnels; les marques appartiennent à leurs propriétaires respectifs.' },
          { q: 'À quelle fréquence les codes sont-ils vérifiés?', a: 'Chaque page affiche sa date de dernière vérification. Les codes et primes sont revérifiés régulièrement selon les conditions officielles.' },
        ],
      },
      footer: {
        disclaimer:
          'Site indépendant, non affilié aux entreprises mentionnées et non approuvé par celles-ci. Les marques appartiennent à leurs propriétaires respectifs. Les pages partagent des codes de parrainage personnels : le nouveau client et le parrain peuvent tous deux recevoir une prime. Ceci n’est pas un conseil financier.',
      },
    },
  },
};
