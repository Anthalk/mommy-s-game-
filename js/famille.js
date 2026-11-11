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
    nom: "Anthony",
    avatar: { peau: "#f2c9a8", cheveux: "#4a2e1f", coupe: "court", frange: false, barbe: null, lunettes: null, haut: "#7fb8ef" },
    recette: "cookie",
    bonjour: "Bonjour madame. Premier client de la boutique, ça donne droit à une réduction ?",
    merci: "Encore chauds. Tu peux en refaire une fournée ? C'est pour un ami.",
    impatient: "Bon, je repasse. Garde-moi des cookies.",
  },
  soeur: {
    nom: "Minus",
    avatar: { peau: "#f2c9a8", cheveux: "#a8743f", coupe: "long", frange: false, barbe: null, lunettes: null, haut: "#b9e3c6" },
    recette: "cupcake",
    bonjour: "Un cupcake avec beaucoup de chantilly. Tu peux mettre de l'ATEEZ dans la boutique ? Non ? Bon, je chante.",
    merci: "Je le prends en photo avant de le manger, sinon personne ne va me croire.",
    impatient: "Je reviens, il y a un live d'ATEEZ dans cinq minutes. Mets-le-moi de côté !",
  },
  papa: {
    nom: "Papa",
    avatar: { peau: "#c98e64", cheveux: "#2e1f17", coupe: "court", frange: false, barbe: "courte", lunettes: null, haut: "#5b7fb5" },
    recette: "tarte",
    bonjour: "Une tarte aux fraises, s'il vous plaît. Et ne me parlez pas des pyramides, je sais des choses.",
    merci: "Elle est parfaite. Trop parfaite. Qui vous a donné cette recette ?",
    impatient: "Je reviens. Je dois vérifier un truc sur les pyramides.",
  },
  copine: {
    nom: "Camille",
    avatar: { peau: "#f2c9a8", cheveux: "#2b1d16", coupe: "long", frange: false, barbe: null, lunettes: null, haut: "#f6c26b" },
    recette: "fraisier",
    bonjour: "Un fraisier, s'il vous plaît. C'est pour un patient. Longue histoire.",
    merci: "Bon, il avait raison. Pour une fois.",
    impatient: "J'ai un patient qui m'attend, je repasse après. Ne vendez pas le dernier fraisier !",
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
    { qui: null, img: "telephone", texte: "Elle raccroche." },
    { qui: "maman", texte: "Elle va se faire enculer la vieille !" },
    { qui: "moi", texte: "Maman. Cette semaine, c'est une pâtisserie. On vend des gâteaux, pas des pierres tombales." },
    { qui: "moi", texte: "Et le premier client, c'est moi. Je t'explique comment ça marche." },
  ],
  jour2: [
    { qui: "soeur", texte: "Maman, c'est vrai que tu as ouvert une pâtisserie ? Mets-moi un cupcake de côté." },
    { qui: "soeur", texte: "Je finis le nouveau clip d'ATEEZ et j'arrive. Enfin, je le regarde encore trois fois et j'arrive." },
    { qui: "winter", son: "wouf", texte: "WOUF ! WOUF ! WOUF !" },
    { qui: null, img: "winter_balle", texte: "Winter vient d'entrer dans la cuisine. À 3000 ampères. Avec sa balle." },
    { qui: "soeur", texte: "Quand elle pose sa balle, touche-la pour la lancer. Sinon elle te suit jusqu'à la fermeture." },
  ],
  jour3: [
    { qui: "papa", texte: "Bonjour madame la cheffe. On m'a parlé d'une tarte aux fraises, je viens vérifier." },
    { qui: "papa", texte: "Remarque, une part de tarte vue de côté, c'est un triangle. Comme les pyramides." },
    { qui: "papa", texte: "Non mais les pyramides… On nous dit qu'ils les ont construites à la main. Réfléchis deux secondes." },
    { qui: null, img: "soucoupe", texte: "Personne ne sait s'il plaisante. Lui non plus, peut-être." },
    { qui: "tsuki", son: "miaou", texte: "Miaou." },
    { qui: null, img: "tsuki", texte: "Tsuki réclame à manger. Encore. Elle est si petite qu'on ne voit que ses oreilles dépasser du comptoir." },
  ],
  jour4: [
    { qui: null, texte: "Pendant ce temps, au cabinet de kiné…" },
    { qui: "copine", texte: "On inspire… et on relâche…" },
    { qui: null, img: "crac", son: "crac", texte: "*CRAC !!!*" },
    { qui: "copine", texte: "…Oups. Un gâteau ?" },
    { qui: "copine", texte: "Bon, je file chercher un fraisier pour me faire pardonner. Anthony dit que c'est le meilleur du coin." },
    { qui: "suguru", texte: "…" },
    { qui: null, img: "suguru", texte: "Suguru est entré. Il fixe le mur. Personne ne sait pourquoi." },
    { qui: "copine", texte: "Laisse-lui le temps de choisir. Il est bizarre, mais on l'aime comme ça." },
  ],
  jour5: [
    { qui: "moi", texte: "Aujourd'hui, tout le monde passe à la boutique. Oui, tout le monde. Même Suguru." },
    { qui: "soeur", texte: "Et on a passé une commande spéciale." },
    { qui: "papa", texte: "Un gâteau d'anniversaire. Je me demande bien pour qui." },
    { qui: "winter", son: "wouf", texte: "WOUF ! (J'ai ramené ma balle. Évidemment.)" },
  ],
  // après le dernier jour, juste avant le cadeau — ✏️ un bon endroit pour vos vrais mots doux
  fin: [
    { qui: "moi", texte: "Joyeux anniversaire Maman. Cinq jours de service et la boutique tient encore debout." },
    { qui: "soeur", texte: "Joyeux anniversaire ! Le cupcake du deuxième jour reste le meilleur. Presque aussi bien qu'un concert d'ATEEZ." },
    { qui: "papa", texte: "Joyeux anniversaire. Officiellement, tu as un an de plus. Officiellement." },
    { qui: "copine", texte: "Joyeux anniversaire ! Si tu as mal au dos après cette semaine de service, tu sais où me trouver." },
    { qui: "winter", son: "wouf", texte: "Wouf ! (Joyeux anniversaire. Tu lances la balle ?)" },
    { qui: "tsuki", son: "miaou", texte: "Miaou. (Joyeux anniversaire. Et sinon, on mange quand ?)" },
    { qui: "suguru", texte: "Suguru te fixe intensément. C'est sa façon de dire « joyeux anniversaire »." },
    { qui: "moi", texte: "Au fait, quelqu'un a laissé un paquet sur le comptoir. Il y a ton nom dessus." },
  ],
};
