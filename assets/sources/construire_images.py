#!/usr/bin/env python3
"""Prépare les images du jeu dans assets/img (PNG 160 px).
 - illustrations maison : PNG issus des SVG (rasteriser.js), recadrés et centrés
 - Fluent Emoji 3D (Microsoft, licence MIT) : simplement redimensionnés
Usage : python3 construire_images.py <dossier_png_maison> <dossier_png_fluent>"""
import os, sys
from PIL import Image

TAILLE = 160
SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img")
FLUENT = {
    "oeuf": "egg", "beurre": "butter", "chocolat": "chocolate_bar", "fraise": "strawberry",
    "cookie": "cookie", "cupcake": "cupcake", "fraisier": "shortcake", "anniversaire": "birthday_cake",
    "ours": "bear", "lapin": "rabbit_face", "renard": "fox", "chat": "cat_face", "panda": "panda",
    "koala": "koala", "grenouille": "frog", "cochon": "pig_face", "chien": "dog_face", "tigre": "tiger_face",
    "lion": "lion", "vache": "cow_face", "hamster": "hamster", "pingouin": "penguin",
    "cloche": "bellhop_bell", "piece": "coin", "poubelle": "wastebasket", "coeur": "sparkling_heart",
    "colere": "anger_symbol", "fache": "face_with_steam_from_nose", "feu": "fire", "etincelles": "sparkles",
    "valide": "check_mark_button", "attention": "warning", "fumee": "dashing_away", "sablier": "hourglass_not_done",
    "cadenas": "locked", "cadeau": "wrapped_gift", "fete": "party_popper", "etoile": "star",
    "tulipe": "tulip", "cafe": "hot_beverage", "miel": "honey_pot", "panier": "basket",
    "baguette": "baguette_bread", "citron": "lemon", "plante": "potted_plant", "croissant": "croissant",
    "eclair": "high_voltage", "poisson": "fish", "question": "white_question_mark",
    "telephone": "telephone", "zzz": "zzz",
}


def carre(im, marge=.06):
    im = im.convert("RGBA")
    boite = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    im = im.crop(boite)
    cote = int(max(im.size) * (1 + 2 * marge))
    fond = Image.new("RGBA", (cote, cote), (0, 0, 0, 0))
    fond.paste(im, ((cote - im.width) // 2, (cote - im.height) // 2), im)
    return fond.resize((TAILLE, TAILLE), Image.LANCZOS)


if __name__ == "__main__":
    maison, fluent = sys.argv[1], sys.argv[2]
    os.makedirs(SORTIE, exist_ok=True)
    for f in sorted(os.listdir(maison)):
        if f.endswith(".png"):
            carre(Image.open(os.path.join(maison, f))).save(os.path.join(SORTIE, f), optimize=True)
    for nom, src in FLUENT.items():
        im = Image.open(os.path.join(fluent, src + "_3d.png")).convert("RGBA").resize((TAILLE, TAILLE), Image.LANCZOS)
        im.save(os.path.join(SORTIE, nom + ".png"), optimize=True)
    print(len(os.listdir(SORTIE)), "images dans", os.path.normpath(SORTIE))
