## 1. Protótipos: identidade, movimento e cena (só HTML, pode começar antes do fim da fundação)

Rodada 1 (1.1 a 1.7) feita em 2026-11-18 em `design/prototipos/estrutura-e-cenas/`. Em 2026-11-19 a dona aprovou as
animações, as cenas, a sequência e a pilha, e pediu o layout idêntico ao da referência: a rodada 2 (1.8 a 1.13) refaz o
layout.

- [x] 1.1 Montar a base comum em `design/prototipos/estrutura-e-cenas/`: página inteira com a estrutura final (Hero,
      Sobre com competências e sequência da arquitetura, Projetos, Experiência, Pesquisa, Recomendações com exemplo
      marcado como `validar`, Contato), texto real do currículo, barra de controles (cor e tipografia das 3 direções,
      tema, sem WebGL, movimento reduzido) e o condutor de rolagem próprio (D2, D5). O Hero já sai com o tema escuro
      como inicial e com a apresentação interativa: nome animado, luz que segue o ponteiro e cartão de perfil em 3D
      (D7, D11)
- [x] 1.2 Protótipo da sequência presa da arquitetura em SVG (requisição, serviços, dados, testes e deploy), com ida e
      volta pela rolagem, lista simples com movimento reduzido e versão de celular (D4)
- [x] 1.3 Protótipo da cena A (abaixo da superfície), com imagem estática nos dois temas (D3)
- [x] 1.4 Protótipo da cena B (cluster que se cura), com imagem estática nos dois temas (D3)
- [x] 1.5 Protótipo da cena C (porto de deploy), com imagem estática nos dois temas (D3)
- [x] 1.6 Duas opções de marca animada (assinatura própria, se a dona enviar a foto, e fonte manuscrita OFL) (D1)
- [x] 1.7 Conferir cada protótipo: sem erro no console e sem rolagem lateral em 1440 e 390 px, contraste dos tokens,
      quadros por segundo da cena no computador e com CPU 4x mais lenta, e as 10 heurísticas de Nielsen
- [x] 1.8 Medir a referência rodando (cópia do build fora do repositório dela): container, espaçamentos, escala
      tipográfica e os componentes de cada seção, com capturas em 1440 e 390 px fora do repositório (D1, D2)
- [x] 1.9 Refazer a base em `design/prototipos/layout-referencia/` com o layout idêntico ao da referência: container,
      faixas com trama de pontos, fontes e tamanhos, barra do topo (marca, links, PT/EN/ES, tema, "Agendar call", "Baixar
      CV"), Hero (cena solta, formas, "Onde já construí"), Sobre (frase-título, foto, 4 fatos, 6 cartões de competência
      numerados com logos, "Também:"), Projetos (destaque e lista), Trajetória (barras por ano, linhas, formação), Pesquisa,
      Recomendações (destaque e carrossel), Contato (faixa invertida, linhas rótulo/valor, "Agendar call" com link
      provisório marcado `validar`, formulário em "Prefere escrever por aqui?") e rodapé, com o texto do currículo (D1, D12)
- [x] 1.10 Paleta roxo, preto e branco nos tokens com os nomes da referência, nos dois temas e na faixa invertida, com 2
      ou 3 variações de roxo na barra de controles, e contraste AA conferido em todas (D7)
- [x] 1.11 Portar da rodada 1, sem mudar o comportamento: nome em onda, luz do ponteiro, transição de tema, títulos e
      blocos, sequência da arquitetura no fim do Sobre, pilha da Pesquisa, as 3 cenas e o carregador; a foto do Sobre
      ganha a inclinação 3D e os fatos contam; imagens estáticas das cenas geradas de novo para a paleta e o fundo novos
      (D3, D4, D11)
- [x] 1.12 Comparar lado a lado com a referência, seção por seção, em 1440 e 390 px, e repetir a conferência da 1.7
      (console, rolagem lateral, quadros por segundo, contraste, fontes até 140 KB, movimento reduzido, sem WebGL, sem
      JavaScript, teclado)
