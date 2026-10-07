// Loads src/content outside Astro (for the scripts), validated with the same schemas as the build,
// and returns the same model as the pages (src/lib/model.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { buildModel } from '../src/lib/model.ts';
import { guideFront, guideMeta, hubTexts, productFacts, productTexts } from '../src/lib/schema.ts';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'src', 'content');
const LOCS = ['en', 'fr'];

function parse(schema, data, file) {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  const issues = r.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
  throw new Error(`[content] ${path.relative(ROOT, file)} is invalid:\n${issues}`);
}
const yamlFile = (schema, file) => parse(schema, YAML.parse(fs.readFileSync(file, 'utf8')), file);
const dirs = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : []);

export function loadRaw() {
  const raw = { hub: {}, products: [] };
  for (const loc of LOCS) {
    const f = path.join(CONTENT, 'hub', `${loc}.yaml`);
    if (fs.existsSync(f)) raw.hub[loc] = yamlFile(hubTexts, f);
  }
  for (const slug of dirs(path.join(CONTENT, 'products'))) {
    const dir = path.join(CONTENT, 'products', slug);
    if (!fs.existsSync(path.join(dir, 'product.yaml'))) continue;
    const product = { slug, facts: yamlFile(productFacts, path.join(dir, 'product.yaml')), texts: {}, guides: [] };
    for (const loc of LOCS) {
      const f = path.join(dir, `${loc}.yaml`);
      if (fs.existsSync(f)) product.texts[loc] = yamlFile(productTexts, f);
    }
    for (const id of dirs(path.join(dir, 'guides'))) {
      const gdir = path.join(dir, 'guides', id);
      const guide = { id, meta: yamlFile(guideMeta, path.join(gdir, 'guide.yaml')), texts: {} };
      for (const loc of LOCS) {
        const f = path.join(gdir, `${loc}.md`);
        if (!fs.existsSync(f)) continue;
        const m = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
        if (!m) throw new Error(`[content] ${path.relative(ROOT, f)}: missing front matter (--- … ---)`);
        guide.texts[loc] = { front: parse(guideFront, YAML.parse(m[1]), f), body: m[2], file: path.relative(ROOT, f).replace(/\\/g, '/') };
      }
      product.guides.push(guide);
    }
    raw.products.push(product);
  }
  return raw;
}

export const loadModel = () => buildModel(loadRaw());
