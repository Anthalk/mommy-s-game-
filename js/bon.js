"use strict";
/* Bon cadeau (affichage, PDF téléchargeable) et confettis */
/* ===================== LE CADEAU ===================== */
let codeBon = CONFIG.code || "";   // rempli après le mot magique si le code est chiffré
const siteCourt = () => (CONFIG.lien || "").replace(/^https?:\/\//, "").replace(/\/$/, "");

function remplirBon() {
  $("#bon-titre").textContent = CONFIG.titreBon;
  $("#bon-pour").textContent = CONFIG.dedicace;
  const l = $("#bon-lien");
  l.hidden = !CONFIG.lien; l.href = CONFIG.lien || "#";
  l.textContent = "À utiliser sur " + siteCourt();
  $("#bon-details").textContent = CONFIG.details;
  $("#bon-code").textContent = codeBon || "(code à venir)";
  $("#bon-validite").textContent = CONFIG.validite;
  $("#bon-signature").textContent = CONFIG.signature;
}

$("#btn-copier").addEventListener("click", async () => {
  const b = $("#btn-copier");
  try { await navigator.clipboard.writeText(codeBon); b.textContent = "Code copié ✓"; }
  catch (e) {   // repli : on sélectionne le code pour une copie manuelle
    const r = document.createRange(); r.selectNodeContents($("#bon-code"));
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    b.textContent = "Code sélectionné";
  }
  setTimeout(() => (b.textContent = "Copier le code"), 2500);
});

$("#cadeau").addEventListener("click", async () => {
  const c = $("#cadeau");
  if (c.classList.contains("secoue")) return;
  c.classList.add("secoue");
  Son.init();
  Son.note(400, .15, "triangle", .1); Son.note(500, .15, "triangle", .1, .25);
  await pause(1000);
  c.classList.remove("secoue");
  if (CONFIG.codeChiffre && !codeBon) {
    // le mot magique a peut-être déjà été donné sur cet appareil
    const memo = Progression.etat.motMagique;
    if (memo && Secret.disponible()) { try { codeBon = await Secret.dechiffrer(CONFIG.codeChiffre, memo); } catch (e) {} }
    if (!codeBon) return demanderMot();
  }
  ouvrirBon();
});

function ouvrirBon() {
  remplirBon();
  Progression.etat.bonVu = true; Progression.sauver();
  afficher("ecran-bon");
  Son.victoire();
  lancerConfettis(220);
  setTimeout(() => lancerConfettis(120), 900);
}

function demanderMot() {
  $("#cadeau-intro").hidden = true;
  $("#mot-magique").hidden = false;
  $("#mot-indice").textContent = CONFIG.indiceMotMagique || "";
  $("#mot-erreur").textContent = "";
  setTimeout(() => $("#mot-saisie").focus(), 100);
}

$("#mot-magique").addEventListener("submit", async (e) => {
  e.preventDefault();
  const mot = $("#mot-saisie").value, err = $("#mot-erreur"), form = $("#mot-magique");
  if (!Secret.normaliser(mot)) return;
  if (!Secret.disponible()) { err.textContent = "Ouvre le jeu depuis son adresse en ligne (https://…) pour pouvoir ouvrir le cadenas."; return; }
  $("#btn-mot").disabled = true; err.textContent = "";
  try {
    codeBon = await Secret.dechiffrer(CONFIG.codeChiffre, mot);
    Progression.etat.motMagique = Secret.normaliser(mot); Progression.sauver();
    Son.caisse();
    form.hidden = true;
    ouvrirBon();
  } catch (x) {
    Son.erreur();
    if (x.message === "format" || x.name === "InvalidCharacterError" || x.name === "DataError") {
      err.textContent = "Le code chiffré de js/config.js semble incomplet : recopie-le en entier depuis chiffrer.html.";
      $("#btn-mot").disabled = false; return;
    }
    err.textContent = choisir(["Ce n'est pas le bon mot magique…", "Raté ! Le cadenas ne bouge pas.", "Non… Essaie encore !"]);
    form.classList.remove("non"); void form.offsetWidth; form.classList.add("non");
  }
  $("#btn-mot").disabled = false;
});

$("#btn-retour-semaine").addEventListener("click", () => Semaine.afficher());

/* ---------------------- Image téléchargeable du bon ---------------------- */
function lignes(ctx, texte, largeurMax) {
  const mots = texte.split(" "), res = []; let ligne = "";
  for (const m of mots) {
    const essai = ligne ? ligne + " " + m : m;
    if (ctx.measureText(essai).width > largeurMax && ligne) { res.push(ligne); ligne = m; } else ligne = essai;
  }
  if (ligne) res.push(ligne);
  return res;
}

async function imageDuBon() {
  try { await Promise.all([document.fonts.load('80px "Pacifico"'), document.fonts.load('800 40px "Nunito"'), document.fonts.load('400 40px "Nunito"')]); } catch (e) {}
  const W = 1080, H = 1250, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const emo = getComputedStyle(document.documentElement).getPropertyValue("--emoji");
  // fond
  c.fillStyle = "#fff4e8"; c.fillRect(0, 0, W, H);
  c.fillStyle = "#ffe1ea";
  [[120, 120, 160], [980, 1380, 180], [960, 160, 90], [90, 1300, 80]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
  // carte
  rectArrondi(c, 70, 70, W - 140, H - 140, 50);
  c.fillStyle = "#fffdf9"; c.fill();
  c.setLineDash([26, 18]); c.lineWidth = 8; c.strokeStyle = "#ef7fa6"; c.stroke(); c.setLineDash([]);

  c.textAlign = "center"; c.textBaseline = "alphabetic";
  let y = 210;
  // étiquette
  c.font = '800 38px Nunito, sans-serif';
  const et = "B O N   C A D E A U", lw = c.measureText(et).width + 80;
  rectArrondi(c, W / 2 - lw / 2, y - 52, lw, 74, 37); c.fillStyle = "#ef7fa6"; c.fill();
  c.fillStyle = "#fff"; c.fillText(et, W / 2, y);
  y += 130;
  c.font = '84px Pacifico, cursive'; c.fillStyle = "#d65a87";
  for (const l of lignes(c, CONFIG.titreBon, W - 260)) { c.fillText(l, W / 2, y); y += 100; }
  c.font = '800 40px Nunito, sans-serif'; c.fillStyle = "#5b3a29";
  for (const l of lignes(c, CONFIG.dedicace, W - 260)) { c.fillText(l, W / 2, y); y += 52; }
  y += 10;
  c.font = '400 34px Nunito, sans-serif';
  for (const l of lignes(c, CONFIG.details, W - 300)) { c.fillText(l, W / 2, y); y += 46; }
  y += 40;
  // le code de la carte cadeau, bien en évidence
  if (codeBon) {
    rectArrondi(c, 150, y, W - 300, 230, 30); c.fillStyle = "#fff4e8"; c.fill();
    c.setLineDash([16, 12]); c.lineWidth = 5; c.strokeStyle = "#e9b44c"; c.stroke(); c.setLineDash([]);
    c.font = '800 30px Nunito, sans-serif'; c.fillStyle = "#d65a87";
    c.fillText("C O D E   D E   L A   C A R T E   C A D E A U", W / 2, y + 70);
    let taille = 76;
    do { c.font = `800 ${taille}px Nunito, sans-serif`; taille -= 4; } while (c.measureText(codeBon).width > W - 360 && taille > 30);
    c.fillStyle = "#5b3a29"; c.fillText(codeBon, W / 2, y + 165);
    y += 230 + 70;
  }
  if (CONFIG.lien) {   // adresse du site (cliquable dans le PDF)
    c.font = '800 36px Nunito, sans-serif'; c.fillStyle = "#d65a87";
    const t = "À utiliser sur " + siteCourt(), w = c.measureText(t).width;
    c.fillText(t, W / 2, y);
    c.fillRect(W / 2 - w / 2, y + 8, w, 3);
    cv.lien = { x: W / 2 - w / 2 - 10, y: y - 40, w: w + 20, h: 60 };
    y += 64;
  }
  c.fillStyle = "#5b3a29";
  c.font = '400 32px Nunito, sans-serif'; c.globalAlpha = .75;
  if (CONFIG.validite) { c.fillText(CONFIG.validite, W / 2, y); y += 50; }
  c.globalAlpha = 1;
  c.fillStyle = "#8a5a40";
  // la signature peut contenir un emoji : on combine les polices
  c.font = `52px Pacifico, ${emo}`;
  c.fillText(CONFIG.signature, W / 2, Math.max(y + 40, H - 150));
  // (en ouvrant le fichier en local, le navigateur interdit d'exporter une image contenant des PNG)
  if (location.protocol !== "file:") { dessinerImage(c, "anniversaire", 190, H - 150, 110); dessinerImage(c, "cupcake", W - 190, H - 150, 110); }
  return cv;
}

/* PDF d'une page A4 contenant l'image du bon (format PDF écrit à la main :
   une image JPEG centrée sur la page, aucune bibliothèque nécessaire). */
function pdfDepuisCanvas(cv) {
  const jpeg = Uint8Array.from(atob(cv.toDataURL("image/jpeg", .93).split(",")[1]), (ch) => ch.charCodeAt(0));
  const PW = 595.28, PH = 841.89, marge = 24;
  const k = Math.min((PW - 2 * marge) / cv.width, (PH - 2 * marge) / cv.height);
  const iw = cv.width * k, ih = cv.height * k, ix = (PW - iw) / 2, iy = (PH - ih) / 2;
  const dessin = `q ${iw.toFixed(2)} 0 0 ${ih.toFixed(2)} ${ix.toFixed(2)} ${iy.toFixed(2)} cm /Im0 Do Q`;
  const enc = new TextEncoder(), morceaux = [], positions = [];
  let taille = 0;
  const ajoute = (x) => { const b = typeof x === "string" ? enc.encode(x) : x; morceaux.push(b); taille += b.length; };
  const objet = (n, debut, flux, fin) => { positions[n] = taille; ajoute(`${n} 0 obj\n${debut}`); if (flux) { ajoute(flux); ajoute(fin); } ajoute("\nendobj\n"); };
  ajoute("%PDF-1.4\n"); ajoute(new Uint8Array([37, 226, 227, 207, 211, 10]));
  objet(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objet(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  const annot = cv.lien && CONFIG.lien ? " /Annots [7 0 R]" : "";
  objet(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R${annot} >>`);
  objet(4, `<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, "\nendstream");
  objet(5, `<< /Length ${dessin.length} >>\nstream\n`, dessin, "\nendstream");
  objet(6, "<< /Title (Bon cadeau - Atelier patisserie) /Producer (La patisserie de Maman) >>");
  // lien cliquable vers le site (coordonnées du canvas → points PDF, axe vertical inversé)
  const L = cv.lien, rect = L ? [ix + L.x * k, iy + (cv.height - L.y - L.h) * k, ix + (L.x + L.w) * k, iy + (cv.height - L.y) * k].map((v) => v.toFixed(2)).join(" ") : "";
  objet(7, `<< /Type /Annot /Subtype /Link /Rect [${rect || "0 0 0 0"}] /Border [0 0 0] /A << /S /URI /URI (${(CONFIG.lien || "").replace(/[()\\]/g, "")}) >> >>`);
  const xref = taille;
  ajoute(`xref\n0 8\n0000000000 65535 f \n${positions.slice(1).map((p) => String(p).padStart(10, "0") + " 00000 n \n").join("")}`);
  ajoute(`trailer\n<< /Size 8 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(morceaux, { type: "application/pdf" });
}

$("#btn-telecharger").addEventListener("click", async () => {
  const blob = pdfDepuisCanvas(await imageDuBon());
  const nom = "bon-cadeau-atelier-patisserie.pdf";
  const fichier = new File([blob], nom, { type: "application/pdf" });
  // Sur téléphone : feuille de partage (« Enregistrer dans Fichiers », e-mail…)
  if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
    try { await navigator.share({ files: [fichier], title: "Mon bon cadeau" }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nom;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
});

/* ============================ CONFETTIS ============================ */
const Conf = { cv: $("#confettis"), ctx: null, parts: [], actif: false };
Conf.ctx = Conf.cv.getContext("2d");
function redimConfettis() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  Conf.cv.width = innerWidth * dpr; Conf.cv.height = innerHeight * dpr;
  Conf.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
redimConfettis();
function lancerConfettis(n) {
  const couleurs = ["#ef7fa6", "#e9b44c", "#8fd3b6", "#7fb8ef", "#f6d365", "#c79bf2"];
  for (let i = 0; i < n; i++) {
    Conf.parts.push({
      x: innerWidth / 2 + hasard(-40, 40), y: innerHeight * .35,
      vx: hasard(-1, 1) * hasard(150, 520), vy: hasard(-820, -260),
      w: hasard(6, 12), h: hasard(10, 18), rot: hasard(0, 6), vr: hasard(-10, 10),
      c: choisir(couleurs), vie: hasard(2.5, 4),
    });
  }
  if (!Conf.actif) { Conf.actif = true; Conf.dernier = performance.now(); requestAnimationFrame(animerConfettis); }
}
function animerConfettis(t) {
  const dt = Math.min(.05, (t - Conf.dernier) / 1000); Conf.dernier = t;
  const c = Conf.ctx;
  c.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of Conf.parts) {
    p.vy += 900 * dt; p.vx *= (1 - 1.2 * dt); p.vy *= (1 - .8 * dt);
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.vie -= dt;
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
    c.globalAlpha = Math.min(1, p.vie);
    c.fillStyle = p.c; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
    c.restore();
  }
  Conf.parts = Conf.parts.filter((p) => p.vie > 0 && p.y < innerHeight + 40);
  if (Conf.parts.length) requestAnimationFrame(animerConfettis);
  else { Conf.actif = false; c.clearRect(0, 0, innerWidth, innerHeight); }
}
