"""Ajusta o rosto da personagem às proporções das fotos da Evelym, em ciclo: gera, renderiza de frente, mede e corrige.

Roda no Python do ambiente isolado (que tem o MediaPipe) e chama o Blender do Flatpak para gerar e renderizar:

    .cache/personagem/venv/bin/python scripts/personagem/ajustar_rosto.py ~/Documentos/fotos-personagem

As fotos ficam fora do repositório. O alvo mistura as medidas dos retratos estilizados (60%) e das fotos reais (40%):
os retratos são o estilo que a dona escolheu, as fotos guardam os traços dela. Os arquivos 40 a 45 são os retratos.
O resultado vai para scripts/personagem/rosto-ajustado.json, que o gerar.py lê.
"""

import glob
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import medir_rosto  # noqa: E402

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(RAIZ, ".cache", "personagem")
SAIDA = os.path.join(os.path.dirname(__file__), "rosto-ajustado.json")
BLENDER = ["flatpak", "run"]
RETRATOS = {f"{n}.png" for n in range(40, 46)}
COM_OCULOS = {"27.png", "29.png", "30.png"}  # óculos escuros escondem os olhos

# Eixo do gerar.py -> medida que ele controla. O alvo positivo de cada eixo aumenta a medida.
MEDIDA_DO_EIXO = {
    "rosto_largura": "largura_do_rosto",
    "rosto_altura": "altura_do_rosto",
    "mandibula": "largura_da_mandibula",
    "olho_tamanho": "largura_do_olho",
    "olho_abertura": "abertura_do_olho",
    "olho_inclinacao": "inclinacao_do_olho",
    "sobrancelha": "sobrancelha_ao_olho",
    "nariz_largura": "largura_do_nariz",
    "nariz_comprimento": "comprimento_do_nariz",
    "nariz_projecao": "projecao_do_nariz",
    "boca_largura": "largura_da_boca",
    "labio_cima": "labio_de_cima",
    "labio_baixo": "labio_de_baixo",
    "queixo": "altura_do_queixo",
}
VOLTAS = 7
# Teto de cada eixo: levado aos extremos (-1 ou 1), o MakeHuman deforma o rosto mesmo com as medidas batendo
# (rodada de 2026-11-22). Melhor ficar um pouco longe do alvo do que estranho.
TETO = 0.5
# Mover a sobrancelha pelo alvo do MakeHuman não deforma o rosto: esse eixo pode ir até o fim.
TETO_DO_EIXO = {"sobrancelha": 1.0}
# O canto de fora do olho sobe pela deformação própria do gerar.py (o alvo do MakeHuman sozinho não chega à inclinação
# dos retratos). O alongamento fica fixo: a largura do olho é controlada pelo eixo olho_tamanho.
SOBE_CANTO = 0.004
ESTICA = 0.08
TOLERANCIA = 0.02  # diferença relativa que já conta como igual


def alvo(pasta, detector):
    fotos = [f for f in sorted(glob.glob(os.path.join(pasta, "*.png"))) if os.path.basename(f) not in COM_OCULOS]
    resultados = medir_rosto.medir(fotos, detector)
    retratos = {k: v for k, v in resultados.items() if k in RETRATOS}
    reais = {k: v for k, v in resultados.items() if k not in RETRATOS}
    m_retratos, m_reais = medir_rosto.media(retratos), medir_rosto.media(reais)
    return {k: 0.6 * m_retratos[k] + 0.4 * m_reais[k] for k in m_retratos}


def escala(medida, valor_alvo):
    """Denominador do erro relativo: a inclinação, em graus, perto de zero, usa 3 graus como base."""
    return max(abs(valor_alvo), 3.0) if medida == "inclinacao_do_olho" else abs(valor_alvo)


def rodar(eixos, estica, n):
    tentativa = os.path.join(CACHE, "ajuste-tentativa.json")
    with open(tentativa, "w", encoding="utf8") as f:
        json.dump({"eixos": eixos, "estica": estica, "sobe_canto": SOBE_CANTO}, f)
    blend = os.path.join(CACHE, "evelym.blend")
    imagem = os.path.join(CACHE, f"medida-{n}.png")
    subprocess.run(
        [*BLENDER, f"--env=PERSONAGEM_AJUSTE={tentativa}", "org.blender.Blender", "-b", "--python",
         os.path.join(RAIZ, "scripts", "personagem", "gerar.py")],
        check=True, capture_output=True,
    )
    subprocess.run(
        [*BLENDER, f"--env=PERSONAGEM_MEDIDA={imagem}", "org.blender.Blender", "-b", blend, "--python",
         os.path.join(RAIZ, "scripts", "personagem", "render.py")],
        check=True, capture_output=True,
    )
    return imagem


