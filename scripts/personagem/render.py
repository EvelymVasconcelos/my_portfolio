"""Renderiza a personagem gerada por `gerar.py` em três vistas (frente, três quartos e perfil), para o protótipo.

Uso: `npm run personagem:render` (abre `.cache/personagem/evelym.blend` no Blender do Flatpak, sem interface). Saída:
`design/prototipos/personagem-3d/render-<vista>.webp`, vista pela página `index.html` da mesma pasta.

A luz imita a da cena do site: principal quente vinda do alto à esquerda, preenchimento suave e recorte roxo atrás.
"""

import math
import os

import bpy
from mathutils import Vector

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PASTA = os.path.join(RAIZ, "design", "prototipos", "personagem-3d")
VISTAS = {"frente": 0, "tres-quartos": 35, "perfil": 90}


def topo_da_cabeca():
    corpo = next(o for o in bpy.data.objects if o.name.endswith(".body"))
    pontos = [corpo.matrix_world @ Vector(c) for c in corpo.bound_box]
    return max(p.z for p in pontos)


def luz(nome, tipo, energia, cor, local, alvo, tamanho=1.0):
    dados = bpy.data.lights.new(nome, tipo)
    dados.energy = energia
    dados.color = cor
    if tipo == "AREA":
        dados.size = tamanho
    obj = bpy.data.objects.new(nome, dados)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = local
    obj.rotation_euler = (Vector(alvo) - Vector(local)).to_track_quat("-Z", "Y").to_euler()


def main():
    cena = bpy.context.scene
    topo = topo_da_cabeca()
    alvo = Vector((0, 0, topo - 0.17))  # entre os olhos e o queixo, com os ombros no quadro

    # Fundo cinza-arroxeado escuro, como o tema escuro do site.
    mundo = bpy.data.worlds.new("fundo")
    mundo.use_nodes = True
    fundo = mundo.node_tree.nodes["Background"]
    fundo.inputs[0].default_value = (0.07, 0.065, 0.09, 1)
    fundo.inputs[1].default_value = 0.6
    cena.world = mundo

    luz("principal", "AREA", 45, (1, 0.95, 0.9), (-0.9, -1.2, topo + 0.6), alvo, 0.8)
    luz("preenchimento", "AREA", 12, (0.95, 0.95, 1), (1.1, -1.0, topo - 0.1), alvo, 1.2)
    luz("recorte", "AREA", 30, (0.78, 0.68, 1), (0.6, 1.1, topo + 0.3), alvo, 0.6)

    camera = bpy.data.objects.new("camera", bpy.data.cameras.new("camera"))
    camera.data.lens = 70
    cena.collection.objects.link(camera)
    cena.camera = camera

    cena.render.engine = "BLENDER_EEVEE"
    cena.render.resolution_x = 900
    cena.render.resolution_y = 1100
    cena.render.film_transparent = False
    cena.view_settings.view_transform = "AgX"
    # WebP: cada rodada de renders fica no Git, então o peso conta (PNG dava 1,1 MB por vista).
    cena.render.image_settings.file_format = "WEBP"
    cena.render.image_settings.quality = 88

    os.makedirs(PASTA, exist_ok=True)
    distancia = 1.15
    for nome, graus in VISTAS.items():
        a = math.radians(graus)
        # O MakeHuman olha para -Y; a câmera gira em volta da cabeça a partir da frente.
        camera.location = alvo + Vector((math.sin(a) * distancia, -math.cos(a) * distancia, 0.05))
        camera.rotation_euler = (alvo - camera.location).to_track_quat("-Z", "Y").to_euler()
        cena.render.filepath = os.path.join(PASTA, f"render-{nome}.webp")
        bpy.ops.render.render(write_still=True)
        print("RENDER", cena.render.filepath)


if __name__ == "__main__":
    main()
