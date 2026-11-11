"use strict";
/* =====================================================================
   ✏️  LA FAMILLE — prénoms, apparences, répliques et scènes
   Tout ce qui est entre guillemets peut être modifié librement.

   Apparence (avatar) :
     peau     : couleur de peau (ex. "#f2c9a8" clair, "#d9a27a" mat, "#8d5a3b" foncé)
     cheveux  : couleur des cheveux (ex. "#2b1d16" noir, "#5a3825" brun, "#a8743f" châtain clair,
                "#e2c27a" blond, "#b5462e" roux, "#a9a9a9" gris, "#eeeeee" blanc)
     coupe    : "court", "long", "carre", "boucles", "chignon", "queue", "degarni", "chauve"
     frange   : true / false
     barbe    : null, "courte", "moustache"
     lunettes : null, "rondes", "carrees"
     haut     : couleur du vêtement
   ===================================================================== */

const FAMILLE = {
  maman: {
    nom: CONFIG.prenom,
    avatar: { peau: "#f2c9a8", cheveux: "#6b4226", coupe: "carre", frange: true, barbe: null, lunettes: null, haut: "#ef7fa6" },
  },
  moi: {
    nom: "Moi",                                   // ✏️ ton prénom
    avatar: { peau: "#f2c9a8", cheveux: "#4a2e1f", coupe: "court", frange: false, barbe: null, lunettes: null, haut: "#7fb8ef" },
    recette: "cookie",
    bonjour: "Je suis ton tout premier client ! Des cookies, s'il te plaît 🍪",
    merci: "Trop bons ! Je savais que tu étais faite pour ça.",
    impatient: "Bon… je repasserai, cheffe !",
  },
  soeur: {
    nom: "Ma sœur",                               // ✏️ son prénom
    avatar: { peau: "#f2c9a8", cheveux: "#a8743f", coupe: "long", frange: false, barbe: null, lunettes: null, haut: "#b9e3c6" },
    recette: "cupcake",
    bonjour: "Coucou Maman ! Un cupcake avec plein de chantilly, s'il te plaît !",
    merci: "Mmmh ! Je reviens demain. Et après-demain. Et le jour d'après.",
    impatient: "Je reviendrai plus tard, promis !",
  },
  papa: {
    nom: "Papa",                                  // ✏️ son prénom
    avatar: { peau: "#eebd98", cheveux: "#4a3020", coupe: "court", frange: false, barbe: "courte", lunettes: null, haut: "#5b7fb5" },
    recette: "tarte",
    bonjour: "Bonjour madame la cheffe ! Une tarte aux fraises, et pas de chichis.",
    merci: "Encore meilleure que celle de la boulangerie !",
    impatient: "Je vais faire un tour et je reviens.",
  },
  copine: {
    nom: "Ma copine",                             // ✏️ son prénom
    avatar: { peau: "#f2c9a8", cheveux: "#2b1d16", coupe: "boucles", frange: false, barbe: null, lunettes: null, haut: "#f6c26b" },
    recette: "fraisier",
    bonjour: "Coucou ! Je viens goûter le fameux fraisier dont tout le monde parle.",
    merci: "Incroyable ! Il faudra absolument me donner la recette.",
    impatient: "Je repasse tout à l'heure !",
  },
};

// Les animaux (illustrations dans assets/img : winter.png, tsuki.png, suguru.png) — Winter est une chienne
const ANIMAUX_FAMILLE = {
  winter: {
    nom: "Winter", img: "winter",
    arrivee: "WOUF ! WOUF ! (Lance-la ! Lance-la ! LANCE-LA !)",
    lance: ["Winter file à 3000 ampères !", "ZOOM. Winter a déjà rapporté la balle.", "Winter ne se fatigue jamais. Jamais."],
    depart: "Winter va faire une sieste… de 30 secondes. 💤",
  },
  tsuki: {
    nom: "Tsuki", img: "tsuki", recette: "cookie",
    bonjour: "Miaou ! (Je n'ai rien mangé depuis trois jours.)",
    merci: "Miaou ! (Elle avait mangé il y a dix minutes.)",
    impatient: "Tsuki repart, outrée. Elle n'a toujours rien mangé (depuis 20 minutes).",
  },
  suguru: {
    nom: "Suguru", img: "suguru",
    bonjour: "Suguru fixe le mur. Il réfléchit à sa commande… peut-être.",
    decide: "Suguru a choisi ! (Personne ne sait comment.)",
    merci: "Suguru renifle son gâteau, le fixe longuement… puis ronronne. C'est un oui.",
    impatient: "Suguru est parti fixer un autre mur.",
  },
};