def main():
    argumentos = [a for a in sys.argv[1:] if not a.startswith("--")]
    pasta = os.path.expanduser(argumentos[0] if argumentos else "~/Documentos/fotos-personagem")
    detector = medir_rosto._detector()
    meta = alvo(pasta, detector)

    eixos = {e: 0.0 for e in MEDIDA_DO_EIXO}
    if os.path.exists(SAIDA) and "--continuar" in sys.argv:
        # parte do último resultado, para não refazer o caminho
        with open(SAIDA, encoding="utf8") as f:
            eixos.update(json.load(f)["eixos"])
    eixos = {e: float(np.clip(v, -TETO_DO_EIXO.get(e, TETO), TETO_DO_EIXO.get(e, TETO))) for e, v in eixos.items()}
    estica = ESTICA
    # Sensibilidade inicial: quanto a medida muda com o eixo indo de 0 a 1 (corrigida a cada volta).
    sens = {e: (4.0 if m == "inclinacao_do_olho" else 0.12 * abs(meta[m])) for e, m in MEDIDA_DO_EIXO.items()}
    anterior = None
    melhor = None

    for n in range(VOLTAS):
        imagem = rodar(eixos, estica, n)
        r = medir_rosto.medir([imagem], detector)[os.path.basename(imagem)]
        if not r.get("aceita"):
            print(f"volta {n}: o MediaPipe não achou o rosto no render ({r.get('motivo')})")
            break
        m = r["medidas"]
        erros = {k: (meta[k] - m[k]) / escala(k, meta[k]) for k in meta}
        nota = float(np.mean([abs(v) for v in erros.values()]))
        print(f"volta {n}: erro médio {nota:.1%}")
        for k in meta:
            print(f"   {k:22} alvo {meta[k]:7.3f}  personagem {m[k]:7.3f}  ({erros[k]:+.1%})")
        if melhor is None or nota < melhor[0]:
            melhor = (nota, dict(eixos), estica, m)

        # Secante: atualiza a sensibilidade de cada eixo pelo que mudou desde a volta anterior.
        if anterior:
            for e, k in MEDIDA_DO_EIXO.items():
                dv = eixos[e] - anterior[0][e]
                dm = m[k] - anterior[1][k]
                if abs(dv) > 0.02 and dm / dv > 0:
                    sens[e] = float(np.clip(dm / dv, 0.02 * abs(meta[k]) + 0.05 * (k == "inclinacao_do_olho"), 3 * abs(meta[k]) + 10))
        anterior = (dict(eixos), m, estica)

        for e, k in MEDIDA_DO_EIXO.items():
            if abs(erros[k]) > TOLERANCIA:
                passo = float(np.clip((meta[k] - m[k]) / sens[e], -0.3, 0.3))
                teto = TETO_DO_EIXO.get(e, TETO)
                eixos[e] = float(np.clip(eixos[e] + passo, -teto, teto))

    nota, eixos, estica, m = melhor
    with open(SAIDA, "w", encoding="utf8") as f:
        json.dump(
            {
                "nota": "Gerado por scripts/personagem/ajustar_rosto.py: valores dos eixos do gerar.py que mais aproximam "
                "as medidas do rosto da personagem das fotos da dona.",
                "erro_medio": round(nota, 4),
                "eixos": {k: round(v, 3) for k, v in eixos.items()},
                "estica": round(estica, 3),
                "sobe_canto": SOBE_CANTO,
                "alvo": {k: round(v, 4) for k, v in meta.items()},
                "personagem": {k: round(v, 4) for k, v in m.items()},
            },
            f,
            indent=2,
            ensure_ascii=False,
        )
        f.write("\n")
    print(f"MELHOR erro médio {nota:.1%} -> {SAIDA}")
    detector.close()


if __name__ == "__main__":
    main()
