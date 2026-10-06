// Propagates the shared engine (template, scripts, docs, skills, workflow, hub assets, shared hub settings)
// from this repo to every sibling repo of the network, then rebuilds them.
//
//   npm run sync            → copy + rebuild every sibling
//   npm run sync -- --dry   → only list what would be copied
//
// Per-repo content is never touched: sites/, public/, .cache/, README.md, and the `publish` / `products` lines.
import { execFileSync } from 'node:child_process';
import { copyEngine, listRepos } from './engine.mjs';

const dry = process.argv.includes('--dry');
const repos = listRepos();
const self = repos.find((r) => r.self);
const targets = repos.filter((r) => !r.self);

if (!targets.length) {
  console.log('No sibling repo found next to this one.');
  process.exit(0);
}
console.log(`Source: ${self.name} (publish: ${self.publish})${dry ? '  [dry run]' : ''}`);
for (const t of targets) {
  const copied = copyEngine(self.dir, t.dir, { dry });
  console.log(`\n→ ${t.name} (publish: ${t.publish})\n   ${copied.join('\n   ')}`);
  if (!dry) {
    try {
      const out = execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: t.dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      console.log(`   ${out.split('\n').filter((l) => /Built|mode|⚠/.test(l)).join('\n   ')}`);
    } catch (e) {
      console.error(`   ✖ build failed:\n${e.stdout || ''}${e.stderr || e.message}`);
      process.exitCode = 1;
    }
  }
}
console.log(`\nDone. Review with "git status" in each repo, then commit and push.`);
