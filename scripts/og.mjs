// Generates the social-share images and icons into each assets folder (commit the results):
//   sites/<slug>/assets/og-<locale>.png, apple-touch-icon.png
//   hub/assets/og-<locale>.png, apple-touch-icon.png, favicon.ico
// Run locally after changing a code, bonus or theme:  npm install && npm run og
import fs from 'node:fs';
import path from 'node:path';
import { loadProject, ROOT } from './load.mjs';
import { ogSvg } from '../template/og.mjs';
import { money } from './lib.mjs';

let Resvg;
try {
  ({ Resvg } = await import('@resvg/resvg-js'));
} catch {
  console.error('Missing dev dependency. Run "npm install" first.');
  process.exit(1);
}

const render = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' },
    background: 'rgba(0,0,0,0)',
  })
    .render()
    .asPng();

// ICO container holding a single PNG image.
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size >= 256 ? 0 : size, 6);
  header.writeUInt8(size >= 256 ? 0 : size, 7);
  header.writeUInt8(0, 8);
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

const { hub, sites, products, P } = await loadProject();
const save = (file, buf) => {
  fs.writeFileSync(file, buf);
  console.log(`  ✔ ${path.relative(ROOT, file)}`);
};

for (const site of sites) {
  const dir = path.join(site.dir, 'assets');
  for (const loc of site.locs) {
    const L = site.locales[loc];
    const og = L.c.og || {};
    const svg = ogSvg({
      theme: site.theme,
      eyebrow: og.eyebrow || '',
      line1: og.line1 || site.name,
      line2: og.line2 || L.ui.codeLabel,
      code: site.code,
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

// Home-page images and icons are shared (hub/assets/): only the home-page repo generates them.
if (P.standalone) process.exit(0);

// Network logo: hub/assets/logo.png (square, transparent, round badge) is the single source.
// MARK = the leaf + tag part of the badge, used where the full logo would be unreadable (≤ 64 px).
const hubDir = path.join(ROOT, 'hub', 'assets');
const logoFile = path.join(hubDir, 'logo.png');
const MARK = { scale: 0.795, cx: 530, cy: 372, size: 1024 }; // crop of the 1024-px source, tuned for the current logo
const dataUri = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
let logoUri = null;
if (fs.existsSync(logoFile)) {
  logoUri = dataUri(fs.readFileSync(logoFile));
  const full = (px) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><image href="${logoUri}" width="512" height="512"/></svg>`;
  const k = MARK.scale; // 1 source px (1024-px logo) = k px on the 512-px canvas
  const markSvg = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${bg ? `<rect width="512" height="512" fill="${bg}"/>` : ''}<defs><clipPath id="c"><circle cx="256" cy="256" r="234"/></clipPath></defs><circle cx="256" cy="256" r="244" fill="#FAFAF8" stroke="#0E2A56" stroke-width="22"/><g clip-path="url(#c)"><image href="${logoUri}" x="${256 - MARK.cx * k}" y="${256 - MARK.cy * k}" width="${MARK.size * k}" height="${MARK.size * k}"/></g></svg>`;
  save(path.join(hubDir, 'logo-512.png'), render(full(), 512));
  save(path.join(hubDir, 'logo-mark-128.png'), render(markSvg(), 128));
  save(path.join(hubDir, 'favicon-192.png'), render(markSvg(), 192));
  save(path.join(hubDir, 'apple-touch-icon.png'), render(markSvg('#FFFFFF'), 180));
  save(path.join(hubDir, 'favicon.ico'), pngToIco(render(markSvg(), 48), 48));
} else {
  const hubIcon = fs.readFileSync(path.join(hubDir, 'icon.svg'), 'utf8');
  save(path.join(hubDir, 'apple-touch-icon.png'), render(hubIcon, 180));
  save(path.join(hubDir, 'favicon.ico'), pngToIco(render(hubIcon, 48), 48));
}

// Home-page share image: the logo (or, without one, the first product's code and bonus).
const first = products[0];
for (const loc of hub.locs) {
  const H = hub.locales[loc];
  const og = H.c.og || {};
  const svg = ogSvg({
    theme: hub.theme,
    eyebrow: og.eyebrow || '',
    line1: og.line1 || hub.name,
    line2: og.line2 || '',
    code: first ? first.code : '—',
    codeLabel: first ? `${first.name} · ${H.ui.codeLabel}` : H.ui.codeLabel,
    badgeTop: og.badgeTop || (first ? money(first.bonus.amount, first.bonus.currency, H.lang) : ''),
    badgeBottom: og.badgeBottom || H.ui.bonus,
    footer: P.siteUrl.replace(/^https?:\/\//, ''),
    logo: logoUri,
  });
  save(path.join(hubDir, `og-${loc}.png`), render(svg, 1200));
}
