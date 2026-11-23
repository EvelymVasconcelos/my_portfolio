"""Gera a personagem da Evelym no Blender, sem interface, a partir da base humana do MPFB (modelos CC0).

Uso: `npm run personagem` (chama o Blender do Flatpak com este arquivo). Saída: `.cache/personagem/evelym.blend`, que o
`render.py` usa para os renders do protótipo e, no bloco 3, o export do modelo.

Tudo que define a personagem está em PERSONAGEM, abaixo: cada ajuste pedido pela dona vira uma mudança aqui, revisável
no Git. A origem e a licença de cada peça estão em scripts/personagem/ORIGEM.md.
"""

import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(__file__))

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SAIDA = os.path.join(RAIZ, ".cache", "personagem", "evelym.blend")


def simetrico(nome, valor):
    """Um ajuste dos dois lados do rosto (o MPFB separa em l- e r-)."""
    return [{"target": f"{lado}-{nome}", "value": valor} for lado in ("l", "r")]


# Rosto pelas fotos da dona (2026-11-22, duas rodadas): rosto fino e longo, com maçãs do rosto marcadas e queixo pequeno e
# pontudo; nariz de dorso reto e fino, com a ponta pontuda e levemente arrebitada; olhos amendoados e estreitos, com a
# pálpebra de cima um pouco caída; sobrancelhas quase retas, de espessura média; boca de largura média, lábio de cima cheio,
# arco do cupido marcado e um sorriso leve.
ROSTO = [
    {"target": "head-oval", "value": 0.6},
    {"target": "head-invertedtriangular", "value": 0.4},
    {"target": "head-scale-horiz-decr", "value": 0.3},
    {"target": "head-scale-vert-incr", "value": 0.1},
    {"target": "chin-width-decr", "value": 0.5},
    {"target": "chin-triangle", "value": 0.35},
    {"target": "chin-prominent-incr", "value": 0.15},
    *simetrico("cheek-bones-incr", 0.4),
    *simetrico("cheek-volume-decr", 0.5),
    *simetrico("eye-corner2-up", 0.3),
    *simetrico("eye-height2-decr", 0.3),
    *simetrico("eye-eyefold-down", 0.3),
    *simetrico("eye-epicanthus-in", 0.2),
    {"target": "eyebrows-trans-down", "value": 0.1},
    {"target": "nose-hump-decr", "value": 0.4},
    {"target": "nose-point-width-decr", "value": 0.35},
    {"target": "nose-scale-horiz-decr", "value": 0.25},
    {"target": "nose-nostrils-width-decr", "value": 0.3},
    {"target": "nose-point-up", "value": 0.3},
    {"target": "nose-scale-depth-incr", "value": 0.2},
    {"target": "mouth-scale-horiz-decr", "value": 0.2},
    {"target": "mouth-upperlip-volume-incr", "value": 0.4},
    {"target": "mouth-lowerlip-volume-incr", "value": 0.3},
    {"target": "mouth-cupidsbow-incr", "value": 0.5},
    {"target": "mouth-angles-up", "value": 0.35},
    {"target": "neck-scale-horiz-decr", "value": 0.2},
]

