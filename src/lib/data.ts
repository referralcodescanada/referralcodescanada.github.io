// Reads the content collections (validated by src/content.config.ts) and builds the site model once per build.
import { getCollection } from 'astro:content';
import { isLoc } from './i18n.ts';
import { buildModel, type Model, type RawContent, type RawProduct } from './model.ts';

let cache: Promise<Model> | undefined;

async function load(): Promise<Model> {
  const [hub, products, texts, guides, guideTexts] = await Promise.all([
    getCollection('hub'),
    getCollection('products'),
    getCollection('productTexts'),
    getCollection('guides'),
    getCollection('guideTexts'),
  ]);
  const raw: RawContent = { hub: {}, products: [] };
  for (const h of hub) if (isLoc(h.id)) raw.hub[h.id] = h.data;

  for (const p of products) {
    const product: RawProduct = { slug: p.id, facts: p.data, texts: {}, guides: [] };
    for (const t of texts) {
      const [slug, loc] = t.id.split('/');
      if (slug === p.id && isLoc(loc)) product.texts[loc] = t.data;
    }
    for (const g of guides) {
      const [slug, id] = g.id.split('/');
      if (slug !== p.id) continue;
      const guide: RawProduct['guides'][number] = { id, meta: g.data, texts: {} };
      for (const t of guideTexts) {
        const [s, gid, loc] = t.id.split('/');
        if (s === slug && gid === id && isLoc(loc)) {
          guide.texts[loc] = { front: t.data, body: t.body || '', file: `src/content/products/${slug}/guides/${id}/${loc}.md` };
        }
      }
      product.guides.push(guide);
    }
    raw.products.push(product);
  }
  return buildModel(raw);
}

export const getModel = () => (cache ??= load());
