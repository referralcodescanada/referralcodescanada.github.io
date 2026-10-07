// /<slug>/llms.txt — index of one product's pages for AI assistants.
import { getModel } from '../../lib/data.ts';
import { productLlmsTxt } from '../../lib/markdown.ts';

export async function getStaticPaths() {
  const m = await getModel();
  return m.products.map((p) => ({ params: { product: p.slug } }));
}

export async function GET({ params }: { params: { product: string } }) {
  const m = await getModel();
  return new Response(productLlmsTxt(m.products.find((p) => p.slug === params.product)!, m.hub));
}
