"""Exporta a personagem para o site: public/models/evelym.glb (roda no Blender, sobre o evelym.blend já projetado).

Passos:
1. braços na pose de digitar (cinemática inversa até o teclado), aplicada como pose de descanso: no site, só dedos,
   mãos e cabeça se mexem;
2. corta da cintura para baixo (fica atrás da mesa) e a geometria auxiliar do MakeHuman;
3. grava numa textura só a cor da pele (retrato projetado + pele genérica), pelo Cycles;
4. exporta em glTF binário, com as texturas em WebP.

A escala e a posição na cena ficam no site (components/scene/hero-scene.ts), não aqui: o modelo sai em metros, com os
pés na origem e o rosto para -Y (o glTF vira +Z, de frente para a câmera da cena).
"""

import os

import bmesh
import bpy
from mathutils import Vector

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SAIDA = os.environ.get("PERSONAGEM_GLB", os.path.join(RAIZ, "public", "models", "evelym.glb"))

EXPORTAR = {
    # Mãos no teclado: em relação ao centro da cabeça, em metros (x para o lado, y para a frente é negativo, z para cima).
    # Mãos na largura dos ombros: mais perto do meio, o braço descia grudado no tronco (2026-11-23).
    "mao": Vector((0.18, -0.3, -0.46)),
    # Para onde o cotovelo aponta (alvo do polo da cinemática inversa): para fora e um pouco à frente, como quem digita.
    # Com o cotovelo para trás, o braço descia colado ao corpo e sumia atrás do notebook (2026-11-23).
    "cotovelo": Vector((0.9, 0.05, -0.5)),
    "textura_da_pele": 2048,
}


def malhas():
    return [o for o in bpy.data.objects if o.type == "MESH"]


def centro_da_cabeca(armadura):
    osso = armadura.data.bones["head"]
    return armadura.matrix_world @ ((osso.head_local + osso.tail_local) / 2)


def pose_de_digitar(armadura):
    cabeca = centro_da_cabeca(armadura)
    bpy.context.view_layer.objects.active = armadura
    bpy.ops.object.mode_set(mode="POSE")
    vazios = []
    for lado, sufixo in ((1, "l"), (-1, "r")):
        # O MakeHuman olha para -Y, e o lado esquerdo dele fica em +X.
        alvo = bpy.data.objects.new(f"alvo_{sufixo}", None)
        polo = bpy.data.objects.new(f"polo_{sufixo}", None)
        for vazio, rel in ((alvo, EXPORTAR["mao"]), (polo, EXPORTAR["cotovelo"])):
            bpy.context.scene.collection.objects.link(vazio)
            vazio.location = cabeca + Vector((rel.x * lado, rel.y, rel.z))
            vazios.append(vazio)
        restricao = armadura.pose.bones[f"lowerarm_{sufixo}"].constraints.new("IK")
        restricao.target = alvo
        restricao.pole_target = polo
        restricao.pole_angle = 0
        restricao.chain_count = 2
        # mão alinhada com o antebraço, palma para baixo
        armadura.pose.bones[f"hand_{sufixo}"].rotation_mode = "XYZ"
    bpy.context.view_layer.update()

    # Aplica a pose nas malhas e a torna a pose de descanso.
    bpy.ops.object.mode_set(mode="OBJECT")
    for o in malhas():
        bpy.context.view_layer.objects.active = o
        for mod in list(o.modifiers):
            if mod.type == "MASK" and mod.vertex_group != "body":
                # máscara da blusa do pacote (esconde a pele por baixo dela): a blusa sai, e o moletom é feito dessa pele
                o.modifiers.remove(mod)
            elif mod.type in ("ARMATURE", "MASK"):
                bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.context.view_layer.objects.active = armadura
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")
    bpy.ops.pose.visual_transform_apply()
    for osso in armadura.pose.bones:
        for r in list(osso.constraints):
            osso.constraints.remove(r)
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    for v in vazios:
        bpy.data.objects.remove(v, do_unlink=True)
    for o in malhas():
        mod = o.modifiers.new("Armature", "ARMATURE")
        mod.object = armadura


def peso(o, v, prefixos):
    """Soma dos pesos do vértice nos grupos cujo nome começa por um dos prefixos."""
    total = 0.0
    for g in v.groups:
        if o.vertex_groups[g.group].name.startswith(prefixos):
            total += g.weight
    return total