- [x] 1.13 A dona escolhe cena, variação de roxo e marca (tema inicial escuro, layout, fontes e foto 3D no Sobre já
      decididos). Registrar a escolha, com a data, na D2 da design.md e commitar os protótipos

## 2. Identidade visual no código

- [x] 2.1 Tokens da paleta escolhida em `@theme` de `app/globals.css`, com os nomes da referência, nos dois temas e na
      `band-invert`, e as utilidades de layout da referência (`container-site`, faixas, escala tipográfica), sem cor literal
      nos componentes
- [x] 2.2 `tests/unit/contrast.test.ts` (pasta que o Vitest lê) com os pares de texto/fundo e de borda/fundo
      declarados num arquivo só, falhando abaixo de 4,5:1 e 3:1. A orquídea (`--accent-2`) dá 2,97:1 sobre `--surface` no escuro: lá ela só entra como
      decoração; o teste cobra 3:1 sobre `--bg`. O mesmo teste reprova hex ou rgb literal em componentes
- [x] 2.3 Bricolage Grotesque, Instrument Sans e JetBrains Mono por `next/font`, como na referência (subconjunto latino,
      `display: swap`), e medição do peso no build (até 140 KB). Medido em 2026-11-19: 104,3 KB pré-carregados e
      134,9 KB baixados ao abrir `/pt` (a mono entra logo depois), em 3 arquivos
- [x] 2.4 Tema escuro como inicial no script de tema da fundação, aplicado antes da primeira pintura e mantido na troca
      de idioma (lições da D7), com testes de hidratação nos dois temas, de primeira visita com o sistema em modo claro
      (abre escuro) e de troca de idioma com o tema salvo (`tests/e2e/tema.spec.ts`)
