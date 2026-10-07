---
name: new-referral-product
description: Create a new referral-code site for another product (Fizz, Tangerine, Koho, Neo…) in its own repo of the Referral Codes Canada network — researches the official referral terms, writes the bilingual config, icon and images, registers it on the home page. Use when the user wants to add a new product / referral code.
---

# New referral product

Goal: a new repo folder `../<slug>/` that publishes `https://referralcodescanada.github.io/<slug>/` (EN) and `/<slug>/fr/` (FR), registered on the home page. The user commits and pushes; never do it yourself.

## 1. Collect inputs (ask only for what's missing)
- Product name and **slug** (lowercase, dashes: becomes the URL and the GitHub repo name).
- The user's **referral code** and **invite link** (exact). Never invent one.

## 2. Research the offer — official sources only
Search the company's own site / help centre for the current referral program. Record, with the URL of each fact:
bonus for the new client (and referrer), minimum deposit or condition, deadlines (sign-up window, funding period, when the code can still be added), where the bonus is paid, eligibility (residency, age, new client), how to enter the code after sign-up (app/web path), exclusions, effective date.
Also note the official site, terms and promotions URLs in EN and FR.
If a fact can't be confirmed officially, leave it out or phrase it cautiously ("check the official terms"). Accuracy beats completeness: this page is cited by search engines and AI assistants.

## 3. Scaffold
From any repo of the network (usually `../wealthsimple`):
```
npm run new-product -- <slug>
```
It creates `../<slug>/` (engine + `publish: '<slug>'`, draft site copied from an existing one, no guides) and adds `<slug>` to `products` in the home-page repo.

## 4. Write the content — `../<slug>/sites/<slug>/site.config.mjs`
Rewrite **everything** product-specific; see `docs/config-reference.md` for every field:
- `brand` (name, `sameAs` official URL + Wikipedia if any), `referral` (code, url, bonus, minDeposit or 0, currency, `codeSpelled`), `lastVerified` / `firstPublished` = today.
- `theme`: colors inspired by the product but **not** its logo or trademarked artwork; keep text contrast readable in light and dark.
- `locales.en` and `locales.fr` (Canadian French): seo (title ≤ ~65 chars with code + bonus + `{year}`, description ≤ ~160), og, hub.summary, hero, mockup, facts, steps, existing, rules, faq (8–12 real questions people search, the first answering "What is the <brand> referral code?" directly), finalCta, footer disclaimer (independent, not affiliated, both parties get a bonus, not financial advice).
- `features` ("Why <brand>") is **optional and off by default**: the page is about the code, not marketing the product. Only add it if the user asks, with simple, easily verifiable perks — never financial claims (fees, returns, insurance/CIPF/CDIC, interest rates).
- Remove any section that doesn't apply (e.g. `existing` if the code can't be added after sign-up) rather than inventing.
Replace `assets/icon.svg` with a simple original 64×64 icon (rounded square, theme colors) — never the company logo.

## 5. Build and review
```
cd ../<slug>
npm install
npm run og        # social images og-en.png / og-fr.png + apple-touch-icon
```
Set `draft: false`, then `npm run build` and fix warnings. Preview with `npm run serve` (http://localhost:4321/<slug>/) and check EN + FR, mobile width, dark mode. Read the generated `dist/index.md` once: it is what AI assistants will read.

## 6. Hand over to the user
Tell the user, in French, to:
1. Create the **public** GitHub repo `<slug>` on the `referralcodescanada` account; **Settings → Pages → Source: GitHub Actions**.
2. Push (see `docs/publishing.md`; identity and schannel config are per repo):
   `git init -b main`, `git config user.name "referralcodescanada"`, `git config user.email "dotis+referralcodescanada@proton.me"`, `git config http.sslBackend schannel`, `git add .`, `git commit -m "Initial site"`, `git remote add origin https://referralcodescanada@github.com/referralcodescanada/<slug>.git`, `git push -u origin main`.
3. Commit + push the home-page repo (`../referralcodescanada.github.io`) whose `products` list changed.
4. After both deploys: run `npm run check` in the new repo; submit `https://referralcodescanada.github.io/<slug>/sitemap.xml` in Search Console (the root URL-prefix property already covers it).
Then offer to write 1–3 guides with the `add-guide` skill — only about using the code and getting the bonus (see its scope rule).