def cortar():
    """Tira as pernas (ficam atrás da mesa): os vértices presos às coxas, às canelas e aos pés."""
    pernas = ("thigh_", "calf_", "foot_", "ball_")
    for o in malhas():
        if not o.vertex_groups:
            continue
        bm = bmesh.new()
        bm.from_mesh(o.data)
        bm.verts.ensure_lookup_table()
        fora = [bm.verts[v.index] for v in o.data.vertices if peso(o, v, pernas) > 0.5]
        bmesh.ops.delete(bm, geom=fora, context="VERTS")
        bm.to_mesh(o.data)
        bm.free()
        if not o.data.vertices:
            bpy.data.objects.remove(o, do_unlink=True)


def copiar_pele(nome, material, fica, folga, suavizar=0, folga_dos_bracos=None):
    """Peça do moletom feita da pele do corpo: copia os vértices em que fica(objeto, vértice) é verdadeiro e infla."""
    corpo = next(o for o in malhas() if o.name.endswith(".body"))
    copia = corpo.copy()
    copia.data = corpo.data.copy()
    copia.name = nome
    bpy.context.scene.collection.objects.link(copia)
    bm = bmesh.new()
    bm.from_mesh(copia.data)
    bm.verts.ensure_lookup_table()
    fora = [bm.verts[v.index] for v in copia.data.vertices if not fica(copia, v)]
    bmesh.ops.delete(bm, geom=fora, context="VERTS")
    # Normais coerentes e para fora antes de inflar: na malha do MakeHuman, parte do peito vinha com a normal para dentro,
    # e o moletom afundava no corpo ali (a pele aparecia por cima).
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # Tecido grosso não marca a anatomia: alisa a forma (sem mexer nas bordas) antes de inflar.
    miolo = [v for v in bm.verts if not v.is_boundary]
    for _ in range(suavizar):
        bmesh.ops.smooth_vert(bm, verts=miolo, factor=0.6, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.normal_update()
    camada = bm.verts.layers.deform.active
    bracos = {g.index for g in copia.vertex_groups if g.name.startswith(("upperarm_", "lowerarm_"))}
    for v in bm.verts:
        f = folga
        if folga_dos_bracos is not None and camada is not None:
            # mangas mais justas que o tronco, com transição pelo peso dos ossos do braço
            braco = min(1.0, sum(w for g, w in v[camada].items() if g in bracos))
            f = folga + (folga_dos_bracos - folga) * braco
        v.co += v.normal * f
    bm.to_mesh(copia.data)
    bm.free()
    copia.data.materials.clear()
    copia.data.materials.append(material)


def coberto(o, v):
    """A pele que vira moletom: braços e tronco, sem as mãos, o pescoço e a cabeça."""
    return (
        peso(o, v, ("upperarm_", "lowerarm_", "spine_", "pelvis", "clavicle_")) >= 0.35
        and peso(o, v, ("hand_",)) <= 0.15
        and peso(o, v, ("neck_",)) <= 0.6
        and peso(o, v, ("head",)) <= 0.05
    )


def cair_como_tecido(obj):
    """Na frente do tronco, o tecido cai reto a partir do ponto mais saliente acima dele: não volta para dentro abaixo do
    busto (moletom não marca o corpo). Só no tronco, de frente, abaixo dos ombros; as mangas ficam como estão."""
    armadura = next(o for o in bpy.data.objects if o.type == "ARMATURE")
    ombros = centro_da_cabeca(armadura).z - 0.2
    bracos = {g.index for g in obj.vertex_groups if g.name.startswith(("upperarm_", "lowerarm_"))}
    mundo = [obj.matrix_world @ v.co for v in obj.data.vertices]
    eixo_y = sum(p.y for p in mundo) / len(mundo)
    faixas = {}
    for v, p in zip(obj.data.vertices, mundo):
        braco = sum(g.weight for g in v.groups if g.group in bracos)
        # só o meio do peito: puxar a lateral do tronco para a frente fazia uma aba ao lado do braço
        if braco < 0.2 and p.y < eixo_y and p.z < ombros and abs(p.x) < 0.125:
            faixas.setdefault(round(p.x / 0.012), []).append(v.index)
    inversa = obj.matrix_world.inverted()
    for indices in faixas.values():
        indices.sort(key=lambda i: -mundo[i].z)  # de cima para baixo
        mais_a_frente = None
        for i in indices:
            p = mundo[i]
            if mais_a_frente is not None and p.y > mais_a_frente:
                p = p.copy()
                # some aos poucos na direção das laterais
                lado = min(1.0, max(0.0, (abs(p.x) - 0.1) / 0.025))
                p.y = mais_a_frente + (p.y - mais_a_frente) * lado
                obj.data.vertices[i].co = inversa @ p
            mais_a_frente = p.y if mais_a_frente is None else min(mais_a_frente, p.y)
    obj.data.update()


def moletom(material):
    """O moletom numa peça só: tronco até o quadril e mangas até o punho, na mesma folga. Duas peças com folgas diferentes
    deixavam dobras e manchas na emenda do ombro (2026-11-23). A blusa curta do pacote sai.

    Generoso no pescoço: a pele do alto do peito e do ombro também é puxada pelo osso do pescoço, e excluí-la abria
    buracos. O moletom sobe até a base do pescoço, por baixo da gola do capuz."""
    copiar_pele("evelym.moletom", material, coberto, 0.015, suavizar=10, folga_dos_bracos=0.008)
    cair_como_tecido(bpy.data.objects["evelym.moletom"])

    # A pele que ficou inteira por baixo do moletom sai (como fazia a máscara da blusa): assim ela nunca atravessa o
    # tecido, e o modelo fica mais leve. Fica uma borda de pele perto das aberturas (punho e gola).
    corpo = next(o for o in malhas() if o.name.endswith(".body"))
    dentro = {v.index for v in corpo.data.vertices if coberto(corpo, v)}
    vizinhos = {i: set() for i in dentro}
    for aresta in corpo.data.edges:
        a, b = aresta.vertices
        if a in vizinhos:
            vizinhos[a].add(b)
        if b in vizinhos:
            vizinhos[b].add(a)
    miolo = dentro
    for _ in range(2):  # duas voltas de margem a partir da borda
        miolo = {i for i in miolo if vizinhos[i] <= miolo}
    bm = bmesh.new()
    bm.from_mesh(corpo.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in miolo], context="VERTS")
    bm.to_mesh(corpo.data)
    bm.free()
    print(f"MOLETOM pele escondida removida: {len(miolo)} vértices")


