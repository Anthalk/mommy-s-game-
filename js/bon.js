"use strict";
/* Écrans, bon cadeau (QR code + image téléchargeable) et confettis */
/* ===================== LE CADEAU ===================== */
function texteQR() {
  if (CONFIG.qrContenu && CONFIG.qrContenu.trim()) return CONFIG.qrContenu.trim();
  return [
    "BON CADEAU",
    CONFIG.titreBon,
    `Offert à ${CONFIG.prenom} pour son anniversaire`,
    CONFIG.code && `Code : ${CONFIG.code}`,
    CONFIG.validite,
    CONFIG.signature,
  ].filter(Boolean).join("\n");
}

function creerQR() {
  const qr = qrcode(0, "M");
  qr.addData(texteQR(), "Byte");
  qr.make();
  return qr;
}

// Dessine le QR code (avec sa marge blanche obligatoire) sur un contexte 2D
function dessinerQR(ctx, qr, x, y, taille) {
  const n = qr.getModuleCount(), marge = 4, cellule = taille / (n + marge * 2);
  ctx.fillStyle = "#fff"; ctx.fillRect(x, y, taille, taille);
  ctx.fillStyle = "#2b1a12";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (qr.isDark(r, c)) {
      ctx.fillRect(Math.floor(x + (c + marge) * cellule), Math.floor(y + (r + marge) * cellule),
                   Math.ceil(cellule), Math.ceil(cellule));
    }
  }
}

function remplirBon() {
  $("#bon-titre").textContent = CONFIG.titreBon;
  $("#bon-pour").textContent = `Offert à ${CONFIG.prenom} pour son anniversaire`;
  $("#bon-details").textContent = CONFIG.details;
  $("#bon-code").textContent = CONFIG.code ? `Code : ${CONFIG.code}` : "";
  $("#bon-validite").textContent = CONFIG.validite;
  $("#bon-signature").textContent = CONFIG.signature;
  const qr = creerQR(), n = qr.getModuleCount();
  const cv = $("#qr"), echelle = 8, taille = (n + 8) * echelle;
  cv.width = cv.height = taille;
  dessinerQR(cv.getContext("2d"), qr, 0, 0, taille);
}

$("#cadeau").addEventListener("click", async () => {
  const c = $("#cadeau");
  if (c.classList.contains("secoue")) return;
  c.classList.add("secoue");
  Son.init();
  Son.note(400, .15, "triangle", .1); Son.note(500, .15, "triangle", .1, .25);
  await pause(1000);
  c.classList.remove("secoue");
  remplirBon();
  Progression.etat.bonVu = true; Progression.sauver();
  afficher("ecran-bon");
  Son.victoire();
  lancerConfettis(220);
  setTimeout(() => lancerConfettis(120), 900);
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
  const W = 1080, H = 1500, cv = document.createElement("canvas");
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
  for (const l of lignes(c, `Offert à ${CONFIG.prenom} pour son anniversaire`, W - 260)) { c.fillText(l, W / 2, y); y += 52; }
  y += 10;
  c.font = '400 34px Nunito, sans-serif';
  for (const l of lignes(c, CONFIG.details, W - 300)) { c.fillText(l, W / 2, y); y += 46; }
  y += 30;
  // QR
  const qr = creerQR(), tq = 470;
  dessinerQR(c, qr, (W - tq) / 2, y, tq);
  y += tq + 70;
  c.font = '800 42px Nunito, sans-serif'; c.fillStyle = "#5b3a29";
  if (CONFIG.code) { c.fillText(`Code : ${CONFIG.code}`, W / 2, y); y += 56; }
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

$("#btn-telecharger").addEventListener("click", async () => {
  const cv = await imageDuBon();
  const nom = "bon-cadeau-atelier-patisserie.png";
  cv.toBlob(async (blob) => {
    if (!blob) return;
    const fichier = new File([blob], nom, { type: "image/png" });
    // Sur téléphone : feuille de partage (permet « Enregistrer l'image »)
    if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
      try { await navigator.share({ files: [fichier], title: "Mon bon cadeau" }); return; }
      catch (e) { if (e.name === "AbortError") return; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = nom;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, "image/png");
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
