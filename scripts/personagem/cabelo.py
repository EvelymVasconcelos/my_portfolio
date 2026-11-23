"""Cabelo da Evelym gerado por script, em mechas em faixas (a técnica de cabelo de jogo).

Corte das fotos de 2026-11-22: chanel em camadas na altura dos ombros, repartido no meio, com franja cortina (mechas que
saem da risca, descem pelas laterais da testa e emolduram o rosto até as maçãs). Nenhum cabelo do pacote do MakeHuman
tem esse corte, então ele é obra própria (ver ORIGEM.md).

Como funciona:
- a forma da cabeça vem de raios lançados do centro da cabeça até a pele (o couro cabeludo da malha do MPFB);
- as mechas da risca nascem ao longo da linha do meio (da testa ao alto da nuca) e vão até a lateral da cabeça pelo menor
  caminho sobre ela; as da frente descem na diagonal pelos cantos da testa (a franja cortina) e as de trás pela nuca;
- passando da altura das orelhas, cada mecha cai na vertical até o comprimento do corte, abrindo um pouco (volume) e
  com a ponta virada levemente para dentro;
- cada mecha é uma faixa com textura de fios (gerada aqui, com transparência nas pontas), em duas camadas.
"""

import math
import random

import bmesh
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

CABELO = {
    "comprimento": 0.255,  # metros abaixo do topo da cabeça: pontas nos ombros
    "franja_ate": 0.17,  # a franja cortina termina na altura das maçãs do rosto
    "risca_x": 0.004,  # risca quase no meio
    "mechas_por_lado": 110,
    "mechas_da_nuca": 70,
    "largura": 0.022,
    "camadas": (0.004, 0.011),  # distância da pele de cada camada
    "volume": 0.01,  # quanto as pontas se abrem para fora (liso e assentado)
    "cor": (0.012, 0.009, 0.008),
    "brilho": (0.07, 0.05, 0.045),
    "semente": 7,
}


def _textura_de_fios(nome, cor, brilho, largura=256, altura=1024):
    """Textura de fios: cor escura com brilhos finos e transparência que se desfia nas pontas (v = 0 é a raiz)."""
    import numpy as np

    rng = np.random.default_rng(CABELO["semente"])
    colunas = rng.random(largura)
    brilhos = (rng.random(largura) ** 6)[None, :]
    v = np.linspace(0, 1, altura)[:, None]
    # cada fio termina numa altura diferente: pontas desfiadas
    fim = 0.78 + colunas[None, :] * 0.22
    alfa = np.clip((fim - v) / 0.05, 0, 1) * (0.55 + 0.45 * (colunas[None, :] > 0.12))
    base = np.array(cor)[None, None, :]
    claro = np.array(brilho)[None, None, :]
    rgb = base + (claro - base) * brilhos[..., None]
    pixels = np.concatenate([np.broadcast_to(rgb, (altura, largura, 3)), alfa[..., None]], axis=2)
    imagem = bpy.data.images.new(nome, largura, altura, alpha=True)
    # o Blender guarda a imagem de baixo para cima: a linha 0 é v = 0
    imagem.pixels.foreach_set(pixels.astype(np.float32).ravel())
    imagem.pack()
    return imagem


def _material(imagem):
    mat = bpy.data.materials.new("evelym.cabelo")
    mat.use_nodes = True
    arvore = mat.node_tree
    bsdf = next(n for n in arvore.nodes if n.type == "BSDF_PRINCIPLED")
    tex = arvore.nodes.new("ShaderNodeTexImage")
    tex.image = imagem
    arvore.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    arvore.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
    bsdf.inputs["Roughness"].default_value = 0.5
    bsdf.inputs["Specular IOR Level"].default_value = 0.25  # fosco: a luz de recorte roxa não pinta o cabelo
    mat.surface_render_method = "DITHERED"
    return mat


