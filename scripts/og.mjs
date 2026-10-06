// Generates the social-share images and icons into each assets folder (commit the results):
//   sites/<slug>/assets/og-<locale>.png, apple-touch-icon.png
//   hub/assets/og-<locale>.png, apple-touch-icon.png, favicon.ico
// Run locally after changing a code, bonus or theme:  npm install && npm run og
import fs from 'node:fs';
import path from 'node:path';
import { loadProject, ROOT } from './load.mjs';
import { ogSvg } from '../template/og.mjs';

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

const { hub, sites, P } = await loadProject();
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

const hubDir = path.join(ROOT, 'hub', 'assets');
const first = sites[0];
for (const loc of hub.locs) {
  const H = hub.locales[loc];
  const og = H.c.og || {};
  const F = first && (first.locales[loc] || first.locales[first.def]);
  const svg = ogSvg({
    theme: hub.theme,
    eyebrow: og.eyebrow || '',
    line1: og.line1 || hub.name,
    line2: og.line2 || '',
    code: first ? first.code : '—',
    codeLabel: first ? `${first.name} · ${H.ui.codeLabel}` : H.ui.codeLabel,
    badgeTop: og.badgeTop || (F ? F.vars.bonus : ''),
    badgeBottom: og.badgeBottom || H.ui.bonus,
    footer: P.siteUrl.replace(/^https?:\/\//, ''),
  });
  save(path.join(hubDir, `og-${loc}.png`), render(svg, 1200));
}
const hubIcon = fs.readFileSync(path.join(hubDir, 'icon.svg'), 'utf8');
save(path.join(hubDir, 'apple-touch-icon.png'), render(hubIcon, 180));
save(path.join(hubDir, 'favicon.ico'), pngToIco(render(hubIcon, 48), 48));
