# Referral Codes Canada — page d'accueil

Dépôt **`referralcodescanada/referralcodescanada.github.io`** → https://referralcodescanada.github.io/ (EN) · `/fr/` (FR)

C'est la racine du domaine. Elle publie :

- la **page d'accueil** bilingue qui liste tous les codes de parrainage (cartes avec code, prime, bouton copier) ;
- les fichiers que les moteurs et les IA ne lisent **qu'à la racine** : `robots.txt`, `sitemap.xml` (index qui pointe vers le sitemap de chaque produit), `llms.txt`, `llms-full.txt` ;
- `products.json`, que chaque site produit lit pour afficher les autres codes ;
- `favicon.ico` et la clé IndexNow du domaine.

Chaque produit vit dans son propre dépôt (ex. `referralcodescanada/wealthsimple`). Ce dépôt lit leurs données à la construction (`/<produit>/referral.json`) : la page d'accueil se met à jour toute seule, au plus tard le lendemain grâce à la reconstruction quotidienne.

## Mise en ligne (une seule fois)

1. Sur GitHub (compte **referralcodescanada**), créez le dépôt **public** `referralcodescanada.github.io`, sans README.
2. **Settings → Pages → Source : GitHub Actions.**
3. Dans ce dossier :
   ```bash
   git init -b main
   git config user.name "referralcodescanada"
   git config user.email "dotis+referralcodescanada@proton.me"
   git config http.sslBackend schannel
   git add .
   git commit -m "Home page"
   git remote add origin https://referralcodescanada@github.com/referralcodescanada/referralcodescanada.github.io.git
   git push -u origin main
   ```

## Réglages — `hub/hub.config.mjs`

- `publish: 'hub'` : ne pas changer dans ce dépôt.
- `products: ['wealthsimple', …]` : ajoutez chaque nouveau dépôt produit ici.
- Textes de l'accueil (`locales.en` / `locales.fr`), thème, `analytics`, `verification`, `customDomain`.
- `public/` : fichiers copiés tels quels à la racine (vérification Google, Bing…).

## Search Console

Ajoutez aussi une propriété **préfixe d'URL** `https://referralcodescanada.github.io/`. Elle couvre l'accueil **et** tous les produits. Le fichier de vérification Google de votre compte est déjà dans `public/`. Soumettez ensuite `https://referralcodescanada.github.io/sitemap.xml`.

## Local

```bash
npm run dev        # → http://localhost:4321/
```

`template/` et `scripts/` sont identiques à ceux des dépôts produits : si vous modifiez le gabarit, copiez ces deux dossiers dans les autres dépôts.
