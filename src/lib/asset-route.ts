// Shared by src/pages/[product]/assets/[name].png.ts and [name].svg.ts: serve the files of
// src/content/products/<slug>/assets/ with a given extension at /<slug>/assets/<file>.
import { assetFiles, readAsset } from './assets.ts';
import { getModel } from './data.ts';

const TYPES: Record<string, string> = { png: 'image/png', svg: 'image/svg+xml' };

export function assetRoute(ext: 'png' | 'svg') {
  return {
    async getStaticPaths() {
      const m = await getModel();
      return m.products.flatMap((p) =>
        assetFiles(p.slug)
          .filter((f) => f.endsWith(`.${ext}`))
          .map((f) => ({ params: { product: p.slug, name: f.slice(0, -ext.length - 1) } })),
      );
    },
    GET({ params }: { params: { product: string; name: string } }) {
      return new Response(new Uint8Array(readAsset(params.product, `${params.name}.${ext}`)), { headers: { 'Content-Type': TYPES[ext] } });
    },
  };
}
