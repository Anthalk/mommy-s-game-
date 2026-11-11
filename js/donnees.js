"use strict";
/* =====================================================================
   Recettes, ingrédients et déroulé de la semaine (les « jours »)
   ===================================================================== */

const ING = {
  farine:    { img: "farine",    nom: "Farine",    art: "la farine" },
  oeuf:      { img: "oeuf",      nom: "Œufs",      art: "les œufs" },
  sucre:     { img: "sucre",     nom: "Sucre",     art: "le sucre" },
  beurre:    { img: "beurre",    nom: "Beurre",    art: "le beurre" },
  chocolat:  { img: "chocolat",  nom: "Chocolat",  art: "le chocolat" },
  fraise:    { img: "fraise",    nom: "Fraises",   art: "les fraises" },
  chantilly: { img: "chantilly", nom: "Chantilly", art: "la chantilly" },
  bougies:   { img: "bougies",   nom: "Bougies",   art: "les bougies" },
};
// Ce qui se pose sur un gâteau cuit (au plan de travail), et pas dans le saladier
const DECORS = ["fraise", "chantilly", "bougies"];

// 3 ingrédients dans un saladier = une pâte, qui donne une fois cuite…
const PATES = {
  cookie:   { nom: "la pâte à cookies",   ingr: ["farine", "beurre", "chocolat"], img: "pate_cookie",   cuit: "cookie" },
  cupcake:  { nom: "la pâte à cupcakes",  ingr: ["farine", "oeuf", "beurre"],     img: "pate_cupcake",  cuit: "cupcake_nature" },
  sablee:   { nom: "la pâte sablée",      ingr: ["farine", "beurre", "sucre"],    img: "pate_sablee",   cuit: "fond" },
  genoise:  { nom: "la pâte à génoise",   ingr: ["farine", "oeuf", "sucre"],      img: "pate_genoise",  cuit: "genoise" },
  chocolat: { nom: "la pâte au chocolat", ingr: ["farine", "oeuf", "chocolat"],   img: "pate_chocolat", cuit: "gateau_chocolat" },
};
// … ces gâteaux sortis du four
const CUITS = {
  cookie:          { nom: "les cookies",          img: "cookie" },
  cupcake_nature:  { nom: "le cupcake nature",    img: "cupcake_nature" },
  fond:            { nom: "le fond de tarte",     img: "fond_tarte" },
  genoise:         { nom: "la génoise",           img: "genoise" },
  gateau_chocolat: { nom: "le gâteau au chocolat", img: "gateau_chocolat" },
};
// Les desserts que commandent les clients (patience en secondes)
const RECETTES = {
  cookie:       { nom: "Cookies",               art: "les ", img: "cookie",        pate: "cookie",   decors: [],                       patience: 80 },
  cupcake:      { nom: "Cupcake",               art: "le ",  img: "cupcake",       pate: "cupcake",  decors: ["chantilly"],            patience: 95 },
  tarte:        { nom: "Tarte aux fraises",     art: "la ",  img: "tarte_fraises", pate: "sablee",   decors: ["fraise"],               patience: 95 },
  fraisier:     { nom: "Fraisier",              art: "le ",  img: "fraisier",      pate: "genoise",  decors: ["chantilly", "fraise"],  patience: 115 },
  anniversaire: { nom: "Gâteau d'anniversaire", art: "le ",  img: "anniversaire",  pate: "chocolat", decors: ["chantilly", "bougies"], patience: 120 },
};

/* Plan de la cuisine (la ligne 0 est le comptoir, les clients sont au-dessus)
   K comptoir · B saladier · O four · A plan de travail · T poubelle · # meuble
   Caisses : F farine, E œufs, S sucre, U beurre, C chocolat, R fraises, H chantilly, G bougies */
const PLAN = [
  "KKKKKKK",
  ".......",
  "F.B.B.O",
  "E.....O",
  "S.A.A.#",
  "U.....#",
  "......T",
  "CRHG###",
];
const CAISSES = { F: "farine", E: "oeuf", S: "sucre", U: "beurre", C: "chocolat", R: "fraise", H: "chantilly", G: "bougies" };
const DECO_MEUBLES = { "4,6": "tulipe", "5,6": "cafe", "7,4": "panier", "7,5": "croissant", "7,6": "citron" };
const ANIMAUX = ["ours", "lapin", "renard", "chat", "panda", "koala", "grenouille", "cochon", "chien", "tigre", "lion", "vache", "hamster", "pingouin"];

/* La semaine : chaque jour ajoute une recette et des meubles.
   Les postes s'identifient par leur lettre + numéro d'apparition (B1 = 1er saladier, O2 = 2e four…). */
const JOURS = [
  { titre: "L'ouverture", clients: 4, nouvelle: "cookie", recettes: ["cookie"],
    postes: ["F", "U", "C", "B1", "O1"], simultanes: 2, patience: 1.3,
    texte: "Bienvenue dans ta pâtisserie ! Pour commencer en douceur : une seule recette, un saladier et un four." },
  { titre: "Les cupcakes", clients: 5, nouvelle: "cupcake", recettes: ["cookie", "cupcake"],
    postes: ["E", "H", "A1", "O2"], simultanes: 2, patience: 1.15,
    texte: "Nouveau : le plan de travail pour décorer, la chantilly et un deuxième four !" },
  { titre: "La tarte aux fraises", clients: 6, nouvelle: "tarte", recettes: ["cookie", "cupcake", "tarte"],
    postes: ["S", "R", "B2"], simultanes: 3, patience: 1.05,
    texte: "Nouveau : le sucre, les fraises et un deuxième saladier. Les clients arrivent maintenant par trois !" },
  { titre: "Le fraisier", clients: 7, nouvelle: "fraisier", recettes: ["cookie", "cupcake", "tarte", "fraisier"],
    postes: ["A2"], simultanes: 3, patience: 1,
    texte: "Nouveau : un deuxième plan de travail, et un dessert à décorer deux fois." },
  { titre: "Le grand jour", clients: 8, nouvelle: "anniversaire", recettes: ["cookie", "cupcake", "tarte", "fraisier", "anniversaire"],
    postes: ["G"], simultanes: 3, patience: 1,
    texte: "Dernier jour de la semaine… et une recette très spéciale : le gâteau d'anniversaire !" },
];

// Toutes les images utilisées par le jeu (préchargées)
const IMAGES = [
  ...new Set([
    ...Object.values(ING).map((i) => i.img), ...Object.values(PATES).map((p) => p.img),
    ...Object.values(CUITS).map((c) => c.img), ...Object.values(RECETTES).map((r) => r.img),
    ...Object.values(DECO_MEUBLES), ...ANIMAUX,
    "saladier", "brule", "cloche", "piece", "poubelle", "coeur", "colere", "fache", "feu", "etincelles",
    "valide", "attention", "fumee", "sablier", "cadenas", "cadeau", "fete", "etoile",
  ]),
];
