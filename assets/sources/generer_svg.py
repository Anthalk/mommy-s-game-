#!/usr/bin/env python3
"""Génère les illustrations « maison » (SVG) dans le style des Fluent Emoji 3D :
volumes doux, dégradés, pas de contour. Lancer : python3 generer_svg.py
Les SVG sont écrits dans ce dossier ; ils sont ensuite convertis en PNG
(voir README du projet)."""
import os

ICI = os.path.dirname(os.path.abspath(__file__))


def svg(contenu, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">'
            f'<defs>{defs}</defs>{contenu}</svg>')


def lin(id_, *stops, x1=0, y1=0, x2=0, y2=1):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rad(id_, *stops, cx=.35, cy=.3, r=.8):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


OMBRE = ""   # pas d'ombre portée (comme les Fluent Emoji)

# ------------------------------------------------------------------ farine
def farine():
    d = (lin("sac", (0, "#e4d3b6"), (.45, "#fbf4e6"), (1, "#d3bd98"), x2=1, y2=0)
         + lin("haut", (0, "#d6c19c"), (.5, "#f1e6d2"), (1, "#c5ad84"), x2=1, y2=0)
         + lin("eti", (0, "#f59bbb"), (1, "#e06d97")))
    c = (OMBRE
         + '<path d="M58 96 C50 146 48 196 58 226 Q128 244 198 226 C208 196 206 146 198 96 Z" fill="url(#sac)"/>'
         + '<path d="M68 100 C76 74 84 52 92 40 Q128 30 164 40 C172 52 180 74 188 100 Q128 112 68 100Z" fill="url(#haut)"/>'
         + '<path d="M92 44 L100 92 M128 36 L128 98 M164 44 L156 92" stroke="#c8b08a" stroke-width="3" opacity=".6"/>'
         + '<ellipse cx="128" cy="39" rx="35" ry="10" fill="#ffffff"/>'
         + '<circle cx="112" cy="33" r="8" fill="#ffffff"/><circle cx="138" cy="30" r="10" fill="#ffffff"/><circle cx="152" cy="36" r="7" fill="#fff"/>'
         + '<path d="M70 100 Q128 114 186 100" stroke="#b5814f" stroke-width="8" fill="none" stroke-linecap="round"/>'
         + '<rect x="74" y="134" width="108" height="70" rx="16" fill="url(#eti)"/>'
         # épi de blé stylisé sur l'étiquette
         + '<path d="M128 194 L128 146" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'
         + "".join(f'<ellipse cx="{128 + dx}" cy="{y}" rx="7" ry="11" fill="#fff" transform="rotate({ang} {128 + dx} {y})"/>'
                   for y in (154, 168, 182) for dx, ang in ((-9, -30), (9, 30)))
         + '<ellipse cx="128" cy="144" rx="6" ry="10" fill="#fff"/>'
         + '<path d="M70 120 C66 160 66 196 72 218" stroke="#fff" stroke-width="10" opacity=".45" fill="none" stroke-linecap="round"/>')
    return svg(c, d)


# ------------------------------------------------------------------ sucre
def cube(x, y, a, b, h):
    top = f"{x},{y} {x + a},{y - b} {x + 2 * a},{y} {x + a},{y + b}"
    gauche = f"{x},{y} {x + a},{y + b} {x + a},{y + b + h} {x},{y + h}"
    droite = f"{x + a},{y + b} {x + 2 * a},{y} {x + 2 * a},{y + h} {x + a},{y + b + h}"
    j = 'stroke-linejoin="round" stroke-width="7"'
    return (f'<polygon points="{gauche}" fill="#e6ecf3" stroke="#e6ecf3" {j}/>'
            f'<polygon points="{droite}" fill="#cdd8e4" stroke="#cdd8e4" {j}/>'
            f'<polygon points="{top}" fill="#ffffff" stroke="#ffffff" {j}/>'
            + "".join(f'<circle cx="{x + a * fx}" cy="{y + b * fy + h * fz}" r="2" fill="#b9c6d4" opacity=".7"/>'
                      for fx, fy, fz in ((.4, .6, .4), (.7, .9, .6), (1.4, .5, .5), (1.6, .2, .3), (.3, .5, .8))))


