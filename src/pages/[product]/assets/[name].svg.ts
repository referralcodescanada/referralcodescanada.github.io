// /<slug>/assets/<name>.svg — the product icon of src/content/products/<slug>/assets/.
import { assetRoute } from '../../../lib/asset-route.ts';

export const { getStaticPaths, GET } = assetRoute('svg');
