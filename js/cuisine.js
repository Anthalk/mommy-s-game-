"use strict";
/* =====================================================================
   La cuisine : les clients commandent au comptoir, on prépare, on cuit,
   on décore et on sert avant qu'ils ne perdent patience.
   ===================================================================== */

const COLS = PLAN[0].length, LIGNES = PLAN.length, ZONE = 1.65;  // ZONE = hauteur (en cases) de la salle clients
const PLACES = [1, 3, 5];                                         // colonnes où se placent les clients
const VITESSE = 4.6;                                              // cases par seconde
const DUREE_MELANGE = 2.2, DUREE_CUISSON = 6, DELAI_BRULE = 13;   // secondes

/* ----------------------------- Règles ----------------------------- */
const contient = (grand, petit) => {     // petit ⊆ grand (multiensembles)
  const reste = [...grand];
  for (const x of petit) { const i = reste.indexOf(x); if (i < 0) return false; reste.splice(i, 1); }
  return true;
};
const memeEnsemble = (a, b) => a.length === b.length && contient(a, b);
const sauf = (grand, petit) => { const r = [...grand]; for (const x of petit) { const i = r.indexOf(x); if (i >= 0) r.splice(i, 1); } return r; };
const listeNoms = (ids) => ids.map((i) => ING[i].art).join(" et ");
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const cuitDe = (rec) => PATES[RECETTES[rec].pate].cuit;

function recetteDe(o) {
  if (!o || o.type !== "cuit") return null;
  for (const [k, r] of Object.entries(RECETTES)) if (PATES[r.pate].cuit === o.id && memeEnsemble(r.decors, o.decors)) return k;
  return null;
}
function peutDecorer(o, d, recettes) {
  return o && o.type === "cuit" && !o.decors.includes(d) &&
    recettes.some((k) => cuitDe(k) === o.id && RECETTES[k].decors.includes(d) && contient(RECETTES[k].decors, o.decors));
}
function aDecorer(o, recettes) {
  return o && o.type === "cuit" && recettes.some((k) => cuitDe(k) === o.id && RECETTES[k].decors.length > o.decors.length && contient(RECETTES[k].decors, o.decors));
}
function pateComplete(contenu) { return Object.keys(PATES).find((p) => memeEnsemble(PATES[p].ingr, contenu)) || null; }
function nomObjet(o) {
  if (!o) return "";
  if (o.type === "ingr") return ING[o.id].art;
  if (o.type === "pate") return PATES[o.id].nom;
  if (o.type === "brule") return "un gâteau brûlé";
  const r = recetteDe(o);
  if (r) return RECETTES[r].art + RECETTES[r].nom.toLowerCase();
  return CUITS[o.id].nom;
}

/* Dessin d'un objet (ingrédient, pâte, gâteau…) centré en (x, y) */
function dessinerObjet(c, o, x, y, s) {
  if (o.type === "ingr") return dessinerImage(c, ING[o.id].img, x, y, s);
  if (o.type === "pate") return dessinerImage(c, PATES[o.id].img, x, y, s);
  if (o.type === "brule") return dessinerImage(c, "brule", x, y, s);
  const r = recetteDe(o);
  if (r) return dessinerImage(c, RECETTES[r].img, x, y, s);
  dessinerImage(c, CUITS[o.id].img, x, y, s);
  o.decors.forEach((d, i) => dessinerImage(c, ING[d].img, x + (i - (o.decors.length - 1) / 2) * s * .42 + s * .12, y - s * .24, s * .5));
}