def sucre():
    d = (lin("boite", (0, "#7fb8ef"), (1, "#4f8fd6"), x2=1, y2=0)
         + lin("cote", (0, "#3f78b9"), (1, "#356aa6"), x2=1, y2=0))
    c = (OMBRE
         + '<path d="M72 64 L176 64 L196 84 L196 210 L92 210 L72 190 Z" fill="url(#cote)"/>'
         + '<rect x="72" y="84" width="104" height="128" rx="10" fill="url(#boite)"/>'
         + '<polygon points="72,84 92,64 196,64 176,84" fill="#a9d0f5"/>'
         + '<rect x="84" y="102" width="80" height="34" rx="8" fill="#ffffff"/>'
         + '<text x="124" y="127" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="22" fill="#4f8fd6" text-anchor="middle">SUCRE</text>'
         + '<path d="M80 150 L80 200" stroke="#fff" stroke-width="7" opacity=".35" stroke-linecap="round"/>'
         + cube(118, 182, 30, 16, 30) + cube(160, 190, 26, 14, 26) + cube(138, 150, 26, 14, 26))
    return svg(c, d)


# ------------------------------------------------------------------ bol (pour la chantilly et les pâtes)
def bol(interieur, extra="", cuillere=False):
    d = (lin("bol", (0, "#ffffff"), (.6, "#e9eef4"), (1, "#c8d3df"), x2=1, y2=1)
         + lin("bord", (0, "#fdfefe"), (1, "#dfe6ee")))
    c = OMBRE + '<path d="M34 126 Q40 218 128 222 Q216 218 222 126 Z" fill="url(#bol)"/>'
    c += '<path d="M50 150 Q62 196 104 208" stroke="#fff" stroke-width="10" opacity=".7" fill="none" stroke-linecap="round"/>'
    c += '<ellipse cx="128" cy="126" rx="94" ry="30" fill="url(#bord)"/>'
    c += interieur
    if cuillere:
        c += ('<path d="M150 118 L206 40" stroke="#c98b55" stroke-width="14" stroke-linecap="round"/>'
              '<path d="M150 118 L206 40" stroke="#e2aa74" stroke-width="5" stroke-linecap="round" opacity=".8"/>')
    c += extra
    return c, d


def chantilly():
    interieur = '<ellipse cx="128" cy="128" rx="82" ry="22" fill="#e9eef4"/>'
    creme = (lin("cr", (0, "#ffffff"), (1, "#eef0f5")))
    dome = ("".join(f'<ellipse cx="128" cy="{y}" rx="{rx}" ry="{ry}" fill="url(#cr)"/>'
                    for y, rx, ry in ((118, 80, 30), (92, 62, 26), (68, 44, 22), (48, 26, 16)))
            + '<path d="M128 22 Q140 34 134 44 Q122 44 128 22Z" fill="#fff"/>'
            + '<path d="M88 112 Q100 100 120 104 M96 86 Q108 76 124 80 M106 62 Q116 54 128 58" stroke="#dfe3ea" stroke-width="4" fill="none" stroke-linecap="round"/>'
            + '<ellipse cx="104" cy="58" rx="10" ry="6" fill="#fff"/>')
    c, d = bol(interieur, dome)
    return svg(c, d + creme)


PATES = {
    "pate_cookie": ("#b98657", "#9a6a40", True),
    "pate_cupcake": ("#f6e2a6", "#e8cc7e", False),
    "pate_genoise": ("#f7d77a", "#e9bf55", False),
    "pate_sablee": ("#eccb9a", "#d9ae72", False),
    "pate_chocolat": ("#7a4a32", "#5b3424", False),
}


def pate(clair, fonce, pepites):
    g = rad("pate", (0, clair), (1, fonce), cx=.4, cy=.35, r=.9)
    interieur = ('<ellipse cx="128" cy="128" rx="82" ry="22" fill="url(#pate)"/>'
                 '<path d="M80 128 Q104 112 128 124 Q152 136 172 122" stroke="#fff" stroke-width="5" opacity=".35" fill="none" stroke-linecap="round"/>')
    if pepites:
        interieur += "".join(f'<ellipse cx="{x}" cy="{y}" rx="6" ry="4" fill="#3d2418"/>' for x, y in ((92, 128), (118, 136), (150, 126), (172, 134), (134, 116)))
    c, d = bol(interieur, cuillere=True)
    return svg(c, d + g)


def saladier():
    c, d = bol('<ellipse cx="128" cy="128" rx="82" ry="22" fill="#dfe6ee"/>')
    return svg(c, d)


