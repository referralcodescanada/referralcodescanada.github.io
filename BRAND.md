# Referral Codes Canada — langue visuelle

Source de vérité du design. Les valeurs vivent dans le code ; ce fichier explique les choix et les règles.

## 1. Logo

- Source unique : `public/assets/logo.png` (carré 1024 px, fond transparent, badge rond : feuille d'érable rouge + étiquette « % » marine, « REFERRALCODES CANADA »).
- `npm run og` en dérive tous les formats : `logo-512.png` (accueil, données structurées), `logo-mark-128.png` (en-tête et pied de page : feuille + étiquette seulement, lisible en petit), `favicon-192.png`, `favicon.ico`, `apple-touch-icon.png`. Le recadrage de la version petite taille est réglé par `MARK` dans `scripts/og.mjs`.
- Jamais le logo d'une entreprise listée : chaque produit a une icône originale (`assets/icon.svg`, carré arrondi aux couleurs du produit).

## 2. Couleurs

Jetons définis dans `src/config/site.ts` (`theme.light` / `theme.dark`), transformés en variables CSS par `src/lib/theme.ts`. Chaque produit peut remplacer n'importe quel jeton dans son `product.yaml` (Wealthsimple : vert ; Fizz : violet + lime), sans reprendre les éléments de marque de l'entreprise.

| Jeton | Rôle | Réseau (clair / sombre) |
| --- | --- | --- |
| `bg`, `surface` | Fond de page, cartes | `#F7F5F0` / `#0F1013` · `#FFFFFF` / `#181A1F` |
| `ink`, `muted`, `line` | Texte, texte secondaire, bordures | `#16181D` · `#5D6069` · `#E5E1D8` |
| `brand`, `brandInk` | Boutons principaux, bloc final ; texte dessus | `#16181D` / `#F2F1EC` |
| `accent`, `accentInk`, `accentSoft` | Rouge du réseau : bouton copier, puces, accents | `#C8102E` / `#FF5A6E` |
| `highlight` | Surlignage `==…==`, autocollant de prime | `#FFD166` / `#E0A82E` |

Le mode sombre suit le réglage du système (`prefers-color-scheme`). Le contraste du texte doit rester lisible dans les deux modes.

**Or de la pièce** : `--coin-gold` (dégradé conique, `src/styles/global.css`), partagé par la grande pièce, le logo de l'en-tête et les petites pièces.

## 3. Typographie

- **Fraunces** (serif, 600–800, axe optique) : titres `h1`/`h2`, montants, légende de la pièce.
- **Inter** (sans) : texte, interface.
- **JetBrains Mono** (700) : le code de parrainage, espacé (`letter-spacing`), pour qu'on le lise et le recopie sans erreur.

## 4. Composants signature

| Composant | Rôle |
| --- | --- |
| `ui/Coin/` | Le logo en pièce d'or 3D (accueil) : tranche crénelée, dos bilingue « $ » + feuille. Arrivée en tournoyant, tour lent toutes les 9 s, inclinaison vers la souris ; un clic la fait bondir (2,5 tours) et la retourne sur l'autre face. |
| `ui/LogoCoin.astro` | Logo de l'en-tête et du pied de page : se retourne sur son côté « $ » au survol, et tourne quand on copie un code. |
| `ui/CopyButton.astro` | Copie le code, message de confirmation, petites pièces qui jaillissent (`lib/effects/coin-burst.ts`). |
| `ui/CodeBox.astro` | Le code dans un cadre pointillé : l'élément le plus important de chaque page. |
| `ui/PhoneMockup.astro` | Illustration de la prime reçue (pas une vraie capture d'application). |

## 5. Mouvement

- Animations en `transform` / `opacity` seulement : elles tournent sur le GPU, sans saccade.
- Tout respecte `prefers-reduced-motion` : aucune animation, page complète et lisible.
- Les animations en continu se mettent en pause hors de l'écran (pièce) ; rien ne bouge pendant qu'on lit le dos de la pièce.
