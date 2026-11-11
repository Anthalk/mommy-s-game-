"use strict";
/* =====================================================================
   La pâtisserie : les clients commandent au comptoir, on prépare,
   on cuit, on décore et on sert avant qu'ils ne perdent patience.
   ===================================================================== */

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

/* ----------------------------- Données ----------------------------- */
const ING = {
  farine:    { emoji: "🌾", nom: "la farine" },
  oeuf:      { emoji: "🥚", nom: "les œufs" },
  sucre:     { emoji: "🍬", nom: "le sucre" },
  beurre:    { emoji: "🧈", nom: "le beurre" },
  chocolat:  { emoji: "🍫", nom: "le chocolat" },
  fraise:    { emoji: "🍓", nom: "les fraises" },
  chantilly: { emoji: "🍦", nom: "la chantilly" },
};
const DECORS = ["fraise", "chantilly"];   // ce qui se pose sur un gâteau cuit

const PATES = {
  cookie:  { nom: "la pâte à cookies", ingr: ["farine", "beurre", "chocolat"], couleur: "#a8744c", cuit: "cookie" },
  genoise: { nom: "la pâte à génoise", ingr: ["farine", "oeuf", "sucre"],      couleur: "#f2d77e", cuit: "genoise" },
  sablee:  { nom: "la pâte sablée",    ingr: ["farine", "beurre", "sucre"],    couleur: "#e6c79b", cuit: "fond" },
};
const CUITS = {
  cookie:  { nom: "les cookies" },
  genoise: { nom: "la génoise" },
  fond:    { nom: "le fond de tarte" },
};
const RECETTES = {
  cookie:   { nom: "Cookies",           art: "les ", emoji: "🍪", pate: "cookie",  decors: [],                     patience: 80,  debloque: 0 },
  cupcake:  { nom: "Cupcake",           art: "le ",  emoji: "🧁", pate: "genoise", decors: ["chantilly"],          patience: 95,  debloque: 1 },
  tarte:    { nom: "Tarte aux fraises", art: "la ",  emoji: "🥧", pate: "sablee",  decors: ["fraise"],             patience: 95,  debloque: 3 },
  fraisier: { nom: "Fraisier",          art: "le ",  emoji: "🍰", pate: "genoise", decors: ["chantilly", "fraise"], patience: 120, debloque: 5 },
};
const ANIMAUX = ["🐻", "🐰", "🦊", "🐱", "🐼", "🐨", "🐸", "🐷", "🐶", "🐯", "🦁", "🐮", "🐹", "🐧"];

/* Plan de la cuisine (la ligne 0 est le comptoir, les clients sont au-dessus)
   K comptoir · B saladier · O four · A plan de travail · T poubelle · # meuble
   Caisses : F farine, E œufs, S sucre, U beurre, C chocolat, R fraises, H chantilly */
const PLAN = [
  "KKKKKKK",
  ".......",
  "F.B.B.O",
  "E.....O",
  "S.A.A.#",
  "U.....#",
  "......T",
  "CRH####",
];
const CAISSES = { F: "farine", E: "oeuf", S: "sucre", U: "beurre", C: "chocolat", R: "fraise", H: "chantilly" };
const DECO_MEUBLES = { "4,6": "🌷", "5,6": "☕", "7,3": "🍯", "7,4": "🧺", "7,5": "🥖", "7,6": "🍋" };
const COLS = PLAN[0].length, LIGNES = PLAN.length, ZONE = 2.3;   // ZONE = hauteur (en cases) de la salle clients
const PLACES = [1, 3, 5];                                         // colonnes où se placent les clients
const VITESSE = 4.6;                                              // cases par seconde
const DUREE_MELANGE = 2.2, DUREE_CUISSON = 6, DELAI_BRULE = 13;   // secondes

/* ----------------------------- Utilitaires ----------------------------- */
const contient = (grand, petit) => {     // petit ⊆ grand (multiensembles)
  const reste = [...grand];
  for (const x of petit) { const i = reste.indexOf(x); if (i < 0) return false; reste.splice(i, 1); }
  return true;
};
const memeEnsemble = (a, b) => a.length === b.length && contient(a, b);
const sauf = (grand, petit) => { const r = [...grand]; for (const x of petit) { const i = r.indexOf(x); if (i >= 0) r.splice(i, 1); } return r; };
const emojis = (ids) => ids.map((i) => ING[i].emoji).join(" ");
const hasardEntre = (a, b) => a + Math.random() * (b - a);
const auHasard = (t) => t[Math.floor(Math.random() * t.length)];
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function recetteDe(o) {
  if (!o || o.type !== "cuit") return null;
  for (const [k, r] of Object.entries(RECETTES)) {
    if (PATES[r.pate].cuit === o.id && memeEnsemble(r.decors, o.decors)) return k;
  }
  return null;
}
function peutDecorer(o, d) {
  return o && o.type === "cuit" && !o.decors.includes(d) &&
    Object.values(RECETTES).some((r) => PATES[r.pate].cuit === o.id && r.decors.includes(d) && contient(r.decors, o.decors));
}
function aDecorer(o) {
  return o && o.type === "cuit" && Object.values(RECETTES).some((r) =>
    PATES[r.pate].cuit === o.id && r.decors.length > o.decors.length && contient(r.decors, o.decors));
}
function pateComplete(contenu) {
  return Object.keys(PATES).find((p) => memeEnsemble(PATES[p].ingr, contenu)) || null;
}
function nomObjet(o) {
  if (!o) return "";
  if (o.type === "ingr") return ING[o.id].nom;
  if (o.type === "pate") return PATES[o.id].nom;
  if (o.type === "brule") return "un gâteau brûlé";
  const r = recetteDe(o);
  if (r && (RECETTES[r].decors.length || o.id === "cookie")) return RECETTES[r].art + RECETTES[r].nom.toLowerCase();
  return CUITS[o.id].nom + (o.decors.length ? " (" + emojis(o.decors) + ")" : "");
}