/* ============================== LE JEU ============================== */
const Cuisine = {
  cv: null, ctx: null, W: 0, H: 0, T: 40, ox: 0, oy: 0, gy: 0, stations: null,

  init() {
    this.cv = $("#cuisine");
    this.ctx = this.cv.getContext("2d");
    this.cv.addEventListener("pointerdown", (e) => this.toucher(e));
    const surRedim = () => { if (this.stations) { this.redim(); this.dessiner(); } };
    window.addEventListener("resize", surRedim);
    if (window.ResizeObserver) new ResizeObserver(surRedim).observe($("#zone-cuisine"));
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.mettreEnPause(true); });
    $("#btn-pause").addEventListener("click", () => this.mettreEnPause(true));
    $("#btn-reprendre").addEventListener("click", () => this.mettreEnPause(false));
    $("#btn-quitter").addEventListener("click", () => { this.enCours = false; this.pause = false; $("#ov-pause").hidden = true; Semaine.afficher(); });
    $("#btn-fleches").addEventListener("click", () => {
      Progression.etat.fleches = !Progression.etat.fleches; Progression.sauver(); this.majBoutonFleches();
    });
    $("#btn-lancer-jour").addEventListener("click", () => { Son.init(); Son.cloche(); this.lancer(); });
    $("#btn-fermer-recette").addEventListener("click", () => this.fermerRecette());
    $("#ov-recette").addEventListener("click", (e) => { if (e.target.id === "ov-recette") this.fermerRecette(); });
    $("#tickets").addEventListener("click", (e) => {
      const t = e.target.closest(".ticket[data-recette]");
      if (t) this.ouvrirRecette(t.dataset.recette);
    });
    $("#btn-jour-suivant").addEventListener("click", () => this.demarrerJour(this.jour + 1));
    $("#btn-menu").addEventListener("click", () => { $("#ov-fin").hidden = true; Semaine.afficher(); });
    $("#btn-fermer-boutique").addEventListener("click", async () => { $("#ov-fin").hidden = true; await Dialogue.jouer(SCENES.fin); Cadeau.afficher(); });
  },

  /* ----------------------- Mise en place d'un jour ----------------------- */
  demarrerJour(i) {
    this.jour = i;
    this.J = JOURS[i];
    this.recettes = this.J.recettes;
    const actifs = new Set(["K", "T"]);
    JOURS.slice(0, i + 1).forEach((j) => j.postes.forEach((p) => actifs.add(p)));
    this.stations = []; this.grille = [];
    const compte = {};
    PLAN.forEach((ligne, r) => {
      this.grille.push([]);
      [...ligne].forEach((ch, c) => {
        let st = null;
        compte[ch] = (compte[ch] || 0) + 1;
        const id = "BOA".includes(ch) ? ch + compte[ch] : ch;
        if (ch === "K") st = { type: "comptoir" };
        else if (ch === "B") st = { type: "bol", contenu: [], etat: "vide", t: 0, pate: null };
        else if (ch === "O") st = { type: "four", objet: null, etat: null, t: 0, bip: 0 };
        else if (ch === "A") st = { type: "plan", objet: null };
        else if (ch === "T") st = { type: "poubelle" };
        else if (CAISSES[ch]) st = { type: "caisse", id: CAISSES[ch] };
        else if (ch === "#") st = { type: "meuble", deco: DECO_MEUBLES[r + "," + c] };
        if (st && st.type !== "meuble" && !actifs.has(id)) st = { type: "meuble" };
        if (st) { st.c = c; st.r = r; this.stations.push(st); }
        this.grille[r].push(st);
      });
    });
    this.joueur = { x: 3.5, y: 3.5, chemin: [], file: [], action: null, tenu: null, marche: 0, dir: 1, geste: 0 };
    this.clients = []; this.effets = []; this.affectation = new Map(); this.attente = []; this.preparations = [];
    this.servis = 0; this.partis = 0; this.pieces = 0; this.numeroClient = 0;
    this.objectif = this.J.clients;
    this.facteur = this.J.patience * Math.max(.3, +CONFIG.patience || 1);
    this.facteurMax = this.facteur * 1.6;
    this.decouverteFaite = false;
    this.fini = false; this.enCours = false; this.pause = false;
    this.prochainClient = .8; this.temps = 0; this.derniereRecette = null;
    this.message = null; this.indices = { stations: [], texte: "" }; this.tIndice = 0;
    this.sigTickets = ""; this.idsTickets = [];
    this.P = PROGRAMME[i] || { invites: {}, winter: [] };
    this.winter = null; this.winterVenues = 0;
    this.bulles = []; this.bulle = null; $("#bulle").classList.remove("visible"); $("#pied").classList.remove("parle");

    afficher("ecran-cuisine");
    $("#hud-jour").textContent = `Jour ${i + 1}`;
    $("#ov-pause").hidden = true; $("#ov-fin").hidden = true; $("#ov-recette").hidden = true;
    $("#indice").textContent = "";
    // fiche d'introduction du jour
    $("#jour-titre").textContent = `Jour ${i + 1} · ${this.J.titre}`;
    $("#jour-texte").textContent = this.J.texte;
    $("#jour-regles").hidden = i !== 0;
    $("#jour-fiche").innerHTML = htmlFiche(this.J.nouvelle, true);
    $("#jour-objectif").textContent = this.objectif;
    // petite scène de dialogue avant le jour (la première fois)
    const scene = SCENES["jour" + (i + 1)];
    const vues = Progression.etat.scenes || (Progression.etat.scenes = []);
    if (scene && (APERCU || !vues.includes(i))) {
      $("#ov-jour").hidden = true;
      Dialogue.jouer(scene).then(() => {
        if (!vues.includes(i)) { vues.push(i); Progression.sauver(); }
        $("#ov-jour").hidden = false;
      });
    } else $("#ov-jour").hidden = false;
    this.majBoutonFleches();
    requestAnimationFrame(() => { this.redim(); this.majHUD(); this.majTickets(); this.dessiner(); });
  },

  lancer() {
    $("#ov-jour").hidden = true;
    this.enCours = true; this.pause = false;
    this.dernier = performance.now();
    requestAnimationFrame((t) => this.boucle(t));
  },

  mettreEnPause(oui) {
    if (!this.enCours || this.fini) return;
    if (oui && !this.pause) {
      this.pause = true;
      $("#livre").innerHTML = this.recettes.map((k) => htmlFiche(k, false)).join("");
      $("#ov-pause").hidden = false;
    } else if (!oui && this.pause) {
      this.pause = false;
      $("#ov-pause").hidden = true; $("#ov-recette").hidden = true;
      this.dernier = performance.now();
      requestAnimationFrame((t) => this.boucle(t));
    }
  },
  ouvrirRecette(k) {
    if (!this.enCours || this.fini) return;
    this.pauseAvantRecette = this.pause;
    this.mettreEnPause(true);
    $("#ov-pause").hidden = true;
    $("#recette-fiche").innerHTML = htmlFiche(k, true);
    $("#ov-recette").hidden = false;
  },
  fermerRecette() {
    $("#ov-recette").hidden = true;
    if (this.pauseAvantRecette) $("#ov-pause").hidden = false; else this.mettreEnPause(false);
  },
  majBoutonFleches() {
    $("#btn-fleches").textContent = Progression.etat.fleches ? "💡 Flèches d'aide : oui" : "💡 Flèches d'aide : non";
  },

  redim() {
    const zone = $("#zone-cuisine").getBoundingClientRect();
    if (!zone.width || !zone.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.W = zone.width; this.H = zone.height;
    this.cv.width = this.W * dpr; this.cv.height = this.H * dpr;
    this.cv.style.width = this.W + "px"; this.cv.style.height = this.H + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.T = Math.max(20, Math.floor(Math.min(this.W / COLS, this.H / (LIGNES + ZONE))));
    this.ox = Math.round((this.W - COLS * this.T) / 2);
    this.oy = Math.round((this.H - (LIGNES + ZONE) * this.T) / 2);
    this.gy = this.oy + ZONE * this.T;
  },

  /* ----------------------- Contrôles ----------------------- */
  toucher(e) {
    if (!this.enCours || this.pause || this.fini) return;
    Son.init();
    const rect = this.cv.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const c = Math.floor((x - this.ox) / this.T), r = Math.floor((y - this.gy) / this.T);
    const w = this.winter;
    if (w && w.etat === "attend" && w.balle && Math.hypot(x - this.px(w.balle.x), y - this.py(w.balle.y)) < this.T * .65) { this.lancerBalle(); return; }
    if (c < 0 || c >= COLS || y < this.oy || r >= LIGNES) return;
    let action;
    if (r < 0) action = { type: "station", st: this.grille[0][c] };            // on touche un client → comptoir
    else if (this.grille[r][c]) action = { type: "station", st: this.grille[r][c] };
    else action = { type: "sol", c, r };
    if (action.type === "station" && action.st.type === "meuble") return;
    const j = this.joueur;
    if (j.file.length >= 4) { this.dire("Doucement, une chose à la fois ! 😅"); return; }
    j.file.push(action);
    this.effets.push({ type: "onde", x: (x - this.ox) / this.T, y: (y - this.gy) / this.T, vie: .4 });
  },

  chemin(action) {
    const j = this.joueur, dep = { c: Math.floor(j.x), r: Math.floor(j.y) };
    let buts;
    if (action.type === "sol") buts = [{ c: action.c, r: action.r }];
    else if (action.st.type === "comptoir") buts = [{ c: action.st.c, r: 1 }];
    else buts = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dc, dr]) => ({ c: action.st.c + dc, r: action.st.r + dr }));
    buts = buts.filter((b) => this.libre(b.c, b.r));
    const cle = (p) => p.c + "," + p.r, estBut = new Set(buts.map(cle));
    const vus = new Map([[cle(dep), null]]), file = [dep];
    while (file.length) {
      const p = file.shift();
      if (estBut.has(cle(p))) {
        const ch = []; let q = p;
        while (q && cle(q) !== cle(dep)) { ch.unshift(q); q = vus.get(cle(q)); }
        return ch;
      }
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = { c: p.c + dc, r: p.r + dr };
        if (this.libre(n.c, n.r) && !vus.has(cle(n))) { vus.set(cle(n), p); file.push(n); }
      }
    }
    return null;
  },
  libre(c, r) { return r >= 0 && r < LIGNES && c >= 0 && c < COLS && PLAN[r][c] === "."; },

  /* ----------------------- Actions ----------------------- */
  dire(txt, duree = 2.6) { this.message = { txt, t: duree }; this.afficherIndice(); },

  interagir(st) {
    const j = this.joueur, t = j.tenu;
    const mainsPleines = () => { Son.erreur(); this.dire(`Tes mains sont pleines : tu portes ${nomObjet(t)}.`); };
    switch (st.type) {
      case "caisse":
        if (!t) { j.tenu = { type: "ingr", id: st.id }; Son.prendre(); return; }
        if (t.type === "ingr" && t.id === st.id) { j.tenu = null; Son.poser(); this.dire(`Tu as reposé ${ING[st.id].art} dans sa caisse.`); return; }
        return mainsPleines();

      case "bol":
        if (st.etat === "melange") { Son.erreur(); return this.dire("Ça mélange… encore un petit instant !"); }
        if (st.etat === "pret") {
          if (t) return mainsPleines();
          j.tenu = { type: "pate", id: st.pate };
          st.etat = "vide"; st.contenu = []; st.pate = null; Son.prendre(); return;
        }
        if (!t) {
          if (st.contenu.length) { j.tenu = { type: "ingr", id: st.contenu.pop() }; if (!st.contenu.length) st.etat = "vide"; Son.prendre(); this.dire("Tu as repris le dernier ingrédient."); }
          else { Son.erreur(); this.dire("Le saladier est vide : apporte-lui des ingrédients."); }
          return;
        }
        if (t.type !== "ingr") { Son.erreur(); return this.dire(t.type === "pate" ? "Cette pâte est prête : direction le four !" : "Ça ne va pas dans le saladier !"); }
        if (DECORS.includes(t.id)) { Son.erreur(); return this.dire(`${majuscule(ING[t.id].art)}, c'est pour décorer, sur le plan de travail.`); }
        if (!this.peutAjouter(st, t.id)) { Son.erreur(); return this.dire("Avec ce qu'il y a déjà dedans, ça ne fait aucune recette 🤔"); }
        st.contenu.push(t.id); j.tenu = null; Son.plouf();
        st.etat = "rempli";
        { const p = pateComplete(st.contenu); if (p) { st.etat = "melange"; st.t = 0; st.pate = p; } }
        return;

      case "four":
        if (!st.objet) {
          if (t && t.type === "pate") { st.objet = t; st.etat = "cuisson"; st.t = 0; st.bip = 0; j.tenu = null; Son.four(); return; }
          Son.erreur();
          return this.dire(t ? "Seule une pâte crue va au four." : "Le four est vide : apporte une pâte du saladier.");
        }
        if (st.etat === "cuisson") { Son.erreur(); return this.dire("Pas encore cuit, patience !"); }
        if (t) return mainsPleines();
        j.tenu = st.etat === "brule" ? { type: "brule" } : { type: "cuit", id: PATES[st.objet.id].cuit, decors: [] };
        st.objet = null; st.etat = null; Son.prendre();
        if (j.tenu.type === "brule") this.dire("Oups, c'est tout noir… à la poubelle !");
        return;

      case "plan":
        if (!st.objet) {
          if (t && t.type === "cuit") { st.objet = t; j.tenu = null; Son.poser(); return; }
          Son.erreur();
          if (!t) return this.dire("Le plan de travail est vide.");
          if (t.type === "ingr" && DECORS.includes(t.id)) return this.dire("Pose d'abord ici un gâteau sorti du four, puis décore-le.");
          if (t.type === "pate") return this.dire("Cette pâte doit d'abord cuire au four.");
          return this.dire("Ça ne se pose pas ici.");
        }
        if (!t) { j.tenu = st.objet; st.objet = null; Son.prendre(); return; }
        if (t.type === "ingr" && DECORS.includes(t.id)) {
          if (peutDecorer(st.objet, t.id, this.recettes)) {
            st.objet.decors.push(t.id); j.tenu = null; Son.plouf();
            const r = recetteDe(st.objet);
            if (r) this.dire(`${RECETTES[r].nom} : terminé ! ✨`);
            return;
          }
          Son.erreur(); return this.dire("Ça ne va pas sur ce gâteau.");
        }
        Son.erreur(); return this.dire("Il y a déjà quelque chose sur ce plan de travail.");

      case "poubelle":
        if (!t) { Son.erreur(); return this.dire("Rien à jeter."); }
        j.tenu = null; Son.jeter(); this.dire("Jeté ! 🗑️", 1.4); return;

      case "comptoir":
        return this.servir();
    }
  },

  peutAjouter(bol, id) {
    if (bol.etat === "melange" || bol.etat === "pret" || DECORS.includes(id)) return false;
    const essai = [...bol.contenu, id];
    return this.recettes.some((k) => contient(PATES[RECETTES[k].pate].ingr, essai));
  },

  servir() {
    const j = this.joueur, o = j.tenu, rec = recetteDe(o);
    if (!o) { Son.erreur(); return this.dire("Apporte un dessert terminé au comptoir pour servir."); }
    if (!rec) {
      Son.erreur();
      if (aDecorer(o, this.recettes)) return this.dire("Il faut encore le décorer sur le plan de travail.");
      return this.dire("Ce n'est pas encore un dessert terminé !");
    }
    const cands = this.clients.filter((c) => c.etat === "attend" && !(c.fixe > 0) && c.recette === rec)
      .sort((a, b) => a.patience / a.max - b.patience / b.max);
    if (!cands.length) { Son.erreur(); return this.dire(`Personne n'a commandé ${nomObjet(o)} pour l'instant.`); }
    const cl = cands[0];
    j.tenu = null;
    cl.etat = "part"; cl.content = true; cl.t = 0;
    this.servis++;
    const pourboire = 5 + Math.round(10 * cl.patience / cl.max);
    this.pieces += pourboire;
    Son.caisse();
    if (navigator.vibrate) navigator.vibrate(30);
    this.effets.push({ type: "texte", txt: `+${pourboire}`, x: cl.x + .5, y: -.9, vie: 1.4, couleur: "#2e9a6a" });
    for (let i = 0; i < 4; i++) this.effets.push({ type: "coeur", x: cl.x + .5 + hasard(-.4, .4), y: -.7, vx: hasard(-.4, .4), vie: hasard(.9, 1.5) });
    if (cl.perso) this.parler(cl.perso, (FAMILLE[cl.perso] || ANIMAUX_FAMILLE[cl.perso]).merci);
    this.dire(cl.decouverte && this.jour === 0
      ? "Bravo, premier client servi ! 🎉 Les suivants arrivent…"
      : choisir(["Merci ! 😋", "Délicieux ! 💖", "Un régal ! ✨", "Parfait ! 👌", "Miam ! 😍"]), cl.decouverte ? 3 : 1.6);
    this.majHUD();
    if (this.servis >= this.objectif) this.terminer();
  },

  /* ----------------------- Clients ----------------------- */
  nouveauClient() {
    const prises = new Set(this.clients.filter((c) => c.etat !== "part").map((c) => c.place));
    const libres = [0, 1, 2].filter((p) => !prises.has(p));
    if (!libres.length) return false;
    const place = choisir(libres);
    const invite = this.P.invites[this.numeroClient] || null;      // un membre de la famille ?
    const fiche = invite && (FAMILLE[invite] || ANIMAUX_FAMILLE[invite]);
    let recette, decouverte = false;
    if (!this.decouverteFaite) { recette = this.J.nouvelle; decouverte = true; this.decouverteFaite = true; }
    else if (fiche && fiche.recette && this.recettes.includes(fiche.recette)) recette = fiche.recette;
    else if (Math.random() < .35) recette = this.J.nouvelle;                 // la nouveauté revient souvent
    else recette = choisir(this.recettes.length > 1 ? this.recettes.filter((k) => k !== this.derniereRecette) : this.recettes);
    this.derniereRecette = recette;
    const pris = this.clients.map((c) => c.animal);
    const bonus = FAMILLE[invite] ? 1.5 : invite === "tsuki" ? .9 : 1;    // la famille est patiente, Tsuki beaucoup moins
    const max = RECETTES[recette].patience * this.facteur * bonus;
    this.clients.push({
      id: ++this.numeroClient, place, col: PLACES[place], x: -1, recette, decouverte,
      animal: invite ? (FAMILLE[invite] ? "perso_" + invite : fiche.img) : choisir(ANIMAUX.filter((a) => !pris.includes(a))),
      perso: invite, nom: fiche ? fiche.nom : null, fixe: invite === "suguru" ? 7 : 0, miaou: 2,
      patience: max, max, etat: "arrive", t: 0, content: false,
    });
    if (decouverte && this.jour > 0) this.dire(`Nouvelle recette : ${RECETTES[recette].nom} ! Touche son ticket en haut pour la voir en grand.`, 4.5);
    return true;
  },

  majClients(dt) {
    for (const c of this.clients) {
      c.t += dt;
      if (c.etat === "arrive") {
        c.x = Math.min(c.col, c.x + 3.2 * dt);
        if (c.x >= c.col) {
          c.etat = "attend"; Son.cloche();
          if (c.perso) this.parler(c.perso, (FAMILLE[c.perso] || ANIMAUX_FAMILLE[c.perso]).bonjour, 4.5);
          if (c.perso === "tsuki") Son.miaou();
        }
      } else if (c.etat === "attend") {
        if (c.fixe > 0) {                       // Suguru fixe le mur…
          c.fixe -= dt;
          if (c.fixe <= 0) { this.parler("suguru", ANIMAUX_FAMILLE.suguru.decide); Son.cloche(); }
          continue;
        }
        if (c.perso === "tsuki") {              // Tsuki réclame
          c.miaou -= dt;
          if (c.miaou <= 0) {
            c.miaou = hasard(4, 7); Son.miaou();
            this.effets.push({ type: "texte", txt: "Miaou !", x: c.x + .5, y: -.35, vie: 1.2, couleur: "#d65a87", piece: false });
          }
        }
        if (!c.decouverte) c.patience -= dt;
        if (c.patience <= 0) {
          c.etat = "part"; c.content = false; c.t = 0;
          this.partis++;
          this.facteur = Math.min(this.facteurMax, this.facteur + .12);  // on aide un peu après un départ
          Son.triste();
          if (c.perso) this.parler(c.perso, (FAMILLE[c.perso] || ANIMAUX_FAMILLE[c.perso]).impatient);
          else this.dire("Un client en a eu assez d'attendre… Pas grave, on continue !", 3);
          this.majHUD();
        }
      } else if (c.etat === "part" && c.t > .7) c.x += 3.2 * dt;
    }
    this.clients = this.clients.filter((c) => c.x < COLS + 1);

    if (this.fini) return;
    const enAttente = this.clients.filter((c) => c.etat !== "part");
    // pendant la découverte d'une recette (ticket bleu), personne d'autre n'arrive
    if (enAttente.some((c) => c.decouverte)) return;
    this.prochainClient -= dt;
    if (!enAttente.length && this.prochainClient > 1.5) this.prochainClient = 1.5;   // jamais de salle vide trop longtemps
    if (this.prochainClient <= 0 && enAttente.length < this.J.simultanes && this.servis + enAttente.length < this.objectif) {
      if (this.nouveauClient()) this.prochainClient = this.jour < 2 ? hasard(10, 15) : hasard(8, 12);
    }
  },

  /* ----------------------- Boucle ----------------------- */
  boucle(t) {
    if (!this.enCours || this.pause) return;
    const dt = Math.min(.05, (t - this.dernier) / 1000);
    this.dernier = t;
    this.maj(dt);
    this.dessiner();
    requestAnimationFrame((t2) => this.boucle(t2));
  },

  maj(dt) {
    this.temps += dt;
    const j = this.joueur;
    if (j.chemin.length) {
      const cible = j.chemin[0], tx = cible.c + .5, ty = cible.r + .5;
      const dx = tx - j.x, dy = ty - j.y, d = Math.hypot(dx, dy), pas = VITESSE * dt;
      if (Math.abs(dx) > .01) j.dir = Math.sign(dx);
      if (d <= pas) { j.x = tx; j.y = ty; j.chemin.shift(); } else { j.x += dx / d * pas; j.y += dy / d * pas; }
      j.marche += dt;
    } else if (j.action) {
      if (j.action.type === "station" && !this.fini) this.interagir(j.action.st);
      j.action = null; j.geste = .18;
    } else if (j.file.length) {
      j.action = j.file.shift();
      const ch = this.chemin(j.action);
      if (ch) j.chemin = ch; else j.action = null;
    } else j.marche = 0;
    j.geste = Math.max(0, j.geste - dt);

    for (const st of this.stations) {
      if (st.type === "bol" && st.etat === "melange") {
        st.t += dt;
        if (st.t >= DUREE_MELANGE) { st.etat = "pret"; Son.poser(); }
      } else if (st.type === "four" && st.objet) {
        st.t += dt;
        if (st.etat === "cuisson" && st.t >= DUREE_CUISSON) { st.etat = "cuit"; st.t = 0; Son.ding(); }
        else if (st.etat === "cuit") {
          if (st.t > DELAI_BRULE - 5 && st.t - st.bip >= 1) { st.bip = st.t; Son.alerte(); }
          if (st.t >= DELAI_BRULE) { st.etat = "brule"; Son.erreur(); this.dire("Oh non, un gâteau a brûlé dans le four !"); }
        }
      }
    }
    this.majClients(dt);
    this.majWinter(dt);
    if (this.bulle) { this.bulle.t -= dt; if (this.bulle.t <= 0) this.bulleSuivante(); }

    for (const e of this.effets) {
      e.vie -= dt;
      if (e.type === "texte") e.y -= .8 * dt;
      if (e.type === "coeur") { e.y -= 1.2 * dt; e.x += e.vx * dt; }
    }
    this.effets = this.effets.filter((e) => e.vie > 0);

    if (this.message) { this.message.t -= dt; if (this.message.t <= 0) { this.message = null; this.afficherIndice(); } }
    this.tIndice -= dt;
    if (this.tIndice <= 0) {
      this.tIndice = .2;
      this.affecter();
      this.indices = this.calculerIndices();
      this.afficherIndice();
      this.majTickets();
    }
  },

  /* ----------------------- Qui prépare quoi ? -----------------------
     Chaque commande est associée à la préparation la plus avancée qui
     peut encore lui servir : cela alimente les tickets et l'aide. */
  affecter() {
    const L = [], j = this.joueur, S = this.stations;
    if (j.tenu && j.tenu.type === "cuit") L.push({ sorte: "objet", objet: j.tenu, lieu: null });
    for (const p of S) if (p.type === "plan" && p.objet) L.push({ sorte: "objet", objet: p.objet, lieu: p });
    for (const f of S) if (f.type === "four" && f.etat === "cuit") L.push({ sorte: "objet", objet: { type: "cuit", id: PATES[f.objet.id].cuit, decors: [] }, lieu: f });
    if (j.tenu && j.tenu.type === "pate") L.push({ sorte: "pate", pate: j.tenu.id, lieu: null });
    for (const f of S) if (f.type === "four" && f.etat === "cuisson") L.push({ sorte: "pate", pate: f.objet.id, lieu: f, cuisson: true });
    for (const b of S) if (b.type === "bol" && b.pate) L.push({ sorte: "pate", pate: b.pate, lieu: b });
    for (const b of S) if (b.type === "bol" && !b.pate && b.contenu.length) L.push({ sorte: "bol", contenu: b.contenu, lieu: b });
    const ok = (e, k) => {
      const r = RECETTES[k];
      if (e.sorte === "bol") return contient(PATES[r.pate].ingr, e.contenu);
      if (e.sorte === "pate") return e.pate === r.pate;
      return e.objet.id === PATES[r.pate].cuit && contient(r.decors, e.objet.decors);
    };
    const attente = this.clients.filter((c) => (c.etat === "attend" || c.etat === "arrive") && !(c.fixe > 0))
      .sort((a, b) => a.patience / a.max - b.patience / b.max);
    const utilises = new Set();
    this.affectation = new Map();
    for (const c of attente) {
      const e = L.find((x) => !utilises.has(x) && ok(x, c.recette));
      if (e) { utilises.add(e); this.affectation.set(c, e); }
    }
    this.preparations = L;
    this.attente = attente;
  },

  progresClient(c) {
    const e = this.affectation.get(c), r = RECETTES[c.recette], ingr = PATES[r.pate].ingr;
    const p = { ingr: [], four: "non", decors: [] };
    if (!e) return p;
    if (e.sorte === "bol") p.ingr = [...e.contenu];
    else { p.ingr = [...ingr]; p.four = e.sorte === "objet" ? "ok" : e.cuisson ? "encours" : "non"; }
    if (e.sorte === "objet") p.decors = [...e.objet.decors];
    return p;
  },

  /* ----------------------- Aide contextuelle ----------------------- */
  calculerIndices() {
    const j = this.joueur, t = j.tenu, S = this.stations.filter((s) => s.type !== "meuble");
    const bols = S.filter((s) => s.type === "bol"), fours = S.filter((s) => s.type === "four"), plans = S.filter((s) => s.type === "plan");
    const caisse = (id) => S.find((s) => s.type === "caisse" && s.id === id);
    const poubelle = S.find((s) => s.type === "poubelle");
    const attente = this.attente;
    const cmds = attente.map((c) => c.recette);
    const R = (stations, texte) => ({ stations: stations.filter(Boolean), texte });
    const comptoirDe = (rec) => { const c = attente.find((x) => x.recette === rec && x.etat === "attend"); return c ? this.grille[0][c.col] : null; };
    const affectes = [...this.affectation.values()];

    if (this.fini) return R([], "");
    if (t) {
      if (t.type === "ingr") {
        if (DECORS.includes(t.id)) {
          const ok = plans.filter((p) => peutDecorer(p.objet, t.id, this.recettes));
          if (ok.length) return R(ok, `Dépose ${ING[t.id].art} sur le gâteau du plan de travail.`);
          return R([caisse(t.id)], `Rien à décorer pour l'instant : repose ${ING[t.id].art} dans sa caisse.`);
        }
        const ok = bols.filter((b) => this.peutAjouter(b, t.id)).sort((a, b) => b.contenu.length - a.contenu.length);
        if (ok.length) return R([ok[0]], `Verse ${ING[t.id].art} dans le saladier.`);
        return R([caisse(t.id)], `Aucun saladier n'en a besoin : repose ${ING[t.id].art} dans sa caisse.`);
      }
      if (t.type === "pate") {
        const ok = fours.filter((f) => !f.objet);
        return R(ok, ok.length ? `Mets ${PATES[t.id].nom} au four.` : "Les fours sont occupés : attends qu'un gâteau soit cuit.");
      }
      if (t.type === "cuit") {
        const r = recetteDe(t);
        if (r && cmds.includes(r)) return R([comptoirDe(r)], `Sers ${nomObjet(t)} au client ! 🛎️`);
        if (aDecorer(t, this.recettes)) {
          const ok = plans.filter((p) => !p.objet);
          if (ok.length) return R(ok, `Pose ${nomObjet(t)} sur le plan de travail pour le décorer.`);
          return R([poubelle], "Les plans de travail sont pleins : jette ce gâteau ou libère un plan.");
        }
        return R([poubelle, ...plans.filter((p) => !p.objet)], "Personne n'a commandé ça : pose-le sur un plan de travail ou jette-le.");
      }
      if (t.type === "brule") return R([poubelle], "C'est brûlé ! Jette-le à la poubelle.");
    }

    // ---- Mains vides : quelle est la prochaine chose utile ? ----
    const fCuit = fours.filter((f) => f.etat === "cuit");
    if (fCuit.length) return R(fCuit, fCuit.some((f) => f.t > DELAI_BRULE - 5) ? "Vite, ça va brûler ! Sors-le du four !" : "C'est cuit ! Sors-le du four.");
    const fBrule = fours.filter((f) => f.etat === "brule");
    if (fBrule.length) return R(fBrule, "Sors le gâteau brûlé du four pour le jeter.");
    const pFinis = plans.filter((p) => p.objet && cmds.includes(recetteDe(p.objet)));
    if (pFinis.length) return R(pFinis, "Un dessert est prêt : prends-le pour le servir.");
    const bPrets = bols.filter((b) => b.etat === "pret");
    if (bPrets.length && fours.some((f) => !f.objet)) return R(bPrets, "La pâte est prête : prends-la.");

    for (const c of attente) {
      const e = this.affectation.get(c), r = RECETTES[c.recette];
      if (!e) continue;
      if (e.sorte === "objet" && e.lieu && e.lieu.type === "plan") {
        const manque = sauf(r.decors, e.objet.decors);
        if (manque.length) return R(manque.map(caisse), `${r.nom} : il faut ${listeNoms(manque)} pour décorer.`);
      }
      if (e.sorte === "bol") {
        const manque = sauf(PATES[r.pate].ingr, e.contenu);
        if (manque.length) return R(manque.map(caisse), `${r.nom} : il manque ${listeNoms(manque)} dans le saladier.`);
      }
    }
    const sansPrepa = attente.filter((c) => !this.affectation.has(c));
    if (sansPrepa.length) {
      const r = RECETTES[sansPrepa[0].recette], ingr = PATES[r.pate].ingr;
      if (bols.some((b) => b.etat === "vide")) return R(ingr.map(caisse), `${r.nom} : apporte ${listeNoms(ingr)} dans un saladier.`);
      const inutile = this.preparations.find((e) => e.sorte === "bol" && !affectes.includes(e));
      if (inutile) return R([inutile.lieu], "Ce saladier ne sert à aucune commande : touche-le pour reprendre ses ingrédients.");
    }
    const besoinPlan = attente.some((c) => RECETTES[c.recette].decors.length);
    const planInutile = plans.find((p) => p.objet && !affectes.some((e) => e.lieu === p));
    if (planInutile && besoinPlan && !plans.some((p) => !p.objet)) {
      return R([planInutile], "Les plans de travail sont pleins : prends ce gâteau pour le jeter à la poubelle.");
    }
    if (fours.some((f) => f.etat === "cuisson")) return R([], "Ça cuit… prépare la suite en attendant ! ⏳");
    if (bols.some((b) => b.etat === "melange")) return R([], "Ça mélange… ⏳");
    if (!attente.length) return R([], "En attendant le prochain client… ☕");
    return R([], "");
  },

  afficherIndice() {
    const el = $("#indice");
    const txt = this.message ? this.message.txt : this.indices.texte;
    if (el.textContent !== txt) el.textContent = txt;
    el.classList.toggle("message", !!this.message);
  },

  /* ----------------------- Interface HTML ----------------------- */
  majHUD() {
    $("#hud-servis").textContent = `${this.servis}/${this.objectif}`;
    $("#hud-jauge").style.width = (100 * this.servis / this.objectif) + "%";
    $("#hud-pieces").textContent = this.pieces;
  },

  majTickets() {
    const slots = [0, 1, 2].map((p) => this.clients.find((c) => c.place === p && c.etat !== "part"));
    const sig = slots.map((c) => c ? `${c.id}|${c.fixe > 0}|${JSON.stringify(this.progresClient(c))}` : "-").join("/");
    if (sig !== this.sigTickets) {
      this.sigTickets = sig;
      const anciens = this.idsTickets || [];
      $("#tickets").innerHTML = slots.map((c) => c ? this.htmlTicket(c).replace('class="ticket', `class="ticket${anciens.includes(c.id) ? "" : " nouveau"}`) : `<div class="ticket vide"></div>`).join("");
      this.idsTickets = slots.filter(Boolean).map((c) => c.id);
    }
    // jauges de patience (mises à jour en continu)
    const tickets = $("#tickets").children;
    slots.forEach((c, i) => {
      if (!c || !tickets[i]) return;
      const bar = tickets[i].querySelector(".t-patience > div");
      if (!bar) return;
      const f = Math.max(0, c.patience / c.max);
      bar.style.width = (c.decouverte ? 100 : f * 100) + "%";
      bar.style.background = c.decouverte ? "#7fb8ef" : f > .5 ? "#5cc28f" : f > .25 ? "#f2b33d" : "#e0453a";
      tickets[i].classList.toggle("urgent", !c.decouverte && f <= .25);
    });
  },

  htmlTicket(c) {
    if (c.fixe > 0) {
      return `<div class="ticket"><div class="t-patience"><div></div></div>
        <div class="t-tete"><img class="t-plat" src="${srcImg("question")}" alt=""><span class="t-nom">${c.nom} réfléchit…</span><img class="t-client" src="${srcImg(c.animal)}" alt=""></div>
        <div class="t-ligne"><span class="t-ic"><img src="${srcImg("zzz")}" alt=""></span></div></div>`;
    }
    const r = RECETTES[c.recette], ingr = PATES[r.pate].ingr, p = this.progresClient(c);
    const reste = [...p.ingr];
    const ic = (img, ok, cls = "") => `<span class="t-ic ${ok ? "ok" : ""} ${cls}"><img src="${srcImg(img)}" alt=""></span>`;
    const lIngr = ingr.map((i) => { const k = reste.indexOf(i); if (k >= 0) reste.splice(k, 1); return ic(ING[i].img, k >= 0); }).join("");
    const lDecor = r.decors.map((d) => ic(ING[d].img, p.decors.includes(d))).join("");
    return `<div class="ticket ${c.decouverte ? "decouverte" : ""}" data-recette="${c.recette}" role="button" aria-label="Voir la recette ${r.nom}">
      <div class="t-patience"><div></div></div>
      <div class="t-tete"><img class="t-plat" src="${srcImg(r.img)}" alt=""><span class="t-nom">${r.nom}</span><img class="t-client" src="${srcImg(c.animal)}" alt=""></div>
      <div class="t-ligne">${lIngr}</div>
      <div class="t-ligne">${ic("feu", p.four === "ok", p.four === "encours" ? "encours" : "")}${lDecor ? `<i>›</i>${lDecor}` : ""}</div>
    </div>`;
  },

  /* ----------------------- Bulles de paroles ----------------------- */
  parler(qui, texte, duree = 3.8) {
    if (!texte) return;
    this.bulles.push({ qui, texte, duree });
    if (!this.bulle) this.bulleSuivante();
  },
  bulleSuivante() {
    const b = this.bulles.shift(), el = $("#bulle");
    $("#pied").classList.toggle("parle", !!b);
    if (!b) { this.bulle = null; el.classList.remove("visible"); return; }
    this.bulle = b; b.t = b.duree;
    const p = portraitDe(b.qui);
    $("#bulle-img").src = srcImg(p ? p.img : b.qui);
    $("#bulle-nom").textContent = p ? p.nom : "";
    $("#bulle-texte").textContent = b.texte;
    el.classList.remove("visible"); void el.offsetWidth; el.classList.add("visible");
  },

  /* ----------------------- Winter et sa balle ----------------------- */
  caseLibrePres(x, y) {
    const c0 = Math.floor(x), r0 = Math.floor(y);
    const v = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]
      .map(([dc, dr]) => ({ c: c0 + dc, r: r0 + dr })).filter((p) => this.libre(p.c, p.r) && p.r > 1);
    const p = v.length ? choisir(v) : { c: c0, r: r0 };
    return { x: p.c + .5, y: p.r + .5 };
  },
  lancerWinter() {
    this.winterVenues++;
    const cible = this.caseLibrePres(this.joueur.x, this.joueur.y);
    this.winter = { etat: "arrive", x: -.6, y: 6.5, cx: cible.x, cy: cible.y, t: 0, lancers: 0, porte: true, balle: null, dir: 1, wouf: 0 };
    Son.wouf();
    this.parler("winter", ANIMAUX_FAMILLE.winter.arrivee);
    this.dire("Winter t'apporte sa balle ! Touche la balle pour la lancer.", 3.5);
  },
  lancerBalle() {
    const w = this.winter;
    const loin = [];
    for (let r = 2; r < LIGNES; r++) for (let c = 0; c < COLS; c++) if (this.libre(c, r) && Math.hypot(c + .5 - w.balle.x, r + .5 - w.balle.y) >= 3) loin.push({ x: c + .5, y: r + .5 });
    const arrivee = loin.length ? choisir(loin) : { x: 3.5, y: 5.5 };
    w.balle = { x: w.balle.x, y: w.balle.y, x0: w.balle.x, y0: w.balle.y, x1: arrivee.x, y1: arrivee.y, k: 0, vol: true };
    w.etat = "lance"; w.cx = arrivee.x; w.cy = arrivee.y; w.lancers++;
    Son.wouf(); Son.prendre();
    this.pieces += 3; this.majHUD();
    this.effets.push({ type: "texte", txt: "+3", x: w.x, y: w.y - .6, vie: 1.2, couleur: "#2e9a6a" });
    this.parler("winter", ANIMAUX_FAMILLE.winter.lance[(w.lancers - 1) % ANIMAUX_FAMILLE.winter.lance.length], 2.5);
  },
  majWinter(dt) {
    const w = this.winter, j = this.joueur;
    if (!w) {
      if (!this.fini && this.winterVenues < this.P.winter.length && this.servis >= this.P.winter[this.winterVenues]) this.lancerWinter();
      return;
    }
    w.t += dt;
    const courir = (vitesse) => {
      const dx = w.cx - w.x, dy = w.cy - w.y, d = Math.hypot(dx, dy), pas = vitesse * dt;
      if (Math.abs(dx) > .01) w.dir = Math.sign(dx);
      if (d <= pas) { w.x = w.cx; w.y = w.cy; return true; }
      w.x += dx / d * pas; w.y += dy / d * pas; return false;
    };
    if (w.balle && w.balle.vol) {
      const b = w.balle; b.k = Math.min(1, b.k + dt / .6);
      b.x = b.x0 + (b.x1 - b.x0) * b.k; b.y = b.y0 + (b.y1 - b.y0) * b.k;
      if (b.k >= 1) b.vol = false;
    }
    switch (w.etat) {
      case "arrive": case "retour":
        if (courir(9)) {
          w.etat = "attend"; w.t = 0; w.porte = false;
          w.balle = { x: w.x + (w.x < 3.5 ? .42 : -.42), y: w.y + .2 };
          if (w.lancers >= 3) { w.etat = "part"; w.cx = -1; w.cy = w.y; w.porte = true; w.balle = null; this.parler("winter", ANIMAUX_FAMILLE.winter.depart); }
        }
        break;
      case "attend":
        w.wouf -= dt;
        if (w.wouf <= 0) { w.wouf = 2.6; Son.wouf(); this.effets.push({ type: "texte", txt: "Wouf !", x: w.x, y: w.y - .55, vie: .9, couleur: "#5b3a29", piece: false }); }
        // elle suit la cheffe partout avec sa balle
        if (w.t > 1 && Math.hypot(j.x - w.x, j.y - w.y) > 2.6) {
          const p = this.caseLibrePres(j.x, j.y); w.cx = p.x; w.cy = p.y; w.porte = true; w.balle = null; w.etat = "retour";
        }
        if (w.t > 35) { w.etat = "part"; w.cx = -1; w.porte = true; w.balle = null; }
        break;
      case "lance":
        if (courir(12) && !w.balle.vol) {
          w.porte = true; w.balle = null;
          const p = this.caseLibrePres(j.x, j.y); w.cx = p.x; w.cy = p.y; w.etat = "retour";
        }
        break;
      case "part":
        if (courir(10)) this.winter = null;
        break;
    }
  },
  dessinerWinter() {
    const w = this.winter; if (!w) return;
    const c = this.ctx, T = this.T;
    if (w.balle) {
      const b = w.balle, h = b.vol ? Math.sin(Math.PI * b.k) * 1.4 : 0;
      c.fillStyle = "rgba(91,58,41,.2)"; c.beginPath(); c.ellipse(this.px(b.x), this.py(b.y) + T * .12, T * .12, T * .04, 0, 0, Math.PI * 2); c.fill();
      dessinerImage(c, "balle", this.px(b.x), this.py(b.y - h), T * .3);
      if (w.etat === "attend" && Progression.etat.fleches) {   // petit cercle pour montrer qu'on peut la toucher
        c.strokeStyle = `rgba(255,179,0,${.5 + .5 * Math.sin(this.temps * 6)})`; c.lineWidth = 3;
        c.beginPath(); c.arc(this.px(b.x), this.py(b.y), T * .28, 0, Math.PI * 2); c.stroke();
      }
    }
    const court = w.etat !== "attend";
    const saut = court ? Math.abs(Math.sin(this.temps * 18)) * T * .14 : Math.abs(Math.sin(this.temps * 9)) * T * .04;
    const x = this.px(w.x), y = this.py(w.y) - saut;
    c.fillStyle = "rgba(91,58,41,.18)"; c.beginPath(); c.ellipse(this.px(w.x), this.py(w.y) + T * .3, T * .24, T * .07, 0, 0, Math.PI * 2); c.fill();
    if (court) { dessinerImage(c, "eclair", x - w.dir * T * .42, y - T * .18, T * .3); dessinerImage(c, "eclair", x - w.dir * T * .55, y + T * .1, T * .22); }
    dessinerImage(c, w.porte ? "winter_balle" : "winter", x, y, T * .78);
  },

  /* ----------------------- Fin de journée ----------------------- */
  async terminer() {
    this.fini = true;
    this.joueur.file = [];
    const etoiles = this.partis === 0 ? 3 : this.partis <= 2 ? 2 : 1;
    Progression.finirJour(this.jour, etoiles);
    await pause(1600);
    this.enCours = false;
    Son.victoire();
    const dernier = this.jour === JOURS.length - 1;
    $("#fin-titre").textContent = dernier ? "La semaine est finie ! 🎉" : `Jour ${this.jour + 1} réussi ! 🎉`;
    $("#fin-etoiles").innerHTML = "★".repeat(etoiles) + `<span>${"★".repeat(3 - etoiles)}</span>`;
    $("#fin-servis").textContent = this.servis;
    $("#fin-partis").textContent = this.partis;
    $("#fin-pieces").textContent = this.pieces;
    $("#fin-texte").textContent = dernier
      ? "Quelle semaine ! Il est temps de fermer la boutique… mais quelqu'un a laissé un paquet sur le comptoir."
      : `Prochain jour : ${JOURS[this.jour + 1].titre.toLowerCase()}.`;
    $("#btn-jour-suivant").hidden = dernier;
    $("#btn-fermer-boutique").hidden = !dernier;
    $("#btn-menu").hidden = dernier;
    $("#ov-fin").hidden = false;
    lancerConfettis(120);
  },

  /* ============================ DESSIN ============================ */
  px(c) { return this.ox + c * this.T; },
  py(r) { return this.gy + r * this.T; },

  dessiner() {
    if (!this.stations) return;
    const c = this.ctx, T = this.T;
    c.clearRect(0, 0, this.W, this.H);
    c.save();
    rectArrondi(c, this.ox, this.oy, COLS * T, (LIGNES + ZONE) * T, 16);
    c.clip();
    c.fillStyle = "#fde3e7"; c.fillRect(this.ox, this.oy, COLS * T, ZONE * T);
    c.fillStyle = "#fbd2da";
    for (let x = 0; x < COLS * 2; x += 2) c.fillRect(this.ox + x * T / 2, this.oy, T / 4, ZONE * T);
    for (let r = 0; r < LIGNES; r++) for (let col = 0; col < COLS; col++) {
      c.fillStyle = (r + col) % 2 ? "#f7e7d6" : "#fdf3e7";
      c.fillRect(this.px(col), this.py(r), T, T);
    }
    this.dessinerClients();
    for (const st of this.stations) this.dessinerStation(st);
    for (const cl of this.clients) if (cl.nom) this.etiquette(cl.nom, this.px(cl.x + .5), this.gy + T * .78);   // prénoms sur le comptoir
    if (Progression.etat.fleches) this.dessinerContours();
    this.dessinerFile();
    this.dessinerWinter();
    this.dessinerJoueur();
    this.dessinerEffets();
    c.restore();
  },

  baseMeuble(x, y) {
    const c = this.ctx, T = this.T;
    c.fillStyle = "#e3c4a5"; rectArrondi(c, x + 1, y + 1, T - 2, T - 2, T * .14); c.fill();
    c.fillStyle = "#f3e0cc"; rectArrondi(c, x + 1, y + 1, T - 2, T * .8, T * .14); c.fill();
  },

  etiquette(texte, cx, y) {
    const c = this.ctx, T = this.T, taille = Math.max(9, Math.min(14, T * .19));
    c.font = `800 ${taille}px Nunito, sans-serif`;
    const w = Math.min(T - 4, c.measureText(texte).width + 8);
    c.fillStyle = "rgba(91,58,41,.8)"; rectArrondi(c, cx - w / 2, y - taille * .62, w, taille * 1.24, taille * .6); c.fill();
    c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(texte, cx, y + 1, T - 8);
  },

  dessinerStation(st) {
    const c = this.ctx, T = this.T, x = this.px(st.c), y = this.py(st.r), cx = x + T / 2;
    switch (st.type) {
      case "comptoir":
        c.fillStyle = "#b97c4e"; c.fillRect(x, y, T, T);
        c.fillStyle = "#d89c6a"; c.fillRect(x, y, T, T * .55);
        c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(x, y + T * .05, T, T * .08);
        if (st.c === 3) dessinerImage(c, "cloche", cx, y + T * .3, T * .42);
        break;
      case "meuble":
        this.baseMeuble(x, y);
        if (st.deco) dessinerImage(c, st.deco, cx, y + T * .42, T * .56);
        break;
      case "caisse":
        this.baseMeuble(x, y);
        c.fillStyle = "#c48a57"; rectArrondi(c, x + T * .1, y + T * .1, T * .8, T * .66, T * .1); c.fill();
        c.fillStyle = "#d59d69"; rectArrondi(c, x + T * .1, y + T * .1, T * .8, T * .1, T * .05); c.fill();
        dessinerImage(c, ING[st.id].img, cx, y + T * .42, T * .6);
        this.etiquette(ING[st.id].nom, cx, y + T * .82);
        break;
      case "bol":
        this.baseMeuble(x, y);
        if (st.pate) {
          const vibre = st.etat === "melange" ? Math.sin(this.temps * 30) * T * .02 : 0;
          dessinerImage(c, PATES[st.pate].img, cx + vibre, y + T * .5, T * .82);
          if (st.etat === "melange") anneau(c, cx, y + T * .5, T * .44, st.t / DUREE_MELANGE, "#7cc6a4");
          else dessinerImage(c, "etincelles", x + T * .8, y + T * .18, T * .3);
        } else {
          dessinerImage(c, "saladier", cx, y + T * .56, T * .8);
          st.contenu.forEach((id, i) => dessinerImage(c, ING[id].img, cx + (i - (st.contenu.length - 1) / 2) * T * .26, y + T * .34, T * .34));
        }
        break;
      case "four": {
        c.fillStyle = "#aab3be"; rectArrondi(c, x + 1, y + 1, T - 2, T - 2, T * .12); c.fill();
        c.fillStyle = "#c8cfd8"; rectArrondi(c, x + 1, y + 1, T - 2, T * .86, T * .12); c.fill();
        c.fillStyle = "#6c7380";
        for (const k of [.3, .5, .7]) { c.beginPath(); c.arc(x + T * k, y + T * .14, T * .045, 0, Math.PI * 2); c.fill(); }
        const wx = x + T * .12, wy = y + T * .25, ww = T * .76, wh = T * .5;
        c.fillStyle = "#34292a"; rectArrondi(c, wx, wy, ww, wh, T * .08); c.fill();
        if (st.objet) {
          const chaud = st.etat === "cuisson" ? .55 + .15 * Math.sin(this.temps * 6) : st.etat === "cuit" ? .35 : .15;
          const g = c.createRadialGradient(cx, wy + wh, 2, cx, wy + wh, wh * 1.2);
          g.addColorStop(0, `rgba(255,140,40,${chaud})`); g.addColorStop(1, "rgba(255,140,40,0)");
          c.fillStyle = g; rectArrondi(c, wx, wy, ww, wh, T * .08); c.fill();
          const o = st.etat === "cuisson" ? st.objet : st.etat === "brule" ? { type: "brule" } : { type: "cuit", id: PATES[st.objet.id].cuit, decors: [] };
          c.save(); rectArrondi(c, wx, wy, ww, wh, T * .08); c.clip();
          dessinerObjet(c, o, cx, wy + wh * .55, T * .46);
          c.restore();
          const bx = x + T * .12, byy = y + T * .82, bw = T * .76, bh = T * .09;
          c.fillStyle = "rgba(0,0,0,.2)"; rectArrondi(c, bx, byy, bw, bh, bh / 2); c.fill();
          let frac = 1, coul = "#f2b33d";
          if (st.etat === "cuisson") { frac = st.t / DUREE_CUISSON; coul = "#7cc6a4"; }
          else if (st.etat === "cuit" && st.t > DELAI_BRULE - 5) coul = Math.floor(this.temps * 4) % 2 ? "#e0453a" : "#f2b33d";
          else if (st.etat === "brule") coul = "#3a2a24";
          c.fillStyle = coul; rectArrondi(c, bx, byy, bw * Math.min(1, frac), bh, bh / 2); c.fill();
          if (st.etat === "cuit") dessinerImage(c, st.t > DELAI_BRULE - 5 ? "attention" : "valide", x + T * .84, y + T * .2, T * .34);
          if (st.etat === "brule") dessinerImage(c, "fumee", cx + Math.sin(this.temps * 3) * T * .1, y + T * .14, T * .4);
        }
        break;
      }
      case "plan":
        this.baseMeuble(x, y);
        c.fillStyle = "#deae78"; rectArrondi(c, x + T * .1, y + T * .18, T * .8, T * .6, T * .12); c.fill();
        c.fillStyle = "#c99560"; c.beginPath(); c.arc(x + T * .8, y + T * .28, T * .035, 0, Math.PI * 2); c.fill();
        if (st.objet) dessinerObjet(c, st.objet, cx, y + T * .5, T * .64);
        break;
      case "poubelle":
        this.baseMeuble(x, y);
        dessinerImage(c, "poubelle", cx, y + T * .44, T * .62);
        break;
    }
  },

  dessinerClients() {
    const c = this.ctx, T = this.T;
    for (const cl of this.clients) {
      const cx = this.px(cl.x + .5), base = this.oy;
      const saut = cl.etat !== "attend" ? Math.abs(Math.sin(cl.t * 10)) * T * .06 : 0;
      const fache = cl.etat === "attend" && !cl.decouverte && cl.patience / cl.max < .25;
      const tremble = fache ? Math.sin(this.temps * 40) * T * .02 : 0;
      if (cl.perso === "tsuki") dessinerImage(c, cl.animal, cx + tremble, base + T * 1.5 - saut, T * .52);   // minuscule
      else if (cl.perso === "suguru") {
        c.save(); c.translate(cx, base + T * 1.22 - saut); c.rotate(Math.sin(this.temps * 1.3) * .18);
        dessinerImage(c, cl.animal, 0, 0, T * .92); c.restore();
      } else dessinerImage(c, cl.animal, cx + tremble, base + T * 1.22 - saut, T * .92);
      if (cl.etat === "attend" && cl.fixe > 0) {
        const bx = cx + T * .36, by = base + T * .4, r = T * .27;
        c.fillStyle = "#fff"; c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill();
        dessinerImage(c, "question", bx, by, r * 1.3);
      } else if (cl.etat === "attend") {
        // bulle de commande entourée de la jauge de patience
        const bx = cx + T * .36, by = base + T * .4, r = T * .27;
        const f = cl.decouverte ? 1 : Math.max(0, cl.patience / cl.max);
        c.fillStyle = "#fff"; c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill();
        c.lineWidth = Math.max(3, T * .06); c.lineCap = "round";
        c.strokeStyle = "rgba(91,58,41,.15)"; c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = cl.decouverte ? "#7fb8ef" : f > .5 ? "#5cc28f" : f > .25 ? "#f2b33d" : "#e0453a";
        c.beginPath(); c.arc(bx, by, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); c.stroke(); c.lineCap = "butt";
        const reveTsuki = cl.perso === "tsuki" && Math.floor(this.temps / 1.6) % 2;   // Tsuki rêve de poisson
        dessinerImage(c, reveTsuki ? "poisson" : RECETTES[cl.recette].img, bx, by, r * 1.45);
        if (fache) dessinerImage(c, "colere", cx - T * .34, base + T * .78, T * .3);
      } else if (cl.etat === "part") {
        dessinerImage(c, cl.content ? "coeur" : "fache", cx + T * .34, base + T * .55, T * .36);
      }
    }
  },

  dessinerJoueur() {
    const c = this.ctx, T = this.T, j = this.joueur;
    const x = this.px(j.x), y = this.py(j.y);
    const bob = j.chemin.length ? Math.abs(Math.sin(j.marche * 12)) * T * .06 : 0;
    const geste = j.geste > 0 ? T * .06 : 0;
    c.fillStyle = "rgba(91,58,41,.18)";
    c.beginPath(); c.ellipse(x, y + T * .36, T * .26, T * .08, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#ef7fa6";
    c.beginPath(); c.ellipse(x, y + T * .14 - bob, T * .25, T * .25, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff";
    c.beginPath(); c.ellipse(x, y + T * .2 - bob, T * .14, T * .17, 0, 0, Math.PI * 2); c.fill();
    const hy = y - T * .17 - bob - geste;
    if (IMG.tete_maman) dessinerImage(c, "tete_maman", x, hy - T * .03, T * .58);   // la cheffe, c'est Maman !
    else { c.fillStyle = "#f5cfb2"; c.beginPath(); c.arc(x, hy, T * .19, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#fff"; c.strokeStyle = "#e6d6c8"; c.lineWidth = 1;
    c.fillRect(x - T * .13, hy - T * .27, T * .26, T * .1); c.strokeRect(x - T * .13, hy - T * .27, T * .26, T * .1);
    for (const dx of [-.1, 0, .1]) { c.beginPath(); c.arc(x + dx * T, hy - T * .32, T * .1, 0, Math.PI * 2); c.fill(); }
    if (j.tenu) {
      c.fillStyle = "rgba(255,255,255,.9)";
      c.beginPath(); c.arc(x, hy - T * .64, T * .3, 0, Math.PI * 2); c.fill();
      dessinerObjet(c, j.tenu, x, hy - T * .64, T * .5);
    }
  },

  dessinerContours() {
    const c = this.ctx, T = this.T, pulse = .5 + .5 * Math.sin(this.temps * 6);
    for (const st of this.indices.stations) {
      const x = this.px(st.c), y = this.py(st.r);
      c.strokeStyle = `rgba(255,179,0,${.55 + .45 * pulse})`; c.lineWidth = 3;
      rectArrondi(c, x + 2, y + 2, T - 4, T - 4, T * .14); c.stroke();
    }
  },

  dessinerFile() {
    const c = this.ctx, T = this.T, j = this.joueur;
    const cibles = (j.action ? [j.action] : []).concat(j.file);
    cibles.forEach((a, i) => {
      const cc = a.type === "sol" ? a.c : a.st.c, rr = a.type === "sol" ? a.r : a.st.r;
      const x = this.px(cc) + T * .84, y = this.py(rr) + T * .16;
      c.fillStyle = "#5b3a29"; c.beginPath(); c.arc(x, y, T * .14, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#fff"; c.font = `800 ${Math.round(T * .18)}px Nunito, sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(i + 1), x, y + 1);
    });
  },

  dessinerEffets() {
    const c = this.ctx, T = this.T;
    if (Progression.etat.fleches) {
      const saut = Math.abs(Math.sin(this.temps * 5)) * T * .12;
      for (const st of this.indices.stations) {
        const x = this.px(st.c) + T / 2, y = this.py(st.r) - T * .02 - saut;
        c.fillStyle = "#ffb300"; c.strokeStyle = "#fff"; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x - T * .14, y - T * .18); c.lineTo(x + T * .14, y - T * .18); c.lineTo(x, y); c.closePath();
        c.fill(); c.stroke();
      }
    }
    for (const e of this.effets) {
      const x = this.px(e.x), y = this.py(e.y);
      if (e.type === "onde") {
        c.strokeStyle = `rgba(91,58,41,${e.vie / .4 * .5})`; c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, T * (.45 - e.vie / .4 * .3), 0, Math.PI * 2); c.stroke();
      } else if (e.type === "texte") {
        c.globalAlpha = Math.min(1, e.vie);
        c.font = `800 ${Math.round(T * .32)}px Nunito, sans-serif`; c.textAlign = "right"; c.textBaseline = "middle";
        c.lineWidth = 4; c.strokeStyle = "#fff"; c.strokeText(e.txt, x, y);
        c.fillStyle = e.couleur; c.fillText(e.txt, x, y);
        if (e.piece !== false) dessinerImage(c, "piece", x + T * .2, y, T * .32);
        c.globalAlpha = 1;
      } else if (e.type === "coeur") {
        c.globalAlpha = Math.min(1, e.vie); dessinerImage(c, "coeur", x, y, T * .3); c.globalAlpha = 1;
      }
    }
  },
};

function anneau(c, x, y, r, frac, couleur) {
  c.strokeStyle = "rgba(0,0,0,.12)"; c.lineWidth = 4;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = couleur; c.lineCap = "round";
  c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac)); c.stroke();
  c.lineCap = "butt";
}

/* Fiche recette en HTML (grande et lisible) */
function htmlFiche(k, grande) {
  const r = RECETTES[k], p = PATES[r.pate];
  const fig = (img, nom) => `<figure><img src="${srcImg(img)}" alt=""><figcaption>${nom}</figcaption></figure>`;
  const plus = '<i class="plus">+</i>';
  const etapes = [
    ["Dans un saladier", p.ingr.map((i) => fig(ING[i].img, ING[i].nom)).join(plus)],
    ["Au four", fig("feu", "Cuisson")],
  ];
  if (r.decors.length) etapes.push(["Décore sur le plan de travail", r.decors.map((d) => fig(ING[d].img, ING[d].nom)).join(plus)]);
  etapes.push(["Sers au comptoir", fig("cloche", "Servir")]);
  return `<div class="fiche ${grande ? "grande" : ""}">
    <div class="fiche-tete"><img src="${srcImg(r.img)}" alt=""><b>${r.nom}</b></div>
    <ol>${etapes.map(([t, h], i) => `<li><span class="num">${i + 1}</span><div><span class="etape-titre">${t}</span><div class="icones">${h}</div></div></li>`).join("")}</ol>
  </div>`;
}
