// /products.json — every product (code, link, bonus, pages) as JSON.
import { SITE } from '../config/site.ts';
import { getModel } from '../lib/data.ts';
import { URLS } from '../lib/model.ts';

export async function GET() {
  const m = await getModel();
  return new Response(JSON.stringify({ name: SITE.name, url: `${URLS.root}/`, updated: m.hub.lastVerified, products: m.summaries }, null, 2));
}
