// npm run new-product -- <slug> [--from <existing-slug>]
// Creates src/content/products/<slug>/ from an existing product (default: the first one), as a draft:
// rewrite every fact and text (official sources only), replace assets/icon.svg, then set draft: false.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './content.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const fromIdx = args.indexOf('--from');
const PRODUCTS = path.join(ROOT, 'src', 'content', 'products');
const existing = fs.readdirSync(PRODUCTS).filter((d) => fs.existsSync(path.join(PRODUCTS, d, 'product.yaml')));
const from = fromIdx >= 0 ? args[fromIdx + 1] : existing[0];

if (!slug || !/^[a-z0-9-]+$/.test(slug) || ['en', 'fr', 'assets'].includes(slug)) {
  console.error('Usage: npm run new-product -- <slug> [--from <existing>]   (slug: lowercase letters, digits, dashes)');
  process.exit(1);
}
const dest = path.join(PRODUCTS, slug);
if (fs.existsSync(dest)) {
  console.error(`src/content/products/${slug}/ already exists.`);
  process.exit(1);
}
if (!existing.includes(from)) {
  console.error(`Unknown template product "${from}". Existing: ${existing.join(', ')}`);
  process.exit(1);
}

const src = path.join(PRODUCTS, from);
fs.mkdirSync(path.join(dest, 'assets'), { recursive: true });
let facts = fs.readFileSync(path.join(src, 'product.yaml'), 'utf8');
facts = facts
  .replace(/^draft: .*$/m, 'draft: true')
  .replace(/^redirects:\n(?:  .*\n)+/m, 'redirects: []\n')
  .replace(new RegExp(`/${from}/`, 'g'), `/${slug}/`);
fs.writeFileSync(path.join(dest, 'product.yaml'), facts);
for (const f of ['en.yaml', 'fr.yaml']) if (fs.existsSync(path.join(src, f))) fs.copyFileSync(path.join(src, f), path.join(dest, f));
fs.copyFileSync(path.join(src, 'assets', 'icon.svg'), path.join(dest, 'assets', 'icon.svg'));

console.log(`✔ Created src/content/products/${slug}/ (draft, copied from ${from})

Next:
  1. Rewrite product.yaml (code, link, bonus, dates, colors) and en.yaml / fr.yaml — official sources only.
  2. Replace assets/icon.svg with an original icon (never the company's logo).
  3. npm run og        → share images
  4. Set draft: false, npm run build, check http://localhost:4321/${slug}/ (npm run dev).
  5. Commit and push: the page goes live at /${slug}/ and on the home page.`);
