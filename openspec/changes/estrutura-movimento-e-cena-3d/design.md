## Context

- **Ponto de partida:** a página atual tem Hero, Sobre, Projetos, Experiência e Contato, com framer-motion,
  `components/animations/` (incluindo o canvas de partículas) e a identidade provisória "Samsung Lilac". A Pesquisa não
  tem seção, e as publicações aparecem dentro de Projetos (ver o "Ponto de partida" do `CLAUDE.md`).
- **Fundação:** esta change roda sobre a stack que `fundacao-ferramentas-e-stack` entrega, ou seja, Next 16, React 19,
  next-intl 4, Tailwind 4 com tokens em `@theme`, tema por script próprio no `<head>`, Vitest, Playwright com axe e
  Lighthouse na CI.
- **Referência:** o portfólio do Francisco (`~/Documentos/Gabriel Projetos/my-portfolio`, só leitura) já resolveu, e
  testou, o mesmo problema:
  - as seções de servidor;
  - `components/motion/` (`SplitText`, `NameWave`, `CardGlow`, `MotionReady`, `CarouselControls`);
  - `components/scene/` (`HeroSceneLoader` e `hero-scene.ts`);
  - `lib/scene/can-run-scene.ts` e `lib/content/*`;
  - a folha de logos `public/icons/tech.svg`;
  - as imagens estáticas da cena geradas a partir da própria cena.
  Onde esta design diz "como no Francisco", a solução de lá é copiada e adaptada.
- **Já explorado:** o protótipo de identidade em `design/prototipos/identidade-visual/` tem 3 direções com contraste AA
  conferido, o peso das fontes medido (77, 181 e 68 KB) e cenas 3D simples. A dona pediu cenas mais criativas, que
  mostrem senioridade em arquitetura e deploy.
- **Rodada 1 de protótipos (2026-11-18), em `design/prototipos/estrutura-e-cenas/`:** a dona aprovou as animações, as
  três cenas 3D, a sequência da arquitetura e a pilha da Pesquisa, e reprovou o layout em 2026-11-19. O protótipo tinha
  container de 1200 px, tipografia de cada direção e componentes próprios. Ela pediu o layout idêntico ao da referência,
  mudando só as cores (decisões 1, 2, 7, 11 e 12 desta revisão).
- **Medidas da referência** (site rodando, em 1440 px, 2026-11-19): container de 1312 px; 160 px de espaço em cima e
  embaixo de cada seção; nome do Hero em 144 px e títulos de seção em cerca de 74 px; competências numa grade de 3
  colunas com 6 cartões.
- **Skills da Mangue:** o roteiro vem de `montar-site-mangue` (fases 4 a 7) e das skills de apoio
  (`build-awwwards-quality-sites`, `cinematic-scroll-storytelling`, `scroll-scrubbed-visual-sequence`,
  `build-threejs-scroll-worlds`, `copywriting`, `stop-slop`, `accessibility`, `core-web-vitals`). Quando elas conflitam
  com as regras do projeto, vale a regra do projeto, como diz o `CLAUDE.md`. Os conflitos são:
  - Lenis e GSAP como padrão;
  - ícones Solar;
  - preloader;
  - imagem gerada como ilustração.

## Goals / Non-Goals

**Goals:**
- O layout idêntico ao do portfólio de referência, só com a paleta e o conteúdo dela, com a Pesquisa a mais, cumprindo
  a spec `estrutura-e-conteudo`.
- Uma rodada de protótipos que decida juntos a identidade, o movimento e a cena antes do código.
- Uma cena 3D de backend que roda leve, com a mesma composição da imagem estática.
- Movimento de nível alto, sem biblioteca de rolagem e com o menor JavaScript possível.
- Fechar a lista de exceções do axe que a fundação abriu.

**Non-Goals:**
- Um mundo 3D único que conduz a página inteira, com capítulos e câmera por atos. A cena fica no Hero, e a história da
  arquitetura é contada pela sequência presa em HTML e SVG, que é mais leve e acessível (decisão 4).
