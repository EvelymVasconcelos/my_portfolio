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
    "mao": Vector((0.088, -0.27, -0.47)),
    "cotovelo": Vector((0.26, 0.15, -0.5)),  # para onde o cotovelo aponta (alvo do polo da cinemática inversa)
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
            if mod.type in ("ARMATURE", "MASK"):
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


def copiar_pele(nome, material, fica, folga):
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
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * folga
    bm.to_mesh(copia.data)
    bm.free()
    copia.data.materials.clear()
    copia.data.materials.append(material)


def moletom(material):
    """Mangas compridas até o punho e o corpo do moletom até o quadril (a blusa do pacote é curta)."""
    copiar_pele(
        "evelym.mangas",
        material,
        lambda o, v: peso(o, v, ("upperarm_", "lowerarm_")) >= 0.5 and peso(o, v, ("hand_",)) <= 0.15,
        0.009,
    )
    copiar_pele(
        "evelym.tronco",
        material,
        lambda o, v: peso(o, v, ("spine_", "pelvis", "clavicle_")) >= 0.5 and peso(o, v, ("neck_", "head")) <= 0.1,
        0.012,
    )


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
    assar_pele()
    ponto_da_cabeca(armadura)
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=SAIDA,
        export_format="GLB",
        export_image_format="WEBP",
        export_skins=True,
        export_animations=False,
        export_morph=False,
        export_yup=True,
    )
    triangulos = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in malhas())
    print(f"EXPORTADO {SAIDA}: {os.path.getsize(SAIDA) / 1e6:.2f} MB, {triangulos} triângulos, {len(malhas())} malhas")
    print("MALHAS", [(o.name, o.material_slots[0].material.name if o.material_slots else None) for o in malhas()])


if __name__ == "__main__":
    main()
