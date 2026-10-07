---
name: verify-offer
description: Re-verify a product's referral offer against the official terms (bonus, minimum deposit, deadlines, eligibility, app paths), update the content files and guides where anything changed, bump lastVerified and rebuild. Use for the monthly refresh, when the user asks if the code/bonus is still valid, or when a promotion changed.
---

# Verify the offer (monthly refresh)

Fresh, accurate pages rank better and are what AI assistants cite. Run this about once a month per product.

## 1. Read the current claims
In `src/content/products/<slug>/`: `product.yaml` (referral numbers), `en.yaml` / `fr.yaml` (facts, steps, existing, rules, FAQ, features) and `guides/*/` (guide facts). Note the official URLs in `links`.

## 2. Check each claim on official sources
Fetch the official terms / help pages (EN and FR). Look for: changed bonus or minimum, new deadlines, new eligibility rules, closed or new promotions, renamed menus, dead links (any non-200 official URL must be replaced). Check that the user's code/link still opens the official sign-up (do not create an account).

## 3. Update
- A changed amount or code goes in `product.yaml` only: every text uses `{bonus}`, `{minDeposit}`, `{code}`.
- Fix every outdated statement in both languages; keep wording cautious where the source is ambiguous.
- Set `lastVerified: "<today>"` in `product.yaml`, and in each `guide.yaml` you re-checked.
- If the bonus amount, code or theme changed: `npm run og` to regenerate the images.
- If nothing changed, still bump `lastVerified` (the check itself is the freshness signal) — but only after actually re-checking.

## 4. Build, report, hand over
`npm run build` (no errors). Report to the user, in French: what was checked, what changed (before → after, with source links), and what stayed the same. Then: commit + push; after deploy, `npm run check`.