- Editor de conteúdo ou CMS. Os textos ficam em `messages/` e os dados, em `lib/content/`.

## Decisions

### 1. Layout, estrutura e modelo de conteúdo iguais aos da referência
O layout é copiado da referência, seção por seção: as mesmas classes utilitárias (`container-site`, `band`, `band-alt`,
`band-invert`, `type-giant`, `type-display`, `type-title`, `type-lead`, `type-eyebrow`), os mesmos componentes e as
mesmas medidas. Muda só a paleta (decisão 7) e o conteúdo.

| Parte | Como fica (igual à referência) |
|---|---|
| Container | `min(96rem, 100% - 8rem)` a partir de 900 px; `100% - 2.5rem` abaixo |
| Seções | `py-24 lg:py-40` (96 e 160 px); faixas normal, alternada e invertida com a trama de pontos (`--band-dot`) |
| Cabeçalho de seção | rótulo "NN — Nome" em `type-eyebrow` na cor de destaque, frase-título em `type-display` e texto de apoio à direita |
| Barra do topo | marca, links (Sobre, Projetos, Trajetória, Pesquisa, Contato), PT/EN/ES com sublinhado no ativo, tema, "Agendar call" e "Baixar CV" |
| Hero | status com ponto, nome em `type-giant`, texto, botões, cena solta no fundo com formas espalhadas, faixa "Onde já construí" |
| Sobre | frase-título, foto (com a inclinação da decisão 11), texto, 4 fatos em colunas; competências em 6 cartões numerados com logos e a linha "Também:" |
| Projetos | destaque (texto, "O que eu fiz", stack, imagem) e lista de linhas com número, nome, empresa, stack e seta |
| Trajetória | barras por ano com os períodos reais, linhas com período, cargo, empresa e descrição, e a formação em 3 colunas |
| Pesquisa (nova) | mesmo cabeçalho; a pilha de cartões da rodada 1, com o visual dos cartões da referência |
| Recomendações | destaque grande com aspas na cor de destaque, carrossel de cartões com iniciais, "Ler completa" e contador "01 / 08" |
| Contato | faixa invertida, título gigante, linhas rótulo/valor, "Baixar CV", cartão "Agendar call" e "Prefere escrever por aqui?" (decisão 12) |
| Rodapé | o da referência, na faixa invertida |

- **Numeração das seções:** como na referência, o Hero conta como 01; Sobre é 02, Projetos 03, Trajetória 04, Pesquisa
  05, Recomendações 06 e Contato 07.
- **Fatos do Sobre:** os quatro da referência viram os dela, todos do currículo: local (Manaus), formação (Sistemas de
  Informação, UFAM), hoje (backend na Sidia) e pesquisa (2 artigos internacionais).
- **Competências:** seis grupos a partir do currículo (por exemplo, linguagens e frameworks, APIs e arquitetura, dados,
  infraestrutura e cloud, qualidade e testes, e pesquisa e métodos), cada um com a contagem e os logos.
- **Trajetória:** as barras vão de 2014 (UFAM) a hoje, com Bemol Digital (2019 a 2022) e Sidia (2022 a hoje).
- **Seções de servidor:**
  - `Hero`, `About` (com `Skills` e a sequência da arquitetura), `Projects`, `Experience`, `Research` (nova),
    `Recommendations` e `Contact`;
  - `Navbar` com a marca animada e `Footer`.
  - Só os efeitos são componentes de cliente, pequenos e isolados em `components/motion/` e `components/scene/`.
- **Dados em `lib/content/`:**
  - `career.ts`, `projects.ts`, `research.ts`, `recommendations.ts` e `skills.ts`, com ids, datas, links e tecnologias;
  - os textos ficam em `messages/<idioma>.json`, por seção.
  - É o mesmo desenho do Francisco: o texto traduz, e o dado é um só.