def cordoes_sobre_o_moletom():
    """Os cordões saem do capuz e descem por cima do moletom, a 5 mm do tecido (o moletom, mais volumoso que a blusa do
    pacote, passava por cima deles e eles apareciam cortados)."""
    from mathutils.bvhtree import BVHTree

    moletom = bpy.data.objects["evelym.moletom"]
    malha = moletom.data
    bvh = BVHTree.FromPolygons(
        [moletom.matrix_world @ v.co for v in malha.vertices], [p.vertices[:] for p in malha.polygons]
    )
    cordoes = bpy.data.objects["evelym.cordoes"]
    mundo = [cordoes.matrix_world @ v.co for v in cordoes.data.vertices]
    inversa = cordoes.matrix_world.inverted()
    for lado in (-1, 1):
        indices = [i for i, p in enumerate(mundo) if p.x * lado > 0]
        eixo_x = sum(mundo[i].x for i in indices) / len(indices)
        eixo_y = sum(mundo[i].y for i in indices) / len(indices)
        for i in indices:
            p = mundo[i]
            acerto, _n, _f, _d = bvh.ray_cast(Vector((eixo_x, p.y - 0.4, p.z)), Vector((0, 1, 0)))
            if acerto is None:
                continue
            frente = acerto.y - 0.005 - 0.0045  # 5 mm do tecido, mais o raio do cordão
            cordoes.data.vertices[i].co = inversa @ Vector((p.x, p.y + (frente - eixo_y), p.z))


def forma_de_piscar():
    """Forma "piscar" nas pálpebras: a de cima desce até encontrar a de baixo, cobrindo o olho. Os cílios de cima descem
    junto. No site, a cena liga e desliga essa forma (morph target)."""
    olhos = next(o for o in malhas() if o.name.endswith(".high-poly"))
    pontos = [olhos.matrix_world @ v.co for v in olhos.data.vertices]
    centros = []
    for lado in (-1, 1):
        lado_pts = [p for p in pontos if p.x * lado > 0]
        centros.append(sum(lado_pts, Vector()) / len(lado_pts))
    rx, altura, aberta = 0.019, 0.016, 0.0055  # largura da pálpebra, até onde ela se mexe e a abertura do olho

    def descer(p):
        for c in centros:
            dx, dz = p.x - c.x, p.z - c.z
            if abs(dx) >= rx or not -0.001 < dz < altura or p.y > c.y + 0.004:
                continue
            fx = 1 - (dx / rx) ** 2
            # 1 na borda da pálpebra, caindo até 0 na altura limite
            fz = 1.0 if dz <= aberta else max(0.0, 1 - (dz - aberta) / (altura - aberta)) ** 2
            queda = (aberta + 0.0015) * fx * fz
            return Vector((p.x, p.y - 0.002 * fx * fz, p.z - queda))
        return None

    for o in malhas():
        if not (o.name.endswith(".body") or o.name.endswith(".eyelashes02")):
            continue
        if not o.data.shape_keys:
            o.shape_key_add(name="Basis")
        forma = o.shape_key_add(name="piscar")
        inversa = o.matrix_world.inverted()
        movidos = 0
        for i, v in enumerate(o.data.vertices):
            novo = descer(o.matrix_world @ v.co)
            if novo is not None:
                forma.data[i].co = inversa @ novo
                movidos += 1
        print(f"PISCAR {o.name}: {movidos} vértices")


