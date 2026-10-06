// Minimal static server for dist/ (no dependencies).  npm run serve  →  http://localhost:4321
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { loadProject, ROOT } from './load.mjs';

const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4321;
// Pages are built for their public path (e.g. /wealthsimple/), so serve dist/ under that prefix.
const { P } = await loadProject();
const BASE = P.basePath;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg',
};

http
  .createServer((req, res) => {
    let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (BASE && !url.startsWith(`${BASE}/`)) return res.writeHead(302, { Location: `${BASE}/` }).end();
    url = url.slice(BASE.length) || '/';
    let file = path.join(DIST, url);
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.endsWith('/')) return res.writeHead(301, { Location: `${BASE}${url}/` }).end();
      file = path.join(file, 'index.html');
    }
    const found = fs.existsSync(file);
    if (!found) file = path.join(DIST, '404.html');
    res.writeHead(found ? 200 : 404, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`Serving dist/ on http://localhost:${PORT}${BASE}/  (run "npm run build" after each change)`));
