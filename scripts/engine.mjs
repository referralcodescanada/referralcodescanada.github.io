// What is shared between all the repos of the network (the "engine"), and how to find those repos.
// Every repo lives side by side in the same parent folder (e.g. D:\referalcodescanada\<repo>).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './load.mjs';

export const PARENT = path.dirname(ROOT);

// Copied as-is by `npm run sync` and `npm run new-product`.
export const ENGINE = [
  'template',
  'scripts',
  'docs',
  'CLAUDE.md',
  '.claude/skills',
  '.claude/launch.json',
  '.github/workflows',
  'hub/assets',
  'package.json',
  'package-lock.json',
  '.gitignore',
];

// hub/hub.config.mjs is shared too, except these per-repo lines.
const PER_REPO_KEYS = ['publish', 'products'];

const lineOf = (src, key) => src.match(new RegExp(`^\\s*${key}:.*$`, 'm'))?.[0];

export const readPublish = (dir) => {
  const src = fs.readFileSync(path.join(dir, 'hub', 'hub.config.mjs'), 'utf8');
  return src.match(/^\s*publish:\s*'([^']+)'/m)?.[1] || 'hub';
};

// Every sibling folder that contains this engine (has hub/hub.config.mjs).
export function listRepos() {
  return fs
    .readdirSync(PARENT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(PARENT, d.name, 'hub', 'hub.config.mjs')))
    .map((d) => {
      const dir = path.join(PARENT, d.name);
      return { name: d.name, dir, publish: readPublish(dir), self: dir === ROOT };
    });
}

export function copyEngine(fromDir, toDir, { dry = false } = {}) {
  const done = [];
  for (const rel of ENGINE) {
    const src = path.join(fromDir, rel);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(toDir, rel);
    if (!dry) {
      if (fs.statSync(src).isDirectory()) fs.rmSync(dest, { recursive: true, force: true });
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.cpSync(src, dest, { recursive: true });
    }
    done.push(rel);
  }
  // Shared hub config, keeping the target's own `publish` and `products` lines.
  const srcCfg = path.join(fromDir, 'hub', 'hub.config.mjs');
  const destCfg = path.join(toDir, 'hub', 'hub.config.mjs');
  let merged = fs.readFileSync(srcCfg, 'utf8');
  if (fs.existsSync(destCfg)) {
    const old = fs.readFileSync(destCfg, 'utf8');
    for (const key of PER_REPO_KEYS) {
      const keep = lineOf(old, key);
      const cur = lineOf(merged, key);
      if (keep && cur) merged = merged.replace(cur, keep);
    }
  }
  if (!dry) {
    fs.mkdirSync(path.dirname(destCfg), { recursive: true });
    fs.writeFileSync(destCfg, merged);
  }
  done.push('hub/hub.config.mjs (shared settings)');
  return done;
}

export function setConfigLine(dir, key, valueSrc) {
  const file = path.join(dir, 'hub', 'hub.config.mjs');
  const src = fs.readFileSync(file, 'utf8');
  const line = lineOf(src, key);
  if (!line) throw new Error(`${key}: not found in ${file}`);
  const indent = line.match(/^\s*/)[0];
  fs.writeFileSync(file, src.replace(line, `${indent}${key}: ${valueSrc},`));
}

export function readProducts(dir) {
  const src = fs.readFileSync(path.join(dir, 'hub', 'hub.config.mjs'), 'utf8');
  const m = src.match(/^\s*products:\s*\[([^\]]*)\]/m);
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
}
