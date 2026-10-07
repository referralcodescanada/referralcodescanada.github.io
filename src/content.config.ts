// Content collections: every file of src/content is validated against src/lib/schema.ts at build time.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { guideFront, guideMeta, hubTexts, productFacts, productTexts } from './lib/schema.ts';

const PRODUCTS = './src/content/products';
const strip = (entry: string, ext: RegExp) => entry.replace(ext, '');

export const collections = {
  // src/content/hub/en.yaml → id "en"
  hub: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/content/hub', generateId: ({ entry }) => strip(entry, /\.yaml$/) }),
    schema: hubTexts,
  }),
  // src/content/products/wealthsimple/product.yaml → id "wealthsimple"
  products: defineCollection({
    loader: glob({ pattern: '*/product.yaml', base: PRODUCTS, generateId: ({ entry }) => entry.split('/')[0] }),
    schema: productFacts,
  }),
  // src/content/products/wealthsimple/fr.yaml → id "wealthsimple/fr"
  productTexts: defineCollection({
    loader: glob({ pattern: '*/{en,fr}.yaml', base: PRODUCTS, generateId: ({ entry }) => strip(entry, /\.yaml$/) }),
    schema: productTexts,
  }),
  // src/content/products/wealthsimple/guides/bonus-not-received/guide.yaml → id "wealthsimple/bonus-not-received"
  guides: defineCollection({
    loader: glob({ pattern: '*/guides/*/guide.yaml', base: PRODUCTS, generateId: ({ entry }) => entry.replace(/\/guides\/([^/]+)\/guide\.yaml$/, '/$1') }),
    schema: guideMeta,
  }),
  // …/guides/bonus-not-received/fr.md → id "wealthsimple/bonus-not-received/fr"
  guideTexts: defineCollection({
    loader: glob({
      pattern: '*/guides/*/{en,fr}.md',
      base: PRODUCTS,
      generateId: ({ entry }) => entry.replace(/\/guides\/([^/]+)\/(\w+)\.md$/, '/$1/$2'),
      deferRender: true,
    }),
    schema: guideFront,
  }),
};
