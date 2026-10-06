# Publier

## Première mise en ligne d'un dépôt

1. Sur GitHub, connecté en tant que **referralcodescanada** : nouveau dépôt **public**, sans README. Nom = `<slug>` pour un produit, `referralcodescanada.github.io` pour l'accueil.
2. **Settings → Pages → Build and deployment → Source : GitHub Actions**, avant de pousser. Avec « Deploy from a branch », GitHub publie le README au lieu du site.
3. Dans le dossier local :
   ```bash
   git init -b main
   git config user.name "referralcodescanada"
   git config user.email "dotis+referralcodescanada@proton.me"
   git config http.sslBackend schannel
   git add .
   git commit -m "Initial site"
   git remote add origin https://referralcodescanada@github.com/<compte>/<dépôt>.git
   git push -u origin main
   ```
4. **Actions** : « Deploy to GitHub Pages » doit être vert (build, deploy, indexnow). Puis `npm run check`.

### Pourquoi ces réglages
- **Plusieurs comptes GitHub sur le poste** : le `referralcodescanada@` dans l'URL du dépôt force le gestionnaire d'identifiants à utiliser ce compte. Au premier push, choisissez *Sign in with a code* et ouvrez le lien dans une fenêtre privée connectée à **referralcodescanada**. Sinon, le navigateur risque d'autoriser un autre compte (erreur 403).
- **`http.sslBackend schannel`** : le réseau de l'entreprise inspecte le SSL (« self-signed certificate in certificate chain »). `schannel` utilise les certificats Windows, qui connaissent ce certificat. La vérification reste active. Le réglage ne s'applique qu'au dépôt.
- **user.name / user.email** propres au dépôt, pour ne pas signer avec le compte global.

## Publier une modification

```bash
npm run build      # ou npm run dev pour prévisualiser
git add .
git commit -m "…"
git push
```

Ordre quand plusieurs dépôts changent (après `npm run sync` ou un nouveau produit) : **les dépôts produits d'abord, le dépôt racine en dernier**. L'accueil lit les `referral.json` déjà publiés.

## Workflow GitHub Actions (`.github/workflows/deploy.yml`)

- Déclencheurs : push sur `main`, lancement manuel (*Run workflow*), et chaque jour à 06:17 UTC.
- `build` : `node scripts/build.mjs`, sans `npm install`. `deploy` : publication Pages. `indexnow` : ping Bing, seulement sur push ou lancement manuel.
- Après un déploiement, le cache de GitHub Pages peut servir l'ancienne version jusqu'à environ 10 minutes.

## Problèmes connus

| Symptôme | Cause / solution |
| --- | --- |
| `Get Pages site failed` / 404 sur tout le site | Pages pas activé, ou Source ≠ GitHub Actions → activer, puis *Re-run jobs* |
| Le site affiche le README | Source = « Deploy from a branch » → passer à GitHub Actions, relancer le workflow |
| `self-signed certificate in certificate chain` au push | `git config http.sslBackend schannel` |
| Push refusé (403) | Mauvais compte autorisé → URL avec `referralcodescanada@`, reconnexion via fenêtre privée |
| `⚠ … unreachable — using .cache/…` au build | Normal si un autre dépôt n'est pas encore publié ; disparaît une fois en ligne |
