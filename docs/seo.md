# Référencement (Google, Bing, ChatGPT et autres IA)

## Une seule fois

- [ ] **Google Search Console** : propriété **préfixe d'URL** `https://referralcodescanada.github.io/`. Elle couvre l'accueil et tous les produits. Vérification par **fichier HTML** : le fichier `google9224f360ccee5731.html` est dans `public/` de chaque dépôt. Ne jamais le supprimer.
  - Une propriété **Domaine** (enregistrement DNS TXT) est **impossible** sur `github.io` : on ne contrôle pas le DNS de github.io. Elle ne sera possible qu'avec un domaine personnalisé.
  - Les propriétés par produit (`…/wealthsimple/`) sont facultatives, mais permettent de voir chaque produit séparément.
- [ ] Soumettre les sitemaps : `sitemap.xml` (racine, c'est un index qui inclut tous les produits). Dans le champ, taper le nom seulement, sans `/` devant.
- [ ] **Bing Webmaster Tools** : importer depuis Search Console. Bing alimente la recherche de ChatGPT. IndexNow est déjà automatique.
- [ ] **GoatCounter** (optionnel) : créer le site `referralcodescanada`, mettre `analytics.goatcounter` dans `hub/hub.config.mjs`, puis `npm run sync` et pousser.

## Pour chaque nouvelle page

- [ ] Après le déploiement, `npm run check`.
- [ ] Search Console → **Inspection de l'URL** → *Demander l'indexation* (page EN et FR).

## Chaque mois (skill `verify-offer`)

- [ ] Revérifier l'offre sur les pages officielles, corriger, mettre à jour `lastVerified`.
- [ ] `npm run check` dans chaque dépôt.
- [ ] Search Console : pages indexées, requêtes qui génèrent des impressions. Une requête qui a des impressions mais peu de clics est une idée de guide (skill `add-guide`) ou un titre à améliorer.

## Ce qui fait vraiment monter le classement

1. **Mentions et liens depuis d'autres sites** : annuaires de codes de parrainage, fils Reddit / RedFlagDeals qui autorisent les codes, vos profils. Toujours dans les règles des communautés, jamais de spam ni de faux avis.
2. **Fraîcheur et exactitude** : `lastVerified` récent, faits vérifiés.
3. **Contenu utile** : des guides qui répondent à de vraies questions (pas de pages quasi identiques).
4. **Ancienneté** : le classement progresse avec le temps. Comptez quelques semaines pour les requêtes précises, quelques mois pour « <marque> referral code ».
