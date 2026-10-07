// Theme tokens → CSS variables (light by default, dark when the visitor's system asks for it).
// The network theme is in src/config/site.ts; a product overrides any color in its product.yaml.
import type { Theme } from '../config/site.ts';

const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const tokens = (obj: Record<string, string>) =>
  Object.entries(obj)
    .map(([k, v]) => `--${kebab(k)}:${v}`)
    .join(';');

export function themeCss(theme: Theme) {
  const f = theme.fonts;
  const base = `--font-display:${f.display};--font-body:${f.body};--font-mono:${f.mono};--radius:${theme.radius}`;
  return `:root{color-scheme:light dark;${base};${tokens(theme.light)}}@media (prefers-color-scheme:dark){:root{${tokens(theme.dark)}}}`;
}
