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
# vista: (graus a partir da frente, distância da câmera, altura do alvo abaixo do topo da cabeça)
VISTAS = {
    "frente": (0, 1.15, 0.17),
    "tres-quartos": (35, 1.15, 0.17),
    "perfil": (90, 1.15, 0.17),
    "rosto": (12, 0.5, 0.115),  # de perto: olhos, nariz, sobrancelhas e boca
}
# Variante de cor do cabelo, para a dona escolher (lilás dos retratos estilizados, ou o preto das fotos).
VARIANTES = {"lilas": ((0.2, 0.06, 0.32), (0.62, 0.36, 0.85))}


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
    alvo = Vector((0, 0, topo - 0.17))  # entre os olhos e o queixo: ilumina o rosto

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

    def fotografar(sufixo=""):
        for nome, (graus, distancia, abaixo) in VISTAS.items():
            if sufixo and nome not in ("frente", "rosto"):
                continue
            mira = Vector((0, 0, topo - abaixo))
            a = math.radians(graus)
            # O MakeHuman olha para -Y; a câmera gira em volta da cabeça a partir da frente.
            camera.location = mira + Vector((math.sin(a) * distancia, -math.cos(a) * distancia, 0.04))
            camera.rotation_euler = (mira - camera.location).to_track_quat("-Z", "Y").to_euler()
            cena.render.filepath = os.path.join(PASTA, f"render-{nome}{sufixo}.webp")
            bpy.ops.render.render(write_still=True)
            print("RENDER", cena.render.filepath)

    fotografar()
    material = bpy.data.materials.get("evelym.cabelo")
    if material:
        import sys

        sys.path.insert(0, os.path.dirname(__file__))
        import cabelo

        no = next(n for n in material.node_tree.nodes if n.type == "TEX_IMAGE")
        original = no.image
        for nome, (cor, brilho) in VARIANTES.items():
            no.image = cabelo._textura_de_fios(f"evelym.fios.{nome}", cor, brilho)
            fotografar(f"-{nome}")
        no.image = original

if __name__ == "__main__":
    main()