- **Pesquisa:** usa o cabeçalho de seção e o visual de cartão da referência, na pilha presa da rodada 1. Cada publicação
  vira um cartão com evento, ano, local, título original, papel e DOI.
- **Recomendações:**
  - `Recommendations.tsx` e `CarouselControls.tsx` do Francisco, adaptados;
  - a lista vazia tira a seção e o link da barra (spec `recomendacoes`);
  - o texto fica no idioma original, como no LinkedIn.
- **Marca animada:** a do Francisco é a assinatura dele desenhada a traço. Aqui são duas opções, decididas no protótipo:
  - (a) a assinatura da própria Evelym, se ela enviar uma foto, vetorizada à mão em `lib/brand/signature-data.ts`;
  - (b) o nome escrito com uma fonte manuscrita de licença OFL, convertida em caminho.
  - Nos dois casos, com movimento reduzido ela aparece já desenhada.
- **Logos de tecnologia:** a folha SVG única e o script `scripts/tech-icons/build.mjs` vêm do Francisco. Os logos vêm do
  Simple Icons, com licença CC0. São só tecnologias que estão no currículo.
- *Alternativa descartada (rodada 1):* estrutura igual com layout próprio. A dona reprovou em 2026-11-19.
- *Alternativa descartada:* manter as seções atuais e só trocar o visual. Não resolve a falta da Pesquisa nem a do
  modelo de dados, e mistura client e server como hoje.

### 2. Rodadas de protótipos antes do código
É o roteiro da fase 4 da `montar-site-mangue`, sem a geração de imagem: as regras do projeto proíbem imagem gerada como
prova, e protótipo navegável decide melhor.

- **Rodada 1 (2026-11-18):** `design/prototipos/estrutura-e-cenas/`, com a estrutura certa e o layout próprio. Fica como
  histórico e como fonte das animações e das cenas aprovadas.
- **Rodada 2 (a fazer):** `design/prototipos/layout-referencia/`, uma página só com o layout da referência copiado em
  HTML e CSS estático (decisão 1), o texto real dela e as animações, a sequência, a pilha e as três cenas da rodada 1
  portadas sem mudança de comportamento.
- **Barra de controles da rodada 2:** cena (A, B, C), variação de roxo (2 ou 3 opções sobre os mesmos tokens), marca,
  tema, "sem WebGL" e "movimento reduzido". Não há escolha de tipografia nem de layout.
- **Prova de fidelidade:** capturas de cada seção em 1440 e 390 px, lado a lado com a referência rodando, fora do
  repositório (as capturas da referência têm o nome e a foto do dono dela).
- **A escolha:** a dona escolhe cena, variação de roxo e marca. A escolha fica registrada no fim desta seção, com a data,
  e só então começa o código da identidade.
- **Avaliação de cada protótipo:** as 10 heurísticas de Nielsen, o contraste AA (pelo script de tokens) e o desempenho
  da cena (quadros por segundo no computador e com CPU 4x mais lenta).
- **Escolha registrada (2026-11-19):** cena **D, a Evelym programando** (decisão 3), roxo **1 violeta** (`#7c3aed`)
  como cor principal com a orquídea (`#b5179e`) de apoio nos retoques, e a **assinatura manuscrita** como marca. O
  protótipo de referência é `design/prototipos/layout-referencia/` (rodada 2).
- **Já decidido antes da rodada:** o tema inicial é o **escuro** (2026-11-18); o layout, as fontes e o Contato são os
  da referência, e o cartão 3D vira a foto do Sobre (2026-11-19).
