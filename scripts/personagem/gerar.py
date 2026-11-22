"""Gera a personagem da Evelym no Blender, sem interface, a partir da base humana do MPFB (modelos CC0).

Uso: `npm run personagem` (chama o Blender do Flatpak com este arquivo). Saída: `.cache/personagem/evelym.blend`, que o
`render.py` usa para os renders do protótipo e, no bloco 3, o export do modelo.

Tudo que define a personagem está em PERSONAGEM, abaixo: cada ajuste pedido pela dona vira uma mudança aqui, revisável
no Git. A origem e a licença de cada peça estão em scripts/personagem/ORIGEM.md.
"""

import os

import bpy

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SAIDA = os.path.join(RAIZ, ".cache", "personagem", "evelym.blend")

# Bloco 1: a base. Os ajustes de rosto e de estilo entram no bloco 2 (tarefas 2.1 e 2.2).
PERSONAGEM = {
    "name": "evelym",
    "phenotype": {
        "gender": 0.0,  # 0 é feminino no MakeHuman
        "age": 0.5,  # 25 anos
        "muscle": 0.5,
        "weight": 0.42,
        "proportions": 0.6,
        "height": 0.45,
        "cupsize": 0.5,
        "firmness": 0.5,
        "race": {"asian": 0.45, "caucasian": 0.3, "african": 0.25},
    },
    "targets": [],
    "rig": "game_engine",
    "eyes": "high-poly/high-poly.mhclo",
    "eyebrows": "eyebrow005/eyebrow005.mhclo",
    "eyelashes": "eyelashes02/eyelashes02.mhclo",
    "teeth": "",
    "tongue": "",
    "hair": "bob02/bob02.mhclo",
    "proxy": "",
    # Agasalho do pacote enquanto o moletom lilás com capuz não existe (tarefa 2.4).
    "clothes": ["female_sportsuit01/female_sportsuit01.mhclo"],
    "skin_mhmat": "young_asian_female/young_asian_female.mhmat",
    "skin_material_type": "MAKESKIN",
    "eyes_material_type": "MAKESKIN",
    "skin_material_settings": {},
    "eyes_material_settings": {},
    "alternative_materials": {"high-poly": "materials/brown.mhmat"},
    "expressions": [],
}


def limpar_cena():
    """Tira o cubo, a câmera e a luz da cena inicial, sem resetar as preferências (que desligariam o MPFB)."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def main():
    from bl_ext.blender_org.mpfb.services import HumanService

    limpar_cena()
    settings = HumanService.get_default_deserialization_settings()
    settings["subdiv_levels"] = 0  # a subdivisão, se houver, é decidida no export
    basemesh = HumanService.deserialize_from_dict(PERSONAGEM, settings)

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=SAIDA)

    malhas = [o for o in bpy.data.objects if o.type == "MESH"]
    triangulos = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in malhas)
    print(f"PERSONAGEM {basemesh.name}: {len(malhas)} malhas, {triangulos} triângulos -> {SAIDA}")
    for o in malhas:
        print(f"  {o.name}: {len(o.data.vertices)} vértices")


main()
