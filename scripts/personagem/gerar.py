"""Gera a personagem da Evelym no Blender, sem interface, a partir da base humana do MPFB (modelos CC0).

Uso: `npm run personagem` (chama o Blender do Flatpak com este arquivo). Saída: `.cache/personagem/evelym.blend`, que o
`render.py` usa para os renders do protótipo e, no bloco 3, o export do modelo.

Tudo que define a personagem está em PERSONAGEM, abaixo: cada ajuste pedido pela dona vira uma mudança aqui, revisável
no Git. A origem e a licença de cada peça estão em scripts/personagem/ORIGEM.md.
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(__file__))

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SAIDA = os.path.join(RAIZ, ".cache", "personagem", "evelym.blend")


def simetrico(nome, valor):
    """Um ajuste dos dois lados do rosto (o MPFB separa em l- e r-)."""
    return [{"target": f"{lado}-{nome}", "value": valor} for lado in ("l", "r")]


# Rosto pelas fotos e pelos retratos estilizados que a dona mandou (2026-11-22, quatro rodadas): rosto fino e longo, maçãs
# do rosto altas, mandíbula afinando até um queixo pequeno e pontudo; olhos amendoados e espichados, com o canto de fora
# subindo e a pálpebra de cima pesada (o alongamento vem de ESTILO_DOS_OLHOS, porque nenhum alvo alonga o olho); sobrancelhas
# grossas, retas no começo e com arco marcado, baixas; nariz de dorso reto e fino, um pouco longo, ponta pequena e definida;
# lábios cheios, arco do cupido bem desenhado, lábio de baixo mais cheio, expressão serena.
ROSTO = [
    {"target": "head-oval", "value": 0.6},
    {"target": "head-invertedtriangular", "value": 0.45},
    {"target": "chin-width-decr", "value": 0.5},
    {"target": "chin-triangle", "value": 0.35},
    {"target": "chin-prominent-incr", "value": 0.15},
    *simetrico("cheek-bones-incr", 0.3),
    *simetrico("cheek-trans-up", 0.3),
    *simetrico("cheek-volume-decr", 0.5),
    *simetrico("eye-height1-decr", 0.35),
    *simetrico("eye-height3-decr", 0.35),
    *simetrico("eye-eyefold-down", 0.2),
    *simetrico("eye-epicanthus-in", 0.3),
    {"target": "nose-hump-decr", "value": 0.5},
    {"target": "nose-point-width-decr", "value": 0.35},
    {"target": "nose-point-up", "value": 0.2},
    {"target": "nose-flaring-incr", "value": 0.15},
    {"target": "mouth-cupidsbow-incr", "value": 0.8},
    {"target": "mouth-upperlip-middle-up", "value": 0.3},
    {"target": "mouth-angles-up", "value": 0.15},
    {"target": "neck-scale-horiz-decr", "value": 0.2},
]

# Medidas ajustadas automaticamente: cada eixo liga um alvo do MPFB a uma medida do rosto (scripts/personagem/medir_rosto.py).
# O valor vai de -1 a 1: positivo usa o primeiro alvo, negativo o segundo. Os valores vêm de rosto-ajustado.json, que o
# scripts/personagem/ajustar_rosto.py escreve depois de comparar os renders com as fotos da dona.
EIXOS = {
    "rosto_largura": ("head-scale-horiz-incr", "head-scale-horiz-decr", False),
    "rosto_altura": ("head-scale-vert-incr", "head-scale-vert-decr", False),
    "mandibula": ("chin-bones-incr", "chin-bones-decr", False),
    "olho_tamanho": ("eye-scale-incr", "eye-scale-decr", True),
    "olho_abertura": ("eye-height2-incr", "eye-height2-decr", True),
    "olho_inclinacao": ("eye-corner2-up", "eye-corner2-down", True),
    "sobrancelha": ("eyebrows-trans-up", "eyebrows-trans-down", False),
    "nariz_largura": ("nose-scale-horiz-incr", "nose-scale-horiz-decr", False),
    "nariz_comprimento": ("nose-scale-vert-incr", "nose-scale-vert-decr", False),
    "nariz_projecao": ("nose-scale-depth-incr", "nose-scale-depth-decr", False),
    "boca_largura": ("mouth-scale-horiz-incr", "mouth-scale-horiz-decr", False),
    "labio_cima": ("mouth-upperlip-height-incr", "mouth-upperlip-height-decr", False),
    "labio_baixo": ("mouth-lowerlip-height-incr", "mouth-lowerlip-height-decr", False),
    "queixo": ("chin-height-incr", "chin-height-decr", False),
}
AJUSTE = os.environ.get("PERSONAGEM_AJUSTE", os.path.join(os.path.dirname(__file__), "rosto-ajustado.json"))


def carregar_ajuste():
    """Valores dos eixos e do alongamento dos olhos (padrão: os da rodada 4, antes da medição)."""
    import json

    valores = {
        "eixos": {
            "rosto_largura": -0.3,
            "rosto_altura": 0.12,
            "olho_abertura": -0.6,
            "olho_inclinacao": 0.5,
            "sobrancelha": -0.3,
            "nariz_largura": -0.2,
            "nariz_comprimento": 0.2,
            "nariz_projecao": 0.2,
            "boca_largura": -0.12,
        },
        "estica": 0.16,
        "sobe_canto": 0.003,
    }
    if os.path.exists(AJUSTE):
        with open(AJUSTE, encoding="utf8") as f:
            lido = json.load(f)
        valores["eixos"].update(lido.get("eixos", {}))
        valores["estica"] = lido.get("estica", valores["estica"])
        valores["sobe_canto"] = lido.get("sobe_canto", valores["sobe_canto"])
    return valores


def alvos_dos_eixos(eixos):
    alvos = []
    for nome, valor in eixos.items():
        mais, menos, dos_dois_lados = EIXOS[nome]
        alvo, peso = (mais, valor) if valor >= 0 else (menos, -valor)
        if peso < 1e-3:
            continue
        alvos += simetrico(alvo, peso) if dos_dois_lados else [{"target": alvo, "value": peso}]
    return alvos


# Olho espichado: estica as pálpebras na horizontal em volta de cada olho e sobe o canto de fora.
ESTILO_DOS_OLHOS = {
    "raio": (0.027, 0.016),  # metros, na horizontal e na vertical, a área da pálpebra que se mexe
    "estica": 0.16,  # fração a mais de largura no centro da área
    "sobe_canto": 0.003,  # metros que o canto de fora sobe
    # Subir a faixa da sobrancelha por deformação esticou a pele e o reencaixe aumentou a sobrancelha junto (2026-11-22):
    # fica em 0, e a sobrancelha aceita ficar um pouco mais baixa que nos retratos.
    "sobe_sobrancelha": 0.0,
}

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
    "eyebrows": "eyebrow002/eyebrow002.mhclo",  # grossa, reta no começo, com arco marcado e ponta fina
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
    "cor_dos_pelos": (0.11, 0.075, 0.06),  # multiplica sobrancelhas e cílios: escuros, como nas fotos
    "opacidade_das_sobrancelhas": 1.6,  # multiplica a transparência dos fios: sobrancelha marcada
    "opacidade_dos_cilios": 1.2,  # cílios marcados, sem pesar
    "cor_dos_labios": (0.42, 0.11, 0.16),  # rosa-malva, como nos retratos
    "forca_dos_labios": 0.9,  # quanto da cor entra nos lábios (0 a 1)
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


def esticar_olhos(corpo):
    """Aplica os alvos na malha e alonga as pálpebras (só a pele, nunca a geometria auxiliar que guia os olhos)."""
    from bl_ext.blender_org.mpfb.services import HumanService

    bpy.context.view_layer.objects.active = corpo
    corpo.select_set(True)
    bpy.ops.object.shape_key_remove(all=True, apply_mix=True)

    olhos = objeto("." + PERSONAGEM["eyes"].split("/")[0])
    mundo = [olhos.matrix_world @ v.co for v in olhos.data.vertices]
    mascaras = [m.vertex_group for m in corpo.modifiers if m.type == "MASK" and not m.invert_vertex_group]
    grupos = {corpo.vertex_groups[n].index for n in mascaras if n in corpo.vertex_groups}
    rx, rz = ESTILO_DOS_OLHOS["raio"]
    inversa = corpo.matrix_world.inverted()
    for lado in (-1, 1):
        lado_pts = [p for p in mundo if p.x * lado > 0]
        centro = sum(lado_pts, lado_pts[0] * 0) / len(lado_pts)
        for v in corpo.data.vertices:
            if grupos and not any(g.group in grupos for g in v.groups):
                continue
            p = corpo.matrix_world @ v.co
            dx, dz = p.x - centro.x, p.z - centro.z
            d2 = (dx / rx) ** 2 + (dz / rz) ** 2
            if d2 >= 1 or p.y > centro.y + 0.004:
                continue
            f = (1 - d2) ** 2
            p.x += dx * ESTILO_DOS_OLHOS["estica"] * f
            fora = max(0.0, dx * lado) / rx  # 0 no meio, 1 no canto de fora
            p.z += ESTILO_DOS_OLHOS["sobe_canto"] * f * fora
            v.co = inversa @ p
        # Faixa da sobrancelha: sobe com o máximo a 2,2 cm acima do centro do olho, sem mexer na pálpebra.
        for v in corpo.data.vertices:
            if grupos and not any(g.group in grupos for g in v.groups):
                continue
            p = corpo.matrix_world @ v.co
            dx, dz = p.x - centro.x, p.z - centro.z
            if abs(dx) > 0.04 or not 0.006 < dz < 0.045 or p.y > centro.y + 0.004:
                continue
            perfil = math.sin(math.pi * (dz - 0.006) / 0.039) ** 2  # 0 na pálpebra e na testa, 1 na sobrancelha
            p.z += ESTILO_DOS_OLHOS["sobe_sobrancelha"] * perfil * (1 - (dx / 0.04) ** 2)
            v.co = inversa @ p
    corpo.data.update()
    HumanService.refit(corpo)


def pintar_labios(corpo):
    """Lábios rosa-malva. Duas máscaras juntas: uma área macia em volta do centro da boca (atributo de cor "labios") e a
    vermelhidão que a textura da pele já tem nos lábios. Assim o contorno sai do desenho da boca, não de uma elipse."""
    # O centro da boca sai do perfil do rosto, na linha do meio: abaixo da ponta do nariz, os pontos mais salientes são
    # o lábio de cima e o de baixo (o grupo "joint-mouth" do MakeHuman é o pivô da mandíbula, não a boca).
    visivel = corpo.vertex_groups["body"].index
    olhos = objeto("." + PERSONAGEM["eyes"].split("/")[0])
    z_olhos = sum((olhos.matrix_world @ v.co).z for v in olhos.data.vertices) / len(olhos.data.vertices)
    meio = [
        corpo.matrix_world @ v.co
        for v in corpo.data.vertices
        if abs((corpo.matrix_world @ v.co).x) < 0.004 and any(g.group == visivel for g in v.groups)
    ]
    nariz = min((p for p in meio if z_olhos - 0.075 < p.z < z_olhos - 0.02), key=lambda p: p.y)
    # Faixas estreitas logo abaixo do nariz: com o queixo saliente, uma busca larga achava o queixo no lugar do lábio.
    cima = min((p for p in meio if nariz.z - 0.032 < p.z < nariz.z - 0.012), key=lambda p: p.y)
    baixo = min((p for p in meio if cima.z - 0.022 < p.z < cima.z - 0.008), key=lambda p: p.y)
    centro = (cima + baixo) / 2
    print(f"BOCA nariz z={nariz.z:.3f} lábio de cima z={cima.z:.3f} de baixo z={baixo.z:.3f}")
    atributo = corpo.data.color_attributes.new("labios", "FLOAT_COLOR", "POINT")
    for v in corpo.data.vertices:
        p = corpo.matrix_world @ v.co
        d2 = ((p.x - centro.x) / 0.03) ** 2 + ((p.z - centro.z) / 0.013) ** 2
        # nada acima do lábio de cima: o nariz também é avermelhado na textura
        peso = (1 - d2) ** 1.5 if d2 < 1 and p.y < centro.y + 0.01 and p.z < cima.z + 0.006 else 0.0
        atributo.data[v.index].color = (peso, peso, peso, 1)

    material = corpo.material_slots[0].material
    arvore = material.node_tree
    bsdf = principled(material)
    entrada = bsdf.inputs["Base Color"]
    origem = entrada.links[0].from_socket
    textura = next(n for n in arvore.nodes if n.type == "TEX_IMAGE" and n.name == "diffuseTexture")
    separa = arvore.nodes.new("ShaderNodeSeparateColor")
    arvore.links.new(textura.outputs["Color"], separa.inputs["Color"])
    vermelho = arvore.nodes.new("ShaderNodeMath")
    vermelho.operation = "SUBTRACT"
    arvore.links.new(separa.outputs["Red"], vermelho.inputs[0])
    arvore.links.new(separa.outputs["Green"], vermelho.inputs[1])
    realce = arvore.nodes.new("ShaderNodeMapRange")
    realce.inputs["From Min"].default_value = 0.04
    realce.inputs["From Max"].default_value = 0.14
    arvore.links.new(vermelho.outputs[0], realce.inputs["Value"])
    area = arvore.nodes.new("ShaderNodeAttribute")
    area.attribute_name = "labios"
    juntas = arvore.nodes.new("ShaderNodeMath")
    juntas.operation = "MULTIPLY"
    arvore.links.new(realce.outputs["Result"], juntas.inputs[0])
    arvore.links.new(area.outputs["Fac"], juntas.inputs[1])
    forca = arvore.nodes.new("ShaderNodeMath")
    forca.operation = "MULTIPLY"
    forca.inputs[1].default_value = ACABAMENTO["forca_dos_labios"]
    arvore.links.new(juntas.outputs[0], forca.inputs[0])
    mistura = arvore.nodes.new("ShaderNodeMix")
    mistura.data_type = "RGBA"
    mistura.inputs["B"].default_value = (*ACABAMENTO["cor_dos_labios"], 1)
    arvore.links.new(forca.outputs[0], mistura.inputs["Factor"])
    arvore.links.new(origem, mistura.inputs["A"])
    arvore.links.new(mistura.outputs["Result"], entrada)


def acabamento():
    import cabelo

    corpo = objeto(".body")
    esticar_olhos(corpo)
    armadura = next(o for o in bpy.data.objects if o.type == "ARMATURE")
    _obj, mechas = cabelo.gerar(corpo, armadura)
    print(f"CABELO {mechas} mechas")
    tingir(corpo, ACABAMENTO["tom_da_pele"])
    for pelos, opacidade in (("eyebrows", "opacidade_das_sobrancelhas"), ("eyelashes", "opacidade_dos_cilios")):
        pelo = objeto("." + PERSONAGEM[pelos].split("/")[0])
        tingir(pelo, ACABAMENTO["cor_dos_pelos"])
        realcar_alfa(pelo, ACABAMENTO[opacidade])
    pintar_labios(corpo)
    for roupa in PERSONAGEM["clothes"]:
        pintar(objeto("." + roupa.split("/")[0]), ACABAMENTO["cor_da_roupa"])


def main():
    from bl_ext.blender_org.mpfb.services import HumanService

    ajuste = carregar_ajuste()
    PERSONAGEM["targets"] = ROSTO + alvos_dos_eixos(ajuste["eixos"])
    ESTILO_DOS_OLHOS["estica"] = ajuste["estica"]
    ESTILO_DOS_OLHOS["sobe_canto"] = ajuste["sobe_canto"]
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
