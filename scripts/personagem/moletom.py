"""Capuz e cordões do moletom lilás, gerados por script sobre a blusa do pacote do MakeHuman (obra própria, ver ORIGEM.md).

O capuz é uma gola grossa em volta da base do pescoço, mais cheia atrás (o capuz abaixado e embolado), e uma calota
deitada nas costas. Os cordões descem da frente da gola, com ponteira de metal. Tudo fica preso ao osso de cima da
coluna (spine_03), para acompanhar o tronco na animação.
"""

import math

import bmesh
import bpy
from mathutils import Matrix, Vector


def _malha(nome, bm, material, armadura, osso):
    dados = bpy.data.meshes.new(nome)
    bm.to_mesh(dados)
    bm.free()
    obj = bpy.data.objects.new(nome, dados)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(material)
    for p in obj.data.polygons:
        p.use_smooth = True
    grupo = obj.vertex_groups.new(name=osso)
    grupo.add(range(len(obj.data.vertices)), 1.0, "REPLACE")
    obj.parent = armadura
    mod = obj.modifiers.new("Armature", "ARMATURE")
    mod.object = armadura
    return obj


def gerar(armadura, material, cor_dos_cordoes=(0.93, 0.92, 0.95)):
    ossos = armadura.data.bones
    base = armadura.matrix_world @ ossos["neck_01"].head_local  # base do pescoço

    # Gola do capuz: um toro, mais largo e mais grosso atrás.
    bm = bmesh.new()
    anel, secao = 48, 14
    vertices = []
    for i in range(anel):
        a = 2 * math.pi * i / anel  # 0 é a frente (-Y)
        atras = (1 - math.cos(a)) / 2  # 0 na frente, 1 atrás
        raio = 0.072 + 0.022 * atras
        grossura = 0.016 + 0.02 * atras
        centro = Vector((math.sin(a) * raio * 1.18, -math.cos(a) * raio, -0.01 + 0.012 * atras))
        linha = []
        for j in range(secao):
            b = 2 * math.pi * j / secao
            radial = Vector((math.sin(a), -math.cos(a), 0)) * math.cos(b) * grossura
            p = base + centro + radial + Vector((0, 0, math.sin(b) * grossura * 0.8))
            linha.append(bm.verts.new(p))
        vertices.append(linha)
    for i in range(anel):
        for j in range(secao):
            a, b = vertices[i][j], vertices[(i + 1) % anel][j]
            c, d = vertices[(i + 1) % anel][(j + 1) % secao], vertices[i][(j + 1) % secao]
            bm.faces.new((a, b, c, d))
    # Calota do capuz deitada nas costas.
    costas = bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=0.085)
    matriz = (
        Matrix.Translation(base + Vector((0, 0.075, -0.075)))
        @ Matrix.Rotation(math.radians(-25), 4, "X")
        @ Matrix.Diagonal((1.35, 0.45, 1.0, 1.0))
    )
    bmesh.ops.transform(bm, matrix=matriz, verts=costas["verts"])
    capuz = _malha("evelym.capuz", bm, material, armadura, "spine_03")

    # Cordões com ponteira de metal.
    branco = bpy.data.materials.new("evelym.cordao")
    branco.use_nodes = True
    bsdf = next(n for n in branco.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*cor_dos_cordoes, 1)
    bsdf.inputs["Roughness"].default_value = 0.7
    bm = bmesh.new()
    for lado in (-1, 1):
        topo = base + Vector((0.026 * lado, -0.07, -0.02))
        geo = bmesh.ops.create_cone(bm, segments=10, radius1=0.0035, radius2=0.0035, depth=0.13, cap_ends=True)
        bmesh.ops.translate(bm, vec=topo + Vector((0.004 * lado, -0.006, -0.065)), verts=geo["verts"])
        ponta = bmesh.ops.create_cone(bm, segments=10, radius1=0.0048, radius2=0.0042, depth=0.018, cap_ends=True)
        bmesh.ops.translate(bm, vec=topo + Vector((0.008 * lado, -0.012, -0.138)), verts=ponta["verts"])
    cordoes = _malha("evelym.cordoes", bm, branco, armadura, "spine_03")
    return capuz, cordoes