- **Retoques femininos (pedido da dona, 2026-11-19), já no protótipo da rodada 2:**
  - a **assinatura manuscrita** vira a marca padrão: o nome em Mrs Saint Delafield (OFL) convertido em caminhos SVG, uma
    letra por caminho, escrito a traço e preenchido como a assinatura da referência. Não baixa fonte nenhuma, então o
    orçamento de 140 KB continua de pé;
  - a **4ª variação de cor, orquídea** (`#b5179e`, roxo puxado para o rosa), com o botão em 5,9:1 e o destaque de texto
    em 10,4:1 no escuro e 6,7:1 no claro;
  - **detalhes delicados:** cantos um pouco mais arredondados (os raios da referência sobem cerca de 4 a 6 px), estrelinhas
    de quatro pontas piscando devagar perto do nome e um sublinhado em curva sob os títulos de seção, desenhado quando o
    título entra. Com movimento reduzido, tudo fica parado.

### 3. Cena 3D do Hero: a Evelym programando (escolhida em 2026-11-19)
A dona achou que uma arquitetura logo no Hero confunde quem não é da área e pediu uma personagem dela programando. A
cena D do protótipo é a escolhida:
- **Personagem:** geometria procedural com materiais físicos (pele e tecido com sheen, cabelo com brilho e textura de
  fios em bump map, notebook de alumínio, caneca de cerâmica, mesa de madeira), traços tirados das fotos dela. Estilizada,
  sem modelo externo.
- **História:** em ciclo de 24 s, sozinha: digita o código (cerca de 11 s), os testes rodam e passam, o selo acende "Em
  produção". Os painéis são texturas de canvas redesenhadas só quando o texto muda; a tela do notebook mostra o mesmo
  código e ilumina o rosto.
- **Sombras:** uma luz direcional com mapa de sombra de 1024 px (PCF suave). Medido no protótipo: 61 quadros por segundo
  com densidade de pixels 2 na Iris Xe, e 60 com a CPU 4x mais lenta. A regra "sem mapa de sombra em tempo real" abaixo
  vale para os conceitos A a C, que ficam só como histórico.

Os três conceitos da rodada 1, abaixo, ficam registrados como alternativas descartadas.
Todos seguem as mesmas regras:
- geometria procedural, sem GLTF, sem logotipo e sem texto no canvas;
- os rótulos ficam em HTML;
- a mesma linguagem de material: superfícies foscas, luz de recorte roxa e um único `RoomEnvironment` para reflexo
  suave, como no Francisco.

Cada um conta a história em três tempos: em repouso no Hero, avançando enquanto a pessoa sai do Hero e no estado final.

- **A. Abaixo da superfície:**
  - Uma placa fina e translúcida é a interface que o usuário vê. Embaixo dela, camadas em profundidade: gateway e
    autenticação, serviços, filas e, no fundo, os dados (cilindros de banco e blocos de cache).
  - Requisições descem como fios de luz e voltam com a resposta.
  - Ao rolar, a câmera desce abaixo da superfície e uma versão nova da camada de serviços entra ao lado da antiga, num
    deploy azul-verde.
  - Mensagem: o backend é tudo o que sustenta o que se vê.
- **B. Cluster que se cura:**
  - Uma plataforma flutuante com nós, onde cápsulas são pods recebendo tráfego de uma entrada.
  - Ao rolar acontecem três coisas:
    - um deploy gradual troca os pods, um por vez, com o anel de verificação de prontidão;
    - um nó falha e os pods são reagendados nos outros;
    - um pico de carga faz a autoescala criar pods.
  - Mensagem: Kubernetes, deploy sem queda e resiliência.
- **C. Porto de deploy:**
  - Blocos de código são montados num container por um guindaste.
  - Um portal de varredura faz os testes, e o container que falha volta.
  - Os aprovados embarcam numa balsa sobre água escura (uma referência a Manaus), que atraca no píer do cluster, onde
    os containers acendem como serviços rodando.
  - Mensagem: a esteira de CI/CD do commit à produção, ligada à pesquisa E2E-CIFlow.
- **Orçamento comum:**
  - até 150 chamadas de desenho e 80 mil triângulos;
  - `InstancedMesh` para o que se repete (pods, requisições, containers);
  - densidade de pixels limitada a 2, ou 1,5 em toque;
  - sombras só de contato, com textura assada, sem mapa de sombra em tempo real.