# ------------------------------------------------------------------ bougies
def bougies():
    d = (rad("fl", (0, "#fff6b0"), (.45, "#ffc93c"), (1, "#ff7a1a"), cx=.5, cy=.7, r=.7)
         + '<pattern id="ray" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">'
           '<rect width="20" height="20" fill="#ffffff"/><rect width="10" height="20" fill="#ef7fa6"/></pattern>'
         + lin("brill", (0, "#ffffff"), (1, "#ffffff"), x2=1, y2=0))
    c = OMBRE
    for x, h, ang in ((78, 150, -8), (136, 170, 6)):
        top = 222 - h
        c += (f'<g transform="rotate({ang} {x + 18} 222)">'
              f'<rect x="{x}" y="{top}" width="36" height="{h}" rx="10" fill="url(#ray)"/>'
              f'<rect x="{x + 6}" y="{top + 8}" width="7" height="{h - 20}" rx="3" fill="#fff" opacity=".5"/>'
              f'<path d="M{x + 18} {top} L{x + 18} {top - 12}" stroke="#5b3a29" stroke-width="4" stroke-linecap="round"/>'
              f'<path d="M{x + 18} {top - 62} C{x + 38} {top - 34} {x + 34} {top - 10} {x + 18} {top - 8} C{x + 2} {top - 10} {x - 2} {top - 34} {x + 18} {top - 62}Z" fill="url(#fl)"/>'
              f'</g>')
    return svg(c, d)


# ------------------------------------------------------------------ gâteaux cuits
def cylindre(cote1, cote2, dessus1, dessus2, y=150, rx=92, ry=30, h=56, extra=""):
    d = (lin("cote", (0, cote1), (.5, cote2), (1, cote1), x2=1, y2=0)
         + rad("dessus", (0, dessus1), (1, dessus2), cx=.4, cy=.35, r=.8))
    c = (OMBRE
         + f'<path d="M{128 - rx} {y} L{128 - rx} {y + h} A{rx} {ry} 0 0 0 {128 + rx} {y + h} L{128 + rx} {y} Z" fill="url(#cote)"/>'
         + f'<ellipse cx="128" cy="{y}" rx="{rx}" ry="{ry}" fill="url(#dessus)"/>'
         + extra)
    return c, d


