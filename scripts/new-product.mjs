// Creates a new product repo next to this one (one repo = one product, published at /<slug>/),
// and registers it on the home-page repo.
//
//   npm run new-product -- <slug> [--from <existing-site>]
//   e.g. npm run new-product -- fizz
//
// Result: ../<slug>/ with the shared engine, hub config set to publish: '<slug>',
// and sites/<slug>/ copied from an existing site as a DRAFT (texts to rewrite, no guides).
import fs from 'node:fs';
import path from 'node:path';
import { copyEngine, listRepos, PARENT, readProducts, setConfigLine } from './engine.mjs';
import { ROOT } from './load.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const fromIdx = args.indexOf('--from');
const from = fromIdx >= 0 ? args[fromIdx + 1] : fs.readdirSync(path.join(ROOT, 'sites')).find((d) => !/^[._]/.test(d));

if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Usage: npm run new-product -- <slug>   (lowercase letters, digits, dashes — becomes the URL /<slug>/ and the GitHub repo name)');
  process.exit(1);
}
const dest = path.join(PARENT, slug);
if (fs.existsSync(dest)) {
  console.error(`${dest} already exists.`);
  process.exit(1);
}
const srcSite = path.join(ROOT, 'sites', from || '');
if (!from || !fs.existsSync(srcSite)) {
  console.error(`No source site to copy from (looked for sites/${from}). Use --from <slug>.`);
  process.exit(1);
}

// 1. Engine + shared settings
fs.mkdirSync(dest, { recursive: true });
copyEngine(ROOT, dest);
setConfigLine(dest, 'publish', `'${slug}'`);
setConfigLine(dest, 'products', `['${slug}']`);
if (fs.existsSync(path.join(ROOT, 'public'))) fs.cpSync(path.join(ROOT, 'public'), path.join(dest, 'public'), { recursive: true });

// 2. Product content (draft), without guides or generated images
fs.cpSync(srcSite, path.join(dest, 'sites', slug), {
  recursive: true,
  filter: (p) => !/[\\/]guides([\\/]|$)|og-[a-z]+\.png$|apple-touch-icon\.png$/.test(p),
});
const cfgFile = path.join(dest, 'sites', slug, 'site.config.mjs');
fs.writeFileSync(cfgFile, fs.readFileSync(cfgFile, 'utf8').replace(/draft:\s*false/, 'draft: true'));
fs.mkdirSync(path.join(dest, 'sites', slug, 'guides'), { recursive: true });

// 3. Minimal README
fs.writeFileSync(
  path.join(dest, 'README.md'),
  `# ${slug} — referral code

Repo **\`referralcodescanada/${slug}\`** → https://referralcodescanada.github.io/${slug}/

Part of Referral Codes Canada. Everything is explained in [docs/](docs/) and [CLAUDE.md](CLAUDE.md).

- Content: \`sites/${slug}/site.config.mjs\` and \`sites/${slug}/guides/\`
- Local preview: \`npm run dev\`
- Live check: \`npm run check\`
`,
);

// 4. Register on the home-page repo
const hubRepo = listRepos().find((r) => r.publish === 'hub');
let hubMsg = 'No home-page repo (publish: \'hub\') found next to this one — add the product to its `products` list manually.';
if (hubRepo) {
  const list = readProducts(hubRepo.dir);
  if (!list.includes(slug)) {
    setConfigLine(hubRepo.dir, 'products', `[${[...list, slug].map((s) => `'${s}'`).join(', ')}]`);
    hubMsg = `Added '${slug}' to products in ${hubRepo.name}/hub/hub.config.mjs (commit + push that repo once ${slug} is live).`;
  } else hubMsg = `'${slug}' was already listed in ${hubRepo.name}.`;
}

console.log(`✔ Created ${dest}
  sites/${slug}/site.config.mjs is a DRAFT copied from "${from}": rewrite brand, referral, links, texts, FAQ, theme.
  ${hubMsg}

Next:
  1. Edit sites/${slug}/site.config.mjs and replace sites/${slug}/assets/icon.svg
  2. cd ../${slug} && npm install && npm run og
  3. Set draft: false, then npm run dev to review
  4. Create the public GitHub repo "${slug}", Settings → Pages → Source: GitHub Actions
  5. git init -b main, commit, push (see docs/publishing.md)`);