- *Alternativas descartadas:*
  - "constelação de microsserviços" e "terminal em profundidade": a primeira é genérica, e a segunda é texto no canvas,
    o que fere a acessibilidade;
  - mundo 3D com capítulos: ver os Non-Goals.

### 4. Sequência presa da arquitetura em HTML e SVG, não em WebGL
É o efeito central da `scroll-scrubbed-visual-sequence`, com o renderizador SVG/DOM que a própria skill recomenda para
diagramas.

- **Onde fica:** no fim da seção Sobre, depois das competências. Mantém as seções do Francisco (spec
  `movimento-e-rolagem`).
- **Como funciona:**
  - uma área `position: sticky` com o diagrama em SVG;
  - a altura de rolagem é definida pelo número de etapas;
  - a posição da rolagem vira um valor de 0 a 1, escrito numa variável CSS;
  - cada etapa (requisição, serviços, dados, testes e deploy) acende partes do diagrama por `opacity`, `transform` e
    `stroke-dashoffset`.
- **O texto de cada etapa** fica em HTML, numa coluna própria, ligado a competências do currículo. Por exemplo: "APIs
  REST com FastAPI e Django", "PostgreSQL e Redis", "TDD e Pytest", "Docker, Kubernetes e GitHub Actions".
- **Cuidado com o invólucro da referência:** o `div.overflow-x-hidden` que envolve a página na referência cria uma área
  de rolagem própria e quebra o `position: sticky` (sequência e pilha). Aqui ele usa `overflow-x: clip`, que corta o que
  vaza para o lado sem criar essa área (achado no protótipo da rodada 2, em 2026-11-19). O teste de navegador confere a
  posição da área presa no meio da rolagem, e não só o progresso.
- **Movimento reduzido:** não há área presa, e as etapas viram uma lista com o diagrama completo.
- **Celular:** o diagrama fica em cima e o texto embaixo, e a altura não passa de duas telas por etapa. Usa unidades `svh`
  para o Safari do iOS não pular quando a barra de endereço some.
- *Alternativa descartada:* fazer a sequência em WebGL, presa à cena. Dobraria o custo, prenderia o texto ao canvas e
  repetiria a cena do Hero.

### 5. Motor de movimento: CSS mais um condutor próprio, sem GSAP e sem Lenis
- **Títulos e blocos:**
  - `SplitText` como no Francisco: as palavras são separadas no servidor, o nome acessível fica inteiro e o estado final
    está no HTML;
  - a entrada é feita por um único `IntersectionObserver` (`MotionReady`), que liga as classes só quando há JavaScript e
    o movimento não está reduzido.
- **Sequência presa, pilha de cartões e parallax:**
  - um condutor de rolagem próprio, de cerca de 2 KB, baseado em `references/scroll-conductor.js` da
    `build-threejs-scroll-worlds`;
  - ele lê a posição nativa da rolagem uma vez por quadro, só enquanto alguma cena presa está na tela, e escreve o
    progresso em variáveis CSS;
  - a fixação na tela é feita por `position: sticky`, não por JavaScript. Isso evita os dois bugs que a Mangue registrou
    com o ScrollTrigger: a cena presa que muda a altura da página e a rolagem que volta para o meio.
- **Transição de tema:** a View Transitions API, como no Francisco, com zero KB.
- **Custo:**
  - o framer-motion sai (cerca de 40 KB gzip na rota de hoje);
  - entram cerca de 4 KB de código próprio de movimento.
  - A meta é o JavaScript inicial da rota ficar abaixo dos 206 kB de hoje.
- **GSAP só volta à mesa se** o protótipo mostrar que o condutor próprio não sustenta a sequência a 60 quadros por
  segundo, ou fica com mais de 150 linhas. O custo seria cerca de 45 KB gzip (núcleo mais ScrollTrigger), e ele seria a
  única biblioteca de animação.
