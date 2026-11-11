/* =====================================================================
   ✏️  PERSONNALISATION — c'est ici qu'on modifie les textes et réglages
   ===================================================================== */
const CONFIG = {
  // ----- Le bon cadeau -----
  prenom: "Maman",                          // Prénom ou surnom affiché partout
  titreBon: "Atelier pâtisserie",           // Titre du bon
  details: "Un atelier pour apprendre à réaliser de délicieuses pâtisseries… et repartir avec ses créations !",
  code: "GATEAU-2026",                      // Code du bon (mets le vrai code si tu en as un)
  validite: "Valable un an",                // Date ou durée de validité
  signature: "Avec tout mon amour ❤️",      // Ta signature
  // Contenu du QR code. Laisse vide ("") pour générer automatiquement un texte
  // avec les infos ci-dessus, ou mets un lien (ex. "https://…" vers la
  // réservation ou le bon du prestataire) : le scanner ouvrira directement ce lien.
  qrContenu: "",

  // ----- La révélation -----
  // Le bon cadeau ne s'ouvre qu'à partir de cette date (heure de Paris en novembre = UTC+1)
  dateRevelation: "2026-11-14T18:00:00+01:00",
  fuseauHoraire: "Europe/Paris",

  // ----- Le jeu -----
  patience: 1,         // Patience des clients (1.5 = 50 % plus patients, 0.8 = plus pressés)
};
