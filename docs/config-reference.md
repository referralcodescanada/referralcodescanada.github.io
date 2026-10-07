# Référence de configuration

## Variables utilisables dans tous les textes

`{brand}` `{code}` `{codeSpelled}` `{link}` `{linkDisplay}` `{bonus}` `{bonusCents}` `{minDeposit}` `{minDepositCents}` `{balanceDemo}` `{year}` (année du build) `{verifiedDate}` `{month}` (d'après `lastVerified`), plus chaque clé de `locales.<langue>.links` (ex. `{termsUrl}`) et de `vars`.

Mise en forme : `**gras**`, `*italique*`, `` `code` ``, `==surligné==`, `[texte](url)`. Les liens vers `referral.url` reçoivent automatiquement `rel="sponsored"`.

Les montants sont formatés selon la langue (`$25` en anglais, `25 $` en français).

## `hub/hub.config.mjs` (partagé, sauf `publish` et `products`)

| Clé | Rôle |
| --- | --- |
| `name` | Nom du réseau (« Referral Codes Canada ») |
| `siteUrl` | `https://referralcodescanada.github.io` (variable d'environnement `SITE_URL` pour forcer une autre URL) |
| `publish` | **Par dépôt.** `'hub'` dans le dépôt racine, `'<slug>'` dans un dépôt produit |
| `products` | **Par dépôt.** Dépôt racine : liste des produits à afficher sur l'accueil |
| `customDomain` | Domaine personnalisé (vide = github.io). Change toutes les URLs |
| `analytics.goatcounter` | Code GoatCounter (vide = désactivé) |
| `coin.top` / `.bottom` | Légende gravée au dos de la pièce animée de l'accueil (arc du haut, arc du bas) |
| `indexNowKey` | Clé IndexNow (fichier `/<clé>.txt` publié) |
| `verification.google` / `.bing` | Valeur `content` d'une balise meta de vérification (optionnel ; on utilise plutôt les fichiers de `public/`) |
| `theme` | Couleurs `light` et `dark` (bg, surface, ink, muted, line, brand, brandInk, accent, accentInk, accentSoft, highlight), `fonts`, `radius` |
| `locales.en` / `.fr` | Textes de l'accueil : seo, hero, og, listTitle, listIntro, about, faq, footer |

## `sites/<slug>/site.config.mjs`

| Clé | Rôle |
| --- | --- |
| `draft` | `true` : le site n'est pas construit (sauf avec `INCLUDE_DRAFTS=1`) |
| `order` | Ordre d'affichage |
| `defaultLocale` | Langue servie à `/<slug>/` (les autres sont sous `/<slug>/<langue>/`) |
| `lastVerified` | Date de la dernière vérification de l'offre (affichée, `dateModified`, sitemap) |
| `firstPublished` | `datePublished` |
| `redirects` | Pages supprimées : `[{ from: 'guides/ancien/', to: '' }]` (chemins relatifs au site) → redirection vers `to` |
| `brand.name`, `brand.sameAs` | Nom de la marque et URLs officielles (données structurées) |
| `referral` | `code`, `url` (lien d'invitation, ou page d'inscription), `urls.{en,fr}` (facultatif : page d'inscription par langue, pour les produits sans lien de parrainage), `bonus`, `minDeposit` (dépôt ou forfait minimum), `currency`, `codeSpelled.{en,fr}` |
| `theme` | Remplace n'importe quel jeton du thème du hub |
| `vars` | Variables supplémentaires pour les textes |
| `locales.<langue>.links` | URLs officielles (`officialUrl`, `termsUrl`, `promotionsUrl`…) |
| `locales.<langue>.seo` | `title`, `description`, `keywords`, `imageAlt` |
| `locales.<langue>.ui` | Remplace des textes d'interface pour ce produit (clés de `template/i18n.mjs`, ex. `codeLabel`) |
| `locales.<langue>.og` | Texte de l'image de partage : `eyebrow`, `line1`, `line2`, `badgeBottom` |
| `locales.<langue>.hub.summary` | Phrase affichée sur les cartes de l'accueil |
| `hero` | `eyebrow`, `h1`, `lead`, `cta`, `ctaSecondary`, `note`, `chips[]` |
| `mockup` | Maquette de téléphone : `account`, `balanceLabel`, `balance`, `notifTitle`, `notifBody`, `amount`, `rows[]`, `sticker`, `stickerSub` |
| `facts` | Bloc « Réponse rapide » : `kicker`, `title`, `intro`, `items[{label,value}]` |
| `steps` | Comment obtenir la prime : `items[{title,text}]`, `totalTime` (ISO 8601) |
| `existing` | Ajouter le code après l'inscription : `cards[{icon,title,steps[]}]`, `note` (facultatif) |
| `rules` | Conditions : `items[]`, `note` |
| `features` | Avantages du produit : `items[{icon,title,text}]`. **Facultatif, à éviter** : la page parle du code, pas du produit ; jamais d'affirmations financières |
| `faq` | `items[{q,a}]` |
| `finalCta`, `footer.disclaimer` | Appel à l'action final, mention légale |

## `sites/<slug>/guides/<id>.mjs`

| Clé | Rôle |
| --- | --- |
| `order`, `icon`, `lastVerified`, `published`, `draft` | Métadonnées |
| `locales.<langue>.slug` | Fin de l'URL : `/<slug>/[<langue>/]guides/<slug>/` |
| `locales.<langue>.links` | URLs officielles utilisées dans le texte |
| `seo` | `title`, `description`, `keywords` |
| `title`, `lead`, `card` | Titre H1, chapeau (réponse directe), résumé pour les cartes |
| `sections[]` | `{ h2, paragraphs[], list[], steps[], after[], note }`, rendus dans cet ordre |
| `faq[]` | `{ q, a }` |

## Fichiers et dossiers par dépôt

- `sites/<slug>/assets/` : `icon.svg` (original, jamais le logo de la marque), `og-en.png`, `og-fr.png`, `apple-touch-icon.png` (générés par `npm run og`).
- `hub/assets/` (partagé) : **`logo.png`** = logo source du réseau (carré 1024 px, fond transparent). Dans le dépôt d'accueil, `npm run og` en dérive `logo-512.png` (données structurées, accueil), `logo-mark-128.png` (en-tête et pied de page : feuille + étiquette, lisible en petit), `favicon-192.png`, `favicon.ico`, `apple-touch-icon.png` et les images de partage de l'accueil. Le recadrage de la version petite taille est réglé par `MARK` dans `scripts/og.mjs`. Ensuite, `npm run sync`.
- **Pièce animée** : sur l'accueil, `logo-512.png` devient la face d'une pièce d'or 3D (`coin()` dans `template/layout.mjs`, styles `.coin` dans `styles.css`, animations dans `app.js`) : chute en tournoyant au chargement, rotation toutes les 9 s, inclinaison vers la souris ; chaque clic la fait bondir et la retourne sur l'autre face, où elle reste jusqu'au clic suivant. Le logo de l'en-tête et du pied de page se retourne sur son côté « $ » au survol, et copier un code fait jaillir des pièces. Tout est désactivé si le visiteur a demandé de réduire les animations.
- `public/` : copié tel quel à la racine publiée (fichiers de vérification Google, Bing…).
- `.cache/` : dernière copie valide des données des autres dépôts. À committer.

Icônes disponibles (`icon:`) : copy, check, arrow, external, gift, wallet, chart, layers, coin, auto, shield, phone, monitor, clock, info, bolt, card, user, globe, plus.