PERSONAGEM = {
    "name": "evelym",
    "phenotype": {
        "gender": 0.0,  # 0 é feminino no MakeHuman
        "age": 0.53,  # perto dos 30 anos (0,5 são 25)
        "muscle": 0.5,
        "weight": 0.42,
        "proportions": 0.6,
        "height": 0.45,
        "cupsize": 0.5,
        "firmness": 0.5,
        "race": {"asian": 0.45, "caucasian": 0.4, "african": 0.15},
    },
    "targets": ROSTO,
    "rig": "game_engine",
    "eyes": "high-poly/high-poly.mhclo",
    "eyebrows": "eyebrow001/eyebrow001.mhclo",  # quase reta, espessura média, afinando no fim
    "eyelashes": "eyelashes02/eyelashes02.mhclo",
    "teeth": "",
    "tongue": "",
    "hair": "",  # gerado por script em cabelo.py: nenhum cabelo do pacote tem o corte dela
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

# Cores e corte, aplicados depois que o MPFB monta a personagem. Cores lineares (R, G, B), de 0 a 1.
ACABAMENTO = {
    "tom_da_pele": (0.8, 0.57, 0.42),  # multiplica a textura (que é de pele clara): morena clara, dourada
    "cor_da_roupa": (0.5, 0.36, 0.78),  # lilás do moletom, no lugar da textura do agasalho provisório
    "cor_dos_pelos": (0.07, 0.05, 0.045),  # multiplica sobrancelhas e cílios: escuros, como nas fotos
    "opacidade_dos_pelos": 2.0,  # multiplica a transparência dos fios: sobrancelha marcada
}


def limpar_cena():
    """Tira o cubo, a câmera e a luz da cena inicial, sem resetar as preferências (que desligariam o MPFB)."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def objeto(sufixo):
    return next(o for o in bpy.data.objects if o.type == "MESH" and o.name.endswith(sufixo))


def principled(material):
    return next(n for n in material.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def tingir(obj, cor):
    """Multiplica a cor-base de cada material do objeto (com a textura, se houver) pela cor dada."""
    for slot in obj.material_slots:
        arvore = slot.material.node_tree
        entrada = principled(slot.material).inputs["Base Color"]
        if not entrada.is_linked:
            entrada.default_value = (*cor, 1)
            continue
        origem = entrada.links[0].from_socket
        mix = arvore.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1
        mix.inputs["B"].default_value = (*cor, 1)
        arvore.links.new(origem, mix.inputs["A"])
        arvore.links.new(mix.outputs["Result"], entrada)


def pintar(obj, cor):
    """Troca a cor-base de cada material do objeto por uma cor lisa, sem a textura."""
    for slot in obj.material_slots:
        entrada = principled(slot.material).inputs["Base Color"]
        for link in list(entrada.links):
            slot.material.node_tree.links.remove(link)
        entrada.default_value = (*cor, 1)


def realcar_alfa(obj, fator):
    """Fios mais visíveis: multiplica a transparência da textura (sobrancelhas e cílios saem fracos sem isso)."""
    for slot in obj.material_slots:
        arvore = slot.material.node_tree
        entrada = principled(slot.material).inputs["Alpha"]
        if not entrada.is_linked:
            continue
        origem = entrada.links[0].from_socket
        conta = arvore.nodes.new("ShaderNodeMath")
        conta.operation = "MULTIPLY"
        conta.use_clamp = True
        conta.inputs[1].default_value = fator
        arvore.links.new(origem, conta.inputs[0])
        arvore.links.new(conta.outputs[0], entrada)


def acabamento():
    import cabelo

    corpo = objeto(".body")
    armadura = next(o for o in bpy.data.objects if o.type == "ARMATURE")
    _obj, mechas = cabelo.gerar(corpo, armadura)
    print(f"CABELO {mechas} mechas")
    tingir(corpo, ACABAMENTO["tom_da_pele"])
    for pelos in ("eyebrows", "eyelashes"):
        pelo = objeto("." + PERSONAGEM[pelos].split("/")[0])
        tingir(pelo, ACABAMENTO["cor_dos_pelos"])
        realcar_alfa(pelo, ACABAMENTO["opacidade_dos_pelos"])
    for roupa in PERSONAGEM["clothes"]:
        pintar(objeto("." + roupa.split("/")[0]), ACABAMENTO["cor_da_roupa"])


def main():
    from bl_ext.blender_org.mpfb.services import HumanService

    limpar_cena()
    settings = HumanService.get_default_deserialization_settings()
    settings["subdiv_levels"] = 0  # a subdivisão, se houver, é decidida no export
    basemesh = HumanService.deserialize_from_dict(PERSONAGEM, settings)
    acabamento()

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=SAIDA)

    malhas = [o for o in bpy.data.objects if o.type == "MESH"]
    triangulos = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in malhas)
    print(f"PERSONAGEM {basemesh.name}: {len(malhas)} malhas, {triangulos} triângulos -> {SAIDA}")
    for o in malhas:
        print(f"  {o.name}: {len(o.data.vertices)} vértices")


if __name__ == "__main__":
    main()
