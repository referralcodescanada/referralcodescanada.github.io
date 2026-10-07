// /<key>.txt — proves to IndexNow (Bing, Yandex…) that the pings come from this site. Key: src/config/site.ts.
import { SITE } from '../config/site.ts';

export const getStaticPaths = () => (SITE.indexNowKey ? [{ params: { indexnow: SITE.indexNowKey } }] : []);
export const GET = () => new Response(SITE.indexNowKey);
