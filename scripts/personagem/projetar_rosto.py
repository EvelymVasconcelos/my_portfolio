"""Gera a personagem com o retrato da Evelym projetado no rosto (passo completo do `npm run personagem`).

Roda no Python do ambiente isolado (.cache/personagem/venv, com o MediaPipe) e chama o Blender do Flatpak:

1. gerar.py: a personagem, com o rosto ajustado às medidas (rosto-ajustado.json);
2. render.py no modo de medição: o rosto de frente, com os dados da câmera;
3. MediaPipe: os pontos do rosto no render e no retrato;
4. projetar.py: o retrato na pele do rosto.

O retrato fica fora do repositório. Padrão: ~/Documentos/fotos-personagem/40.png (o retrato de frente que a dona
escolheu em 2026-11-22). Outro: PERSONAGEM_FOTO=/caminho/da/foto.png.
"""

import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
import medir_rosto  # noqa: E402

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(RAIZ, ".cache", "personagem")
SCRIPTS = os.path.join(RAIZ, "scripts", "personagem")
FOTO = os.path.expanduser(os.environ.get("PERSONAGEM_FOTO", "~/Documentos/fotos-personagem/40.png"))


def blender(*args, env=None):
    comando = ["flatpak", "run"] + ([f"--env={env}"] if env else []) + ["org.blender.Blender", "-b", *args]
    resultado = subprocess.run(comando, capture_output=True, text=True)
    for linha in resultado.stdout.splitlines():
        if linha.startswith(("PERSONAGEM", "CABELO", "BOCA", "PROJECAO", "MASCARA", "TOM", "Traceback", "Error")):
            print(linha)
    if resultado.returncode != 0 or "Traceback" in resultado.stdout + resultado.stderr:
        print(resultado.stdout[-3000:], resultado.stderr[-3000:])
        raise SystemExit("o Blender falhou")


def pontos(caminho, detector):
    pts = medir_rosto.pontos_3d(caminho, detector)
    if pts is None:
        raise SystemExit(f"o MediaPipe não achou o rosto em {caminho}")
    return pts[:, :2].tolist()


def main():
    if not os.path.exists(FOTO):
        raise SystemExit(f"retrato não encontrado: {FOTO}")
    pasta = os.path.join(CACHE, "projecao")
    os.makedirs(pasta, exist_ok=True)
    blend = os.path.join(CACHE, "evelym.blend")
    render = os.path.join(pasta, "frente.png")

    blender("--python", os.path.join(SCRIPTS, "gerar.py"))
    blender(blend, "--python", os.path.join(SCRIPTS, "render.py"), env=f"PERSONAGEM_MEDIDA={render}")

    detector = medir_rosto._detector()
    with open(render + ".camera.json", encoding="utf8") as f:
        camera = json.load(f)
    dados = {"render": pontos(render, detector), "foto": pontos(FOTO, detector), "camera": camera, "caminho_foto": FOTO}
    detector.close()
    with open(os.path.join(pasta, "pontos.json"), "w", encoding="utf8") as f:
        json.dump(dados, f)

    blender(blend, "--python", os.path.join(SCRIPTS, "projetar.py"))


if __name__ == "__main__":
    main()