- [x] 2.5 Atualizar as capturas de referência de propósito (identidade nova) e registrar o motivo no commit
- [x] 2.6 `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passando. A dona confere `/pt` nos dois
      temas no navegador

## 3. Estrutura e conteúdo

- [x] 3.1 `lib/content/` com `career.ts`, `projects.ts`, `research.ts`, `recommendations.ts` e `skills.ts` a partir do
      currículo, só com dados (ids, datas, links, tecnologias) (D1). `recommendations.ts` entra no bloco 6, com os
      textos que a dona enviar
- [x] 3.2 Reorganizar `messages/pt.json` por seção, com os textos de acessibilidade ("Pular para o conteúdo",
      `aria-label`, `alt`), passando a copy nova por `copywriting` e `stop-slop`; resolver antes a voz, a situação do
      ICSCA 2026 e os nomes de projeto com a dona (D8). Resolvido em 2026-11-19: primeira pessoa, ICSCA já publicado
      (DOI pendente), títulos descritivos. A copy passou pela `stop-slop`; os títulos dos artigos ficam em
      `lib/content/research.ts`, fora do tradutor
- [x] 3.3 Gerar e revisar `en.json` e `es.json`, e teste de paridade de chaves entre os três idiomas
      (`tests/unit/messages.test.ts`, que também reprova texto vazio e travessão). A revisão corrigiu nome de empresa,
      gênero, termos técnicos traduzidos ("Dramaturgo", "confirmar") e travessões do DeepL
- [x] 3.4 Seções de servidor `Hero`, `About` (com `Skills`), `Projects` e `Experience` (Trajetória, com as barras por
      ano) portadas do protótipo da rodada 2 com o layout da referência, âncoras estáveis e títulos ligados por
      `aria-labelledby`
- [x] 3.4b `Contact` e `ContactForm` como na referência: linhas rótulo/valor, "Baixar CV", cartão "Agendar call" (link em
      `lib/contact.ts`; vazio tira o cartão e o botão da barra e abre o formulário) e o formulário em `<details>` nativo,
      mantendo a spec `formulario-de-contato` (D12). Sem link de agenda, o formulário já vem aberto. A lógica do
      formulário continua a atual (react-hook-form e Zod); a versão segura é o bloco 6 da fundação
- [x] 3.5 Seção `Research` nova, com o peso da Experiência, DOI como link e a situação de cada publicação como no
      currículo
- [x] 3.6 `Navbar` como na referência (Sobre, Projetos, Trajetória, Pesquisa, Contato, PT/EN/ES, tema, "Agendar call" e
      "Baixar CV"), foco no título ao seguir uma âncora, e `Footer` da referência
- [x] 3.7 Folha de logos de tecnologia com `scripts/tech-icons/build.mjs` (Simple Icons, CC0), só com tecnologias do
      currículo
- [x] 3.8 Remover `components/animations/` (inclusive `Particles.tsx`) e a identidade "Samsung Lilac" que sobrar
- [x] 3.9 Testes de navegador: ordem e âncoras das seções em pt/en/es, largura do container (1312 px em 1440), página com
      JavaScript desligado, navegação da barra só com teclado, "Agendar call" e "Prefere escrever por aqui?" pelo teclado
      e sem JavaScript, e comparação lado a lado com a referência em 1440 e 390 px (`tests/e2e/estrutura.spec.ts`).
      A comparação visual foi feita contra o protótipo da rodada 2, que copia o CSS da referência: rodar a referência
      criaria arquivos na pasta dela, que é só leitura. JS inicial de `/pt` medido: 289 kB gzip (framer-motion sai na
      4.9; Zod e react-hook-form no cliente, no bloco 6 da fundação)
- [x] 3.10 Lint, tipos, testes, capturas e build passando. A dona confere as três línguas, celular e computador

## 4. Movimento e rolagem

- [x] 4.1 `SplitText` e `MotionReady` como no Francisco: palavras separadas no servidor, nome acessível inteiro e estado
      final no HTML (D5)
- [x] 4.2 Condutor de rolagem próprio (progresso de 0 a 1 em variável CSS, ativo só com cena presa na tela) com teste
      determinístico de ida e volta (D5)
- [x] 4.3 Sequência presa da arquitetura no fim de Sobre, portada do protótipo, com `position: sticky`, unidades `svh`,
      lista simples com movimento reduzido e foco do teclado sem ficar preso (D4)
- [x] 4.4 Pilha de cartões (na seção escolhida no protótipo) e parallax de até 15%, com o cartão focado sempre por cima
- [x] 4.5 Transição circular do tema pela View Transitions API, nascendo no botão também pelo teclado, instantânea com
      movimento reduzido ou sem suporte
- [x] 4.6 Nome do Hero letra a letra, com a onda sob o ponteiro: modo de letras no `SplitText` e ilha `NameWave`, com
      folga na máscara para não cortar curvas e pingos (D11)
- [x] 4.7 Luz que segue o ponteiro no fundo do Hero, com as formas reagindo à posição dele: variáveis CSS gravadas só
      enquanto o ponteiro se move (D11)
- [x] 4.8 Foto do Sobre com inclinação 3D e reflexo, e números dos fatos contando ao aparecer, com o valor final no HTML
      (D11)
- [x] 4.9 Remover o framer-motion e medir o JavaScript inicial da rota (meta: abaixo de 206 kB)
      Medido em 2026-11-19: 289 → 252 kB gzip. **Meta ainda não atingida.** Cerca de 155 kB são React 19 e Next 16; o
      maior peso restante do site é o Zod do formulário, que sai no bloco 6 da fundação (`zod/mini` ou regras próprias,
      como na referência)
- [x] 4.10 Testes: unitários da onda e da inclinação (mudam com ponteiro fino, nada com movimento reduzido ou toque);
      de navegador com `reducedMotion: 'reduce'` (nada preso, nada se move, conteúdo final, números no valor final), com
      teclado na sequência e na pilha, e com o leitor de tela nos títulos animados e no nome do Hero
- [x] 4.11 Lint, tipos, testes e build passando. A dona confere o Hero com o mouse, com movimento reduzido ligado de
      verdade no sistema e no celular

## 5. Cena 3D

- [x] 5.1 `lib/scene/can-run-scene.ts` (movimento reduzido, economia de dados, aparelho fraco, sem WebGL) com testes de
      cada condição (D6). Aparelho fraco como na spec daqui: 4 GB ou menos **e** até 4 núcleos
- [x] 5.2 Módulo da cena escolhida, portado do protótipo: `three` com import seletivo, `setTheme`, `setProgress`,
      `dispose`, pausa fora da tela e com a aba oculta, perda de contexto e rebaixamento por quadros por segundo (D3, D6).
      A história começa no estado final (o quadro do pôster) e segue o ciclo de 24 s; os textos dos painéis vêm de
      `messages/` (`hero.scene`), e o código do editor fica em inglês nos três idiomas
- [x] 5.3 `HeroSceneLoader`: import dinâmico depois do `load` e do navegador ocioso, troca da imagem pela cena sem salto.
      Começa com o Hero perto da tela, sem esperar interação (a referência espera; rever se o TBT do bloco 7 pedir)
- [x] 5.4 Modo de captura e imagens estáticas `public/images/scene/<conceito>-{claro,escuro}.webp` geradas pela cena,
      com `alt` e a descrição da cena traduzidos (`npm run scene:posters`, `scripts/render-scene-posters.ts`)
- [x] 5.5 Rótulos da cena em HTML fora do canvas, canvas escondido da tecnologia assistiva e sem foco. A cena D não tem
      rótulos sobre as peças (a escolha da dona tirou o cartão de legenda); a descrição traduzida fica no `aria-label`
      do contêiner (`role="img"`), e o canvas tem `aria-hidden` e `tabindex=-1`
- [x] 5.6 Testes de navegador: a cena aparece com WebGL; não baixa `three` com WebGL desligado, com movimento reduzido ou
      com economia de dados; pausa fora da tela; acompanha a troca de tema
- [x] 5.7 Medir o custo da cena (KB gzip, quadros por segundo no computador e com CPU 4x mais lenta) e registrar em
      `docs/otimizacao-de-desempenho.md`. Medido: 140,4 kB gzip fora do carregamento inicial; 60,1 quadros por segundo
      na Iris Xe com densidade 2 e 59,9 com a CPU 4x mais lenta
- [ ] 5.8 Lint, tipos, testes e build passando. A dona confere com WebGL desligado de verdade no navegador
      (`chrome://flags` ou `--disable-webgl`) e num celular

