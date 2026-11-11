/* =====================================================================
   ✏️  PERSONNALISATION — c'est ici qu'on modifie les textes et réglages
   ===================================================================== */
const CONFIG = {
  // ----- Le bon cadeau -----
  prenom: "Maman",                          // Prénom ou surnom affiché partout
  titreBon: "Atelier pâtisserie",           // Titre du bon
  dedicace: "Pour Maman, cheffe pâtissière. Cette fois, pour de vrai.",   // Sous le titre du bon
  details: "Une carte cadeau pour un atelier pâtisserie à L'Atelier de Nils.",
  lien: "https://www.latelierdenils.fr/",   // Site où utiliser la carte cadeau

  // 👉👉👉 LE CODE DE LA CARTE CADEAU, protégé par le « mot magique »
  // 1. ouvre la page chiffrer.html du site (ex. https://ton-site.netlify.app/chiffrer.html)
  // 2. tape le code de la carte et le mot magique, clique sur « Chiffrer »
  // 3. colle le résultat ci-dessous, entre les guillemets (il commence par v1:)
  codeChiffre: "",
  indiceMotMagique: "Anthony va te le donner. Demande-lui !",   // affiché quand on demande le mot
  // (sans mot magique : laisse codeChiffre vide et mets le code en clair ici… mais il sera lisible par tous)
  code: "",

  validite: "Valable un an",                // Date ou durée de validité
  signature: "Avec tout mon amour ❤️",      // Ta signature

  // ----- La révélation -----
  // Le bon cadeau ne s'ouvre qu'à partir de cette date (heure de Paris en novembre = UTC+1)
  dateRevelation: "2026-11-14T18:00:00+01:00",
  fuseauHoraire: "Europe/Paris",

  // ----- Le jeu -----
  patience: 1,         // Patience des clients (1.5 = 50 % plus patients, 0.8 = plus pressés)
};
