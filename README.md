# La pâtisserie de Maman

Jouer : **https://anthalk.github.io/mommy-s-game-/**

Un petit jeu d'anniversaire, sur téléphone ou ordinateur. Pendant 5 jours, on
tient une pâtisserie : les clients (dont la famille et les animaux) commandent
au comptoir, et il faut préparer leurs desserts avant qu'ils perdent patience.
À la fin de la semaine, un bon cadeau pour un atelier à
[L'Atelier de Nils](https://www.latelierdenils.fr/) se débloque, à partir du
samedi 14 novembre à 18 h.

## Modifier le jeu

- `js/config.js` : prénom, textes du bon, date de révélation, patience des clients.
- `js/famille.js` : prénoms, apparences, répliques et scènes.
- `js/donnees.js` : recettes et déroulé des 5 jours.

## Le code de la carte cadeau

Il n'est jamais écrit en clair : il est chiffré, et il ne s'affiche qu'avec le
mot magique, à taper en ouvrant le cadeau.

1. Ouvrir https://anthalk.github.io/mommy-s-game-/chiffrer.html
2. Taper le code et le mot magique, puis cliquer sur « Chiffrer ».
3. Coller le résultat (il commence par `v1:`) dans `js/config.js`, ligne `codeChiffre`.

## Tester

- `?apercu` à la fin de l'adresse : tout est débloqué, rien n'est enregistré.
- `?reset` : efface la progression enregistrée sur l'appareil.

## Crédits

Illustrations 3D Fluent Emoji de Microsoft (licence MIT, voir
`assets/img/LICENCE-fluent-emoji.txt`). Les autres illustrations (farine, sucre,
chantilly, pâtes, Winter, Tsuki, Suguru…) sont générées par
`assets/sources/generer_svg.py`.