## 6. Recomendações

- [ ] 6.1 Cadastrar em `lib/content/recommendations.ts` e `messages/` as recomendações que a dona enviar (texto exato,
      nome, cargo, empresa, mês e ano, idioma original); sem nenhuma, conferir que a seção e o link somem
- [ ] 6.2 `Recommendations` e `CarouselControls` como na referência: recomendação em destaque, cartões com iniciais
      (escondidas do leitor de tela), "Ler completa" em `<details>` nativo, contador "01 / 08" com barra, botões e posição
      traduzidos, `aria-roledescription`, anúncio da recomendação atual, sem avanço automático, faixa com rolagem nativa sem
      JavaScript
- [ ] 6.3 Testes de navegador: carrossel e "Ler completa" só com teclado, sem JavaScript e com movimento reduzido
- [ ] 6.4 A dona confere o texto de cada recomendação no site antes de ir ao ar

## 7. Fechamento

- [ ] 7.1 Axe WCAG 2.2 A/AA sem violações em pt/en/es nos dois temas, com a lista de exceções da fundação vazia
- [ ] 7.2 Lighthouse no celular (3 execuções, `/pt`, `/en` e `/es`) com LCP abaixo de 2,5 s, CLS abaixo de 0,1 e TBT
      abaixo de 200 ms, e as asserções passando de aviso a erro (D10)
- [ ] 7.3 Conferência final da dona: pt/en/es, claro/escuro, celular e computador, só com teclado, com leitor de tela,
      com movimento reduzido e com WebGL desligado, de verdade no navegador
- [ ] 7.4 `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` e `npm run build` passando
- [ ] 7.5 Atualizar o `CLAUDE.md` (estado atual, seções e decisões, inclusive a regra do tema: o escuro é o padrão, no
      lugar de "o modo claro é a experiência principal") e rodar `graphify update .`