/* Qui vient quel jour : « invites » = numéro d'arrivée du client (0 = le premier),
   « winter » = Winter débarque quand ce nombre de clients a été servi. */
const PROGRAMME = [
  { invites: { 0: "moi" }, winter: [] },
  { invites: { 0: "soeur" }, winter: [2] },
  { invites: { 0: "papa", 3: "tsuki" }, winter: [1, 4] },
  { invites: { 0: "copine", 2: "suguru", 5: "tsuki" }, winter: [3] },
  { invites: { 0: "moi", 2: "soeur", 3: "tsuki", 4: "papa", 5: "suguru", 6: "copine" }, winter: [1, 5] },
];

/* Les scènes de dialogue. « qui » : une personne de FAMILLE, un animal, ou null (narration) */
const SCENES = {
  jour1: [
    { qui: null, img: "telephone", son: "sonnerie", texte: "Driiing… Driiing…" },
    { qui: "maman", texte: "Pompes funèbres marbrerie d'Antony, bon…" },
    { qui: "maman", texte: "…" },
    { qui: "maman", texte: "Ah. Mauvais contexte." },
    { qui: "moi", texte: "Maman ! Cette semaine, tu tiens une pâtisserie, pas une marbrerie 😄" },
    { qui: "moi", texte: "Et je serai ton tout premier client. Je t'explique tout !" },
  ],
  jour2: [
    { qui: "soeur", texte: "Coucou Maman ! Il paraît que tu as ouvert une pâtisserie ? J'arrive !" },
    { qui: "winter", son: "wouf", texte: "WOUF ! WOUF ! WOUF !" },
    { qui: null, img: "winter_balle", texte: "Winter vient d'entrer dans la cuisine. À 3000 ampères. Avec sa balle." },
    { qui: "soeur", texte: "Si elle te ramène sa balle, touche-la pour la lancer… sinon elle ne te lâchera pas !" },
  ],
  jour3: [
    { qui: "papa", texte: "Bonjour madame la cheffe ! On m'a dit que la tarte aux fraises était à tomber." },
    { qui: "tsuki", son: "miaou", texte: "Miaou." },
    { qui: null, img: "tsuki", texte: "Tsuki réclame à manger. Encore. Elle est si petite qu'on ne voit que ses oreilles dépasser du comptoir." },
  ],
  jour4: [
    { qui: "copine", texte: "Coucou ! Je viens goûter le fameux fraisier dont tout le monde parle." },
    { qui: "suguru", texte: "…" },
    { qui: null, img: "suguru", texte: "Suguru est entré. Il fixe le mur. Personne ne sait pourquoi." },
    { qui: "copine", texte: "Laisse-lui le temps de choisir : il est bizarre, mais tellement attendrissant." },
  ],
  jour5: [
    { qui: "moi", texte: "Maman, aujourd'hui c'est le grand jour : toute la famille vient à la pâtisserie !" },
    { qui: "soeur", texte: "Et on a une commande très spéciale…" },
    { qui: "papa", texte: "Un gâteau d'anniversaire ! Je me demande bien pour qui 🤔" },
    { qui: "winter", son: "wouf", texte: "WOUF ! (J'ai ramené ma balle. Évidemment.)" },
  ],
  // après le dernier jour, juste avant le cadeau — ✏️ un bon endroit pour vos vrais mots doux
  fin: [
    { qui: "moi", texte: "Joyeux anniversaire Maman ! Tu as été une cheffe incroyable toute la semaine." },
    { qui: "soeur", texte: "Joyeux anniversaire ! On t'aime fort ❤️" },
    { qui: "papa", texte: "Joyeux anniversaire ! La meilleure pâtissière du monde, et de loin." },
    { qui: "copine", texte: "Joyeux anniversaire ! Merci pour tous ces gâteaux 🍰" },
    { qui: "winter", son: "wouf", texte: "Wouf ! (Joyeux anniversaire. Tu lances la balle ?)" },
    { qui: "tsuki", son: "miaou", texte: "Miaou. (Joyeux anniversaire. Et sinon, on mange quand ?)" },
    { qui: "suguru", texte: "Suguru te fixe intensément. C'est sa façon de dire « joyeux anniversaire »." },
    { qui: "moi", texte: "Au fait… on t'a laissé quelque chose sur le comptoir 🎁" },
  ],
};
