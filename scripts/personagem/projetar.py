"""Projeta o retrato da Evelym na pele do rosto da personagem (roda no Blender; chamado por projetar_rosto.py).

Entrada: .cache/personagem/projecao/pontos.json, com os 468 pontos do rosto (MediaPipe) no render de frente da personagem
e no retrato, a câmera do render e o caminho do retrato. Saída: o próprio evelym.blend, com:

- um mapa UV "projecao", que leva cada vértice do rosto ao ponto certo do retrato;
- uma máscara "rosto_mascara" (de 0 a 1 por vértice): só o rosto, de borda suave, sem o cabelo da foto e sem as partes
  que o retrato não vê de frente;
- o material da pele misturando o retrato e a pele genérica pela máscara, com a pele genérica no tom médio do retrato;
- sem as sobrancelhas 3D, que passam a vir do retrato.

Como o retrato encaixa: os pontos do render voltam para a superfície 3D por raios a partir da câmera; uma câmera projetiva
(DLT, 11 parâmetros) leva esses pontos 3D aos do retrato; o que sobra de diferença entre os dois rostos é corrigido por
uma deformação suave em 2D (thin-plate spline), para olhos, nariz e boca caírem exatamente nos lugares do retrato.
"""

import json
import os

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PONTOS = os.path.join(RAIZ, ".cache", "personagem", "projecao", "pontos.json")

# Contorno do rosto na malha do MediaPipe, em volta (da testa, pelo lado direito da imagem, até voltar).
CONTORNO = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176,
            149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
PROJECAO = {
    "borda": 0.18,  # largura da borda suave da máscara, em distâncias entre os olhos
    "recuo": 0.04,  # quanto a máscara começa para dentro do contorno do rosto
    "frente": (0.25, 0.55),  # a máscara some quando a pele vira de lado para a câmera do retrato
    # O retrato já traz luz e sombra; a luz da cena clareia por cima. Gama acima de 1 escurece os meios-tons e devolve o
    # contraste das sobrancelhas, dos olhos e dos lábios.
    "gama": 1.35,
}


def objeto(prefixo):
    return next(o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith(prefixo))


def bvh_do_rosto(objs):
    grafo = bpy.context.evaluated_depsgraph_get()
    verts, faces = [], []
    for o in objs:
        malha = o.evaluated_get(grafo).to_mesh()
        base = len(verts)
        verts += [o.matrix_world @ v.co for v in malha.vertices]
        faces += [[base + i for i in p.vertices] for p in malha.polygons]
        o.evaluated_get(grafo).to_mesh_clear()
    return BVHTree.FromPolygons(verts, faces)


def raios(pontos_render, camera, bvh):
    """Leva cada ponto do render (pixels) até a superfície 3D. Devolve (índices que acertaram, pontos 3D)."""
    m = np.array(camera["matriz"])
    origem = Vector(m[:3, 3])
    rotacao = m[:3, :3]
    w, h = camera["largura"], camera["altura"]
    f = camera["lente"] / camera["sensor"] * max(w, h)  # sensor ajustado pelo lado maior (padrão do Blender)
    indices, pontos = [], []
    for i, (x, y) in enumerate(pontos_render):
        if i >= 468:
            continue  # íris: os olhos 3D ficam no lugar
        direcao = Vector(rotacao @ np.array([(x - w / 2) / f, -(y - h / 2) / f, -1.0])).normalized()
        acerto, _n, _i, _d = bvh.ray_cast(origem, direcao)
        if acerto is not None:
            indices.append(i)
            pontos.append(tuple(acerto))
    return indices, np.array(pontos)


def normalizar(pts):
    centro = pts.mean(axis=0)
    escala = np.sqrt(pts.shape[1]) / np.mean(np.linalg.norm(pts - centro, axis=1))
    t = np.eye(pts.shape[1] + 1)
    t[:-1, :-1] *= escala
    t[:-1, -1] = -escala * centro
    return t


