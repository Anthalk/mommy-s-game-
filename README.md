# 🧁 La pâtisserie de Maman — jeu d'anniversaire

Petit jeu de gestion de cuisine (téléphone ou ordinateur). Des clients arrivent
au comptoir avec une commande et une jauge de patience ; il faut préparer leurs
desserts avant qu'ils ne s'impatientent. À la fin de la journée, un paquet
attend sur le comptoir : il révèle un **bon cadeau pour un atelier pâtisserie**
avec son QR code.

**Comment on joue** : on touche un meuble, la cheffe y va et s'en sert (on peut
enchaîner plusieurs meubles). Elle ne porte qu'une chose à la fois.

| Dessert | Saladier (3 ingrédients) | Four | Plan de travail |
|---|---|---|---|
| 🍪 Cookies | 🌾 farine + 🧈 beurre + 🍫 chocolat | 🔥 | – |
| 🧁 Cupcake | 🌾 farine + 🥚 œufs + 🍬 sucre | 🔥 | 🍦 chantilly |
| 🥧 Tarte aux fraises | 🌾 farine + 🧈 beurre + 🍬 sucre | 🔥 | 🍓 fraises |
| 🍰 Fraisier | 🌾 farine + 🥚 œufs + 🍬 sucre | 🔥 | 🍦 chantilly + 🍓 fraises |

Les recettes se débloquent au fil de la journée. Un gâteau oublié au four finit
par brûler. Le premier client est un tutoriel (sa patience ne baisse pas), des
flèches jaunes et un message en bas indiquent toujours la prochaine étape, et si
un client s'en va, les suivants deviennent un peu plus patients. Il n'y a pas
de « game over » : la journée se termine quand assez de clients sont servis.

## Personnaliser le bon

Tout se règle dans `js/config.js` :
prénom, titre, description, code, validité, signature et contenu du QR code
(`qrContenu`), ainsi que le nombre de clients à servir (`clientsAServir`) et la
patience des clients (`patience`).

- `qrContenu: ""` → le QR contient un texte récapitulant le bon.
- `qrContenu: "https://…"` → le QR ouvre ce lien (par ex. le bon ou la page de
  réservation du prestataire de l'atelier).

## Tester

- Ouvrir `index.html` dans un navigateur, ou lancer `python3 -m http.server`
  puis aller sur http://localhost:8000.
- Ajouter `?fin` à l'adresse pour aller directement au bon cadeau
  (ex. `index.html?fin`).

## Mettre en ligne (GitHub Pages)

Sur GitHub : *Settings → Pages → Build and deployment → Deploy from a branch*,
choisir la branche et le dossier `/ (root)`. Le jeu sera disponible à l'adresse
`https://<utilisateur>.github.io/<dépôt>/`.

## Crédits

QR code généré par [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
de Kazuhiko Arase (licence MIT), copié dans `vendor/qrcode.js`.
