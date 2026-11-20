# Desempenho do portfólio

Registro do que foi medido no próprio site durante as changes `fundacao-ferramentas-e-stack` e
`estrutura-movimento-e-cena-3d` (novembro de 2026). Nenhum número aqui é estimativa: cada um diz como foi medido. O
Lighthouse (LCP, CLS e TBT no perfil de celular) entra no bloco 7 da change `estrutura-movimento-e-cena-3d`.

## Como medi

- **JavaScript inicial:** um script lê o HTML gerado de `/pt` (`.next/server/app/pt.html`), pega todos os
  `<script src>` e soma o tamanho de cada arquivo comprimido com gzip. É o JavaScript que o navegador baixa antes de
  qualquer interação.
- **Fontes:** soma dos `.woff2` baixados ao abrir `/pt` num Chromium do Playwright, com a rede registrada.
- **Cena 3D:** soma, com gzip, dos arquivos que contêm o Three.js e o módulo da cena; confirmado que nenhum deles está
  no HTML inicial.
- **Quadros por segundo da cena:** Chromium do Playwright com a GPU da máquina (`--use-angle=gl`; o WebGL informa
  "Mesa Intel Iris Xe Graphics (RPL-U)"), janela de 1440 × 900 com densidade 2, contando `requestAnimationFrame` por
  5 s com a cena rodando. A CPU 4x mais lenta usa `Emulation.setCPUThrottlingRate` do DevTools.

## JavaScript inicial de `/pt` (gzip)

| Momento | kB | O que mudou |
|---|---|---|
| Bloco 3 (estrutura nova, ainda com framer-motion) | 289 | Seções de servidor; só as mensagens das ilhas de cliente vão ao navegador |
| Bloco 4 (movimento) | 252 | framer-motion saiu; movimento em CSS e ilhas de cerca de 1 kB cada |
| Bloco 5 (cena 3D) | 256 | Entrou só o carregador da cena; a cena em si é baixada depois |
| Fundação, bloco 6 (formulário seguro) | 231 | Zod clássico trocado por `zod/mini` e React Hook Form removido |

Meta da design: abaixo de 206 kB. Ainda não atingida: faltam 25 kB. Cerca de 155 kB são React 19 e Next 16, que o site
não controla; o resto são o next-intl, as ilhas de cliente e o carregador da cena.

## Fontes

Bricolage Grotesque e Instrument Sans pré-carregadas (104,3 kB) e JetBrains Mono logo depois: 134,9 kB ao abrir `/pt`,
em 3 arquivos. Orçamento: 140 kB.

## Cena 3D do Hero

| Medida | Valor | Meta |
|---|---|---|
| Código da cena (Three.js 0.160 com import seletivo e o módulo) | 125,1 kB gzip, fora do carregamento inicial | até 200 kB |
| Quadros por segundo, Iris Xe, densidade 2 | 60,2 | 60 |
| Quadros por segundo com a CPU 4x mais lenta | 60,2 | acima de 30 |
| Imagens estáticas (pôsteres, WebP com transparência) | 37 kB (claro) e 38 kB (escuro) | — |

Como a cena se protege:

- só carrega depois do `load`, com o navegador ocioso e o Hero perto da tela, e não carrega com movimento reduzido,
  economia de dados, aparelho fraco (4 GB ou menos e até 4 núcleos) ou sem WebGL;
- pausa fora da tela e com a aba oculta;
- se a média ficar abaixo de 30 quadros por segundo por 3 s, cai para densidade 1; se continuar lenta, devolve a imagem;
- o primeiro quadro é o mesmo da imagem estática, então a troca não tem salto (CLS zero);
- os pôsteres são gerados pela própria cena (`npm run scene:posters`).

O Three.js fica fixo na 0.160.0, a versão do protótipo aprovado. Com a 0.187 (a da referência), a mesma cena saía mais
clara: pele (235, 202, 175) contra (219, 171, 141) do protótipo e notebook cinza em vez de preto, medidos no mesmo pixel
das duas capturas. Com a 0.160, os pixels batem e o código da cena fica 15 kB menor (140,4 → 125,1 kB gzip).