def gerar(corpo, armadura):
    random.seed(CABELO["semente"])
    grafo = bpy.context.evaluated_depsgraph_get()
    avaliado = corpo.evaluated_get(grafo)
    malha = avaliado.to_mesh()
    malha.transform(corpo.matrix_world)
    bvh = BVHTree.FromPolygons([v.co.copy() for v in malha.vertices], [p.vertices[:] for p in malha.polygons])
    zs = [v.co.z for v in malha.vertices]
    topo = max(zs)
    cabeca = [v.co for v in malha.vertices if v.co.z > topo - 0.2]
    cy = sum(c.y for c in cabeca) / len(cabeca)
    centro = Vector((0, cy, topo - 0.115))
    avaliado.to_mesh_clear()

    def pele(direcao):
        """Ponto da pele na direção dada, a partir do centro da cabeça."""
        acerto, _normal, _i, _d = bvh.ray_cast(centro + direcao * 0.3, -direcao)
        return acerto

    corte = topo - CABELO["comprimento"]
    faixas = []  # (pontos, larguras)

    def caminho(direcoes, desvio, ate_z, abre, lado):
        """Segue a pele pelas direções e depois cai na vertical até ate_z."""
        raios = []
        for d in direcoes:
            p = pele(d)
            if p is None:
                return None
            raios.append((p - centro).length)
        # Suaviza a distância até a pele: a orelha não vira um calombo no cabelo, que passa por cima dela.
        suaves = []
        for k in range(len(raios)):
            janela = raios[max(0, k - 2) : k + 3]
            suaves.append(max(raios[k], sum(janela) / len(janela)))
        pontos = [centro + d.normalized() * (r + desvio) for d, r in zip(direcoes, suaves)]
        ultimo = pontos[-1]
        horizontal = Vector((ultimo.x - centro.x, ultimo.y - centro.y, 0))
        if horizontal.length < 1e-4:
            return None
        horizontal.normalize()
        queda = max(0.0, ultimo.z - ate_z)
        passos = max(2, int(queda / 0.025))
        for k in range(1, passos + 1):
            t = k / passos
            # abre para fora (volume) e, no fim, a ponta volta um pouco para dentro
            fora = abre * math.sin(t * math.pi * 0.8) * (1 - 0.35 * t**4)
            pontos.append(ultimo + horizontal * (fora + 0.004 * t) + Vector((0, 0, -queda * t)))
        return pontos

    def direcao(polar, longitude, lado):
        """Direção a partir do centro da cabeça: polar 0 é o alto, longitude 0 é a frente e 90° é a lateral."""
        return Vector(
            (
                lado * math.sin(polar) * math.sin(longitude),
                -math.sin(polar) * math.cos(longitude),
                math.cos(polar),
            )
        )

    for desvio in CABELO["camadas"]:
        for lado in (-1, 1):
            # Mechas da risca: raiz ao longo da linha do meio, da testa (u = 0) ao alto da nuca (u = 1), indo até a
            # lateral pelo menor caminho sobre a cabeça (interpolação esférica entre a raiz e o ponto de chegada).
            for i in range(CABELO["mechas_por_lado"]):
                u = (i + random.random()) / CABELO["mechas_por_lado"]
                if u < 0.5:
                    raiz = direcao(0.5 * (1 - 2 * u), 0, lado)
                else:
                    raiz = direcao(0.5 * (2 * u - 1), math.pi, lado)
                raiz.x += CABELO["risca_x"] * lado
                raiz.normalize()
                chegada = direcao(1.45 + 0.35 * u, math.radians(78 + 45 * u), lado)
                direcoes = [raiz.slerp(chegada, k / 11) for k in range(12)]
                frente = max(0.0, 1 - u / 0.28)  # 1 na testa, 0 a partir de um quarto da risca
                ate = corte + random.uniform(-0.012, 0.008)
                if frente > 0:
                    # franja cortina: termina nas maçãs do rosto e vai alongando até o comprimento do corte
                    curta = topo - CABELO["franja_ate"] + random.uniform(-0.01, 0.01)
                    ate = curta + (ate - curta) * (1 - frente)
                pontos = caminho(direcoes, desvio + random.uniform(0, 0.003), ate, CABELO["volume"], lado)
                if pontos:
                    faixas.append(pontos)
        # Mechas da nuca: descem do alto da nuca em meridianos, cobrindo a parte de trás.
        for j in range(CABELO["mechas_da_nuca"]):
            lon = math.pi * (0.42 + (j + random.random()) / CABELO["mechas_da_nuca"] * 1.16)
            direcoes = []
            for k in range(8):
                p = 0.6 + 1.25 * k / 7
                direcoes.append(Vector((math.sin(p) * math.sin(lon), -math.sin(p) * math.cos(lon), math.cos(p))))
            pontos = caminho(direcoes, desvio + 0.002, corte + random.uniform(-0.01, 0.012), CABELO["volume"], 1)
            if pontos:
                faixas.append(pontos)

    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    for pontos in faixas:
        u0 = random.random() * 0.8
        du = 0.2
        anterior = None
        n = len(pontos)
        comprimento = sum((pontos[k + 1] - pontos[k]).length for k in range(n - 1))
        andado = 0.0
        for k, p in enumerate(pontos):
            if k > 0:
                andado += (p - pontos[k - 1]).length
            t = andado / comprimento
            direcao = (pontos[min(k + 1, n - 1)] - pontos[max(k - 1, 0)]).normalized()
            normal = (p - centro).normalized()
            lado_v = direcao.cross(normal).normalized()
            w = CABELO["largura"] * (1 - 0.35 * t)
            a = bm.verts.new(p - lado_v * w / 2)
            b = bm.verts.new(p + lado_v * w / 2)
            if anterior:
                face = bm.faces.new((anterior[0], anterior[1], b, a))
                for loop, (uu, vv) in zip(face.loops, ((u0, anterior[2]), (u0 + du, anterior[2]), (u0 + du, t), (u0, t))):
                    loop[uv].uv = (uu, vv)
            anterior = (a, b, t)

    dados = bpy.data.meshes.new("evelym.cabelo")
    bm.to_mesh(dados)
    bm.free()
    obj = bpy.data.objects.new("evelym.cabelo", dados)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(_material(_textura_de_fios("evelym.fios", CABELO["cor"], CABELO["brilho"])))
    for poligono in obj.data.polygons:
        poligono.use_smooth = True

    # preso ao osso da cabeça: acompanha a cabeça na animação do site
    grupo = obj.vertex_groups.new(name="head")
    grupo.add(range(len(obj.data.vertices)), 1.0, "REPLACE")
    obj.parent = armadura
    modificador = obj.modifiers.new("Armature", "ARMATURE")
    modificador.object = armadura
    return obj, len(faixas)
