// /<slug>/llms-full.txt — full text of one product's pages and guides, every language.
import { getModel } from '../../lib/data.ts';
import { productFullText } from '../../lib/markdown.ts';

export async function getStaticPaths() {
  const m = await getModel();
  return m.products.map((p) => ({ params: { product: p.slug } }));
}

export async function GET({ params }: { params: { product: string } }) {
  const m = await getModel();
  return new Response(productFullText(m.products.find((p) => p.slug === params.product)!, m.hub));
}
