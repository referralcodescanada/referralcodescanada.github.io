// /llms-full.txt — the full text of every page, every product, every language.
import { getModel } from '../lib/data.ts';
import { productFullText } from '../lib/markdown.ts';

export async function GET() {
  const m = await getModel();
  return new Response(m.products.map((p) => productFullText(p, m.hub)).join('\n\n---\n\n'));
}
