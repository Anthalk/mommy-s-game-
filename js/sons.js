/* Petits sons synthétisés (aucun fichier audio nécessaire) */
const Son = {
  ctx: null, coupe: false,
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  },
  note(freq, duree = .12, type = "sine", vol = .12, retard = 0) {
    if (this.coupe || !this.ctx) return;
    const t = this.ctx.currentTime + retard;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + duree);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + duree + .02);
  },
  prendre()  { this.note(620, .08, "triangle", .1); this.note(880, .08, "triangle", .08, .05); },
  poser()    { this.note(420, .09, "triangle", .1); },
  plouf()    { this.note(300, .12, "sine", .14); this.note(520, .1, "sine", .08, .06); },
  four()     { this.note(220, .3, "sawtooth", .04); },
  ding()     { this.note(1318, .5, "sine", .12); this.note(1760, .6, "sine", .08, .12); },
  alerte()   { this.note(880, .1, "square", .05); },
  cloche()   { this.note(1046, .35, "sine", .1); },
  erreur()   { this.note(200, .15, "square", .05); },
  jeter()    { this.note(160, .2, "sawtooth", .06); },
  triste()   { [392, 330, 262].forEach((f, i) => this.note(f, .22, "triangle", .08, i * .14)); },
  caisse()   { [784, 988, 1175, 1568].forEach((f, i) => this.note(f, .18, "triangle", .1, i * .07)); },
  victoire() { [523, 659, 784, 1047].forEach((f, i) => this.note(f, .25, "triangle", .12, i * .12)); },
  joyeux() {
    // « Joyeux anniversaire » (mélodie traditionnelle, domaine public)
    const N = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
    const air = [["G4",.75],["G4",.25],["A4",1],["G4",1],["C5",1],["B4",2],
                 ["G4",.75],["G4",.25],["A4",1],["G4",1],["D5",1],["C5",2],
                 ["G4",.75],["G4",.25],["G5",1],["E5",1],["C5",1],["B4",1],["A4",2],
                 ["F5",.75],["F5",.25],["E5",1],["C5",1],["D5",1],["C5",2.5]];
    let t = 0; const temps = .36;
    air.forEach(([n, d]) => { this.note(N[n], d * temps * .95, "triangle", .1, t); t += d * temps; });
  },
};
