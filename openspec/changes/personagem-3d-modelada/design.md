## Context

A cena do Hero (`components/scene/hero-scene.ts`, Three.js 0.160 fixo) desenha tudo no código. A personagem ocupa cerca
de metade do arquivo: cabeça deformada a partir de uma esfera, olhos em camadas, cabelo em casca com a abertura do rosto
recortada, tronco por torno e braços em cilindros ligados por juntas. A cena já tem tudo que cerca a personagem:

- o carregador que decide se a cena roda (`HeroSceneLoader`), depois do `load`, com o navegador ocioso;
- a pausa fora da tela, a queda de qualidade e a troca pelo pôster;
- a troca de cores pelo tema (`setTheme`) e a história de 24 segundos (`update`);
- os pôsteres, gerados a partir da própria cena (`npm run scene:posters`).

Medidas de hoje (`docs/otimizacao-de-desempenho.md`): o código da cena tem 125 kB gzip e a cena roda a 60 quadros por
segundo na Iris Xe, também com a CPU 4x mais lenta. Na máquina estão o Blender 5.3 (Flatpak) e o Chromium do Playwright,
usado para capturar e medir. Motivação e escopo: ver `proposal.md`. Requisitos: ver `specs/cena-3d/spec.md`.

## Goals / Non-Goals

**Goals:**

- Gerar a personagem por script, sem passos manuais no Blender, para qualquer ajuste pedido pela dona virar uma mudança
  de parâmetro, revisável no Git.
- Trocar só a personagem: mesa, objetos, painéis, câmera, luzes, história e alternativas ficam como estão.
- Caber no orçamento: modelo até 1,5 MB transferidos e código da cena até 200 kB gzip.

**Non-Goals:**

- Animações gravadas (clipes de animação no arquivo). Os ossos são movidos pelo código, como hoje, porque a digitação
  segue a história do painel.
- Ferramenta de edição da personagem no site ou personalização por quem visita.

## Decisions

### D1. Base humana pelo MPFB, com modelos CC0

O MPFB (a extensão do MakeHuman para o Blender) gera um corpo humano com topologia limpa, esqueleto, olhos, sobrancelhas,
cílios e dentes, e controla a forma por parâmetros: idade, proporções, formato do rosto, olhos, nariz, queixo. Os modelos
do pacote de sistema são CC0. Os scripts chamam o MPFB pelo Python do Blender, sem interface.

- _Alternativa:_ modelar do zero por script (como hoje, só que no Blender). Descartada: esculpir um rosto convincente sem
  uma base humana é o mesmo limite que a dona quer deixar para trás.
- _Alternativa:_ modelo comprado num marketplace. Descartada pela dona em 2026-11-22.

### D2. Estilo de animação por cima da base

O MPFB produz um rosto realista. O estilo pedido (rosto fino, queixo pequeno, olhos grandes) entra em duas camadas, as
duas por script:

1. os parâmetros do MPFB, levados aos extremos que eles permitem;
2. uma forma extra (shape key) aplicada por regiões: aumentar os olhos e as órbitas, afinar a mandíbula e encurtar o
   queixo, com quedas suaves para não deixar emenda.

As fotos que a dona mandou (2026-11-20 e 2026-11-22) são a referência de traços; a personagem de animação que ela mandou
é referência só de estilo, sem copiar o desenho de ninguém.

### D3. Cabelo, roupa e headphone

- **Cabelo:** um cabelo do pacote do MPFB, se houver um até os ombros e repartido ao meio. Se não houver, ele é gerado por
  script como mechas em faixas (_hair cards_) com textura de fios e transparência recortada, que é a técnica de cabelo de
  jogo.
- **Moletom:** uma blusa do pacote do MPFB, se houver uma com capuz. Se não houver, ele sai do próprio corpo, inflado e com
  capuz e cordões modelados por script. A cor fica no código, para o tema seguir trocando.
- **Headphone:** continua feito no código, como hoje, preso ao osso da cabeça. Ele já está aprovado e não precisa de
  arquivo.

### D4. Esqueleto mínimo, ossos movidos pelo código

Do esqueleto do MPFB ficam só os ossos que a cena move: pescoço e cabeça, ombros, braços, antebraços, mãos, falanges dos
dedos e os das pálpebras (ou uma forma de olho fechado, o que o MPFB oferecer). O resto é fundido ao osso pai antes de
exportar, para o arquivo ficar leve. No navegador:

- os braços chegam ao teclado por cinemática inversa de dois ossos (ombro, cotovelo, punho), calculada no código, sem
  biblioteca;
- os dedos sobem e descem como hoje;
- a cabeça acompanha o ponteiro;
- a piscada liga a forma de olho fechado.

### D5. Materiais trocados no carregamento

O arquivo leva as texturas de cor, relevo e rugosidade. Ao carregar, o código troca os materiais por `MeshPhysicalMaterial`
com as mesmas texturas e os ajustes de hoje:

- pele com brilho de cetim (sheen);
- cabelo com anisotropia;
- olhos com verniz (clearcoat);
- moletom com a cor do tema.

