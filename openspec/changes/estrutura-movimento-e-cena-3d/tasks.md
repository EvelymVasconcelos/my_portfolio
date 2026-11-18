## 1. Protótipos: identidade, movimento e cena (só HTML, pode começar antes do fim da fundação)

- [ ] 1.1 Montar a base comum em `design/prototipos/estrutura-e-cenas/`: página inteira com a estrutura final (Hero,
      Sobre com competências e sequência da arquitetura, Projetos, Experiência, Pesquisa, Recomendações com exemplo
      marcado como `validar`, Contato), texto real do currículo, barra de controles (cor e tipografia das 3 direções,
      tema, sem WebGL, movimento reduzido) e o condutor de rolagem próprio (D2, D5)
- [ ] 1.2 Protótipo da sequência presa da arquitetura em SVG (requisição, serviços, dados, testes e deploy), com ida e
      volta pela rolagem, lista simples com movimento reduzido e versão de celular (D4)
- [ ] 1.3 Protótipo da cena A (abaixo da superfície), com imagem estática nos dois temas (D3)
- [ ] 1.4 Protótipo da cena B (cluster que se cura), com imagem estática nos dois temas (D3)
- [ ] 1.5 Protótipo da cena C (porto de deploy), com imagem estática nos dois temas (D3)
- [ ] 1.6 Duas opções de marca animada (assinatura própria, se a dona enviar a foto, e fonte manuscrita OFL) (D1)
- [ ] 1.7 Conferir cada protótipo: sem erro no console e sem rolagem lateral em 1440 e 390 px, contraste dos tokens,
      quadros por segundo da cena no computador e com CPU 4x mais lenta, e as 10 heurísticas de Nielsen
- [ ] 1.8 A dona escolhe cena, cor, tipografia, tema inicial e marca. Registrar a escolha, com a data, na D2 da
      design.md e commitar os protótipos

## 2. Identidade visual no código

- [ ] 2.1 Tokens da direção escolhida em `@theme` de `app/globals.css`, nos dois temas, sem cor literal nos componentes
- [ ] 2.2 `tests/contrast.test.ts` com os pares de texto/fundo e de borda/fundo declarados num arquivo só, falhando abaixo
      de 4,5:1 e 3:1
