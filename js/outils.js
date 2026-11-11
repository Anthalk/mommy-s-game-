"use strict";
/* Petits utilitaires partagés */
const $ = (s) => document.querySelector(s);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const hasard = (a, b) => a + Math.random() * (b - a);
const choisir = (t) => t[Math.floor(Math.random() * t.length)];
const echapper = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function afficher(id) {
  document.querySelectorAll(".ecran").forEach((e) => e.classList.toggle("actif", e.id === id));
}

function rectArrondi(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

/* ----------------------------- Images ----------------------------- */
const IMG = {};
const srcImg = (nom) => (typeof AVATARS_URL !== "undefined" && AVATARS_URL[nom]) || `assets/img/${nom}.png`;
function chargerImages(noms) {
  return Promise.all(noms.map((n) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => { IMG[n] = im; ok(); };
    im.onerror = () => ok();          // une image manquante ne bloque pas le jeu
    im.src = srcImg(n);
  })));
}
function dessinerImage(c, nom, x, y, taille) {
  const im = IMG[nom];
  if (im) c.drawImage(im, x - taille / 2, y - taille / 2, taille, taille);
}
