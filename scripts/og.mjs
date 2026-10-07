// Generates the share images and icons (commit the results):
//   src/content/products/<slug>/assets/og-<lang>.png, apple-touch-icon.png   (from the product's texts + icon.svg)
//   public/assets/logo-512.png, logo-mark-128.png, favicon-192.png, apple-touch-icon.png, favicon.ico, og-<lang>.png
//     (from the network logo public/assets/logo.png)
// Run after changing a code, a bonus, a theme or the logo:  npm run og
// Rendered with the system fonts (Segoe UI on Windows): run it on the same machine to keep a consistent look.
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '../src/config/site.ts';
import { money } from '../src/lib/format.ts';
import { URLS } from '../src/lib/model.ts';
import { loadModel, ROOT } from './content.mjs';
import { ogSvg } from './og-svg.mjs';

const render = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' }, background: 'rgba(0,0,0,0)' })
    .render()
    .asPng();

// ICO container holding a single PNG image.
function pngToIco(png, size) {
  const h = Buffer.alloc(22);
  h.writeUInt16LE(0, 0);
  h.writeUInt16LE(1, 2);
  h.writeUInt16LE(1, 4);
  h.writeUInt8(size >= 256 ? 0 : size, 6);
  h.writeUInt8(size >= 256 ? 0 : size, 7);
  h.writeUInt16LE(1, 10);
  h.writeUInt16LE(32, 12);
  h.writeUInt32LE(png.length, 14);
  h.writeUInt32LE(22, 18);
  return Buffer.concat([h, png]);
}

const save = (file, buf) => {
  fs.writeFileSync(file, buf);
  console.log(`  ✔ ${path.relative(ROOT, file)}`);
};

const { hub, products, summaries } = loadModel();

for (const p of products) {
  const dir = path.join(ROOT, 'src', 'content', 'products', p.slug, 'assets');
  for (const loc of p.locs) {
    const L = p.locales[loc];
    const og = L.c.og || {};
    const svg = ogSvg({
      theme: p.theme,
      eyebrow: og.eyebrow || '',
      line1: og.line1 || p.name,
      line2: og.line2 || L.ui.codeLabel,
      code: p.code,
      codeLabel: L.ui.codeLabel,
      badgeTop: og.badgeTop || L.vars.bonus,
      badgeBottom: og.badgeBottom || L.ui.bonus,
      footer: L.url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    });
    save(path.join(dir, `og-${loc}.png`), render(svg, 1200));
  }
  const icon = path.join(dir, 'icon.svg');
  if (fs.existsSync(icon)) save(path.join(dir, 'apple-touch-icon.png'), render(fs.readFileSync(icon, 'utf8'), 180));
}

// Network logo: public/assets/logo.png (square, transparent, round badge) is the single source.
// MARK = the leaf + tag part of the badge, used where the full logo would be unreadable (≤ 64 px).
const brandDir = path.join(ROOT, 'public', 'assets');
const logoFile = path.join(brandDir, 'logo.png');
const MARK = { scale: 0.795, cx: 530, cy: 372, size: 1024 }; // crop of the 1024-px source, tuned for the current logo
const logoUri = `data:image/png;base64,${fs.readFileSync(logoFile).toString('base64')}`;
const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><image href="${logoUri}" width="512" height="512"/></svg>`;
const k = MARK.scale; // 1 source px (1024-px logo) = k px on the 512-px canvas
const markSvg = (bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${bg ? `<rect width="512" height="512" fill="${bg}"/>` : ''}<defs><clipPath id="c"><circle cx="256" cy="256" r="234"/></clipPath></defs><circle cx="256" cy="256" r="244" fill="#FAFAF8" stroke="#0E2A56" stroke-width="22"/><g clip-path="url(#c)"><image href="${logoUri}" x="${256 - MARK.cx * k}" y="${256 - MARK.cy * k}" width="${MARK.size * k}" height="${MARK.size * k}"/></g></svg>`;
save(path.join(brandDir, 'logo-512.png'), render(full, 512));
save(path.join(brandDir, 'logo-mark-128.png'), render(markSvg(), 128));
save(path.join(brandDir, 'favicon-192.png'), render(markSvg(), 192));
save(path.join(brandDir, 'apple-touch-icon.png'), render(markSvg('#FFFFFF'), 180));
const ico = pngToIco(render(markSvg(), 48), 48);
save(path.join(brandDir, 'favicon.ico'), ico);
save(path.join(ROOT, 'public', 'favicon.ico'), ico);

// Home-page share image: the logo + the first product's code.
const first = summaries[0];
for (const loc of hub.locs) {
  const H = hub.locales[loc];
  const og = H.c.og || {};
  const svg = ogSvg({
    theme: hub.theme,
    eyebrow: og.eyebrow || '',
    line1: og.line1 || SITE.name,
    line2: og.line2 || '',
    code: first ? first.code : '—',
    codeLabel: first ? `${first.name} · ${H.ui.codeLabel}` : H.ui.codeLabel,
    badgeTop: og.badgeTop || (first ? money(first.bonus.amount, first.bonus.currency, H.lang) : ''),
    badgeBottom: og.badgeBottom || H.ui.bonus,
    footer: URLS.root.replace(/^https?:\/\//, ''),
    logo: logoUri,
  });
  save(path.join(brandDir, `og-${loc}.png`), render(svg, 1200));
}
