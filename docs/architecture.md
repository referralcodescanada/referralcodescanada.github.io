# Architecture — Referral Codes Canada

## Vue d'ensemble

Un **réseau de dépôts GitHub Pages**, tous sur le compte `referralcodescanada`, rangés côte à côte dans le même dossier local (`D:\referalcodescanada\`).

```
D:\referalcodescanada\
├── referralcodescanada.github.io\   → https://referralcodescanada.github.io/            (page d'accueil, publish: 'hub')
├── wealthsimple\                    → https://referralcodescanada.github.io/wealthsimple/  (publish: 'wealthsimple')
└── <produit>\                       → https://referralcodescanada.github.io/<produit>/     (publish: '<produit>')
```

- Le dépôt nommé **`<compte>.github.io`** est le seul que GitHub publie à la racine du domaine. C'est donc lui qui sert ce que les robots ne cherchent qu'à la racine : `robots.txt`, `sitemap.xml`, `llms.txt`, plus la page d'accueil.
- Chaque **produit** a son propre dépôt, publié sous `/<produit>/`.
- Tous les dépôts partagent le même **moteur** (gabarit + scripts) : même design, mêmes règles SEO. Seul le contenu change.

## Flux de données entre dépôts

```
 dépôt produit (wealthsimple)                       dépôt racine (referralcodescanada.github.io)
 ─────────────────────────────                      ─────────────────────────────────────────────
 sites/wealthsimple/site.config.mjs                 hub/hub.config.mjs → products: ['wealthsimple', …]
 sites/wealthsimple/guides/*.mjs                              │
            │ build                                           │ build : télécharge /<produit>/referral.json
            ▼                                                 ▼
 /wealthsimple/referral.json  ─────────────────────▶  page d'accueil (cartes), /sitemap.xml (index),
 /wealthsimple/sitemap.xml    ◀── référencé par ───   /llms.txt, /llms-full.txt, /products.json
            ▲                                                 │
            └──────── lit /products.json (autres codes) ◀─────┘
```

- Les deux sens passent par des fichiers JSON publics : aucun dépôt n'a besoin d'accès à un autre.
- Chaque dépôt se reconstruit **tous les jours** (workflow planifié). L'accueil reflète donc un changement de produit au plus tard le lendemain, ou immédiatement si on relance son workflow.
- Si le réseau est indisponible pendant un build, la dernière copie valide gardée dans `.cache/` (versionnée) est utilisée.

## Le moteur

| Dossier | Rôle |
| --- | --- |
| `scripts/load.mjs` | Lit les configs, résout les `{variables}`, les URLs, les langues, les guides et les produits distants |
| `scripts/build.mjs` | Génère `dist/` : pages HTML, Markdown, sitemap, robots, llms, JSON, 404 |
| `scripts/products.mjs` | Format `referral.json` / `products.json`, téléchargement avec cache |
| `scripts/og.mjs` | Images de partage PNG et icônes (local, `npm run og`) |
| `scripts/check-live.mjs` | Vérifie le site publié (`npm run check`) |
| `scripts/engine.mjs`, `sync-engine.mjs` | Ce qui est partagé, et sa copie vers les autres dépôts (`npm run sync`) |
| `scripts/new-product.mjs` | Crée un nouveau dépôt produit (`npm run new-product -- <slug>`) |
| `scripts/indexnow.mjs` | Avertit Bing/IndexNow après un déploiement |
| `template/*.mjs` | Gabarits HTML (page produit, guide, accueil, 404), Markdown, image OG |
| `template/styles.css`, `app.js`, `icons.mjs`, `i18n.mjs` | Design, copier le code, barre mobile, pièces animées, statistiques, textes d'interface EN/FR |

Aucune dépendance au moment du build : GitHub Actions lance seulement `node scripts/build.mjs`. `@resvg/resvg-js` (devDependency) sert uniquement à `npm run og`, en local.

## Ce que chaque page contient pour le SEO et les IA

- Titre, description, URL canonique, `hreflang` en-CA / fr-CA / x-default, Open Graph et Twitter avec image 1200×630.
- Données structurées : `WebPage`, `FAQPage`, `HowTo`, `BreadcrumbList`, `Organization`, `WebSite` ; `Article` pour les guides ; `CollectionPage` et `ItemList` pour l'accueil.
- Une version Markdown de chaque page (`index.md`), `llms.txt` / `llms-full.txt`, `referral.json`.
- Les liens de parrainage en `rel="sponsored"`, et une mention « non affilié ».
- HTML statique, CSS et JS en ligne, sans framework.
