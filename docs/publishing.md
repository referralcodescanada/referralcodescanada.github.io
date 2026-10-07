# Publier

## Publier une modification

```bash
npm run build      # facultatif : le même build que GitHub Actions, pour voir les erreurs avant
git add .
git commit -m "…"
git push
```

GitHub Actions (`.github/workflows/deploy.yml`) construit et publie en 1 à 2 minutes. Le cache de GitHub Pages peut servir l'ancienne version jusqu'à environ 10 minutes. Puis `npm run check`.

## Workflow GitHub Actions

- Déclencheurs : push sur `main`, lancement manuel (*Run workflow*), et chaque jour à 06:17 UTC (l'année des titres change seule).
- `build` : `npm ci` puis `npm run build`. Un fichier de contenu invalide arrête le déploiement (le site en ligne reste intact).
- `deploy` : publication Pages. `indexnow` : ping Bing/IndexNow, seulement sur push ou lancement manuel.

## Réglages du dépôt (déjà faits)

- **Settings → Pages → Source : GitHub Actions**. Avec « Deploy from a branch », GitHub publie le README au lieu du site.
- Identité et SSL propres au dépôt :
  ```bash
  git config user.name "referralcodescanada"
  git config user.email "dotis+referralcodescanada@proton.me"
  git config http.sslBackend schannel
  ```
- Remote : `https://referralcodescanada@github.com/referralcodescanada/referralcodescanada.github.io.git`.

### Pourquoi ces réglages
- **Plusieurs comptes GitHub sur le poste** : le `referralcodescanada@` dans l'URL force le gestionnaire d'identifiants à utiliser ce compte. En cas de 403, *Sign in with a code* dans une fenêtre privée connectée à **referralcodescanada**.
- **`http.sslBackend schannel`** : le réseau de l'entreprise inspecte le SSL ; `schannel` utilise les certificats Windows. La vérification reste active.

## Migration vers le dépôt unique (faite le 7 octobre 2026)

Les anciens dépôts `wealthsimple` et `fizz` ont été **supprimés** : tant qu'un dépôt nommé comme un produit a GitHub Pages configuré (même « dépublié »), GitHub lui réserve l'adresse `/<produit>/` et affiche « Site not found ». **Ne jamais recréer un dépôt portant le nom d'un produit** (`wealthsimple`, `fizz`, …) sur ce compte.

## Problèmes connus

| Symptôme | Cause / solution |
| --- | --- |
| Le build échoue avec `[content] … is invalid` ou `unknown placeholder` | Le message nomme le fichier et le champ : corriger, `npm run build` en local |
| `Get Pages site failed` / 404 sur tout le site | Pages pas activé, ou Source ≠ GitHub Actions → activer, puis *Re-run jobs* |
| `/<produit>/` affiche « Site not found · GitHub Pages » | Un dépôt du compte porte le nom du produit et a Pages configuré → le renommer ou le supprimer |
| `self-signed certificate in certificate chain` au push | `git config http.sslBackend schannel` |
| Push refusé (403) | Mauvais compte autorisé → URL avec `referralcodescanada@`, reconnexion via fenêtre privée |
