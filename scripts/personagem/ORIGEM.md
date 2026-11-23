# Origem e licença da personagem 3D

Registro exigido pela spec `cena-3d` ("Modelo da personagem reproduzível e de origem livre"). Cada parte da personagem
diz de onde veio, em que versão e com que licença. Conferido em 2026-11-22.

## Ferramentas (rodam só na máquina de quem gera o modelo, nada disso vai para o site)

| Ferramenta                                  | Versão                                                                                 | Licença                 | Como instalar                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| Blender                                     | 5.3.0 (hash `02f0899d78e3`), Flatpak `org.blender.Blender`, commit `3e510e35073011ea…` | GPL-2.0-or-later        | `flatpak install --user flathub org.blender.Blender`                                     |
| MPFB (extensão do MakeHuman para o Blender) | 2.0.18 (build 20261010)                                                                | código GPL-3.0-or-later | `flatpak run org.blender.Blender -b --online-mode -c extension install -s --enable mpfb` |

**Medição do rosto (só para gerar, não vai para o site):** MediaPipe 1.2.3 (Google, Apache-2.0), instalado num ambiente
Python isolado em `.cache/personagem/venv` (fora das dependências do site), com o modelo `face_landmarker.task` (Apache-2.0)
baixado em 2026-11-22 de
https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task
(SHA-256 `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`). Roda nesta máquina: nenhuma foto sai dela.
As fotos da dona ficam em `~/Documentos/fotos-personagem/`, fora do repositório.

O código do MPFB é GPL, mas só roda aqui para gerar o modelo e não é distribuído com o site. O que vai para o site são
os modelos gerados, cobertos pela licença dos modelos (abaixo).

## Modelos (vão para o site, dentro do `.glb`)

Licença: **CC0**. Pela página de licença do MakeHuman (https://static.makehumancommunity.org/about/license.html), todos os
modelos centrais são CC0: "you are free to do as you see fit with the asset or derivates of the assets. You do not need
to pay anything, include any copyright notices nor give attribution".

| Parte                                                                                                  | Origem                         | Item                                                           |
| ------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------------------- |
| Malha base do corpo e do rosto, alvos de forma (rosto, queixo, nariz, olhos) e esqueleto `game_engine` | dentro da extensão MPFB 2.0.18 | `data/3dobjs/base.obj`, `data/targets/`, `data/rigs/standard/` |
| Olhos                                                                                                  | pacote de sistema              | `eyes/high-poly`, material `eyes/materials/brown.mhmat`        |
| Sobrancelhas                                                                                           | pacote de sistema              | `eyebrows/eyebrow001`                                          |
| Cílios                                                                                                 | pacote de sistema              | `eyelashes/eyelashes02`                                        |
| Pele                                                                                                   | pacote de sistema              | `skins/young_asian_female`                                     |
| Roupa provisória (até o moletom da tarefa 2.4)                                                         | pacote de sistema              | `clothes/female_sportsuit01`                                   |

**Pacote de sistema:** `makehuman_system_assets_cc0.zip`, baixado em 2026-11-22 de
https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip (página:
https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html). 280.737.770 bytes, SHA-256
`b542127a8e25547c7c29c19f2d1d2adb9a664c80396ecd694095dbc8028a0107`. O instalador confere o hash antes de instalar.

**Pele do rosto:** o retrato estilizado da própria Evelym (arquivo `40.png`, enviado por ela em 2026-11-22 e guardado em
`~/Documentos/fotos-personagem/`, fora do repositório), projetado no rosto 3D por `scripts/personagem/projetar.py`. A imagem é
dela, e ela pediu o uso. Ela não entra no Git; o que vai para o site é a textura da pele gerada a partir dela.

O que é criado por script neste repositório é obra própria do portfólio: o cabelo (`scripts/personagem/cabelo.py`, mechas
em faixas e a textura de fios, desde 2026-11-22) e, quando existirem, a forma de estilo e o moletom com capuz.

## Como gerar do zero

1. Instalar o Blender e o MPFB (tabela acima).
2. Baixar o pacote de sistema para uma pasta da home (o Blender do Flatpak não enxerga o `/tmp`) e instalar:
   `npm run personagem:instalar -- ~/Downloads/makehuman-pacotes/makehuman_system_assets_cc0.zip`
3. `npm run personagem`: gera `.cache/personagem/evelym.blend` com o retrato projetado no rosto (precisa do ambiente com
   o MediaPipe do passo 5 e do retrato em `~/Documentos/fotos-personagem/40.png`, ou em `PERSONAGEM_FOTO`).
4. `npm run personagem:render`: gera os renders em `design/prototipos/personagem-3d/`.
5. Para ajustar o rosto às fotos de novo (opcional; o resultado já está em `scripts/personagem/rosto-ajustado.json`):
   - `python3 -m venv --without-pip .cache/personagem/venv` e
     `python3 -m pip --python .cache/personagem/venv/bin/python install mediapipe==1.2.3`;
   - baixar o modelo (endereço acima) para `.cache/personagem/modelos/face_landmarker.task`;
   - `.cache/personagem/venv/bin/python scripts/personagem/ajustar_rosto.py ~/Documentos/fotos-personagem`.
