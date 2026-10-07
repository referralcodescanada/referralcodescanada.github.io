// <page>/index.md — Markdown version of every product page and guide, for AI assistants.
import { getModel } from '../../lib/data.ts';
import { guideMarkdown, productMarkdown } from '../../lib/markdown.ts';
import { markdownRoutes, param, type Route } from '../../lib/routes.ts';

export async function getStaticPaths() {
  const m = await getModel();
  return markdownRoutes(m).map((route) => ({ params: { path: param(route.path) }, props: { route } }));
}

export async function GET({ props }: { props: { route: Route } }) {
  const { route } = props;
  const m = await getModel();
  if (route.kind !== 'product' && route.kind !== 'guide') throw new Error(`no markdown for ${route.path}`);
  const p = m.products.find((x) => x.slug === route.slug)!;
  if (route.kind === 'product') return new Response(productMarkdown(p, p.locales[route.loc], m.hub));
  const g = p.guides.find((x) => x.id === route.guide)!;
  return new Response(guideMarkdown(p, g, g.locales[route.loc]!, m.hub));
}
