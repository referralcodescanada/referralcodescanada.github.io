// 1200×630 social-share image (Open Graph / X / LinkedIn / iMessage previews), rendered to PNG by scripts/og.mjs.
import { esc } from '../src/lib/format.ts';

const SANS = "'Segoe UI', 'Inter', 'Helvetica Neue', 'DejaVu Sans', Arial, sans-serif";
const MONO = "'Consolas', 'JetBrains Mono', 'DejaVu Sans Mono', monospace";

// Rough fit: shrink the font size for long lines so they stay inside the left column.
const fit = (text, max, width) => Math.min(max, Math.floor(width / (String(text).length * 0.55)));

export function ogSvg({ theme, eyebrow, line1, line2, code, codeLabel, badgeTop, badgeBottom, footer, logo }) {
  const t = theme.light;
  const size = Math.min(fit(line1, 78, 640), fit(line2, 78, 640));
  const codeSize = fit(code, 92, 470 / 1.25);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${t.accentSoft}"/><stop offset="1" stop-color="${t.accentSoft}" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="${t.ink}" fill-opacity="0.08"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="${t.bg}"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <circle cx="960" cy="300" r="420" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="14" fill="${t.accent}"/>

  <g font-family="${SANS}">
    <circle cx="92" cy="104" r="8" fill="${t.accent}"/>
    <text x="114" y="114" font-size="28" font-weight="700" letter-spacing="4" fill="${t.accent}">${esc(eyebrow)}</text>
    <text x="80" y="${180 + size * 0.8}" font-size="${size}" font-weight="800" fill="${t.ink}" letter-spacing="-1">${esc(line1)}</text>
    <text x="80" y="${180 + size * 1.85}" font-size="${size}" font-weight="800" fill="${t.ink}" letter-spacing="-1">${esc(line2)}</text>
  </g>

  <g transform="translate(80 392)">
    <rect width="520" height="150" rx="30" fill="${t.surface}" stroke="${t.accent}" stroke-width="4" stroke-dasharray="16 11"/>
    <text x="40" y="48" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="4" fill="${t.muted}">${esc(codeLabel.toUpperCase())}</text>
    <text x="38" y="${48 + codeSize * 0.95}" font-family="${MONO}" font-size="${codeSize}" font-weight="700" letter-spacing="10" fill="${t.ink}">${esc(code)}</text>
  </g>

  ${logo ? `<image href="${logo}" x="745" y="110" width="390" height="390"/>` : `<g transform="translate(940 300) rotate(-8)">
    <circle r="190" fill="${t.accent}"/>
    <circle r="168" fill="none" stroke="${t.accentInk}" stroke-opacity="0.35" stroke-width="3" stroke-dasharray="6 10"/>
    <text y="22" text-anchor="middle" font-family="${SANS}" font-size="${fit(badgeTop, 132, 300)}" font-weight="800" fill="${t.accentInk}">${esc(badgeTop)}</text>
    <text y="80" text-anchor="middle" font-family="${SANS}" font-size="34" font-weight="700" fill="${t.accentInk}" letter-spacing="1">${esc(badgeBottom)}</text>
  </g>`}

  <text x="80" y="592" font-family="${SANS}" font-size="24" font-weight="600" fill="${t.muted}">${esc(footer)}</text>
</svg>`;
}