- *Alternativas descartadas:*
  - Lenis, porque a regra é rolagem nativa;
  - animações CSS ligadas à rolagem (`animation-timeline`) como único mecanismo, porque o suporte delas não é o mesmo
    em todos os navegadores (conferir Firefox e Safari no momento da implementação). Elas podem entrar como melhoria
    onde houver suporte, se o condutor ficar como alternativa.

### 6. Carregamento da cena como no Francisco
- **`can-run-scene.ts` decide se a cena roda.** Ela não roda quando:
  - o movimento está reduzido;
  - o navegador indica economia de dados;
  - `deviceMemory` é 4 ou menos e `hardwareConcurrency` é 4 ou menos;
  - não há WebGL.
- **`HeroSceneLoader`** (cliente):
  - espera o `load` e o navegador ocioso, e faz `import()` do módulo da cena;
  - monta o canvas sobre a imagem estática e troca a opacidade quando o primeiro quadro está pronto.
- **O módulo da cena:**
  - importa só as classes usadas do `three`;
  - expõe `setTheme`, `setProgress` e `dispose`;
  - pausa com `IntersectionObserver` e `visibilitychange`;
  - trata a perda de contexto WebGL voltando à imagem;
  - mede os quadros por segundo e rebaixa a qualidade, como diz a spec `cena-3d`.
- **Imagens estáticas:**
  - geradas pela própria cena num modo de captura (primeiro quadro, sem margem);
  - salvas em `public/images/scene/<conceito>-{claro,escuro}.webp` e servidas por `next/image` com `priority`;
  - o `alt` vem de `messages/`.
- **Custo:**
  - `three` em import seletivo fica em cerca de 120 a 150 KB gzip, e o módulo da cena, em menos de 30 KB;
  - só é baixado quando a cena vai rodar, então não entra no carregamento inicial.

### 7. Identidade em tokens `@theme`
- Os tokens têm os mesmos nomes e papéis dos da referência (`bg`, `surface`, `surface-2`, `line`, `line-strong`, `text`,
  `text-2`, `text-3`, `accent`, `accent-text`, `on-accent`, `ok`, `danger`, `focus`, `band-dot`), com os valores da
  paleta escolhida (roxo, preto e branco) nos dois temas e a cópia invertida para a `band-invert`, em `app/globals.css`.
  Copiar os nomes deixa o CSS dos componentes igual ao da referência.
- O script de contraste do protótipo vira o teste do Vitest: `tests/contrast.test.ts`, com os pares declarados num
  arquivo só.
- As fontes são as da referência, por `next/font` como lá: Bricolage Grotesque (eixo `opsz`), Instrument Sans e
  JetBrains Mono (400 e 700, sem pré-carregamento), só o subconjunto latino, com `display: swap`. Na referência, as duas
  pré-carregadas somam cerca de 107 KB; o orçamento é de 140 KB no carregamento inicial (spec `identidade-visual`).
- O tema inicial é o **escuro** (decisão da dona em 2026-11-18), para toda primeira visita, mesmo com o sistema em claro;
  não usa `prefers-color-scheme`. A troca usa o script de tema da fundação (tarefa 4.7 de lá).
