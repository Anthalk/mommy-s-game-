"use strict";
/* Chiffrement du code de la carte cadeau avec le « mot magique ».
   AES-GCM 256 bits, clé dérivée du mot par PBKDF2-SHA-256 (310 000 itérations),
   via l'API de cryptographie intégrée au navigateur (WebCrypto).
   Sans le mot magique, le texte chiffré ne permet pas de retrouver le code. */
const Secret = {
  disponible() { return !!(window.crypto && crypto.subtle && window.isSecureContext !== false); },

  // « Pyramides de Roswell ! » et « pyramides de roswell » donnent le même mot
  normaliser(mot) {
    return String(mot).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  },

  async cle(mot, sel) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(this.normaliser(mot)), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: sel, iterations: 310000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  },

  async chiffrer(texte, mot) {
    const sel = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const chiffre = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await this.cle(mot, sel), new TextEncoder().encode(texte)));
    const tout = new Uint8Array(28 + chiffre.length);
    tout.set(sel); tout.set(iv, 16); tout.set(chiffre, 28);
    let bin = ""; tout.forEach((o) => (bin += String.fromCharCode(o)));
    return "v1:" + btoa(bin);
  },

  // renvoie le texte, ou lève une erreur si le mot magique est faux
  async dechiffrer(blob, mot) {
    if (!String(blob).startsWith("v1:")) throw new Error("format");
    const b = Uint8Array.from(atob(blob.slice(3).trim()), (ch) => ch.charCodeAt(0));
    const clair = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(16, 28) }, await this.cle(mot, b.slice(0, 16)), b.slice(28));
    return new TextDecoder().decode(clair);
  },
};
