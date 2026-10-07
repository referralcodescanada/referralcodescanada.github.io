# Referral Codes Canada

Dépôt **`referralcodescanada/referralcodescanada.github.io`** → https://referralcodescanada.github.io/

Site bilingue (anglais / français canadien) qui publie des codes de parrainage personnels, construit avec [Astro](https://astro.build) et publié par GitHub Pages. Un seul dépôt pour tout : l'accueil et chaque produit.

| Page | Anglais | Français |
| --- | --- | --- |
| Accueil | `/` | `/fr/` |
| Wealthsimple — code `6QL89Q` | `/wealthsimple/` | `/wealthsimple/fr/` |
| Guide — prime non reçue | `/wealthsimple/guides/referral-bonus-not-received/` | `/wealthsimple/fr/guides/prime-de-parrainage-non-recue/` |
| Fizz — code `DNSFX` | `/fizz/` | `/fizz/fr/` |

Plus, pour Google et les IA : `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `products.json`, une version `index.md` de chaque page, `/<produit>/referral.json` et `/<produit>/llms.txt`.

## Commandes

| Commande | Effet |
| --- | --- |
| `npm install` | Une seule fois (et après une mise à jour de `package.json`) |
| `npm run dev` | Prévisualisation avec rechargement automatique → http://localhost:4321/ |
| `npm run build` | Construit le site dans `dist/` (comme GitHub Actions) |
| `npm run typecheck` | Vérifie le code TypeScript |
| `npm run og` | Régénère les images de partage et les fichiers du logo |
| `npm run check` | Vérifie le site **en ligne** (pages, sitemap, fichiers) |
| `npm run new-product -- <slug>` | Crée le dossier d'un nouveau produit (brouillon) |

Publier : `git add .`, `git commit -m "…"`, `git push`. Le déploiement prend 1 à 2 minutes (voir [docs/publishing.md](docs/publishing.md)).

## Au quotidien

| Je veux… | Je modifie… |
| --- | --- |
| Ajouter un produit | `npm run new-product -- tangerine`, puis les 3 fichiers YAML de `src/content/products/tangerine/` |
| Ajouter un guide | `src/content/products/<produit>/guides/<id>/` : `guide.yaml` + `en.md` + `fr.md` |
| Corriger une prime ou un code | `src/content/products/<produit>/product.yaml` (une seule fois pour les deux langues) |
| Changer un texte | `src/content/products/<produit>/en.yaml` ou `fr.yaml` |
| Modifier un composant (ex. la pièce) | `src/components/ui/Coin/` : toutes les pages suivent |
| Changer les couleurs du réseau | `src/config/site.ts` |

Un fichier de contenu invalide (champ manquant, faute dans un nom de champ, prime qui n'est pas un nombre…) bloque la construction, avec un message qui nomme le fichier et le champ.

## Avec Claude Code

Ouvrez ce dossier dans Claude Code et demandez, par exemple :
- « Ajoute Tangerine avec mon code XXXXX » → skill **new-referral-product**
- « Écris un guide sur … » → skill **add-guide**
- « Revérifie l'offre Wealthsimple » (chaque mois) → skill **verify-offer**
- « Est-ce que le site est bien référencé ? » → skill **seo-check**

## Documentation

- [docs/architecture.md](docs/architecture.md) : dossiers, flux de données, composants.
- [docs/content-reference.md](docs/content-reference.md) : tous les champs des fichiers de contenu.
- [docs/publishing.md](docs/publishing.md) : mise en ligne, Git multi-comptes, SSL, dépannage.
- [docs/seo.md](docs/seo.md) : Search Console, Bing, liste mensuelle.
- [BRAND.md](BRAND.md) : langue visuelle (couleurs, polices, pièce, animations).
