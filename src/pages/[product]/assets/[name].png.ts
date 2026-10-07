// /<slug>/assets/<name>.png — share images and apple-touch-icon of src/content/products/<slug>/assets/.
import { assetRoute } from '../../../lib/asset-route.ts';

export const { getStaticPaths, GET } = assetRoute('png');
