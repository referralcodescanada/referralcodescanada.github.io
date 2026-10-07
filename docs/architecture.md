# Architecture — Referral Codes Canada

Un seul dépôt Astro (`referralcodescanada.github.io`) publie tout le domaine `https://referralcodescanada.github.io/` : l'accueil, chaque produit sous `/<produit>/`, et les fichiers que les robots et les IA cherchent à la racine (`robots.txt`, `sitemap.xml`, `llms.txt`…). GitHub Actions construit le site à chaque push et chaque jour.

> Avant octobre 2026, chaque produit avait son propre dépôt (`wealthsimple`, `fizz`) et un « moteur » copié entre eux. Ces dépôts ont été supprimés ; les adresses publiques n'ont pas changé.

## Les trois questions : quoi, comment, où

```
src/content/      QUOI    le contenu (YAML + Markdown), validé par src/lib/schema.ts
src/components/   COMMENT l'apparence : briques ui/, sections, en-tête/pied, SEO
src/pages/        OÙ      les adresses (une route pour toutes les pages + les fichiers machine)
```

```
src/
├── config/site.ts          réseau : nom, URL, thème, statistiques, IndexNow, légende de la pièce
├── content/
│   ├── hub/<lang>.yaml     textes de l'accueil
│   └── products/<slug>/
│       ├── product.yaml    les faits (code, lien, prime, dates, couleurs, redirections)
│       ├── en.yaml, fr.yaml les textes de chaque langue
│       ├── assets/         icon.svg + images générées (npm run og)
│       └── guides/<id>/    guide.yaml + en.md + fr.md
├── content.config.ts       collections Astro (une par type de fichier)
├── components/
│   ├── ui/                 briques réutilisables : ne lisent jamais un produit (tout passe par les props)
│   ├── sections/           blocs de page : lisent le modèle et assemblent les briques
│   ├── layout/             Header, Footer
│   └── seo/                Head (meta, hreflang, Open Graph, JSON-LD de la page)
├── layouts/                Base, HubPage, ProductPage, GuidePage
├── pages/
│   ├── [...path].astro     TOUTES les pages HTML (accueil, produits, guides, redirections)
│   ├── 404.astro
│   ├── [...path]/index.md.ts   versions Markdown
│   ├── [product]/          referral.json, llms.txt, llms-full.txt, assets/<fichier>
│   └── robots.txt, sitemap.xml, llms.txt, llms-full.txt, products.json, <clé IndexNow>.txt
├── lib/                    logique sans HTML
│   ├── schema.ts           schémas de chaque fichier de contenu
│   ├── model.ts            contenu → données prêtes à afficher (placeholders, URLs, langues, résumés)
│   ├── data.ts             lit les collections Astro → modèle (une fois par build)
│   ├── routes.ts           LA liste des adresses (pages, .md, sitemap, IndexNow en dérivent)
│   ├── jsonld.ts           données structurées schema.org
│   ├── markdown.ts         versions texte pour les IA
│   ├── guide-body.ts       Markdown des guides → sections
│   ├── format.ts, i18n.ts, icons.ts, theme.ts, assets.ts, track.ts
│   └── effects/coin-burst.ts
└── styles/global.css       base, mise en page, classes partagées
```

## Flux de données

```
src/content/*.yaml, *.md ──(schémas)──▶ collections Astro ──▶ lib/data.ts ──▶ lib/model.ts ──▶ modèle
                                                                                   │
            lib/routes.ts (toutes les adresses) ◀──────────────────────────────────┤
                    │                                                              │
                    ▼                                                              ▼
   pages/[...path].astro → layouts → sections → ui       fichiers machine (sitemap, llms, json, .md)
```

- `lib/model.ts` est pur (aucun import Astro) : les scripts (`npm run og`, `check`, `indexnow`, `new-product`) l'utilisent aussi, via `scripts/content.mjs` qui lit les mêmes fichiers avec les mêmes schémas. Node 22.18+ exécute les fichiers `.ts` directement.
- Les placeholders (`{code}`, `{bonus}`…) sont résolus une seule fois dans le modèle. Un placeholder inconnu est une erreur de build.

## Composants

- **`ui/`** : un fichier `.astro` par brique, avec son HTML, ses styles (`<style is:global>`, classes BEM) et son script. Une brique complexe a son dossier : `ui/Coin/` = `Coin.astro` (HTML + styles), `CoinBack.astro` (le dos), `coin.ts` (animation). Les scripts sont regroupés et envoyés une seule fois par page, même si la brique y apparaît plusieurs fois.
- **Données structurées au plus près du contenu** : `ui/Faq.astro` émet son `FAQPage`, `ui/Steps.astro` son `HowTo`, avec le même texte que celui affiché. Le reste du graphe (Organization, WebSite, WebPage, Article, BreadcrumbList) est dans le `<head>` ; les nœuds se référencent par `@id`.
- **Styles partagés** (`.card`, `.section`, `.note`, `.hero`…) : `src/styles/global.css`. Les CSS de chaque page sont intégrés directement dans le HTML (`inlineStylesheets: 'always'`) : aucune requête de plus.

## Ce que chaque page contient pour le SEO et les IA

- Titre, description, URL canonique, `hreflang` en-CA / fr-CA / x-default, Open Graph et X avec image 1200×630.
- Données structurées : `WebPage`, `FAQPage`, `HowTo`, `BreadcrumbList`, `Organization`, `WebSite` ; `Article` pour les guides ; `CollectionPage` + `ItemList` pour l'accueil.
- Une version Markdown de chaque page (`index.md`), `llms.txt` / `llms-full.txt`, `referral.json`, `products.json`.
- Les liens de parrainage en `rel="sponsored"`, et une mention « non affilié ».
- HTML statique ; le JavaScript ne sert qu'aux interactions (copier, pièce, barre mobile).
