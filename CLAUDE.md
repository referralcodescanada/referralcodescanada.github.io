# Referral Codes Canada — project guide for Claude

Static-site generator for a network of GitHub Pages sites that publish personal referral codes (EN + FR) and are optimized for search engines and AI assistants. The user is French-speaking (Québec): **answer in French**.

## The network
Sibling repos in the same parent folder (`D:\referalcodescanada\`), GitHub account `referralcodescanada`:
- `referralcodescanada.github.io` → `https://referralcodescanada.github.io/` — home page + root `robots.txt`, `sitemap.xml` (index), `llms.txt`, `products.json` (`publish: 'hub'`).
- `<slug>` (e.g. `wealthsimple`) → `https://referralcodescanada.github.io/<slug>/` — one product (`publish: '<slug>'`).
Check which repo you are in: `publish` in `hub/hub.config.mjs`. Read `docs/architecture.md` for the data flow.

## Commands
- `npm run build` (no deps; same as CI) · `npm run serve` / `npm run dev` → http://localhost:4321/<base>/
- `npm run og` → regenerate social images (needs `npm install` once)
- `npm run check` → audit the live site (`-- --local` for localhost)
- `npm run sync` → copy the shared engine to every sibling repo and rebuild them
- `npm run new-product -- <slug>` → scaffold a new product repo next to this one and register it on the home page

## Skills (`.claude/skills/`)
`new-referral-product`, `add-guide`, `verify-offer`, `sync-engine`, `seo-check`.

## Rules
- **Never commit, push or create GitHub repos yourself**: prepare everything, then give the user the commands (`docs/publishing.md`). Pushing needs `http.sslBackend schannel` (corporate SSL inspection) and the `referralcodescanada@` remote URL (several GitHub accounts on this PC).
- **Facts come from official sources only** (company help centre / terms). Keep wording cautious when unsure; never invent a code, bonus or deadline. Bump `lastVerified` only after actually re-checking.
- **Shared engine** (`template/`, `scripts/`, `docs/`, this file, `.claude/skills/`, workflow, `hub/assets/`, `package*.json`, `.gitignore`, `hub/hub.config.mjs` except `publish`/`products`) must stay identical across repos: change it in one repo, then `npm run sync`. Per-repo content: `sites/`, `public/`, `.cache/`, `README.md`.
- Never use a company's logo or imitate its branding; pages state they're independent and not affiliated. Referral links keep `rel="sponsored"`.
- French copy is Canadian French, written natively (not literal translation); use a non-breaking space before `:` where a line break could orphan it.
- After changing templates, verify: `npm run build` without warnings, no leftover `{placeholder}` in `dist/`, one `<h1>` per page, valid JSON-LD; preview desktop + mobile + dark mode.
- Put temporary files (screenshots, scratch) outside the repos.
