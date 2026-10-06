// Scaffold a new referral page from an existing one:  npm run new-site -- <slug> [source-slug]
// Example: npm run new-site -- fizz   → copies sites/wealthsimple to sites/fizz as a draft.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './load.mjs';

const [slug, from = 'wealthsimple'] = process.argv.slice(2);
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Usage: npm run new-site -- <slug>   (lowercase letters, digits, dashes)');
  process.exit(1);
}
const src = path.join(ROOT, 'sites', from);
const dest = path.join(ROOT, 'sites', slug);
if (fs.existsSync(dest)) {
  console.error(`sites/${slug} already exists.`);
  process.exit(1);
}
fs.cpSync(src, dest, {
  recursive: true,
  filter: (p) => !/og-[a-z]+\.png$|apple-touch-icon\.png$/.test(p),
});
const cfgFile = path.join(dest, 'site.config.mjs');
fs.writeFileSync(cfgFile, fs.readFileSync(cfgFile, 'utf8').replace(/draft:\s*false/, 'draft: true'));
console.log(`✔ Created sites/${slug} (draft). Next:
  1. Edit sites/${slug}/site.config.mjs (brand, referral code & link, bonus, texts, theme colors)
  2. Replace sites/${slug}/assets/icon.svg
  3. npm run og      → social images
  4. Set draft: false, then npm run build && npm run serve`);
