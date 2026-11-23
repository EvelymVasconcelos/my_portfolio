"""Mede as proporções de um rosto numa imagem, com o MediaPipe (478 pontos do rosto, roda nesta máquina).

Serve para os dois lados da comparação: as fotos da Evelym e os renders da personagem. As medidas usam a distância entre
os centros dos olhos como unidade, então o tamanho da imagem não importa. O rosto é endireitado em 3D a partir dos
próprios pontos antes de medir, porque selfie quase sempre tem a cabeça girada ou inclinada.

Uso (com o ambiente isolado de .cache/personagem/venv, fora das dependências do site):

    .cache/personagem/venv/bin/python scripts/personagem/medir_rosto.py ~/Documentos/fotos-personagem/*.png

O modelo do MediaPipe (face_landmarker.task, Apache 2.0) fica em .cache/personagem/modelos/. Origem em ORIGEM.md.
"""

import json
import math
import os
import sys

import numpy as np

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODELO = os.path.join(RAIZ, ".cache", "personagem", "modelos", "face_landmarker.task")

# Índices da malha de rosto do MediaPipe. "d" é o lado direito da pessoa (à esquerda na imagem).
P = {
    "testa": 10,
    "queixo": 152,
    "bochecha_d": 234,
    "bochecha_e": 454,
    "mandibula_d": 172,
    "mandibula_e": 397,
    "olho_d_fora": 33,
    "olho_d_dentro": 133,
    "olho_d_cima": 159,
    "olho_d_baixo": 145,
    "olho_e_dentro": 362,
    "olho_e_fora": 263,
    "olho_e_cima": 386,
    "olho_e_baixo": 374,
    "sobrancelha_d": 105,
    "sobrancelha_e": 334,
    "raiz_nariz": 168,
    "ponta_nariz": 4,
    "base_nariz": 2,
    "asa_d": 129,
    "asa_e": 358,
    "boca_d": 61,
    "boca_e": 291,
    "labio_cima_fora": 0,
    "labio_cima_dentro": 13,
    "labio_baixo_dentro": 14,
    "labio_baixo_fora": 17,
}

# O que cada medida quer dizer, para o relatório.
NOMES = {
    "largura_do_rosto": "largura nas maçãs do rosto",
    "altura_do_rosto": "altura da testa ao queixo",
    "largura_da_mandibula": "largura da mandíbula",
    "largura_do_olho": "largura de cada olho",
    "abertura_do_olho": "abertura de cada olho",
    "inclinacao_do_olho": "canto de fora acima do de dentro (graus)",
    "sobrancelha_ao_olho": "distância da sobrancelha ao olho",
    "largura_do_nariz": "largura do nariz nas asas",
    "comprimento_do_nariz": "comprimento do nariz",
    "projecao_do_nariz": "quanto a ponta do nariz sai do rosto",
    "largura_da_boca": "largura da boca",
    "labio_de_cima": "altura do lábio de cima",
    "labio_de_baixo": "altura do lábio de baixo",
    "altura_do_queixo": "altura do queixo (do lábio ao fim)",
}


def _detector():
    from mediapipe.tasks.python import BaseOptions, vision

    opcoes = vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=MODELO), num_faces=1)
    return vision.FaceLandmarker.create_from_options(opcoes)


def pontos_3d(caminho, detector):
    import mediapipe as mp

    imagem = mp.Image.create_from_file(caminho)
    resultado = detector.detect(imagem)
    if not resultado.face_landmarks:
        return None
    w, h = imagem.width, imagem.height
    return np.array([(p.x * w, p.y * h, p.z * w) for p in resultado.face_landmarks[0]])


