// @ts-check
import { defineConfig } from 'astro/config';
import { SITE } from './src/config/site.ts';

const site = (process.env.SITE_URL || (SITE.customDomain ? `https://${SITE.customDomain}` : SITE.siteUrl)).replace(/\/+$/, '');

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site,
  // Every page is a folder with an index.html: /wealthsimple/fr/ (same addresses as before the migration).
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
