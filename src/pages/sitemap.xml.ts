// /sitemap.xml — every page with its translations (hreflang) and the date its content was last verified.
import { getModel } from '../lib/data.ts';
import { sitemapGroups } from '../lib/routes.ts';

export async function GET() {
  const groups = sitemapGroups(await getModel());
  const urls = groups.flatMap((g) =>
    g.pages.map(
      (p) => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${g.lastmod}</lastmod>
${g.pages.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.url}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${g.def.url}"/>
  </url>`,
    ),
  );
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
}
