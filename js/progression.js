"use strict";
/* =====================================================================
   Sauvegarde, horloge (date de révélation du cadeau) et menu de la semaine
   ===================================================================== */
const PARAMS = new URLSearchParams(location.search);
const APERCU = PARAMS.has("apercu");   // ?apercu : tout est débloqué (pour tester), rien n'est sauvegardé

const Progression = {
  cle: "patisserie-maman-v2",
  etat: { etoiles: [], bonVu: false, fleches: true, scenes: [] },
  charger() {
    if (PARAMS.has("reset")) { try { localStorage.removeItem(this.cle); } catch (e) {} }
    try { const s = JSON.parse(localStorage.getItem(this.cle)); if (s) Object.assign(this.etat, s); } catch (e) {}
  },
  sauver() {
    if (APERCU) return;
    try { localStorage.setItem(this.cle, JSON.stringify(this.etat)); } catch (e) {}
  },
  joursFinis() { let n = 0; while (n < JOURS.length && this.etat.etoiles[n] > 0) n++; return n; },
  debloque(i) { return APERCU || i <= this.joursFinis(); },
  finirJour(i, etoiles) { this.etat.etoiles[i] = Math.max(this.etat.etoiles[i] || 0, etoiles); this.sauver(); },
  semaineFinie() { return APERCU || this.joursFinis() >= JOURS.length; },
};

/* L'heure vient si possible du serveur qui héberge le jeu (en-tête HTTP « Date »),
   pour ne pas dépendre de l'horloge du téléphone ; sinon, de l'appareil. */
const Horloge = {
  decalage: 0,
  cible: (() => { const t = new Date(CONFIG.dateRevelation).getTime(); return isNaN(t) ? 0 : t; })(),
  async synchroniser() {
    if (!/^https?:/.test(location.protocol)) return;
    try {
      const r = await fetch(location.href, { method: "HEAD", cache: "no-store" });
      const d = new Date(r.headers.get("Date")).getTime();
      if (!isNaN(d)) this.decalage = d - Date.now();
    } catch (e) {}
  },
  maintenant() { return Date.now() + this.decalage; },
  restant() { return this.cible - this.maintenant(); },
  ouvert() { return APERCU || this.restant() <= 0; },
  texteDate() {
    try {
      const parts = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit",
        timeZone: CONFIG.fuseauHoraire || "Europe/Paris",
      }).formatToParts(new Date(this.cible));
      const v = (t) => (parts.find((p) => p.type === t) || {}).value || "";
      const min = v("minute");
      return `${v("weekday")} ${v("day")} ${v("month")} à ${v("hour")} h${min && min !== "00" ? " " + min : ""}`;
    } catch (e) { return new Date(this.cible).toLocaleString("fr-FR"); }
  },
  texteRestant() {
    let s = Math.max(0, Math.floor(this.restant() / 1000));
    const j = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    const deux = (n) => String(n).padStart(2, "0");
    return (j ? `${j} j ` : "") + `${deux(h)} h ${deux(m)} min ${deux(s)} s`;
  },
};

/* ------------------------- Menu de la semaine ------------------------- */
const Semaine = {
  minuteur: null,
  afficher() {
    afficher("ecran-semaine");
    $("#bandeau-apercu").hidden = !APERCU;
    const fini = Progression.joursFinis();
    $("#liste-jours").innerHTML = JOURS.map((j, i) => {
      const etoiles = Progression.etat.etoiles[i] || 0;
      const etat = etoiles > 0 ? "fini" : Progression.debloque(i) ? "dispo" : "verrou";
      const droite = etat === "fini" ? `<span class="jour-etoiles">${"★".repeat(etoiles)}<span>${"★".repeat(3 - etoiles)}</span></span>`
        : etat === "dispo" ? `<span class="jour-jouer">Jouer ▶</span>` : `<img class="jour-cadenas" src="${srcImg("cadenas")}" alt="">`;
      return `<button class="jour ${etat} ${i === fini && etat === "dispo" ? "prochain" : ""}" data-jour="${i}" ${etat === "verrou" ? "disabled" : ""}>
        <img class="jour-plat" src="${srcImg(RECETTES[j.nouvelle].img)}" alt="">
        <span class="jour-texte"><small>Jour ${i + 1}</small><b>${j.titre}</b></span>${droite}</button>`;
    }).join("");
    document.querySelectorAll(".jour[data-jour]").forEach((b) => b.addEventListener("click", () => {
      Son.init(); Son.cloche();
      Cuisine.demarrerJour(+b.dataset.jour);
    }));
    this.majCadeau();
    clearInterval(this.minuteur);
    this.minuteur = setInterval(() => { if ($("#ecran-semaine").classList.contains("actif")) this.majCadeau(); else clearInterval(this.minuteur); }, 1000);
  },
  majCadeau() {
    const el = $("#carte-cadeau"), finie = Progression.semaineFinie(), ouvert = Horloge.ouvert();
    let html;
    if (finie && ouvert) {
      html = `<img src="${srcImg("cadeau")}" class="secoue-doux" alt=""><div><b>${Progression.etat.bonVu ? "Ton cadeau" : "Ton cadeau est arrivé !"}</b>
        <button class="bouton petit" id="btn-voir-cadeau">${Progression.etat.bonVu ? "Revoir mon bon" : "L'ouvrir 🎁"}</button></div>`;
    } else if (finie) {
      html = `<img src="${srcImg("cadeau")}" class="gris" alt=""><div><b>Un cadeau t'attend…</b><br>
        Il sera dévoilé ${Horloge.texteDate()}.<br><span class="compte">Encore ${Horloge.texteRestant()}</span></div>`;
    } else {
      html = `<img src="${srcImg("cadeau")}" class="gris" alt=""><div><b>Une surprise t'attend à la fin de la semaine…</b><br>
        Termine les ${JOURS.length} jours, et rendez-vous ${Horloge.texteDate()}&nbsp;!</div>`;
    }
    if (el.dataset.html !== html) {
      el.dataset.html = html; el.innerHTML = html;
      const b = $("#btn-voir-cadeau");
      if (b) b.addEventListener("click", () => Cadeau.afficher());
    }
  },
};

/* ------------------------- Écran du cadeau ------------------------- */
const Cadeau = {
  minuteur: null,
  afficher() {
    afficher("ecran-cadeau");
    clearInterval(this.minuteur);
    this.maj();
    this.minuteur = setInterval(() => { if ($("#ecran-cadeau").classList.contains("actif")) this.maj(); else clearInterval(this.minuteur); }, 1000);
  },
  maj() {
    const ouvert = Horloge.ouvert();
    $("#cadeau-verrouille").hidden = ouvert;
    $("#cadeau-pret").hidden = !ouvert;
    if (!ouvert) {
      $("#cadeau-date").textContent = Horloge.texteDate();
      $("#cadeau-compte").textContent = Horloge.texteRestant();
    }
  },
};