def dlt(x3, x2):
    """Câmera projetiva 3x4 que leva x3 (n x 3) a x2 (n x 2), pelos mínimos quadrados (com normalização de Hartley)."""
    t3, t2 = normalizar(x3), normalizar(x2)
    a = np.c_[x3, np.ones(len(x3))] @ t3.T
    b = np.c_[x2, np.ones(len(x2))] @ t2.T
    linhas = []
    for (X, Y, Z, W), (u, v, _) in zip(a, b):
        linhas.append([X, Y, Z, W, 0, 0, 0, 0, -u * X, -u * Y, -u * Z, -u * W])
        linhas.append([0, 0, 0, 0, X, Y, Z, W, -v * X, -v * Y, -v * Z, -v * W])
    _u, _s, vt = np.linalg.svd(np.array(linhas))
    p = vt[-1].reshape(3, 4)
    return np.linalg.inv(t2) @ p @ t3


def projetar(p, x3):
    h = np.c_[x3, np.ones(len(x3))] @ p.T
    return h[:, :2] / h[:, 2:3]


def tps(origem, destino, escala, suavidade=1e-3):
    """Deformação suave (thin-plate spline) que leva os pontos origem aos destino. Devolve a função que aplica."""
    o = origem / escala

    def nucleo(r):
        with np.errstate(divide="ignore", invalid="ignore"):
            k = r * r * np.log(r)
        return np.nan_to_num(k)

    n = len(o)
    k = nucleo(np.linalg.norm(o[:, None] - o[None], axis=2)) + suavidade * np.eye(n)
    pmat = np.c_[np.ones(n), o]
    sistema = np.block([[k, pmat], [pmat.T, np.zeros((3, 3))]])
    lado = np.r_[(destino - origem) / escala, np.zeros((3, 2))]
    pesos = np.linalg.solve(sistema, lado)

    def aplicar(q):
        qn = q / escala
        kq = nucleo(np.linalg.norm(qn[:, None] - o[None], axis=2))
        return q + (kq @ pesos[:n] + np.c_[np.ones(len(qn)), qn] @ pesos[n:]) * escala

    return aplicar


def dentro_e_distancia(pts, poligono):
    """Distância de cada ponto à borda do polígono: positiva dentro, negativa fora."""
    a = poligono
    b = np.roll(poligono, -1, axis=0)
    # distância a cada segmento
    ab = b - a
    t = np.clip(np.einsum("ijk,jk->ij", pts[:, None] - a[None], ab) / np.einsum("jk,jk->j", ab, ab), 0, 1)
    perto = a[None] + t[..., None] * ab[None]
    dist = np.linalg.norm(pts[:, None] - perto, axis=2).min(axis=1)
    # dentro ou fora (paridade dos cruzamentos de um raio horizontal)
    y = pts[:, 1][:, None]
    cruza = ((a[None, :, 1] > y) != (b[None, :, 1] > y)) & (
        pts[:, 0][:, None] < (b[None, :, 0] - a[None, :, 0]) * (y - a[None, :, 1]) / (b[None, :, 1] - a[None, :, 1] + 1e-12) + a[None, :, 0]
    )
    dentro = cruza.sum(axis=1) % 2 == 1
    return np.where(dentro, dist, -dist)


