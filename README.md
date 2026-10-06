# Referral Codes Canada — page d'accueil

Dépôt **`referralcodescanada/referralcodescanada.github.io`** → https://referralcodescanada.github.io/ (EN) · `/fr/` (FR)

C'est la racine du domaine : le seul dépôt que GitHub publie à `https://referralcodescanada.github.io/`. Il rassemble les dépôts produits (`wealthsimple`, et plus tard fizz, tangerine…) :

- **page d'accueil** bilingue listant tous les codes ;
- `robots.txt`, `sitemap.xml` (index pointant vers le sitemap de chaque produit), `llms.txt`, `llms-full.txt` : les fichiers que les robots et les IA ne cherchent qu'à la racine ;
- `products.json`, lu par chaque produit pour afficher les autres codes ;
- `favicon.ico`, la clé IndexNow et le fichier de vérification Google (`public/`).

Ce dépôt n'a **pas de dossier `sites/`** : il télécharge les données de chaque produit (`/<produit>/referral.json`) au moment du build, et se reconstruit tous les jours.

## Ajouter un produit

`npm run new-product -- <slug>` (depuis n'importe quel dépôt du réseau) crée le dépôt produit et ajoute le slug à `products` dans `hub/hub.config.mjs` d'ici. Poussez le produit d'abord, puis ce dépôt.

Avec Claude Code : « Ajoute Tangerine avec mon code XXXXX » → skill **new-referral-product**.

## Commandes

`npm run dev` (→ http://localhost:4321/) · `npm run check` (site en ligne) · `npm run sync` (moteur partagé vers les autres dépôts).

## Documentation

Voir [docs/](docs/) : architecture, référence de configuration, publication, référencement. Le dossier est identique dans tous les dépôts.