def genoise():
    c, d = cylindre("#d99a3e", "#f2c46a", "#fbe39a", "#efc35f",
                    extra='<path d="M70 146 Q96 132 128 136" stroke="#fff" stroke-width="7" opacity=".4" fill="none" stroke-linecap="round"/>'
                          + "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="#e0a947" opacity=".7"/>' for x, y in ((100, 152), (140, 160), (166, 146), (118, 166), (84, 160))))
    return svg(c, d)


def gateau_chocolat():
    c, d = cylindre("#5a3322", "#8a5537", "#9b6443", "#6b3e29",
                    extra='<path d="M70 146 Q96 132 128 136" stroke="#fff" stroke-width="7" opacity=".25" fill="none" stroke-linecap="round"/>')
    return svg(c, d)


def coque(y=150, rx=96, ry=40):
    """Fond de tarte : bord cannelé + intérieur."""
    d = (rad("croute", (0, "#f3c47c"), (1, "#c98a3d"), cx=.4, cy=.3, r=.9)
         + rad("fondint", (0, "#f7dfab"), (1, "#e4b66f"), cx=.45, cy=.4, r=.8))
    import math
    bord = ""
    for i in range(28):
        a = 2 * math.pi * i / 28
        bord += f'<circle cx="{128 + rx * math.cos(a):.1f}" cy="{y + ry * math.sin(a):.1f}" r="13" fill="url(#croute)"/>'
    c = (OMBRE
         + f'<path d="M{128 - rx} {y} Q{128 - rx + 8} {y + 58} 128 {y + 62} Q{128 + rx - 8} {y + 58} {128 + rx} {y} Z" fill="#c98a3d"/>'
         + bord
         + f'<ellipse cx="128" cy="{y}" rx="{rx - 10}" ry="{ry - 8}" fill="url(#fondint)"/>')
    return c, d


def fond_tarte():
    c, d = coque()
    c += "".join(f'<circle cx="{x}" cy="{y}" r="2.5" fill="#c98a3d" opacity=".6"/>' for x, y in ((100, 146), (128, 158), (156, 146), (114, 132), (142, 132), (88, 158), (168, 160)))
    return svg(c, d)


def demi_fraise(x, y, s=1, ang=0):
    return (f'<g transform="translate({x} {y}) rotate({ang}) scale({s})">'
            '<path d="M0 26 C-26 8 -24 -18 -8 -20 C-3 -21 0 -16 0 -14 C0 -16 3 -21 8 -20 C24 -18 26 8 0 26Z" fill="url(#fraise)"/>'
            '<path d="M0 18 C-14 6 -12 -10 -4 -12 C-1 -12 0 -9 0 -8 C0 -9 1 -12 4 -12 C12 -10 14 6 0 18Z" fill="#ff8f9c" opacity=".8"/>'
            '<circle cx="-7" cy="-2" r="1.8" fill="#fff3c4"/><circle cx="6" cy="2" r="1.8" fill="#fff3c4"/><circle cx="0" cy="10" r="1.8" fill="#fff3c4"/>'
            '<path d="M-10 -20 Q-4 -28 0 -22 Q4 -28 10 -20" fill="#5cb85c"/>'
            '</g>')


def tarte():
    c, d = coque()
    d += rad("fraise", (0, "#ff6b7d"), (1, "#d62f4a"), cx=.4, cy=.35, r=.8)
    c += '<ellipse cx="128" cy="150" rx="84" ry="30" fill="#fff4dc"/>'
    places = [(84, 142, -20), (112, 132, -5), (144, 132, 8), (172, 142, 20), (98, 160, -12), (128, 152, 0), (158, 160, 12), (128, 172, 0)]
    for x, y, a in sorted(places, key=lambda p: p[1]):
        c += demi_fraise(x, y - 6, 1.05, a)
    c += '<path d="M60 136 Q80 120 104 118" stroke="#fff" stroke-width="6" opacity=".35" fill="none" stroke-linecap="round"/>'
    return svg(c, d)


def cupcake_nature():
    d = (lin("papier", (0, "#8fc9f0"), (.5, "#bfe3fa"), (1, "#7ab7e3"), x2=1, y2=0)
         + rad("muffin", (0, "#f7d38a"), (1, "#c98a3d"), cx=.4, cy=.3, r=.8))
    c = (OMBRE
         + '<path d="M62 132 L80 224 Q128 234 176 224 L194 132 Z" fill="url(#papier)"/>'
         + "".join(f'<path d="M{x} 134 L{x + (128 - x) * .14:.0f} 224" stroke="#6aa8d6" stroke-width="3" opacity=".6"/>' for x in range(72, 190, 14))
         + '<path d="M54 134 C50 70 206 70 202 134 Q128 150 54 134Z" fill="url(#muffin)"/>'
         + '<path d="M78 104 Q96 84 124 82" stroke="#fff" stroke-width="7" opacity=".4" fill="none" stroke-linecap="round"/>')
    return svg(c, d)


def brule():
    d = rad("charbon", (0, "#5a4a44"), (1, "#1e1614"), cx=.4, cy=.3, r=.8)
    c = (OMBRE
         + '<path d="M48 160 C44 120 90 112 128 114 C170 112 214 124 208 164 C204 196 160 206 128 204 C92 206 52 196 48 160Z" fill="url(#charbon)"/>'
         + '<path d="M70 156 L88 150 L98 162 L116 156 M140 176 L152 166 L170 170 L184 160" stroke="#ff7a1a" stroke-width="4" fill="none" opacity=".75" stroke-linecap="round" stroke-linejoin="round"/>'
         + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#9aa3ad" opacity=".55"/>' for x, y, r in ((96, 92, 20), (124, 70, 26), (156, 88, 18), (140, 44, 16))))
    return svg(c, d)


FICHIERS = {
    "farine": farine, "sucre": sucre, "chantilly": chantilly, "bougies": bougies,
    "genoise": genoise, "gateau_chocolat": gateau_chocolat, "fond_tarte": fond_tarte,
    "tarte_fraises": tarte, "cupcake_nature": cupcake_nature, "brule": brule, "saladier": saladier,
}

if __name__ == "__main__":
    for nom, f in FICHIERS.items():
        open(os.path.join(ICI, nom + ".svg"), "w").write(f())
    for nom, (a, b, p) in PATES.items():
        open(os.path.join(ICI, nom + ".svg"), "w").write(pate(a, b, p))
    print("SVG générés :", len(FICHIERS) + len(PATES))
