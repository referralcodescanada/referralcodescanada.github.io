# Referral Codes Canada — project guide for Claude

Astro site publishing personal referral codes (EN + FR) on GitHub Pages, optimized for search engines and AI assistants: https://referralcodescanada.github.io/ (repo `referralcodescanada/referralcodescanada.github.io`). The user is French-speaking (Québec): **answer in French**.

One repo for everything: the home page and every product (`/wealthsimple/`, `/fizz/`…). Read `docs/architecture.md` for how it fits together, `docs/content-reference.md` for every content field, `BRAND.md` for the visual language.

## Commands
- `npm run dev` → http://localhost:4321/ (live reload) · `npm run build` (same as CI) · `npm run preview` (serves `dist/`)
- `npm run typecheck` → TypeScript (`astro check`), must stay at 0 errors
- `npm run og` → regenerate share images and logo files (local, commit the results)
- `npm run check` → audit the live site (`-- --local` against `npm run preview`)
- `npm run new-product -- <slug> [--from <slug>]` → new product folder (draft)

## Where things are
- `src/content/` — content only: `hub/<lang>.yaml`, `products/<slug>/{product.yaml, en.yaml, fr.yaml, assets/, guides/<id>/}`. Validated by `src/lib/schema.ts`.
- `src/components/ui/` — reusable building blocks; **never read product content**, everything comes from props. `src/components/sections/` — page blocks that read the model and assemble `ui/` pieces. `layout/`, `seo/`.
- `src/layouts/` — page types (Base, HubPage, ProductPage, GuidePage). `src/pages/[...path].astro` renders every HTML page from `src/lib/routes.ts`; the other files of `src/pages/` are the machine-readable files.
- `src/lib/` — logic without HTML: `model.ts` (content → resolved data), `routes.ts` (THE list of addresses), `jsonld.ts`, `markdown.ts`, `format.ts`, `i18n.ts` (interface strings), `effects/`.

## Rules
- **Never commit, push or create GitHub repos yourself**: prepare everything, then give the user the commands (`docs/publishing.md`). Pushing needs `http.sslBackend schannel` (corporate SSL inspection) and the `referralcodescanada@` remote URL (several GitHub accounts on this PC).
- **Facts come from official sources only** (company help centre / terms). Keep wording cautious when unsure; never invent a code, bonus or deadline. Bump `lastVerified` only after actually re-checking.
- **Addresses never change**: `/<slug>/` (default language), `/<slug>/fr/`, `/<slug>/[fr/]guides/<slug>/`. A removed page gets an entry in `redirects` (product.yaml). Every address comes from `src/lib/routes.ts`.
- **Guides stay on topic**: only about using the referral code and getting the bonus. No content for existing clients (e.g. "find your own code") and no financial/tax advice — see the scope rule in `.claude/skills/add-guide/SKILL.md`.
- Never use a company's logo or imitate its branding; pages state they're independent and not affiliated. Referral links keep `rel="sponsored"` (automatic for `referral.url` / `urls`).
- French copy is Canadian French, written natively (not literal translation); use a non-breaking space before `:` where a line break could orphan it. In YAML, quote a text containing ": " (or use a `>-` block).
- Components: a `ui/` component keeps its HTML, styles (`<style is:global>`, BEM class names) and script in its own file; a big one gets its own folder (`ui/Coin/`). Shared styles used by several components live in `src/styles/global.css`. When a component's rule must override `.card`, raise its specificity (`.card.mini`), never rely on file order.
- After changing components or styles, verify: `npm run build` and `npm run typecheck` clean, one `<h1>` per page, valid JSON-LD; preview desktop + mobile + dark mode + reduced motion.
- Put temporary files (screenshots, scratch) outside the repo.
