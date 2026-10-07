// Tells Bing, Yandex, Seznam, Naver… (IndexNow) that the pages changed. Run by the deploy workflow.
import { SITE } from '../src/config/site.ts';
import { URLS } from '../src/lib/model.ts';
import { pageRoutes } from '../src/lib/routes.ts';
import { loadModel } from './content.mjs';

const key = SITE.indexNowKey;
if (!key) {
  console.log('No indexNowKey configured — skipping.');
  process.exit(0);
}
const urlList = [...pageRoutes(loadModel()).filter((r) => r.kind !== 'redirect').map((r) => URLS.abs(r.path)), URLS.abs('/llms.txt'), URLS.abs('/sitemap.xml')];
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(URLS.root).host, key, keyLocation: URLS.abs(`/${key}.txt`), urlList }),
});
console.log(`IndexNow → HTTP ${res.status} for ${urlList.length} URLs`);
if (res.status >= 400) console.log(await res.text());
