---
name: sync-engine
description: Propagate changes of the shared engine (template, scripts, docs, skills, workflow, hub assets, shared hub settings like analytics or theme) from the current repo to every sibling repo of the Referral Codes Canada network, rebuild them all and report. Use after changing the design, a script, a skill, the docs or a shared setting.
---

# Sync the engine across repos

All repos in the parent folder (e.g. `D:\referalcodescanada\*`) share the same engine. Content stays per repo.

| Shared (synced) | Per repo (never synced) |
| --- | --- |
| `template/`, `scripts/`, `docs/`, `CLAUDE.md`, `.claude/skills/`, `.claude/launch.json`, `.github/workflows/`, `hub/assets/`, `package.json`, `package-lock.json`, `.gitignore`, `hub/hub.config.mjs` **except** `publish` and `products` | `sites/`, `public/`, `.cache/`, `README.md`, `dist/` |

## Steps
1. Make and test the change in one repo (`npm run build`, `npm run serve`).
2. Preview what will be copied: `npm run sync -- --dry`.
3. Run `npm run sync`. It copies the engine to every sibling that has `hub/hub.config.mjs`, keeps each target's `publish` / `products`, and rebuilds each one. Any "build failed" must be fixed before going further.
4. If the change affects the generated pages, spot-check one product and the home page locally.
5. Tell the user (in French) which repos changed and that each must be committed and pushed (product repos first, the home-page repo last). After deploys, run `npm run check` in each repo.

Never edit a shared file only in a sibling: it would be overwritten by the next sync. Make the change in one repo, then sync.