def suave(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def linear(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def pixels(imagem):
    w, h = imagem.size
    buf = np.empty(w * h * 4, dtype=np.float32)
    imagem.pixels.foreach_get(buf)
    return buf.reshape(h, w, 4)  # linha 0 é a de baixo


def main():
    with open(PONTOS, encoding="utf8") as f:
        dados = json.load(f)
    corpo = objeto("evelym.body")
    olhos = objeto("evelym.high-poly")

    # 1. Pontos do render de volta na superfície 3D (olhos 3D incluídos: a borda das pálpebras fica sobre eles).
    indices, x3 = raios(dados["render"], dados["camera"], bvh_do_rosto([corpo, olhos]))
    foto = np.array(dados["foto"])[indices]

    # 2. Câmera do retrato e correção fina.
    p = dlt(x3, foto)
    proj = projetar(p, x3)
    olho_d, olho_e = np.array(dados["foto"])[33], np.array(dados["foto"])[263]
    unidade = float(np.linalg.norm(olho_e - olho_d))
    erro = np.linalg.norm(proj - foto, axis=1) / unidade
    print(f"PROJECAO {len(indices)} pontos, erro da câmera: médio {erro.mean():.3f}, máximo {erro.max():.3f} (em olhos)")
    corrigir = tps(proj, foto, unidade)

    # 3. Cada vértice do corpo no retrato.
    n = len(corpo.data.vertices)
    co = np.empty(n * 3)
    corpo.data.vertices.foreach_get("co", co)
    mundo = np.array(corpo.matrix_world)
    vw = (np.c_[co.reshape(n, 3), np.ones(n)] @ mundo.T)[:, :3]
    nrm = np.empty(n * 3)
    corpo.data.vertices.foreach_get("normal", nrm)
    nrm = nrm.reshape(n, 3) @ mundo[:3, :3].T
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
    na_foto = corrigir(projetar(p, vw))

    # 4. Máscara: dentro do contorno do rosto do retrato, de frente para a câmera dele, na pele visível.
    contorno = np.array(dados["foto"])[CONTORNO]
    centro = contorno.mean(axis=0)
    contorno = centro + (contorno - centro) * (1 - PROJECAO["recuo"] * unidade / np.linalg.norm(contorno - centro, axis=1, keepdims=True))
    dist = dentro_e_distancia(na_foto, contorno) / unidade
    _u, _s, vt = np.linalg.svd(p)
    centro_camera = vt[-1][:3] / vt[-1][3]
    olhar = centro_camera[None] - vw
    olhar /= np.linalg.norm(olhar, axis=1, keepdims=True)
    de_frente = np.einsum("ij,ij->i", nrm, olhar)
    mascara = suave(dist, 0, PROJECAO["borda"]) * suave(de_frente, *PROJECAO["frente"])
    dentro = dist > PROJECAO["borda"]
    print(
        "MASCARA dentro do rosto:",
        int(dentro.sum()),
        "vértices; de frente (p10, p50, p90):",
        np.round(np.percentile(de_frente[dentro], [10, 50, 90]), 2).tolist(),
        "câmera do retrato em",
        np.round(centro_camera, 3).tolist(),
    )
    visivel = corpo.vertex_groups["body"].index
    na_pele = np.array([any(g.group == visivel for g in v.groups) for v in corpo.data.vertices])
    mascara *= na_pele

    # Sem o cabelo lilás do retrato: perto da borda, recusa pixels em que o azul passa do vermelho. Pele e lábios têm
    # sempre mais vermelho que azul, mesmo com a luz rosada do retrato (o critério "azul acima do verde" cortava a testa,
    # o queixo e a boca).
    retrato = bpy.data.images.load(dados["caminho_foto"], check_existing=True)
    px = pixels(retrato)
    hf, wf = px.shape[:2]
    xi = np.clip(na_foto[:, 0].astype(int), 0, wf - 1)
    yi = np.clip(na_foto[:, 1].astype(int), 0, hf - 1)
    cor = px[hf - 1 - yi, xi, :3]
    maior, menor = cor.max(axis=1), cor.min(axis=1)
    saturacao = (maior - menor) / (maior + 1e-6)
    azulado = cor[:, 2] > cor[:, 0] + 0.03
    perto_da_borda = dist < 0.8
    mascara *= np.where(perto_da_borda & azulado & (saturacao > 0.2), 0.0, 1.0)

    atributo = corpo.data.color_attributes.get("rosto_mascara") or corpo.data.color_attributes.new("rosto_mascara", "FLOAT_COLOR", "POINT")
    atributo.data.foreach_set("color", np.repeat(mascara, 4).astype(np.float32))

    # 5. Mapa UV "projecao".
    uv = corpo.data.uv_layers.get("projecao") or corpo.data.uv_layers.new(name="projecao")
    vert_do_laco = np.empty(len(corpo.data.loops), dtype=np.int64)
    corpo.data.loops.foreach_get("vertex_index", vert_do_laco)
    uvs = np.c_[na_foto[vert_do_laco, 0] / wf, 1 - na_foto[vert_do_laco, 1] / hf]
    uv.data.foreach_set("uv", uvs.astype(np.float32).ravel())
    corpo.data.uv_layers.active = corpo.data.uv_layers["UVMap"]

    # 6. Tom da pele genérica igual ao tom médio do retrato, onde o retrato entra inteiro.
    material = corpo.material_slots[0].material
    arvore = material.node_tree
    textura = next(nd for nd in arvore.nodes if nd.type == "TEX_IMAGE" and nd.name == "diffuseTexture")
    tinta = next(nd for nd in arvore.nodes if nd.type == "MIX" and nd.blend_type == "MULTIPLY")
    pele = pixels(textura.image)
    uv_base = np.empty(len(corpo.data.loops) * 2)
    corpo.data.uv_layers["UVMap"].data.foreach_get("uv", uv_base)
    uv_base = uv_base.reshape(-1, 2)
    uv_do_vertice = np.zeros((n, 2))
    uv_do_vertice[vert_do_laco] = uv_base
    nucleo = mascara > 0.9
    hp, wp = pele.shape[:2]
    cor_pele = pele[(uv_do_vertice[nucleo, 1] * (hp - 1)).astype(int), (uv_do_vertice[nucleo, 0] * (wp - 1)).astype(int), :3]
    # mediana: os brilhos e as sombras do retrato não puxam a média
    tom = np.median(linear(cor[nucleo]) ** PROJECAO["gama"], axis=0) / np.median(linear(cor_pele), axis=0)
    tinta.inputs["B"].default_value = (*np.clip(tom, 0, 2), 1)
    print(f"TOM da pele genérica: {np.round(tom, 3).tolist()} (vértices no núcleo do rosto: {int(nucleo.sum())})")

    # 7. Material: retrato no rosto, pele genérica fora, pela máscara.
    bsdf = next(nd for nd in arvore.nodes if nd.type == "BSDF_PRINCIPLED")
    entrada = bsdf.inputs["Base Color"]
    antes = entrada.links[0].from_socket
    no_uv = arvore.nodes.new("ShaderNodeUVMap")
    no_uv.uv_map = "projecao"
    no_retrato = arvore.nodes.new("ShaderNodeTexImage")
    no_retrato.image = retrato
    no_retrato.extension = "EXTEND"
    arvore.links.new(no_uv.outputs["UV"], no_retrato.inputs["Vector"])
    no_mascara = arvore.nodes.new("ShaderNodeAttribute")
    no_mascara.attribute_name = "rosto_mascara"
    mistura = arvore.nodes.new("ShaderNodeMix")
    mistura.data_type = "RGBA"
    arvore.links.new(no_mascara.outputs["Fac"], mistura.inputs["Factor"])
    arvore.links.new(antes, mistura.inputs["A"])
    gama = arvore.nodes.new("ShaderNodeGamma")
    gama.inputs["Gamma"].default_value = PROJECAO["gama"]
    arvore.links.new(no_retrato.outputs["Color"], gama.inputs["Color"])
    arvore.links.new(gama.outputs["Color"], mistura.inputs["B"])
    arvore.links.new(mistura.outputs["Result"], entrada)

    # 8. As sobrancelhas vêm do retrato.
    for o in [o for o in bpy.data.objects if o.name.startswith("evelym.eyebrow")]:
        bpy.data.objects.remove(o, do_unlink=True)

    bpy.ops.wm.save_mainfile()
    print("PROJECAO salva em", bpy.data.filepath)


main()
