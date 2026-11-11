# 🧁 La pâtisserie de Maman — jeu d'anniversaire

Jeu de gestion de cuisine (téléphone ou ordinateur) en **5 jours**. Des clients
arrivent au comptoir avec une commande et une jauge de patience ; il faut
préparer leurs desserts avant qu'ils ne s'impatientent. Chaque jour ajoute une
recette et des meubles. Une fois la semaine terminée, un **bon cadeau pour un
atelier pâtisserie** (avec QR code) se dévoile… mais seulement à partir de la
date choisie (`dateRevelation`, par défaut le samedi 14 novembre 2026 à 18 h,
heure de Paris). Avant, un compte à rebours s'affiche.

| Jour | Nouveauté | Saladier (3 ingrédients) | Four | Décoration |
|---|---|---|---|---|
| 1 | Cookies | farine + beurre + chocolat | ✔ | – |
| 2 | Cupcake | farine + œufs + beurre | ✔ | chantilly |
| 3 | Tarte aux fraises | farine + beurre + sucre | ✔ | fraises |
| 4 | Fraisier | farine + œufs + sucre | ✔ | chantilly + fraises |
| 5 | Gâteau d'anniversaire | farine + œufs + chocolat | ✔ | chantilly + bougies |

**Aides** : tickets de commande en haut (ingrédients cochés au fur et à mesure,
touchables pour voir la recette en grand), flèches jaunes et message en bas
(désactivables dans la pause), premier client de chaque nouvelle recette sans
limite de temps, clients plus patients après un départ. Pas de « game over ».
La progression est enregistrée dans le navigateur (on peut jouer un jour à la fois).

## Personnaliser

Tout se règle dans `js/config.js` : prénom, textes du bon, code, contenu du QR
code (`qrContenu` : texte automatique si vide, ou un lien `https://…`), date de
révélation et patience des clients. Les recettes et les jours sont dans
`js/donnees.js`.

## Tester

- Ouvrir `index.html` dans un navigateur (ou `python3 -m http.server` puis http://localhost:8000).
- `index.html?apercu` : tous les jours et le cadeau sont débloqués, rien n'est sauvegardé.
- `index.html?reset` : efface la progression enregistrée sur cet appareil.

⚠️ Le verrou de date est un verrou « de bonne foi » : le contenu du bon est
dans les fichiers du jeu, et quelqu'un de curieux peut le lire dans le code
source ou utiliser `?apercu`. L'heure est prise sur le serveur qui héberge le
jeu quand c'est possible (changer l'heure du téléphone ne suffit donc pas une
fois en ligne), sinon sur l'appareil.

## Mettre en ligne

GitHub Pages (dépôt public : *Settings → Pages → Deploy from a branch*) ou
Netlify Drop (glisser le dossier sur https://app.netlify.com/drop).

## Images

- Illustrations 3D **Fluent Emoji** de Microsoft (licence MIT, voir
  `assets/img/LICENCE-fluent-emoji.txt`).
- Farine, sucre, chantilly, bougies, tarte aux fraises, gâteaux cuits et pâtes :
  dessinés pour le jeu (`assets/sources/generer_svg.py`). Pour les régénérer :
  `python3 assets/sources/generer_svg.py`, puis
  `node assets/sources/rasteriser.js assets/sources <dossier_png>` (Playwright),
  puis `python3 assets/sources/construire_images.py <dossier_png> <dossier_fluent>`.

## Crédits

QR code : [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
de Kazuhiko Arase (licence MIT), dans `vendor/qrcode.js`.