def roupa_lisa(material, cor):
    """Tira as texturas da roupa: no site, a cor do moletom vem do tema."""
    arvore = material.node_tree
    bsdf = next(n for n in arvore.nodes if n.type == "BSDF_PRINCIPLED")
    for entrada in bsdf.inputs:
        for link in list(entrada.links):
            arvore.links.remove(link)
    bsdf.inputs["Base Color"].default_value = (*cor, 1)
    bsdf.inputs["Roughness"].default_value = 0.9


def assar_pele():
    corpo = next(o for o in malhas() if o.name.endswith(".body"))
    material = corpo.material_slots[0].material
    arvore = material.node_tree
    tamanho = EXPORTAR["textura_da_pele"]
    imagem = bpy.data.images.new("evelym.pele", tamanho, tamanho, alpha=False)
    alvo = arvore.nodes.new("ShaderNodeTexImage")
    alvo.image = imagem
    for n in arvore.nodes:
        n.select = False
    alvo.select = True
    arvore.nodes.active = alvo
    corpo.data.uv_layers.active = corpo.data.uv_layers["UVMap"]

    cena = bpy.context.scene
    cena.render.engine = "CYCLES"
    cena.cycles.samples = 4
    cena.cycles.device = "CPU"
    cena.render.bake.use_pass_direct = False
    cena.render.bake.use_pass_indirect = False
    cena.render.bake.use_pass_color = True
    cena.render.bake.margin = 8
    for o in bpy.data.objects:
        o.select_set(o == corpo)
    bpy.context.view_layer.objects.active = corpo
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, use_clear=True)

    # Material novo: só a textura assada, sem os nós da projeção.
    bsdf = next(n for n in arvore.nodes if n.type == "BSDF_PRINCIPLED")
    rugosidade = bsdf.inputs["Roughness"].default_value
    novo = bpy.data.materials.new("evelym.pele")
    novo.use_nodes = True
    nbsdf = next(n for n in novo.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    tex = novo.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = imagem
    novo.node_tree.links.new(tex.outputs["Color"], nbsdf.inputs["Base Color"])
    nbsdf.inputs["Roughness"].default_value = rugosidade
    corpo.material_slots[0].material = novo
    uv = corpo.data.uv_layers.get("projecao")
    if uv:
        corpo.data.uv_layers.remove(uv)
    for nome in list(corpo.data.color_attributes.keys()):
        corpo.data.color_attributes.remove(corpo.data.color_attributes[nome])


def ponto_da_cabeca(armadura):
    """Um ponto vazio no centro da cabeça, preso ao osso dela: no site, os fones da cena se prendem a ele."""
    from mathutils import Matrix

    vazio = bpy.data.objects.new("centro_cabeca", None)
    bpy.context.scene.collection.objects.link(vazio)
    vazio.parent = armadura
    vazio.parent_type = "BONE"
    vazio.parent_bone = "head"
    vazio.matrix_world = Matrix.Translation(centro_da_cabeca(armadura))


def main():
    armadura = next(o for o in bpy.data.objects if o.type == "ARMATURE")
    pose_de_digitar(armadura)
    cortar()
    roupa = next(o for o in malhas() if o.name.endswith(".female_sportsuit01"))
    material_da_roupa = roupa.material_slots[0].material
    roupa_lisa(material_da_roupa, (0.5, 0.36, 0.78))
    moletom(material_da_roupa)
    bpy.data.objects.remove(roupa, do_unlink=True)
    cordoes_sobre_o_moletom()
    assar_pele()
    forma_de_piscar()
    ponto_da_cabeca(armadura)
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=SAIDA,
        export_format="GLB",
        export_image_format="WEBP",
        export_skins=True,
        export_animations=False,
        export_morph=True,
        export_morph_normal=False,
        export_yup=True,
    )
    triangulos = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in malhas())
    print(f"EXPORTADO {SAIDA}: {os.path.getsize(SAIDA) / 1e6:.2f} MB, {triangulos} triângulos, {len(malhas())} malhas")
    print("MALHAS", [(o.name, o.material_slots[0].material.name if o.material_slots else None) for o in malhas()])


if __name__ == "__main__":
    main()
