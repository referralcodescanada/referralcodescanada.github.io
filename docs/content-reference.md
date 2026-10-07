# Référence du contenu

Tout le contenu est dans `src/content/`. Chaque fichier est validé au build par `src/lib/schema.ts` : un champ manquant, mal orthographié ou d'un mauvais type arrête la construction avec le nom du fichier et du champ.

## Placeholders et mise en forme

Utilisables dans tous les textes d'un produit et de ses guides :
`{brand}` `{code}` `{codeSpelled}` `{link}` `{linkDisplay}` `{bonus}` `{bonusCents}` `{minDeposit}` `{minDepositCents}` `{balanceDemo}` `{year}` (année du build) `{verifiedDate}` `{month}` (d'après `lastVerified`), plus chaque clé de `links` (ex. `{termsUrl}`) et de `vars`. Accueil : `{name}` `{count}` `{year}` `{month}`.

Un placeholder inconnu est une erreur de build (il ne peut donc jamais partir en ligne tel quel).

Mise en forme : `**gras**`, `*italique*`, `` `code` ``, `==surligné==`, `[texte](url)`. Les liens vers `referral.url` / `referral.urls` reçoivent automatiquement `rel="sponsored"`. Les montants sont formatés selon la langue (`$25` / `25 $`).

**YAML** : mettez entre guillemets un texte qui contient « : » suivi d'une espace, ou qui commence par `{`, `*`, `-`, `#`… (ex. `title: "Code de parrainage Wealthsimple : {code}"`), ou utilisez un bloc `>-` pour un long texte. Les dates s'écrivent `"2026-10-07"`.

## `src/config/site.ts` — le réseau

| Clé | Rôle |
| --- | --- |
| `name` | Nom du réseau (« Referral Codes Canada ») |
| `siteUrl` | `https://referralcodescanada.github.io` (variable d'environnement `SITE_URL` pour forcer une autre URL) |
| `customDomain` | Domaine personnalisé (vide = github.io). Change toutes les URLs |
| `defaultLocale` | Langue de `/` (les autres sont sous `/<langue>/`) |
| `analytics.goatcounter` | Code GoatCounter (vide = désactivé) |
| `indexNowKey` | Clé IndexNow (fichier `/<clé>.txt` publié) |
| `verification.google` / `.bing` | Valeur `content` d'une balise meta de vérification (facultatif ; les fichiers de `public/` suffisent) |
| `coin.top` / `.bottom` | Légende gravée au dos de la pièce de l'accueil |
| `theme` | Couleurs `light` et `dark`, `fonts`, `radius` (voir BRAND.md) |

## `src/content/hub/<lang>.yaml` — l'accueil

`seo` { title, description, keywords }, `hero` { eyebrow, h1, lead }, `og` (texte des images de partage), `listTitle`, `listIntro`, `about` { title, items[{icon, title, text}] }, `faq` { title, items[{q, a}] }, `footer.disclaimer`.

## `src/content/products/<slug>/product.yaml` — les faits

Le nom du dossier est l'adresse (`/<slug>/`) : lettres minuscules, chiffres, tirets.

| Clé | Rôle |
| --- | --- |
| `draft` | `true` : le produit n'est pas publié (sauf avec `INCLUDE_DRAFTS=1`) |
| `order` | Ordre sur l'accueil |
| `defaultLocale` | Langue servie à `/<slug>/` (l'autre est sous `/<slug>/<langue>/`) |
| `lastVerified` | Date de la dernière vérification de l'offre (affichée, `dateModified`, sitemap) |
| `firstPublished` | `datePublished` |
| `redirects` | Pages supprimées : `- from: guides/ancien/` / `to: ""` (chemins relatifs à `/<slug>/`) |
| `brand.name`, `brand.sameAs` | Nom de la marque et URLs officielles (données structurées) |
| `referral` | `code`, `url` (lien d'invitation, ou page d'inscription), `urls.{en,fr}` (facultatif : page d'inscription par langue, pour les produits sans lien de parrainage), `bonus`, `minDeposit` (dépôt ou forfait minimum), `currency`, `codeSpelled.{en,fr}` |
| `theme` | Remplace n'importe quelle couleur du thème du réseau (`light` / `dark`) |
| `vars` | Placeholders supplémentaires |

## `src/content/products/<slug>/<lang>.yaml` — les textes

| Clé | Rôle |
| --- | --- |
| `links` | URLs officielles (`officialUrl`, `termsUrl`, `promotionsUrl` → pied de page) + toute URL utilisée dans le texte |
| `seo` | `title` (≤ ~65 caractères), `description` (≤ ~160), `keywords`, `imageAlt` |
| `ui` | Remplace des textes d'interface pour ce produit (clés de `src/lib/i18n.ts`, ex. `codeLabel`) |
| `og` | Texte des images de partage : `eyebrow`, `line1`, `line2`, `badgeBottom` |
| `hub.summary` | Phrase des cartes de l'accueil |
| `hero` | `eyebrow`, `h1`, `lead`, `cta`, `ctaSecondary`, `note`, `chips[]` |
| `mockup` | Illustration de téléphone (facultatif) : `account`, `balanceLabel`, `balance`, `notifTitle`, `notifBody`, `amount`, `rows[]`, `sticker`, `stickerSub` |
| `facts` | « Réponse rapide » : `kicker`, `title`, `intro`, `items[{label, value}]` |
| `steps` | Comment obtenir la prime : `items[{title, text}]`, `totalTime` (ISO 8601) |
| `existing` | Ajouter le code après l'inscription (facultatif) : `cards[{icon, title, steps[]}]`, `note` |
| `rules` | Conditions : `items[]`, `note` |
| `features` | Avantages du produit. **Facultatif, à éviter** : la page parle du code, pas du produit ; jamais d'affirmations financières |
| `faq` | `items[{q, a}]` |
| `finalCta` | `title`, `text`, `button` |
| `footer.disclaimer` | Mention légale |

Une section absente (`existing`, `features`, `mockup`) disparaît de la page ; les fonds alternés se recalculent.

## `src/content/products/<slug>/guides/<id>/`

`guide.yaml` (commun aux langues) : `order`, `icon`, `lastVerified`, `published`, `draft`.

`en.md` / `fr.md` : en-tête YAML entre `---` puis l'article.

```markdown
---
slug: referral-bonus-not-received        # fin de l'URL : /<slug>/[<langue>/]guides/<slug>/
links:
  helpUrl: https://…                     # URLs utilisables comme {helpUrl}
seo: { title: …, description: …, keywords: [ … ] }
title: Titre H1
lead: Réponse directe en une ou deux phrases.
card: Résumé pour les cartes (facultatif, sinon lead)
faq:
  - q: Question?
    a: Réponse.
---

## Titre de section          ← une section + une entrée de la table des matières

Un paragraphe (mise en forme et {placeholders} permis).

- une puce
- une autre

1. une étape (affichée en carte numérotée)
2. une autre

> Une remarque mise en évidence.
```

Seuls ces éléments sont permis (un `###`, un tableau ou une image arrêtent le build) : le guide s'affiche ainsi de la même façon sur la page, dans sa version `.md` et dans `llms-full.txt`.

## Fichiers

- `src/content/products/<slug>/assets/` : `icon.svg` (original, jamais le logo de la marque), `og-en.png`, `og-fr.png`, `apple-touch-icon.png` (générés par `npm run og`). Publiés à `/<slug>/assets/`.
- `public/` : copié tel quel à la racine (fichier de vérification Google, `favicon.ico`, `assets/` = logo du réseau et dérivés). **Ne jamais supprimer** `google9224f360ccee5731.html`.

Icônes disponibles (`icon:`) : copy, check, arrow, external, gift, wallet, chart, layers, coin, auto, shield, phone, monitor, clock, info, bolt, card, user, globe, plus.