def endireitar(pts):
    """Põe o rosto de frente: eixo x de um olho ao outro, y do queixo para a testa, z para fora do rosto."""
    olho_d = (pts[P["olho_d_fora"]] + pts[P["olho_d_dentro"]]) / 2
    olho_e = (pts[P["olho_e_fora"]] + pts[P["olho_e_dentro"]]) / 2
    ex = olho_e - olho_d
    ex /= np.linalg.norm(ex)
    sobe = pts[P["testa"]] - pts[P["queixo"]]
    ey = sobe - ex * np.dot(sobe, ex)
    ey /= np.linalg.norm(ey)
    ez = np.cross(ex, ey)
    base = np.stack([ex, ey, ez])
    origem = (olho_d + olho_e) / 2
    unidade = np.linalg.norm(olho_e - olho_d)
    return (pts - origem) @ base.T / unidade


def medidas(pts):
    q = endireitar(pts)

    def d(a, b):
        return float(np.linalg.norm(q[P[a]] - q[P[b]]))

    def inclinacao(dentro, fora):
        v = q[P[fora]] - q[P[dentro]]
        return math.degrees(math.atan2(v[1], abs(v[0])))

    bochechas = (q[P["bochecha_d"]] + q[P["bochecha_e"]]) / 2
    return {
        "largura_do_rosto": d("bochecha_d", "bochecha_e"),
        "altura_do_rosto": d("testa", "queixo"),
        "largura_da_mandibula": d("mandibula_d", "mandibula_e"),
        "largura_do_olho": (d("olho_d_fora", "olho_d_dentro") + d("olho_e_fora", "olho_e_dentro")) / 2,
        "abertura_do_olho": (d("olho_d_cima", "olho_d_baixo") + d("olho_e_cima", "olho_e_baixo")) / 2,
        "inclinacao_do_olho": (inclinacao("olho_d_dentro", "olho_d_fora") + inclinacao("olho_e_dentro", "olho_e_fora")) / 2,
        "sobrancelha_ao_olho": (d("sobrancelha_d", "olho_d_cima") + d("sobrancelha_e", "olho_e_cima")) / 2,
        "largura_do_nariz": d("asa_d", "asa_e"),
        "comprimento_do_nariz": d("raiz_nariz", "base_nariz"),
        "projecao_do_nariz": float(q[P["ponta_nariz"]][2] - bochechas[2]),
        "largura_da_boca": d("boca_d", "boca_e"),
        "labio_de_cima": d("labio_cima_fora", "labio_cima_dentro"),
        "labio_de_baixo": d("labio_baixo_dentro", "labio_baixo_fora"),
        "altura_do_queixo": d("labio_baixo_fora", "queixo"),
    }


def de_frente(pts):
    """Aceita só rosto quase de frente: com a cabeça muito girada, um olho aparece bem menor que o outro na imagem."""
    largura_d = np.linalg.norm(pts[P["olho_d_fora"], :2] - pts[P["olho_d_dentro"], :2])
    largura_e = np.linalg.norm(pts[P["olho_e_fora"], :2] - pts[P["olho_e_dentro"], :2])
    return max(largura_d, largura_e) / min(largura_d, largura_e) < 1.35


def medir(caminhos, detector=None):
    detector = detector or _detector()
    saida = {}
    for caminho in caminhos:
        pts = pontos_3d(caminho, detector)
        nome = os.path.basename(caminho)
        if pts is None:
            saida[nome] = {"aceita": False, "motivo": "rosto não encontrado"}
        elif not de_frente(pts):
            saida[nome] = {"aceita": False, "motivo": "cabeça muito girada (perfil)"}
        else:
            saida[nome] = {"aceita": True, "medidas": medidas(pts)}
    return saida


def media(resultados):
    aceitas = [r["medidas"] for r in resultados.values() if r.get("aceita")]
    return {k: float(np.median([m[k] for m in aceitas])) for k in NOMES} if aceitas else {}


if __name__ == "__main__":
    caminhos = sys.argv[1:]
    resultados = medir(caminhos)
    for nome, r in resultados.items():
        print(f"{nome}: " + ("ok" if r["aceita"] else f"fora ({r['motivo']})"), file=sys.stderr)
    print(json.dumps({"por_imagem": resultados, "mediana": media(resultados)}, indent=2, ensure_ascii=False))