- **Lições do portfólio do Francisco para esse script** (`lib/theme-script.ts` e `components/layout/ThemeScript.tsx`
  de lá):
  - o script vai no `<head>`, renderizado pelo servidor, e roda antes da primeira pintura; `next/script` com
    `beforeInteractive` roda tarde demais no App Router e faz a página piscar;
  - na troca de idioma, o Next redesenha o layout sem recarregar: o React recriava o `<script>` (aviso "Encountered a
    script tag" no React 19) e apagava a classe do tema do `<html>`. A solução de lá: o script só é executável no HTML do
    servidor (`type="text/plain"` no navegador) e um `useLayoutEffect` reaplica o tema salvo antes da pintura;
  - um teste de navegador troca de idioma com o tema salvo e confere a classe e o console.

### 8. Textos com o roteiro da Mangue
- **Escrita:** os textos novos (Hero, frases da sequência, títulos de seção, descrições de projeto) passam pelas skills
  `copywriting` e `stop-slop`.
- **Regras da Mangue para a copy:** sem travessão, sem "não é X, é Y", sem lista de negação e sem número sem fonte.
- **Fonte de cada afirmação:** o currículo ou a confirmação da dona. O que não tiver fonte fica marcado com `validar` no
  protótipo e não vai para `messages/`.
- **Tradução:** `en.json` e `es.json` são gerados pelo script atual e revisados. Trocar por tradução à mão é decisão da
  dona no bloco de conteúdo.

### 9. Testes que provam as alternativas
- **Vitest:**
  - paridade de chaves entre `pt`, `en` e `es`;
  - contraste dos tokens;
  - hidratação sem divergência nas duas cores;
  - `can-run-scene` com cada condição;
  - o condutor de rolagem, com progresso determinístico nos dois sentidos.
- **Playwright:**
  - a ordem e as âncoras das seções;
  - página com JavaScript desligado;
  - `reducedMotion: 'reduce'` (sem cena, sem área presa e com o conteúdo final);
  - WebGL desligado (`getContext` devolvendo `null`);
  - teclado na barra, na sequência e no carrossel;
  - pausa da cena fora da tela;
  - capturas novas em 1440 e 390 px, nos temas claro e escuro.
- **Axe:** a lista de exceções da fundação precisa chegar vazia no fim desta change.
- **Lighthouse:** as asserções de LCP, CLS e TBT passam de aviso a erro.

### 10. Orçamento de desempenho
Medido no Lighthouse, no perfil de celular, mediana de 3 execuções:

| Medida | Meta |
|---|---|
| LCP | abaixo de 2,5 s |
| CLS | abaixo de 0,1 |
| TBT | abaixo de 200 ms (substituto de laboratório do INP) |
| JavaScript inicial da rota | abaixo de 206 kB (o valor de hoje) |
| Fontes | até 140 KB |
| Cena | até 200 KB gzip, fora do carregamento inicial |

Os números de antes e depois ficam registrados em `docs/otimizacao-de-desempenho.md`, como no Francisco.

### 11. Apresentação interativa no Hero e no Sobre
Pedido da dona em 2026-11-18. Em 2026-11-19, o cartão de perfil saiu do Hero, para o Hero ficar igual ao da referência, e
virou a foto do Sobre. Os três efeitos usam o mesmo padrão: uma escuta de ponteiro por efeito, que grava a
posição em variáveis CSS num `requestAnimationFrame` só enquanto o ponteiro se move, e o CSS faz o resto. Nada roda com o
ponteiro parado, e o texto nunca muda de lugar.

- **Nome animado:** o `SplitText` ganha o modo de letras (a frase inteira fica para o leitor de tela; as letras, com
  `aria-hidden`). A entrada é só CSS, com atraso por letra. A onda é uma ilha mínima (`NameWave`, como no Francisco):
  distância de cada letra ao ponteiro numa curva gaussiana, gravada em `--wave`; o CSS sobe a letra com `translate` e
  mistura a cor com o destaque de texto. Mudar o peso da fonte foi descartado no Francisco, porque muda a largura e a
  linha se rearranja. **Lição de lá:** a máscara de cada palavra precisa de folga nas laterais e em cima, compensada por
  margem negativa, ou o espaçamento negativo do título corta as letras redondas e o pingo do "i".
- **Luz que segue o ponteiro:** um gradiente radial na cor de destaque, num pseudo-elemento do Hero, posicionado por
  `--mx`/`--my`. As formas do fundo ganham um deslocamento proporcional à posição do ponteiro (parallax de até alguns
  pixels por camada), com transição para não tremer. O brilho fica atrás do texto e com opacidade baixa, então o contraste
  medido não muda.
- **Foto de perfil em 3D, no Sobre:** `transform: perspective() rotateX() rotateY()` a partir da posição do ponteiro
  sobre a foto (no máximo uns 8°), um reflexo em gradiente que acompanha e volta ao plano com transição quando o ponteiro
  sai. Os números dos fatos contam com um contador curto ao entrar na tela; o valor final está no HTML, então sem
  JavaScript e com movimento reduzido aparece o número certo.
- **Custo:** cerca de 1,5 KB de JavaScript para as três ilhas, dentro do orçamento da decisão 5. Sem biblioteca nova.

### 12. Contato e "Agendar call" como na referência
- `Contact.tsx` e `ContactForm.tsx` da referência, adaptados: linhas rótulo/valor, "Baixar CV", o cartão "Agendar call" e
  o formulário dentro de um `<details>` nativo ("Prefere escrever por aqui?"), que abre sem JavaScript.
- O formulário mantém o comportamento da spec `formulario-de-contato` da fundação; muda só onde ele aparece.
- O link de agendamento fica numa constante de `lib/contact.ts`, como na referência. Vazia, ela tira o cartão e o botão
  da barra e deixa o formulário aberto. No protótipo, um link provisório marcado `validar`.
- *Alternativa descartada:* formulário sempre aberto, como na rodada 1. Diferente da referência, que a dona pediu.

## Risks / Trade-offs

- [O layout copiado ficar "parecido" e não igual] → a comparação lado a lado em 1440 e 390 px, seção por seção, no
  protótipo e no site, com a referência rodando.

- [Escopo grande numa change só] → blocos independentes com commit cada, e a dona confere no navegador ao fim de cada
  um. Se um bloco travar, os anteriores já estão no ar.
- [A cena ficar bonita no computador e pesada no celular] → orçamento da decisão 3, rebaixamento automático e a imagem
  estática em aparelho fraco. O teste é feito com CPU 4x mais lenta no protótipo e no código.
- [A sequência presa irritar quem só quer ler] → no máximo duas cenas presas, duas telas por etapa no celular, nada de
  sequestro da rolagem e a lista simples com movimento reduzido.
- [A imagem estática divergir da cena] → as duas são geradas pelo mesmo código, num modo de captura.
- [Conteúdo sem fonte entrar pelo protótipo] → a marcação `validar` e uma verificação antes de passar textos do
  protótipo para `messages/`.
- [Recomendações não chegarem] → a seção sai sozinha com a lista vazia. Nada bloqueia o resto da change.
- [Safari do iOS e `position: sticky` com barra dinâmica] → unidades `svh` e teste em 390 px. Só a dona consegue testar
  num iPhone de verdade, e isso fica registrado nas tarefas.

## Migration Plan

1. Os protótipos (bloco 1) não tocam o código e podem rodar antes do fim da fundação.
2. O código começa depois dos blocos 3 a 5 da fundação. Cada bloco desta change é um commit, e reverter um commit volta
   ao estado anterior.
3. As capturas de referência são atualizadas de propósito no bloco da identidade, porque a mudança visual é intencional.
   Depois disso, voltam a proteger contra regressão.
4. As seções novas entram atrás da estrutura final de uma vez (página única), sem convivência de duas identidades em
   produção.

## Open Questions

- **Voz do texto:** primeira pessoa ("construo") ou terceira ("Evelym constrói"). Muda só o texto em `messages/`.
- **Situação do artigo do ICSCA 2026** (publicado ou com publicação prevista) e **nomes dos projetos** sem fonte no
  currículo: a dona confirma antes do bloco de conteúdo.
- **Textos das recomendações:** a dona envia o texto exato, o nome e o cargo.
- **Marca animada:** assinatura própria (precisa da foto) ou fonte manuscrita.
- **Link de agendamento:** a dona envia o link da agenda (Google Agenda ou outro). Até lá, provisório marcado `validar`.
- **Hospedagem e domínio:** não mudam esta change, mas entram na de SEO.
