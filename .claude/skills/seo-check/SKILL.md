---
name: seo-check
description: Audit the live Referral Codes Canada site for search engines and AI assistants — runs the automated live check (pages, canonicals, sitemap, llms.txt, verification files), reviews titles/descriptions/content, and walks through the Search Console / Bing / analytics checklist. Use when the user asks if the site is well referenced, why a page isn't indexed, or after a deploy.
---

# SEO / AI visibility check

## 1. Automated live check
```
npm run check
```
Every line must be ✔. Typical fixes:
- 404 on a page or file → the last deploy failed (Actions tab) or Pages Source isn't "GitHub Actions" (see `docs/publishing.md`); GitHub caches ~10 min after a deploy, re-run before concluding.
- A product page shows "Site not found · GitHub Pages" → a repo of the account is named like the product and has Pages configured: rename or delete it (`docs/publishing.md`).
- Sitemap missing/extra pages → rebuild and redeploy.

## 2. Content review (per product)
- `<title>` ≤ ~65 chars with brand + "referral code" + code + bonus; description ≤ ~160 with the bonus and a call to action — in EN and FR.
- The first screen answers "What is the <brand> referral code?" in plain words; the facts table is complete; FAQ answers are short and direct.
- `lastVerified` is less than ~35 days old; otherwise run the `verify-offer` skill.
- Each product has a few guides targeting real searches; propose new ones with `add-guide` if not.

## 3. External setup checklist (the user does these; explain in French)
- **Google Search Console**: URL-prefix property `https://referralcodescanada.github.io/` (covers everything) verified with the HTML file in `public/`; sitemap `sitemap.xml` submitted (type the name only, no leading `/`). A **Domain** property is impossible on `github.io` (no DNS access). Use URL Inspection → *Request indexing* for new pages.
- **Bing Webmaster Tools**: import from Search Console or verify with a file/meta tag (Bing's index powers ChatGPT search). IndexNow is pinged automatically on each push.
- **Analytics**: GoatCounter code in `analytics.goatcounter` (`src/config/site.ts`).
- **Mentions / backlinks** (biggest ranking factor, can't be automated): referral-code directories, relevant Reddit/RedFlagDeals threads that allow referral links, the user's own profiles. Never suggest spam or fake reviews.

## 4. Report
Summarize in French: what passed, what failed and how it was fixed, and the 2–3 most valuable next actions.