Assim a luz, o tema e o rebaixamento de qualidade seguem num lugar só.

### D6. Compressão: meshopt e WebP, pelo glTF-Transform

| Opção                          | Decodificador no navegador                                      | Geometria    | Texturas                        |
| ------------------------------ | --------------------------------------------------------------- | ------------ | ------------------------------- |
| **meshopt + WebP (escolhida)** | `MeshoptDecoder` do Three.js, cerca de 6 kB gzip, em JavaScript | 3 a 5x menor | WebP, lido pelo navegador       |
| Draco                          | WASM de cerca de 100 kB, baixado à parte                        | menor ainda  | não comprime                    |
| KTX2 (Basis)                   | transcodificador WASM de cerca de 200 kB                        | não comprime | ficam comprimidas também na GPU |

A compressão roda no desenvolvimento, pelo `@gltf-transform/cli` via `npx`, com a versão fixada no script. Ela não entra
nas dependências do site. No navegador entram o `GLTFLoader` (cerca de 15 kB gzip) e o `MeshoptDecoder`. A cena deve ir
de 125 para cerca de 150 kB gzip, abaixo dos 200 kB.

Metas do arquivo:

- até 40 mil triângulos na personagem;
- texturas de no máximo 1024 px (a pele pode ir a 2048, se a diferença aparecer no pôster);
- até 1,5 MB no total.

### D7. Carregamento

- O carregador da cena continua decidindo se ela roda, sem mudança nas regras (movimento reduzido, economia de dados,
  aparelho fraco, sem WebGL).
- Quando decide rodar, ele baixa o módulo da cena e o modelo em paralelo (`fetch` do `.glb` com prioridade baixa).
- O pôster continua na tela até a cena desenhar o primeiro quadro.
- Se o modelo falhar, a cena não começa e o pôster fica, sem erro no console.

O `.glb` vai em `public/models/` com nome que muda a cada versão do modelo (`evelym-<hash>.glb`), para poder ficar em
cache por um ano.

### D8. Protótipo antes do código: renders do Blender

A regra do projeto pede protótipo antes de mudança visual. Aqui o protótipo são renders do próprio Blender (frente, três
quartos e perfil, com a luz parecida com a da cena), gerados pelo script e abertos numa página HTML local em
`design/prototipos/personagem-3d/`. A dona aprova os renders antes da integração no site. Cada rodada de ajuste é uma
mudança de parâmetro e um novo conjunto de renders.

### D9. Desempenho e alternativas

- **Carregamento:** import dinâmico, sem SSR, depois do `load` e com o navegador ocioso, como hoje. O LCP continua sendo
  texto ou o pôster.
- **Enquanto carrega:** o pôster, gerado do modelo novo.
- **Sem WebGL ou com movimento reduzido:** o pôster, e nem o modelo nem o código são baixados.
- **Celular fraco:** as mesmas regras de aparelho fraco e de queda de qualidade. A malha com esqueleto custa mais que a
  personagem de hoje, então a fluidez é medida de novo, na Iris Xe e com a CPU 4x mais lenta, antes de fechar a change.
- **Core Web Vitals:** LCP abaixo de 2,5 s, CLS abaixo de 0,1 e INP abaixo de 200 ms no perfil de celular. O modelo não
  entra no LCP.

As heurísticas de Nielsen não mudam com esta change: ela não cria tela nem controle novo.

## Risks / Trade-offs

- [O MPFB pode não funcionar no Blender 5.3] → Primeira tarefa do bloco 1. Se não funcionar, usar o Blender 4.5 LTS
  (pacote oficial numa pasta do usuário) só para gerar o modelo, com a versão registrada no arquivo de origem.
- [O rosto realista do MPFB pode resistir ao estilo de animação] → A forma extra da D2 tem limites por região e passa
  pelos renders da D8. Se não bastar, a dona decide entre um estilo mais realista e outro caminho (modelo comprado ou
  artista), antes da integração.
- [Cabelo em mechas com transparência custa caro e pode dar artefato de ordem de desenho] → Transparência recortada
  (alphaTest), sem mistura, e no máximo 2 camadas.
- [O modelo pesa no celular e no plano de dados de quem visita] → Ele só baixa quando a cena vai rodar, e nunca com
  economia de dados ligada. O orçamento de 1,5 MB está na spec.
- [O pôster deixa de bater com a cena] → Os pôsteres continuam saindo da própria cena (`npm run scene:posters`), depois de
  cada mudança no modelo.
- [A dona pode não gostar do resultado depois do trabalho todo] → O branch é separado. O `nova-versao` segue com a
  personagem de hoje até a dona aprovar a nova no navegador.

## Migration Plan

1. Tudo acontece no branch `personagem-3d-modelada`. O `nova-versao` continua publicável.
2. Com a dona aprovando os renders e depois a cena no navegador, o branch entra no `nova-versao`.
3. Para voltar atrás, basta reverter a junção: a personagem feita no código volta inteira, com os pôsteres antigos.

## Open Questions

- Resolução da textura da pele (1024 ou 2048): decidida pela comparação dos pôsteres no bloco de integração, sem mudar a
  abordagem.
