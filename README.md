# 🎂 Le gâteau de Maman — jeu d'anniversaire

Petit jeu web (téléphone ou ordinateur) en 4 étapes. À la fin, un cadeau s'ouvre
et révèle un **bon cadeau pour un atelier pâtisserie**, avec son QR code.

1. **Les courses** : déplacer le saladier pour attraper les ingrédients
   (œufs, farine, sucre, beurre, chocolat, fraises) en évitant les intrus.
2. **Fouette !** : tapoter vite pour remplir la jauge.
3. **La cuisson** : sortir le gâteau quand il est doré (la zone s'élargit à chaque raté).
4. **Les bougies** : les toucher, ou souffler pour de vrai dans le micro.

Pas de « game over » : le jeu est fait pour être fini.

## Personnaliser le bon

Tout se règle dans le bloc `CONFIG` en haut du script de `index.html` :
prénom, titre, description, code, validité, signature, nombre de bougies et
contenu du QR code (`qrContenu`).

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
`https://<utilisateur>.github.io/<dépôt>/`. Le micro (souffler les bougies)
ne fonctionne qu'en HTTPS, ce qui est le cas sur GitHub Pages.

## Crédits

QR code généré par [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
de Kazuhiko Arase (licence MIT), copié dans `vendor/qrcode.js`.
