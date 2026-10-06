// Notifies Bing, Yandex, Seznam, Naver… (IndexNow) that the pages changed. Run by the deploy workflow.
import { loadProject } from './load.mjs';

const { hub, products, remote, P } = await loadProject();
const key = hub.cfg.indexNowKey;
if (!key) {
  console.log('No indexNowKey configured — skipping.');
  process.exit(0);
}
// Single-product repo: only its own pages (key file under /<slug>/). Hub: home + every product on the domain.
const list = P.standalone ? products.filter((p) => !remote.includes(p)) : products;
const urlList = [
  ...(P.standalone ? [] : hub.locs.map((l) => hub.locales[l].url)),
  ...list.flatMap((p) => [...Object.values(p.locales).map((l) => l.url), ...(p.guides || []).map((g) => g.url)]),
  P.abs('/llms.txt'),
  P.abs('/sitemap.xml'),
];
const host = new URL(P.siteUrl).host;
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: P.abs(`/${key}.txt`), urlList }),
});
console.log(`IndexNow → HTTP ${res.status} for ${urlList.length} URLs`);
if (res.status >= 400) console.log(await res.text());
