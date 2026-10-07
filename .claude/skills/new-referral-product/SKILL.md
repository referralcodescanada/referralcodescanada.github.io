---
name: new-referral-product
description: Add a new referral-code product (Tangerine, Koho, Neo…) to the Referral Codes Canada site — researches the official referral terms, writes the bilingual content files, icon and share images, builds and previews it. Use when the user wants to add a new product / referral code.
---

# New referral product

Goal: `src/content/products/<slug>/` publishing `https://referralcodescanada.github.io/<slug>/` (EN) and `/<slug>/fr/` (FR); it appears on the home page, sitemap and llms files automatically. The user commits and pushes; never do it yourself.

## 1. Collect inputs (ask only for what's missing)
- Product name and **slug** (lowercase, dashes: becomes the URL).
- The user's **referral code** and **invite link** (exact). Never invent one. No invite link → `referral.url` = the official sign-up page, plus `urls.en` / `urls.fr`.

## 2. Research the offer — official sources only
Search the company's own site / help centre for the current referral program. Record, with the URL of each fact:
bonus for the new client (and referrer), minimum deposit or condition, deadlines (sign-up window, funding period, when the code can still be added), where the bonus is paid, eligibility (residency, age, new client), how to enter the code after sign-up (app/web path), exclusions, effective date. Also the official site, terms and promotions URLs in EN and FR.
If a fact can't be confirmed officially, leave it out or phrase it cautiously ("check the official terms"). Accuracy beats completeness: this page is cited by search engines and AI assistants.

## 3. Scaffold
```
npm run new-product -- <slug>            # copies an existing product as a draft (--from <slug> to choose)
```

## 4. Write the content (every field: `docs/content-reference.md`)
- `product.yaml`: `brand` (name, `sameAs` official URL + Wikipedia if any), `referral` (code, url, bonus, minDeposit, currency, `codeSpelled`), `lastVerified` / `firstPublished` = today, `order`, `redirects: []`. `theme`: colors inspired by the product but **not** its logo or trademarked artwork; text readable in light and dark.
- `en.yaml` and `fr.yaml` (Canadian French, written natively): seo (title ≤ ~65 chars with code + bonus + `{year}`, description ≤ ~160), og, hub.summary, hero, mockup, facts, steps, existing, rules, faq (8–12 real questions people search, the first answering "What is the <brand> referral code?" directly), finalCta, footer disclaimer (independent, not affiliated, both parties get a bonus, not financial advice). Quote YAML texts that contain ": ".
- `features` is **optional and off by default**: the page is about the code, not marketing the product. Never financial claims (fees, returns, insurance/CIPF/CDIC, interest rates).
- Remove any section that doesn't apply (e.g. `existing` if the code can't be added after sign-up) rather than inventing.
- Replace `assets/icon.svg` with a simple original 64×64 icon (rounded square, theme colors) — never the company logo.

## 5. Build and review
```
npm run og          # share images og-en.png / og-fr.png + apple-touch-icon (local, commit them)
```
Set `draft: false`, then `npm run build` (a schema or placeholder error names the file and field) and `npm run typecheck`. Preview with `npm run dev` → http://localhost:4321/<slug>/ and `/fr/`: desktop, mobile width, dark mode. Read `dist/<slug>/index.md` once: it is what AI assistants read.

## 6. Hand over to the user (in French)
1. `git add .`, `git commit -m "Add <name>"`, `git push` (one repo, see `docs/publishing.md`).
2. After the deploy: `npm run check`; in Search Console, *URL Inspection → Request indexing* for `/<slug>/` and `/<slug>/fr/` (the root property and sitemap already cover them).
Then offer to write 1–3 guides with the `add-guide` skill — only about using the code and getting the bonus.
