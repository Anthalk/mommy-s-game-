"use strict";
/* Portraits de la famille, dessinés à partir de leur description (js/famille.js),
   dans le même style que les illustrations 3D du jeu. */

const AVATARS_URL = {};   // nom d'image → data URL (utilisé par srcImg pour le HTML)

function melanger(c1, c2, t) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
  const g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
  const bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

function dessinerAvatar(a, epaules = true) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const c = cv.getContext("2d");
  const peau = a.peau || "#f2c9a8", ch = a.cheveux || "#5a3825";
  const peauC = melanger(peau, "#ffffff", .35), peauF = melanger(peau, "#7a4a30", .25);
  const chC = melanger(ch, "#ffffff", .25), chF = melanger(ch, "#000000", .3);
  const rad = (x, y, r, c1, c2) => { const g = c.createRadialGradient(x - r * .3, y - r * .4, r * .1, x, y, r * 1.1); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; };
  const forme = (f, fill) => { c.beginPath(); f(); c.fillStyle = fill; c.fill(); };
  const cheveux = rad(128, 90, 120, chC, chF);
  const coupe = a.coupe || "court";
  const decal = epaules ? 0 : 14;   // tête seule : un peu plus bas dans le cadre
  c.translate(0, decal);

  // ---- cheveux de derrière ----
  if (coupe === "long") forme(() => { c.moveTo(46, 128); c.quadraticCurveTo(40, 34, 128, 32); c.quadraticCurveTo(216, 34, 210, 128); c.lineTo(216, 232); c.quadraticCurveTo(128, 246, 40, 232); c.closePath(); }, cheveux);
  if (coupe === "carre") forme(() => { c.moveTo(44, 128); c.quadraticCurveTo(40, 34, 128, 32); c.quadraticCurveTo(216, 34, 212, 128); c.lineTo(214, 192); c.quadraticCurveTo(128, 206, 42, 192); c.closePath(); }, cheveux);
  if (coupe === "boucles") {
    c.fillStyle = cheveux;
    for (let i = 0; i <= 16; i++) {
      const ang = Math.PI * (.95 + i * 1.1 / 16);
      c.beginPath(); c.arc(128 + Math.cos(ang) * 86, 128 + Math.sin(ang) * 88, 30, 0, Math.PI * 2); c.fill();
    }
    for (const [x, y] of [[44, 168], [212, 168], [50, 200], [206, 200]]) { c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fill(); }
  }
  if (coupe === "queue") forme(() => { c.ellipse(206, 150, 26, 58, -.25, 0, Math.PI * 2); }, cheveux);
  if (coupe === "chignon") forme(() => { c.arc(128, 36, 32, 0, Math.PI * 2); }, cheveux);

  // ---- épaules ----
  if (epaules) {
    const haut = a.haut || "#7fb8ef";
    const g = c.createLinearGradient(0, 200, 0, 256); g.addColorStop(0, melanger(haut, "#ffffff", .2)); g.addColorStop(1, melanger(haut, "#000000", .15));
    forme(() => { c.moveTo(30, 262); c.quadraticCurveTo(34, 206, 128, 200); c.quadraticCurveTo(222, 206, 226, 262); c.closePath(); }, g);
    forme(() => { c.moveTo(104, 204); c.quadraticCurveTo(128, 226, 152, 204); c.closePath(); }, peauF);
  }
  // ---- oreilles et tête ----
  for (const x of [52, 204]) forme(() => c.arc(x, 136, 15, 0, Math.PI * 2), peauF);
  forme(() => c.ellipse(128, 128, 76, 84, 0, 0, Math.PI * 2), rad(128, 128, 84, peauC, peau));

  // ---- barbe ----
  if (a.barbe === "courte") {
    forme(() => { c.moveTo(54, 132); c.quadraticCurveTo(58, 214, 128, 216); c.quadraticCurveTo(198, 214, 202, 132); c.quadraticCurveTo(196, 186, 150, 180); c.quadraticCurveTo(128, 172, 106, 180); c.quadraticCurveTo(60, 186, 54, 132); c.closePath(); }, cheveux);
    forme(() => c.ellipse(128, 186, 20, 9, 0, 0, Math.PI * 2), melanger(peau, "#8a3b3b", .3));
  }
  if (a.barbe === "courte" || a.barbe === "moustache") forme(() => { c.moveTo(100, 168); c.quadraticCurveTo(128, 150, 156, 168); c.quadraticCurveTo(128, 162, 100, 168); c.closePath(); }, cheveux);

  // ---- visage ----
  c.fillStyle = "rgba(239,127,166,.35)";
  for (const x of [84, 172]) { c.beginPath(); c.ellipse(x, 162, 16, 10, 0, 0, Math.PI * 2); c.fill(); }
  for (const x of [98, 158]) {
    c.fillStyle = "#3b2a22"; c.beginPath(); c.ellipse(x, 138, 9, 11, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(x - 3, 134, 3.5, 0, Math.PI * 2); c.fill();
  }
  c.strokeStyle = chF; c.lineWidth = 5; c.lineCap = "round";
  for (const x of [98, 158]) { c.beginPath(); c.moveTo(x - 14, 116); c.quadraticCurveTo(x, 108, x + 14, 116); c.stroke(); }
  c.strokeStyle = peauF; c.lineWidth = 4;
  c.beginPath(); c.moveTo(124, 150); c.quadraticCurveTo(128, 156, 133, 151); c.stroke();
  if (a.barbe !== "courte") {
    c.strokeStyle = "#8a3b3b"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(108, 172); c.quadraticCurveTo(128, 190, 148, 172); c.stroke();
  }

  // ---- cheveux de devant ----
  if (coupe === "chauve") {
    // rien
  } else if (coupe === "degarni") {
    forme(() => { c.moveTo(50, 150); c.quadraticCurveTo(46, 96, 70, 80); c.quadraticCurveTo(64, 112, 66, 150); c.closePath(); }, cheveux);
    forme(() => { c.moveTo(206, 150); c.quadraticCurveTo(210, 96, 186, 80); c.quadraticCurveTo(192, 112, 190, 150); c.closePath(); }, cheveux);
  } else if (coupe === "boucles") {
    c.fillStyle = cheveux;
    for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(70 + i * 19, 62 + Math.abs(3 - i) * 4, 24, 0, Math.PI * 2); c.fill(); }
  } else {
    const bas = coupe === "court" ? 112 : 128;
    forme(() => {
      c.moveTo(50, bas); c.quadraticCurveTo(44, 40, 128, 38); c.quadraticCurveTo(212, 40, 206, bas);
      if (a.frange) { c.quadraticCurveTo(196, 104, 176, 104); c.quadraticCurveTo(128, 110, 80, 104); c.quadraticCurveTo(60, 104, 50, bas); }
      else { c.quadraticCurveTo(190, 78, 150, 74); c.quadraticCurveTo(110, 92, 76, 84); c.quadraticCurveTo(58, 92, 50, bas); }
      c.closePath();
    }, cheveux);
    c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 6;
    c.beginPath(); c.moveTo(80, 56); c.quadraticCurveTo(100, 46, 126, 46); c.stroke();
  }

  // ---- lunettes ----
  if (a.lunettes) {
    c.strokeStyle = "#3b2a22"; c.lineWidth = 5; c.fillStyle = "rgba(255,255,255,.18)";
    for (const x of [98, 158]) {
      c.beginPath();
      if (a.lunettes === "rondes") c.arc(x, 138, 21, 0, Math.PI * 2); else rectArrondi(c, x - 24, 120, 48, 36, 9);
      c.fill(); c.stroke();
    }
    c.beginPath(); c.moveTo(119, 136); c.quadraticCurveTo(128, 130, 137, 136); c.stroke();
  }
  return cv.toDataURL("image/png");
}

function genererAvatars() {
  const taches = [];
  for (const [cle, p] of Object.entries(FAMILLE)) {
    AVATARS_URL["perso_" + cle] = dessinerAvatar(p.avatar, true);
    taches.push("perso_" + cle);
  }
  AVATARS_URL.tete_maman = dessinerAvatar(FAMILLE.maman.avatar, false);
  taches.push("tete_maman");
  return Promise.all(taches.map((n) => new Promise((ok) => {
    const im = new Image(); im.onload = () => { IMG[n] = im; ok(); }; im.onerror = () => ok(); im.src = AVATARS_URL[n];
  })));
}