- [ ] 2.3 Fontes por `next/font` (até 3 famílias e 120 KB, métrica de reserva ajustada) e medição do peso no build
- [ ] 2.4 Tema inicial da direção escolhida no script de tema da fundação, com teste de hidratação nos dois temas
- [ ] 2.5 Atualizar as capturas de referência de propósito (identidade nova) e registrar o motivo no commit
- [ ] 2.6 `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passando. A dona confere `/pt` nos dois
      temas no navegador

## 3. Estrutura e conteúdo

- [ ] 3.1 `lib/content/` com `career.ts`, `projects.ts`, `research.ts`, `recommendations.ts` e `skills.ts` a partir do
      currículo, só com dados (ids, datas, links, tecnologias) (D1)
- [ ] 3.2 Reorganizar `messages/pt.json` por seção, com os textos de acessibilidade ("Pular para o conteúdo",
      `aria-label`, `alt`), passando a copy nova por `copywriting` e `stop-slop`; resolver antes a voz, a situação do
      ICSCA 2026 e os nomes de projeto com a dona (D8)
- [ ] 3.3 Gerar e revisar `en.json` e `es.json`, e teste de paridade de chaves entre os três idiomas
- [ ] 3.4 Seções de servidor `Hero`, `About` (com `Skills`), `Projects`, `Experience` e `Contact` na estrutura do
      Francisco, com âncoras estáveis e títulos ligados por `aria-labelledby`
- [ ] 3.5 Seção `Research` nova, com o peso da Experiência, DOI como link e a situação de cada publicação como no
      currículo
- [ ] 3.6 `Navbar` com os links das seções (o de Recomendações só com recomendações cadastradas), foco no título ao seguir
      uma âncora, e `Footer`
- [ ] 3.7 Folha de logos de tecnologia com `scripts/tech-icons/build.mjs` (Simple Icons, CC0), só com tecnologias do
      currículo
- [ ] 3.8 Remover `components/animations/` (inclusive `Particles.tsx`) e a identidade "Samsung Lilac" que sobrar
- [ ] 3.9 Testes de navegador: ordem e âncoras das seções em pt/en/es, página com JavaScript desligado e navegação da
      barra só com teclado
- [ ] 3.10 Lint, tipos, testes, capturas e build passando. A dona confere as três línguas, celular e computador

## 4. Movimento e rolagem

- [ ] 4.1 `SplitText` e `MotionReady` como no Francisco: palavras separadas no servidor, nome acessível inteiro e estado
      final no HTML (D5)
- [ ] 4.2 Condutor de rolagem próprio (progresso de 0 a 1 em variável CSS, ativo só com cena presa na tela) com teste
      determinístico de ida e volta (D5)
- [ ] 4.3 Sequência presa da arquitetura no fim de Sobre, portada do protótipo, com `position: sticky`, unidades `svh`,
      lista simples com movimento reduzido e foco do teclado sem ficar preso (D4)
- [ ] 4.4 Pilha de cartões (na seção escolhida no protótipo) e parallax de até 15%, com o cartão focado sempre por cima
- [ ] 4.5 Transição circular do tema pela View Transitions API, nascendo no botão também pelo teclado, instantânea com
      movimento reduzido ou sem suporte
- [ ] 4.6 Remover o framer-motion e medir o JavaScript inicial da rota (meta: abaixo de 206 kB)
- [ ] 4.7 Testes de navegador com `reducedMotion: 'reduce'` (nada preso, nada se move, conteúdo final), com teclado na
      sequência e na pilha, e com o leitor de tela nos títulos animados
- [ ] 4.8 Lint, tipos, testes e build passando. A dona confere com movimento reduzido ligado de verdade no sistema e no
      celular

## 5. Cena 3D

- [ ] 5.1 `lib/scene/can-run-scene.ts` (movimento reduzido, economia de dados, aparelho fraco, sem WebGL) com testes de
      cada condição (D6)
- [ ] 5.2 Módulo da cena escolhida, portado do protótipo: `three` com import seletivo, `setTheme`, `setProgress`,
      `dispose`, pausa fora da tela e com a aba oculta, perda de contexto e rebaixamento por quadros por segundo (D3, D6)
- [ ] 5.3 `HeroSceneLoader`: import dinâmico depois do `load` e do navegador ocioso, troca da imagem pela cena sem salto
- [ ] 5.4 Modo de captura e imagens estáticas `public/images/scene/<conceito>-{claro,escuro}.webp` geradas pela cena,
      com `alt` e a descrição da cena traduzidos
- [ ] 5.5 Rótulos da cena em HTML fora do canvas, canvas escondido da tecnologia assistiva e sem foco
- [ ] 5.6 Testes de navegador: a cena aparece com WebGL; não baixa `three` com WebGL desligado, com movimento reduzido ou
      com economia de dados; pausa fora da tela; acompanha a troca de tema
- [ ] 5.7 Medir o custo da cena (KB gzip, quadros por segundo no computador e com CPU 4x mais lenta) e registrar em
      `docs/otimizacao-de-desempenho.md`
- [ ] 5.8 Lint, tipos, testes e build passando. A dona confere com WebGL desligado de verdade no navegador
      (`chrome://flags` ou `--disable-webgl`) e num celular

## 6. Recomendações

- [ ] 6.1 Cadastrar em `lib/content/recommendations.ts` e `messages/` as recomendações que a dona enviar (texto exato,
      nome, cargo, empresa, mês e ano, idioma original); sem nenhuma, conferir que a seção e o link somem
- [ ] 6.2 `Recommendations` e `CarouselControls` como no Francisco: botões e posição traduzidos, `aria-roledescription`,
      anúncio da recomendação atual, sem avanço automático, faixa com rolagem nativa sem JavaScript
- [ ] 6.3 Testes de navegador: carrossel só com teclado, sem JavaScript e com movimento reduzido
- [ ] 6.4 A dona confere o texto de cada recomendação no site antes de ir ao ar

## 7. Fechamento

- [ ] 7.1 Axe WCAG 2.2 A/AA sem violações em pt/en/es nos dois temas, com a lista de exceções da fundação vazia
- [ ] 7.2 Lighthouse no celular (3 execuções, `/pt`, `/en` e `/es`) com LCP abaixo de 2,5 s, CLS abaixo de 0,1 e TBT
      abaixo de 200 ms, e as asserções passando de aviso a erro (D10)
- [ ] 7.3 Conferência final da dona: pt/en/es, claro/escuro, celular e computador, só com teclado, com leitor de tela,
      com movimento reduzido e com WebGL desligado, de verdade no navegador
- [ ] 7.4 `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` e `npm run build` passando
- [ ] 7.5 Atualizar o `CLAUDE.md` (estado atual, seções e decisões) e rodar `graphify update .`
