// Settings of the whole network (https://referralcodescanada.github.io/).
// Home-page copy: src/content/hub/<lang>.yaml · products: src/content/products/<slug>/.
// The theme below is the default of every page; a product overrides any token in its product.yaml.

export const SITE = {
  name: 'Referral Codes Canada',

  // Public URL. Can be overridden at build time with the SITE_URL environment variable.
  siteUrl: 'https://referralcodescanada.github.io',

  // Optional custom domain (e.g. 'codesparrainage.ca'). Changes every URL — decide early.
  customDomain: '',

  defaultLocale: 'en' as const,
  github: 'https://github.com/referralcodescanada',

  // Optional cookie-free analytics: create a free site on https://www.goatcounter.com and put its
  // code here (e.g. 'referralcodescanada'). Counts page views + "copy-code/<slug>" and "signup-click/<slug>" events.
  analytics: { goatcounter: '' },

  // Bing / Yandex / Seznam instant indexing (ChatGPT search relies on Bing's index).
  // The key file is published at /<key>.txt and pinged after each deploy. '' disables it.
  indexNowKey: '420047cf19eb1251e214e92c08b05afd',

  // content="" value of verification meta tags (optional: the files in public/ are used instead).
  verification: { google: '', bing: '' },

  // Legend engraved on the back of the animated logo coin (home page hero): top arc, bottom arc.
  coin: { top: 'Referral Codes Canada', bottom: 'Codes de parrainage' },

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
};

export type Theme = typeof SITE.theme;
export type ThemeColors = Theme['light'];

// Network logo files, generated from public/assets/logo.png by "npm run brand".
export const BRAND_FILES = {
  mark: '/assets/logo-mark-128.png', // header / footer (leaf + tag, readable when small)
  full: '/assets/logo-512.png', // home page coin, structured data
  favicon: '/assets/favicon-192.png',
  appleIcon: '/assets/apple-touch-icon.png',
};
