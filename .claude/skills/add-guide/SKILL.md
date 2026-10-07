---
name: add-guide
description: Write a new bilingual (EN/FR) guide page for a product of the Referral Codes Canada network — picks a topic people search, verifies every fact on official sources, writes sites/<slug>/guides/<id>.mjs, builds and checks it. Use when the user wants more content, a new article/guide, or to target a new search query.
---

# Add a guide

Guides are extra pages (`/<slug>/guides/<en-slug>/`, `/<slug>/fr/guides/<fr-slug>/`) that target related searches and link back to the referral code. They're listed automatically on the product page, footer, sitemap, `llms.txt` and the home page.

## 1. Choose the topic — scope rule
These sites exist to get **new clients to use the user's referral code**. A guide is in scope only if it helps someone **use the code or get the bonus**:
- ✅ how/where to enter the code, the code isn't accepted, the bonus is late or missing, when the bonus is paid, eligibility edge cases (province, existing account, second plan), what counts toward the condition.
- ❌ content for **existing clients** — especially "find / share your own referral code": they can't use the user's code, and it teaches them to compete with it.
- ❌ **financial, tax, legal or investment advice** (TFSA/RRSP transfers, contribution room, taxes, fees comparisons, "which account should I open"): Google holds this "Your Money or Your Life" content to high standards of expertise, and errors create liability. Answer such a question in one FAQ line on the main page that links to the company's official help page instead.
- ❌ general product reviews or comparisons with competitors.
If the user asks for an out-of-scope guide, explain why (in French) and propose an in-scope alternative or a FAQ entry.

If the user didn't give a topic, propose up to 3 in-scope options with the search query each would target. Avoid near-duplicates of existing guides (`ls sites/<slug>/guides/`) and thin rewrites of the main page — Google demotes low-value pages. Two or three good guides per product are enough.

## 2. Research
Use the company's official help centre / terms / product pages. Keep the URL of every fact. Numbers, deadlines and menu paths must be confirmed; if a French app label can't be confirmed, describe the element ("the gift icon") instead of guessing its label.

## 3. Write `sites/<slug>/guides/<id>.mjs`
Copy the structure of an existing guide. Fields (see `docs/config-reference.md`):
- `order`, `icon` (name from `template/icons.mjs`), `lastVerified` (today).
- Per locale (`en`, `fr`): `slug` (URL, lowercase-dashes, in that language), `links` (official URLs used in the text, as `{placeholders}`), `seo` { title ≤ ~65 chars, description ≤ ~160, keywords }, `title` (H1), `lead` (direct answer in 1–2 sentences), `card` (one-line summary for cards), `sections` [{ h2, paragraphs, list, steps, after, note }], `faq` (2–4 questions).
- Mention the referral code naturally where relevant (`{code}`, `{bonus}`, `{minDeposit}`) — the template already adds a code callout, don't overdo it.
- Link to official sources with `[text]({linkName})`. Canadian French for `fr`, written natively (not a literal translation).

## 4. Build and check
```
npm run build
```
No warnings, no leftover `{placeholder}` in `dist/` (grep for `\{[a-zA-Z]+\}`). Preview `npm run serve` → the guide URLs printed by the build. Read the generated `index.md` of the guide.

## 5. Hand over
Tell the user (in French) what was added and the two URLs, then: commit + push this repo. After deploy, `npm run check` must list the new pages; optionally request indexing of the new URLs in Search Console.
