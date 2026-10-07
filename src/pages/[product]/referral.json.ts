// /<slug>/referral.json — one product as JSON (same data as in /products.json).
import { getModel } from '../../lib/data.ts';

export async function getStaticPaths() {
  const m = await getModel();
  return m.summaries.map((s) => ({ params: { product: s.slug }, props: { summary: s } }));
}

export const GET = ({ props }: { props: { summary: unknown } }) => new Response(JSON.stringify(props.summary, null, 2));
