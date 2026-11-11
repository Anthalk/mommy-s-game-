"use strict";
/* Scènes de dialogue façon bande dessinée : on touche l'écran pour avancer. */

function portraitDe(qui) {
  if (!qui) return null;
  if (FAMILLE[qui]) return { img: "perso_" + qui, nom: FAMILLE[qui].nom };
  if (ANIMAUX_FAMILLE[qui]) return { img: ANIMAUX_FAMILLE[qui].img, nom: ANIMAUX_FAMILLE[qui].nom };
  return null;
}

const Dialogue = {
  jouer(lignes) {
    return new Promise((fin) => {
      const ov = $("#ov-dialogue");
      let i = -1, minuteur = null, complet = true;
      const texteEl = $("#dlg-texte");
      const suivante = () => {
        if (!complet) { clearInterval(minuteur); texteEl.textContent = lignes[i].texte; complet = true; return; }
        i++;
        if (i >= lignes.length) return terminer();
        const l = lignes[i], p = portraitDe(l.qui);
        const img = p ? p.img : l.img;
        $("#dlg-portrait").hidden = !img;
        if (img) $("#dlg-portrait").src = srcImg(img);
        $("#dlg-nom").hidden = !p;
        $("#dlg-nom").textContent = p ? p.nom : "";
        $("#dlg-boite").classList.toggle("narration", !p);
        $("#dlg-boite").classList.toggle("choc", l.son === "crac");
        $("#dlg-boite").classList.remove("arrive"); void $("#dlg-boite").offsetWidth; $("#dlg-boite").classList.add("arrive");
        if (l.son && Son[l.son]) Son[l.son]();
        if (l.son === "crac" && navigator.vibrate) navigator.vibrate([60, 30, 60]);
        // effet machine à écrire
        let n = 0; complet = false; texteEl.textContent = "";
        minuteur = setInterval(() => {
          n += 1; texteEl.textContent = l.texte.slice(0, n);
          if (n >= l.texte.length) { clearInterval(minuteur); complet = true; }
        }, 28);
      };
      const terminer = () => {
        clearInterval(minuteur);
        ov.hidden = true;
        ov.removeEventListener("click", clic);
        $("#dlg-passer").removeEventListener("click", passer);
        fin();
      };
      const clic = (e) => { if (e.target.id !== "dlg-passer") { Son.init(); suivante(); } };
      const passer = (e) => { e.stopPropagation(); terminer(); };
      ov.addEventListener("click", clic);
      $("#dlg-passer").addEventListener("click", passer);
      ov.hidden = false;
      suivante();
    });
  },
};