/* ============================== LE JEU ============================== */
const Cuisine = {
  cv: null, ctx: null, W: 0, H: 0, T: 40, ox: 0, oy: 0, gy: 0,

  init() {
    this.cv = document.getElementById("cuisine");
    this.ctx = this.cv.getContext("2d");
    this.cv.addEventListener("pointerdown", (e) => this.toucher(e));
    const surRedim = () => { if (this.stations) { this.redim(); this.dessiner(); } };
    window.addEventListener("resize", surRedim);
    if (window.ResizeObserver) new ResizeObserver(surRedim).observe(document.getElementById("zone-cuisine"));
    document.addEventListener("visibilitychange", () => { if (document.hidden && this.enCours && !this.fini) this.mettreEnPause(true); });
    document.getElementById("btn-pause").addEventListener("click", () => this.mettreEnPause(true));
    document.getElementById("btn-reprendre").addEventListener("click", () => this.mettreEnPause(false));
    document.getElementById("btn-ouvrir").addEventListener("click", () => { Son.init(); Son.cloche(); this.lancer(); });
    document.getElementById("btn-fermer").addEventListener("click", () => this.quitter());
  },

  /* ----------------------- Mise en place ----------------------- */
  preparer() {
    this.stations = []; this.grille = [];
    PLAN.forEach((ligne, r) => {
      this.grille.push([]);
      [...ligne].forEach((ch, c) => {
        let st = null;
        if (ch === "K") st = { type: "comptoir" };
        else if (ch === "B") st = { type: "bol", contenu: [], etat: "vide", t: 0, pate: null };
        else if (ch === "O") st = { type: "four", objet: null, etat: null, t: 0, bip: 0 };
        else if (ch === "A") st = { type: "plan", objet: null };
        else if (ch === "T") st = { type: "poubelle" };
        else if (ch === "#") st = { type: "meuble", deco: DECO_MEUBLES[r + "," + c] };
        else if (CAISSES[ch]) st = { type: "caisse", id: CAISSES[ch] };
        if (st) { st.c = c; st.r = r; this.stations.push(st); }
        this.grille[r].push(st);
      });
    });
    this.joueur = { x: 3.5, y: 3.5, chemin: [], file: [], action: null, tenu: null, marche: 0, dir: 1, geste: 0 };
    this.clients = []; this.effets = [];
    this.servis = 0; this.partis = 0; this.pieces = 0;
    this.objectif = Math.max(1, CONFIG.clientsAServir | 0);
    this.facteur = Math.max(.3, +CONFIG.patience || 1);
    this.tuto = true; this.fini = false; this.enCours = false; this.pause = false;
    this.prochainClient = .8; this.temps = 0;
    this.derniereRecette = null; this.recettesVues = new Set();
    this.message = null; this.indices = { stations: [], texte: "" }; this.tIndice = 0;
    this.signatureBandeau = "";
    document.getElementById("ov-intro").hidden = false;
    document.getElementById("ov-pause").hidden = true;
    document.getElementById("ov-fin").hidden = true;
    document.getElementById("indice").textContent = "";
    this.redim();
    this.majHUD();
    this.majBandeau();
    this.dessiner();
  },

  lancer() {
    document.getElementById("ov-intro").hidden = true;
    this.enCours = true; this.pause = false;
    this.dernier = performance.now();
    requestAnimationFrame((t) => this.boucle(t));
  },

  mettreEnPause(oui) {
    if (!this.enCours || this.fini) return;
    if (oui && !this.pause) {
      this.pause = true;
      document.getElementById("livre").innerHTML = this.htmlRecettes(true);
      document.getElementById("ov-pause").hidden = false;
    } else if (!oui && this.pause) {
      this.pause = false;
      document.getElementById("ov-pause").hidden = true;
      this.dernier = performance.now();
      requestAnimationFrame((t) => this.boucle(t));
    }
  },

  redim() {
    const zone = document.getElementById("zone-cuisine").getBoundingClientRect();
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
  dire(txt, duree = 2.4) { this.message = { txt, t: duree }; this.afficherIndice(); },

  interagir(st) {
    const j = this.joueur, t = j.tenu;
    const mainsPleines = () => { Son.erreur(); this.dire(`Tes mains sont pleines : tu portes ${nomObjet(t)}.`); };
    switch (st.type) {
      case "caisse":
        if (!t) { j.tenu = { type: "ingr", id: st.id }; Son.prendre(); return; }
        if (t.type === "ingr" && t.id === st.id) { j.tenu = null; Son.poser(); this.dire(`Tu as reposé ${ING[st.id].nom} dans sa caisse.`); return; }
        return mainsPleines();

      case "bol":
        if (st.etat === "melange") { Son.erreur(); return this.dire("Ça mélange… encore un petit instant !"); }
        if (st.etat === "pret") {
          if (t) return mainsPleines();
          j.tenu = { type: "pate", id: st.pate };
          st.etat = "vide"; st.contenu = []; st.pate = null; Son.prendre(); return;
        }
        if (!t) {
          if (st.contenu.length) { j.tenu = { type: "ingr", id: st.contenu.pop() }; Son.prendre(); this.dire("Tu as repris le dernier ingrédient."); }
          else { Son.erreur(); this.dire("Le saladier est vide : apporte-lui des ingrédients."); }
          return;
        }
        if (t.type !== "ingr") { Son.erreur(); return this.dire(t.type === "pate" ? "Cette pâte est prête : direction le four 🔥" : "Ça ne va pas dans le saladier !"); }
        if (DECORS.includes(t.id)) { Son.erreur(); return this.dire(`${majuscule(ING[t.id].nom)}, c'est pour décorer sur le plan de travail 🍽️`); }
        if (!this.peutAjouter(st, t.id)) { Son.erreur(); return this.dire("Avec ce qu'il y a déjà dedans, ça ne fait aucune recette 🤔"); }
        st.contenu.push(t.id); j.tenu = null; Son.plouf();
        st.etat = "rempli";
        const p = pateComplete(st.contenu);
        if (p) { st.etat = "melange"; st.t = 0; st.pate = p; }
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
          if (t.type === "ingr" && DECORS.includes(t.id)) return this.dire("Pose d'abord une génoise ou un fond de tarte sorti du four.");
          if (t.type === "pate") return this.dire("Cette pâte doit d'abord cuire au four 🔥");
          return this.dire("Ça ne se pose pas ici.");
        }
        if (!t) { j.tenu = st.objet; st.objet = null; Son.prendre(); return; }
        if (t.type === "ingr" && DECORS.includes(t.id)) {
          if (peutDecorer(st.objet, t.id)) {
            st.objet.decors.push(t.id); j.tenu = null; Son.plouf();
            const r = recetteDe(st.objet);
            if (r && RECETTES[r].decors.length) {
              const encore = aDecorer(st.objet) ? " (ou continue de le décorer)" : "";
              this.dire(`${RECETTES[r].emoji} ${RECETTES[r].nom} terminé !${encore}`);
            }
            return;
          }
          Son.erreur(); return this.dire("Ça ne va pas sur ce gâteau.");
        }
        Son.erreur(); return this.dire("Il y a déjà quelque chose sur ce plan de travail.");

      case "poubelle":
        if (!t) { Son.erreur(); return this.dire("Rien à jeter."); }
        j.tenu = null; Son.jeter(); this.dire("Jeté ! 🗑️", 1.4); return;

      case "comptoir":
        return this.servir(st);
    }
  },

  peutAjouter(bol, id) {
    if (bol.etat === "melange" || bol.etat === "pret" || DECORS.includes(id)) return false;
    const essai = [...bol.contenu, id];
    return Object.values(PATES).some((p) => contient(p.ingr, essai));
  },

  servir() {
    const j = this.joueur, o = j.tenu, rec = recetteDe(o);
    if (!o) { Son.erreur(); return this.dire("Apporte un dessert terminé au comptoir pour servir."); }
    if (!rec) {
      Son.erreur();
      if (aDecorer(o)) return this.dire("Il faut encore le décorer sur le plan de travail 🍓");
      return this.dire("Ce n'est pas encore un dessert terminé !");
    }
    const cands = this.clients.filter((c) => c.etat === "attend" && c.recette === rec)
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
    this.effets.push({ type: "texte", txt: `+${pourboire} 🪙`, x: cl.x + .5, y: -1.2, vie: 1.4, couleur: "#2e9a6a" });
    for (let i = 0; i < 5; i++) this.effets.push({ type: "coeur", x: cl.x + .5 + hasardEntre(-.4, .4), y: -1, vx: hasardEntre(-.4, .4), vie: hasardEntre(.9, 1.5) });
    if (this.tuto) {
      this.tuto = false;
      this.prochainClient = 2.5;
      this.dire("Bravo, premier client servi ! 🎉 Les suivants arrivent…", 3.5);
    } else {
      this.dire(auHasard(["Merci ! 😋", "Délicieux ! 💖", "Un régal ! ✨", "Parfait ! 👌", "Miam ! 😍"]), 1.6);
    }
    this.majHUD();
    if (this.servis >= this.objectif) this.terminer();
  },

  /* ----------------------- Clients ----------------------- */
  nouveauClient() {
    const prises = new Set(this.clients.filter((c) => c.etat !== "part").map((c) => c.place));
    const libres = [0, 1, 2].filter((p) => !prises.has(p));
    if (!libres.length) return false;
    const place = auHasard(libres);
    let recette;
    if (this.tuto) recette = "cookie";
    else {
      const dispo = Object.keys(RECETTES).filter((k) => RECETTES[k].debloque <= this.servis);
      // une recette tout juste débloquée est servie en priorité, pour la découvrir
      const nouvelle = dispo.find((k) => !this.recettesVues.has(k));
      recette = nouvelle || auHasard(dispo.length > 1 ? dispo.filter((k) => k !== this.derniereRecette) : dispo);
    }
    if (!this.recettesVues.has(recette) && this.recettesVues.size) {
      this.dire(`Nouvelle recette : ${RECETTES[recette].emoji} ${RECETTES[recette].nom} ! (voir en bas)`, 3.5);
    }
    this.recettesVues.add(recette);
    this.derniereRecette = recette;
    const animauxPris = this.clients.map((c) => c.emoji);
    const max = RECETTES[recette].patience * this.facteur;
    this.clients.push({
      place, col: PLACES[place], x: -1, recette,
      emoji: auHasard(ANIMAUX.filter((a) => !animauxPris.includes(a))),
      patience: max, max, etat: "arrive", t: 0, content: false,
    });
    this.majBandeau();
    return true;
  },

  majClients(dt) {
    for (const c of this.clients) {
      c.t += dt;
      if (c.etat === "arrive") {
        c.x = Math.min(c.col, c.x + 3.2 * dt);
        if (c.x >= c.col) { c.etat = "attend"; Son.cloche(); }
      } else if (c.etat === "attend") {
        if (!this.tuto) c.patience -= dt;
        if (c.patience <= 0) {
          c.etat = "part"; c.content = false; c.t = 0;
          this.partis++;
          this.facteur = Math.min(+CONFIG.patience * 1.8 || 1.8, this.facteur + .12);  // on aide un peu après un départ
          Son.triste();
          this.dire(`${c.emoji} en a eu assez d'attendre… Pas grave, on continue !`, 3);
          this.majHUD();
        }
      } else if (c.etat === "part" && c.t > .7) {
        c.x += 3.2 * dt;
      }
    }
    const avant = this.clients.length;
    this.clients = this.clients.filter((c) => c.x < COLS + 1);
    if (this.clients.length !== avant) this.majBandeau();

    if (this.fini) return;
    const enAttente = this.clients.filter((c) => c.etat !== "part").length;
    const maxSimultanes = this.tuto ? 1 : (this.servis < 2 ? 2 : 3);
    this.prochainClient -= dt;
    if (enAttente === 0 && this.prochainClient > 1.5) this.prochainClient = 1.5;   // jamais de salle vide trop longtemps
    if (this.prochainClient <= 0 && enAttente < maxSimultanes && this.servis + enAttente < this.objectif) {
      if (this.nouveauClient()) this.prochainClient = this.servis < 4 ? hasardEntre(11, 16) : hasardEntre(8, 13);
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
          if (st.t >= DELAI_BRULE) { st.etat = "brule"; Son.erreur(); this.dire("Oh non, un gâteau a brûlé dans le four ! 🔥"); }
        }
      }
    }
    this.majClients(dt);

    for (const e of this.effets) {
      e.vie -= dt;
      if (e.type === "texte") e.y -= .8 * dt;
      if (e.type === "coeur") { e.y -= 1.2 * dt; e.x += e.vx * dt; }
    }
    this.effets = this.effets.filter((e) => e.vie > 0);

    if (this.message) { this.message.t -= dt; if (this.message.t <= 0) { this.message = null; this.afficherIndice(); } }
    this.tIndice -= dt;
    if (this.tIndice <= 0) { this.tIndice = .2; this.indices = this.calculerIndices(); this.afficherIndice(); this.majBandeau(); }
  },

  /* ----------------------- Aide contextuelle ----------------------- */
  calculerIndices() {
    const j = this.joueur, t = j.tenu, S = this.stations;
    const bols = S.filter((s) => s.type === "bol"), fours = S.filter((s) => s.type === "four"), plans = S.filter((s) => s.type === "plan");
    const caisse = (id) => S.find((s) => s.type === "caisse" && s.id === id);
    const poubelle = S.find((s) => s.type === "poubelle");
    const attente = this.clients.filter((c) => c.etat === "attend" || c.etat === "arrive")
      .sort((a, b) => a.patience / a.max - b.patience / b.max);
    const cmds = attente.map((c) => c.recette);
    const R = (stations, texte) => ({ stations: stations.filter(Boolean), texte });
    const comptoirDe = (rec) => { const c = attente.find((x) => x.recette === rec); return c ? this.grille[0][c.col] : null; };

    if (this.fini) return R([], "");
    if (t) {
      if (t.type === "ingr") {
        if (DECORS.includes(t.id)) {
          const ok = plans.filter((p) => peutDecorer(p.objet, t.id));
          if (ok.length) return R(ok, `Dépose ${ING[t.id].nom} sur le gâteau du plan de travail.`);
          return R([caisse(t.id)], `Rien à décorer pour l'instant : repose ${ING[t.id].nom} dans sa caisse.`);
        }
        const ok = bols.filter((b) => this.peutAjouter(b, t.id));
        if (ok.length) return R(ok, `Verse ${ING[t.id].nom} dans un saladier 🥣`);
        return R([caisse(t.id)], `Aucun saladier n'en a besoin : repose ${ING[t.id].nom} dans sa caisse.`);
      }
      if (t.type === "pate") {
        const ok = fours.filter((f) => !f.objet);
        return R(ok, ok.length ? `Mets ${PATES[t.id].nom} au four 🔥` : "Les deux fours sont occupés : attends qu'un gâteau soit cuit.");
      }
      if (t.type === "cuit") {
        const r = recetteDe(t);
        if (r && cmds.includes(r)) return R([comptoirDe(r)], `Sers ${nomObjet(t)} au client ! 🛎️`);
        if (aDecorer(t)) {
          const ok = plans.filter((p) => !p.objet);
          if (ok.length) return R(ok, `Pose ${nomObjet(t)} sur un plan de travail pour le décorer.`);
          return R([poubelle], "Les plans de travail sont pleins : jette ce gâteau ou libère un plan.");
        }
        return R([poubelle, ...plans.filter((p) => !p.objet)], "Personne n'a commandé ça : pose-le sur un plan de travail ou jette-le.");
      }
      if (t.type === "brule") return R([poubelle], "C'est brûlé ! Jette-le à la poubelle 🗑️");
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

    // On associe chaque commande à ce qui est déjà en préparation
    // (du plus avancé au moins avancé, pour finir ce qui est commencé)
    const enCours = [];
    for (const p of plans) if (p.objet) enCours.push({ lieu: p, sorte: "plan" });
    for (const f of fours) if (f.objet && f.etat !== "brule") enCours.push({ lieu: f, sorte: f.etat === "cuisson" ? "pate" : "cuit" });
    for (const b of bols) if (b.pate) enCours.push({ lieu: b, sorte: "pate" });
    for (const b of bols) if (!b.pate && b.contenu.length) enCours.push({ lieu: b, sorte: "bol" });
    const compatible = (e, r) => {
      const rec = RECETTES[r];
      if (e.sorte === "bol") return contient(PATES[rec.pate].ingr, e.lieu.contenu);
      if (e.sorte === "pate") return (e.lieu.pate || (e.lieu.objet && e.lieu.objet.id)) === rec.pate;
      if (e.sorte === "cuit") return PATES[e.lieu.objet.id].cuit === PATES[rec.pate].cuit;
      return e.lieu.objet.id === PATES[rec.pate].cuit && contient(rec.decors, e.lieu.objet.decors);
    };
    const utilises = new Set(), aCommencer = [];
    for (const c of attente) {
      const e = enCours.find((x) => !utilises.has(x) && compatible(x, c.recette));
      if (e) { utilises.add(e); e.pour = c.recette; } else aCommencer.push(c.recette);
    }
    // décorations à apporter
    for (const e of enCours) if (e.sorte === "plan" && e.pour) {
      const manque = sauf(RECETTES[e.pour].decors, e.lieu.objet.decors);
      if (manque.length) return R(manque.map(caisse), `Pour ${RECETTES[e.pour].emoji} ${RECETTES[e.pour].nom}, il faut ${manque.map((m) => ING[m].nom + " " + ING[m].emoji).join(" et ")}.`);
    }
    // saladiers à compléter
    for (const e of enCours) if (e.sorte === "bol" && e.pour) {
      const manque = sauf(PATES[RECETTES[e.pour].pate].ingr, e.lieu.contenu);
      if (manque.length) return R(manque.map(caisse), `Il manque ${emojis(manque)} dans le saladier.`);
    }
    // une commande pas encore commencée
    if (aCommencer.length) {
      const r = RECETTES[aCommencer[0]], ingr = PATES[r.pate].ingr;
      if (bols.some((b) => b.etat === "vide")) return R(ingr.map(caisse), `${r.emoji} ${r.nom} : apporte ${emojis(ingr)} dans un saladier.`);
      // tout est encombré par des préparations dont personne ne veut : on aide à faire de la place
      const inutiles = enCours.filter((e) => !e.pour && e.sorte === "bol");
      if (inutiles.length) return R([inutiles[0].lieu], "Ce saladier ne sert à aucune commande : touche-le pour reprendre ses ingrédients.");
    }
    {
      const plansInutiles = enCours.filter((e) => !e.pour && e.sorte === "plan");
      const besoinPlan = attente.some((c) => RECETTES[c.recette].decors.length);
      if (plansInutiles.length && besoinPlan && !plans.some((p) => !p.objet)) {
        return R([plansInutiles[0].lieu], "Les plans de travail sont pleins : prends ce gâteau pour le jeter à la poubelle.");
      }
    }
    if (enCours.some((e) => e.lieu.type === "four")) return R([], "Ça cuit… prépare la suite en attendant ! ⏳");
    if (bols.some((b) => b.etat === "melange")) return R([], "Ça mélange… ⏳");
    if (!attente.length) return R([], "En attendant le prochain client… ☕");
    return R([], "");
  },

  afficherIndice() {
    const el = document.getElementById("indice");
    const txt = this.message ? this.message.txt : this.indices.texte;
    if (el.textContent !== txt) el.textContent = txt;
    el.classList.toggle("message", !!this.message);
  },

  /* ----------------------- Interface HTML ----------------------- */
  majHUD() {
    document.getElementById("hud-servis").textContent = `${this.servis}/${this.objectif}`;
    document.getElementById("hud-jauge").style.width = (100 * this.servis / this.objectif) + "%";
    document.getElementById("hud-pieces").textContent = this.pieces;
  },

  etapes(k) {
    const r = RECETTES[k];
    return `${emojis(PATES[r.pate].ingr)} <i>→</i> 🔥${r.decors.length ? " <i>→</i> " + emojis(r.decors) : ""}`;
  },

  htmlRecettes(detaille) {
    const dispo = Object.keys(RECETTES).filter((k) => this.recettesVues.has(k) || (detaille && RECETTES[k].debloque <= this.servis));
    if (!dispo.length) return "";
    return dispo.map((k) => {
      const r = RECETTES[k];
      if (!detaille) {
        const cmd = this.clients.some((c) => c.recette === k && c.etat !== "part");
        return `<div class="puce ${cmd ? "commande" : ""}"><span class="emoji gros">${r.emoji}</span><span class="emoji">${this.etapes(k)}</span></div>`;
      }
      return `<div class="fiche"><div class="emoji gros">${r.emoji}</div><div><b>${r.nom}</b><br><span class="emoji">${this.etapes(k)}</span></div></div>`;
    }).join("");
  },

  majBandeau() {
    const html = this.htmlRecettes(false);
    if (html !== this.signatureBandeau) {
      this.signatureBandeau = html;
      document.getElementById("bandeau").innerHTML = html;
    }
  },

  /* ----------------------- Fin de journée ----------------------- */
  async terminer() {
    this.fini = true;
    this.joueur.file = [];
    await new Promise((r) => setTimeout(r, 1600));
    Son.victoire();
    const etoiles = this.partis === 0 ? 3 : this.partis <= 2 ? 2 : 1;
    document.getElementById("fin-etoiles").textContent = "⭐".repeat(etoiles) + "☆".repeat(3 - etoiles);
    document.getElementById("fin-servis").textContent = this.servis;
    document.getElementById("fin-partis").textContent = this.partis;
    document.getElementById("fin-pieces").textContent = this.pieces;
    document.getElementById("ov-fin").hidden = false;
    lancerConfettis(120);
  },
  quitter() {
    this.enCours = false;
    document.getElementById("ov-fin").hidden = true;
    afficher("ecran-cadeau");
  },

  /* ============================ DESSIN ============================ */
  px(c) { return this.ox + c * this.T; },
  py(r) { return this.gy + r * this.T; },

  dessiner() {
    const c = this.ctx, T = this.T;
    c.clearRect(0, 0, this.W, this.H);
    c.save();
    rectArrondi(c, this.ox, this.oy, COLS * T, (LIGNES + ZONE) * T, 16);
    c.clip();

    // Salle des clients (papier peint rayé)
    c.fillStyle = "#fde3e7"; c.fillRect(this.ox, this.oy, COLS * T, ZONE * T);
    c.fillStyle = "#fbd2da";
    for (let x = 0; x < COLS * 2; x += 2) c.fillRect(this.ox + x * T / 2, this.oy, T / 4, ZONE * T);
    // Carrelage de la cuisine
    for (let r = 0; r < LIGNES; r++) for (let col = 0; col < COLS; col++) {
      c.fillStyle = (r + col) % 2 ? "#f7e7d6" : "#fdf3e7";
      c.fillRect(this.px(col), this.py(r), T, T);
    }
    this.dessinerClients();
    for (const st of this.stations) this.dessinerStation(st);
    this.dessinerIndices();
    this.dessinerFile();
    this.dessinerJoueur();
    this.dessinerEffets();
    c.restore();
  },

  baseMeuble(x, y) {
    const c = this.ctx, T = this.T;
    c.fillStyle = "#e3c4a5"; rectArrondi(c, x + 1, y + 1, T - 2, T - 2, T * .14); c.fill();
    c.fillStyle = "#f3e0cc"; rectArrondi(c, x + 1, y + 1, T - 2, T * .8, T * .14); c.fill();
  },

  dessinerStation(st) {
    const c = this.ctx, T = this.T, x = this.px(st.c), y = this.py(st.r), cx = x + T / 2;
    switch (st.type) {
      case "comptoir":
        c.fillStyle = "#b97c4e"; c.fillRect(x, y, T, T);
        c.fillStyle = "#d89c6a"; c.fillRect(x, y, T, T * .55);
        c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(x, y + T * .05, T, T * .08);
        if (st.c === 3) emoji(c, "🛎️", cx, y + T * .32, T * .38);
        break;
      case "meuble":
        this.baseMeuble(x, y);
        if (st.deco) emoji(c, st.deco, cx, y + T * .42, T * .48);
        break;
      case "caisse":
        this.baseMeuble(x, y);
        c.fillStyle = "#c48a57"; rectArrondi(c, x + T * .12, y + T * .16, T * .76, T * .62, T * .08); c.fill();
        c.strokeStyle = "#a06c3f"; c.lineWidth = Math.max(1, T * .03);
        for (const k of [.36, .58]) { c.beginPath(); c.moveTo(x + T * .14, y + T * k); c.lineTo(x + T * .86, y + T * k); c.stroke(); }
        emoji(c, ING[st.id].emoji, cx, y + T * .44, T * .5);
        break;
      case "bol": {
        this.baseMeuble(x, y);
        const by = y + T * .52;
        c.fillStyle = "#dfe7ee";
        c.beginPath(); c.ellipse(cx, by, T * .34, T * .26, 0, 0, Math.PI); c.fill();
        c.fillStyle = "#ffffff"; c.strokeStyle = "#b9c6d2"; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(cx, by, T * .34, T * .1, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        if (st.etat === "melange" || st.etat === "pret") {
          c.fillStyle = PATES[st.pate].couleur;
          c.beginPath(); c.ellipse(cx, by, T * .29, T * .075, 0, 0, Math.PI * 2); c.fill();
          if (st.etat === "melange") {
            const a = this.temps * 9;
            c.strokeStyle = "#8d99a6"; c.lineWidth = Math.max(2, T * .05); c.lineCap = "round";
            c.beginPath(); c.moveTo(cx + Math.cos(a) * T * .14, by + Math.sin(a) * T * .04); c.lineTo(cx + T * .08, by - T * .42); c.stroke();
            anneau(c, cx, y + T * .5, T * .44, st.t / DUREE_MELANGE, "#7cc6a4");
          } else emoji(c, "✨", cx + T * .28, y + T * .2, T * .26);
        } else {
          st.contenu.forEach((id, i) => emoji(c, ING[id].emoji, cx + (i - (st.contenu.length - 1) / 2) * T * .22, by - T * .1, T * .26));
        }
        break;
      }
      case "four": {
        c.fillStyle = "#aab3be"; rectArrondi(c, x + 1, y + 1, T - 2, T - 2, T * .12); c.fill();
        c.fillStyle = "#c8cfd8"; rectArrondi(c, x + 1, y + 1, T - 2, T * .86, T * .12); c.fill();
        c.fillStyle = "#6c7380";
        for (const k of [.3, .5, .7]) { c.beginPath(); c.arc(x + T * k, y + T * .14, T * .045, 0, Math.PI * 2); c.fill(); }
        const wx = x + T * .14, wy = y + T * .26, ww = T * .72, wh = T * .46;
        c.fillStyle = "#34292a"; rectArrondi(c, wx, wy, ww, wh, T * .08); c.fill();
        if (st.objet) {
          const chaud = st.etat === "cuisson" ? .5 + .15 * Math.sin(this.temps * 6) : st.etat === "cuit" ? .35 : .15;
          const g = c.createRadialGradient(cx, wy + wh, 2, cx, wy + wh, wh * 1.2);
          g.addColorStop(0, `rgba(255,140,40,${chaud})`); g.addColorStop(1, "rgba(255,140,40,0)");
          c.fillStyle = g; rectArrondi(c, wx, wy, ww, wh, T * .08); c.fill();
          const o = st.etat === "cuisson" ? st.objet : st.etat === "brule" ? { type: "brule" } : { type: "cuit", id: PATES[st.objet.id].cuit, decors: [] };
          dessinerObjet(c, o, cx, wy + wh * .58, T * .4);
          // barre de cuisson
          const bx = x + T * .14, byy = y + T * .8, bw = T * .72, bh = T * .09;
          c.fillStyle = "rgba(0,0,0,.2)"; rectArrondi(c, bx, byy, bw, bh, bh / 2); c.fill();
          let frac = 1, coul = "#f2b33d";
          if (st.etat === "cuisson") { frac = st.t / DUREE_CUISSON; coul = "#7cc6a4"; }
          else if (st.etat === "cuit" && st.t > DELAI_BRULE - 5) coul = Math.floor(this.temps * 4) % 2 ? "#e0453a" : "#f2b33d";
          else if (st.etat === "brule") coul = "#3a2a24";
          c.fillStyle = coul; rectArrondi(c, bx, byy, bw * Math.min(1, frac), bh, bh / 2); c.fill();
          if (st.etat === "cuit") emoji(c, st.t > DELAI_BRULE - 5 ? "⚠️" : "✅", x + T * .84, y + T * .2, T * .3);
          if (st.etat === "brule") emoji(c, "💨", cx + Math.sin(this.temps * 3) * T * .1, y + T * .12, T * .34);
        }
        break;
      }
      case "plan":
        this.baseMeuble(x, y);
        c.fillStyle = "#deae78"; rectArrondi(c, x + T * .12, y + T * .2, T * .76, T * .56, T * .12); c.fill();
        c.fillStyle = "#c99560"; c.beginPath(); c.arc(x + T * .8, y + T * .3, T * .035, 0, Math.PI * 2); c.fill();
        if (st.objet) dessinerObjet(c, st.objet, cx, y + T * .5, T * .54);
        else { c.globalAlpha = .35; emoji(c, "🔪", cx, y + T * .48, T * .3); c.globalAlpha = 1; }
        break;
      case "poubelle":
        this.baseMeuble(x, y);
        emoji(c, "🗑️", cx, y + T * .44, T * .55);
        break;
    }
  },

  dessinerClients() {
    const c = this.ctx, T = this.T;
    for (const cl of this.clients) {
      const cx = this.px(cl.x + .5), base = this.oy;
      const saut = cl.etat !== "attend" ? Math.abs(Math.sin(cl.t * 10)) * T * .06 : 0;
      const fache = cl.etat === "attend" && cl.patience / cl.max < .25;
      const tremble = fache ? Math.sin(this.temps * 40) * T * .02 : 0;
      emoji(c, cl.emoji, cx + tremble, base + T * 1.82 - saut, T * .95);
      if (cl.etat === "attend") {
        // bulle de commande
        c.fillStyle = "#fff"; c.strokeStyle = "rgba(91,58,41,.15)"; c.lineWidth = 1;
        rectArrondi(c, cx - T * .44, base + T * .1, T * .88, T * .66, T * .16); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(cx - T * .08, base + T * .75); c.lineTo(cx, base + T * .88); c.lineTo(cx + T * .08, base + T * .75); c.fill();
        emoji(c, RECETTES[cl.recette].emoji, cx, base + T * .44, T * .48);
        // jauge de patience
        const f = Math.max(0, cl.patience / cl.max);
        const bx = cx - T * .4, by = base + T * .95, bw = T * .8, bh = T * .1;
        c.fillStyle = "rgba(91,58,41,.18)"; rectArrondi(c, bx, by, bw, bh, bh / 2); c.fill();
        c.fillStyle = this.tuto ? "#7fb8ef" : f > .5 ? "#5cc28f" : f > .25 ? "#f2b33d" : "#e0453a";
        rectArrondi(c, bx, by, Math.max(bh, bw * f), bh, bh / 2); c.fill();
        if (fache) emoji(c, "💢", cx + T * .36, base + T * 1.25, T * .3);
      } else if (cl.etat === "part") {
        emoji(c, cl.content ? "💖" : "😤", cx + T * .34, base + T * 1.25, T * .32);
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
    // corps + tablier
    c.fillStyle = "#ef7fa6";
    c.beginPath(); c.ellipse(x, y + T * .14 - bob, T * .25, T * .25, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff";
    c.beginPath(); c.ellipse(x, y + T * .2 - bob, T * .14, T * .17, 0, 0, Math.PI * 2); c.fill();
    // tête
    const hy = y - T * .17 - bob - geste;
    c.fillStyle = "#f5cfb2"; c.beginPath(); c.arc(x, hy, T * .19, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#8a5a40"; // cheveux
    c.beginPath(); c.arc(x, hy - T * .02, T * .19, Math.PI * 1.05, Math.PI * 1.95); c.fill();
    c.fillStyle = "#3b2a22";
    c.beginPath(); c.arc(x - T * .065 + j.dir * T * .02, hy + T * .02, T * .025, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x + T * .065 + j.dir * T * .02, hy + T * .02, T * .025, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(239,127,166,.5)";
    c.beginPath(); c.arc(x - T * .11, hy + T * .08, T * .035, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x + T * .11, hy + T * .08, T * .035, 0, Math.PI * 2); c.fill();
    // toque
    c.fillStyle = "#fff"; c.strokeStyle = "#e6d6c8"; c.lineWidth = 1;
    c.fillRect(x - T * .13, hy - T * .27, T * .26, T * .1); c.strokeRect(x - T * .13, hy - T * .27, T * .26, T * .1);
    for (const dx of [-.1, 0, .1]) { c.beginPath(); c.arc(x + dx * T, hy - T * .32, T * .1, 0, Math.PI * 2); c.fill(); }
    // objet porté
    if (j.tenu) {
      c.fillStyle = "rgba(255,255,255,.85)";
      c.beginPath(); c.arc(x, hy - T * .62, T * .27, 0, Math.PI * 2); c.fill();
      dessinerObjet(c, j.tenu, x, hy - T * .62, T * .42);
    }
  },

  dessinerIndices() {
    const c = this.ctx, T = this.T;
    const pulse = .5 + .5 * Math.sin(this.temps * 6);
    for (const st of this.indices.stations) {
      const x = this.px(st.c), y = this.py(st.r);
      c.strokeStyle = `rgba(255,179,0,${.55 + .45 * pulse})`; c.lineWidth = 3;
      rectArrondi(c, x + 2, y + 2, T - 4, T - 4, T * .14); c.stroke();
    }
    // flèches (dessinées après coup pour passer au-dessus des meubles voisins)
    this._fleches = this.indices.stations;
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
    // flèches d'aide
    const saut = Math.abs(Math.sin(this.temps * 5)) * T * .12;
    for (const st of this._fleches || []) {
      const x = this.px(st.c) + T / 2, y = this.py(st.r) - T * .02 - saut;
      c.fillStyle = "#ffb300"; c.strokeStyle = "#fff"; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x - T * .14, y - T * .18); c.lineTo(x + T * .14, y - T * .18); c.lineTo(x, y); c.closePath();
      c.fill(); c.stroke();
    }
    for (const e of this.effets) {
      const x = this.px(e.x), y = this.py(e.y);
      if (e.type === "onde") {
        c.strokeStyle = `rgba(91,58,41,${e.vie / .4 * .5})`; c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, T * (.45 - e.vie / .4 * .3), 0, Math.PI * 2); c.stroke();
      } else if (e.type === "texte") {
        c.globalAlpha = Math.min(1, e.vie);
        c.font = `800 ${Math.round(T * .32)}px Nunito, ${EMOJI_FONT}`; c.textAlign = "center"; c.textBaseline = "middle";
        c.lineWidth = 4; c.strokeStyle = "#fff"; c.strokeText(e.txt, x, y);
        c.fillStyle = e.couleur; c.fillText(e.txt, x, y);
        c.globalAlpha = 1;
      } else if (e.type === "coeur") {
        c.globalAlpha = Math.min(1, e.vie); emoji(c, "💗", x, y, T * .26); c.globalAlpha = 1;
      }
    }
  },
};

/* ----------------------------- Dessin d'objets ----------------------------- */
function emoji(c, ch, x, y, taille) {
  c.font = `${Math.round(taille)}px ${EMOJI_FONT}`;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(ch, x, y);
}
function rectArrondi(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function anneau(c, x, y, r, frac, couleur) {
  c.strokeStyle = "rgba(0,0,0,.12)"; c.lineWidth = 4;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = couleur; c.lineCap = "round";
  c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac)); c.stroke();
  c.lineCap = "butt";
}

function dessinerObjet(c, o, x, y, s) {
  if (o.type === "ingr") return emoji(c, ING[o.id].emoji, x, y, s);
  if (o.type === "pate") {
    c.fillStyle = "#dfe7ee";
    c.beginPath(); c.ellipse(x, y, s * .45, s * .36, 0, 0, Math.PI); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(x, y, s * .45, s * .14, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = PATES[o.id].couleur; c.beginPath(); c.ellipse(x, y, s * .38, s * .1, 0, 0, Math.PI * 2); c.fill();
    if (o.id === "cookie") { c.fillStyle = "#4a2c1d"; for (const dx of [-.18, .05, .2]) { c.beginPath(); c.arc(x + dx * s, y + (dx > 0 ? -.02 : .03) * s, s * .035, 0, Math.PI * 2); c.fill(); } }
    return;
  }
  if (o.type === "brule") {
    c.fillStyle = "#2b2220"; c.beginPath(); c.ellipse(x, y + s * .08, s * .38, s * .2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(120,120,120,.6)";
    for (const [dx, dy, r] of [[-.12, -.22, .1], [.08, -.32, .13], [.2, -.2, .08]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); c.fill(); }
    return;
  }
  // gâteau cuit
  const r = recetteDe(o);
  if (r && (RECETTES[r].decors.length || o.id === "cookie")) return emoji(c, RECETTES[r].emoji, x, y, s);
  if (o.id === "genoise") {
    c.fillStyle = "#d9a441";
    c.beginPath(); c.ellipse(x, y + s * .16, s * .4, s * .12, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(x - s * .4, y - s * .08, s * .8, s * .24);
    c.fillStyle = "#f2cf73"; c.beginPath(); c.ellipse(x, y - s * .08, s * .4, s * .12, 0, 0, Math.PI * 2); c.fill();
  } else if (o.id === "fond") {
    c.fillStyle = "#c98d4f"; c.beginPath(); c.ellipse(x, y + s * .06, s * .44, s * .2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#f0d39c"; c.beginPath(); c.ellipse(x, y + s * .02, s * .34, s * .13, 0, 0, Math.PI * 2); c.fill();
  }
  o.decors.forEach((d, i) => emoji(c, ING[d].emoji, x + (i - (o.decors.length - 1) / 2) * s * .32, y - s * .22, s * .38));
}
