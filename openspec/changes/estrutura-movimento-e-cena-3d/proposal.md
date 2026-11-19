## Why

Hoje o site da Evelym parece um modelo de portfólio genérico. Ele não mostra o que a diferencia: anos de backend em
Python, arquitetura de microsserviços, deploy com Docker, Kubernetes e CI/CD, e pesquisa publicada sobre qualidade de
software. Para piorar, o link "Pesquisa" da barra do topo aponta para uma seção que não existe.

O portfólio do Francisco já provou uma estrutura que funciona para recrutadores e líderes técnicos. A dona quer a mesma
estrutura, com duas diferenças:
- mais movimento, tirado do repertório das skills da Mangue;
- uma cena 3D que só uma engenheira de backend sênior faria, mostrando que ela entende de arquitetura e de deploy.

É a hora certa: a fundação (`fundacao-ferramentas-e-stack`) deixa a stack nova, os testes e a CI prontos para receber
esse trabalho com segurança.

**Revisão de 2026-11-19:** a primeira rodada de protótipos (2026-11-18) trouxe a estrutura certa, mas um layout
próprio, com container mais estreito, tipografia e componentes diferentes. A dona aprovou as animações, as cenas 3D, a
sequência da arquitetura e a pilha da Pesquisa, e pediu o **layout idêntico ao do portfólio de referência**, mudando só
as cores. Esta versão da change registra esse pedido.

Esta change substitui as changes 2, 3 e 4 do plano original (`identidade-visual`, `cena-3d` e `conteudo-e-secoes`). A
identidade, o movimento e a cena 3D são escolhidos juntos, no mesmo protótipo, porque um depende do outro: a cena usa as
cores e o tema, e o movimento segue a história da cena. A entrega continua em partes, um bloco por vez, cada um testável
no navegador. SEO e compartilhamento seguem como change própria, depois desta.

## What Changes

- **Layout idêntico ao do portfólio de referência, só com a paleta trocada, mais a seção de Pesquisa.** Mesma
  largura de container, mesmas faixas com trama de pontos, mesmas fontes (Bricolage Grotesque, Instrument Sans e
  JetBrains Mono) e tamanhos, mesmos componentes em cada seção. A ordem é Hero, Sobre (com as competências), Projetos
  (um em destaque e os outros em lista), Trajetória (barras por ano, linhas e formação), Pesquisa, Recomendações e
  Contato, com a barra do topo e o rodapé da referência.
  - **Hero:** status, nome gigante, texto, botões e a cena 3D solta no fundo da faixa, com formas geométricas
    espalhadas e a faixa "Onde já construí" embaixo.
  - **Sobre:** frase-título grande, foto, quatro fatos curtos e as competências em seis cartões numerados com logos.
  - **Contato:** faixa invertida, título gigante, linhas com rótulo e valor (e-mail, LinkedIn, GitHub, Lattes), "Baixar
    CV", o cartão **Agendar call** e o formulário dentro de "Prefere escrever por aqui?". O link de agendamento vem da
    dona; até lá, o protótipo usa um provisório marcado como `validar`.
  - Todas as seções são renderizadas no servidor. O texto vem de `messages/` nos três idiomas e os dados, do currículo.
  - **Pesquisa**, que o Francisco não tem: seção própria com o mesmo peso da Experiência, com ICSCA 2026, IEEE SEAI 2024 e
    o TCC. O link "Pesquisa" da barra passa a funcionar.
  - **Recomendações:** só com os textos reais do LinkedIn que a dona enviar, com o nome e o cargo de quem escreveu. Sem
    os textos, a seção não vai ao ar.
- **Paleta nova em roxo, preto e branco** sobre o layout e a tipografia da referência. Ela sai de uma rodada de
  protótipos HTML que já combinam o layout, o movimento e a cena, com variações de roxo para comparar. Saem a identidade
  provisória "Samsung Lilac" e o framer-motion.
- **Movimento ligado à rolagem, do repertório da Mangue:**
  - títulos revelados palavra por palavra;
  - blocos que entram ao aparecer na tela;
  - uma pilha de cartões presa à rolagem;
  - uma sequência presa e conduzida pela rolagem, em que a arquitetura de um sistema se monta etapa por etapa, da
    requisição ao deploy;
  - parallax curto;
  - transição circular na troca de tema.
  - A rolagem continua nativa, sem nenhuma biblioteca de rolagem suave.
- **Apresentação interativa no Hero e no Sobre** (pedido da dona em 2026-11-18; o cartão foi para o Sobre em
  2026-11-19, para o Hero ficar igual ao da referência), com três efeitos que respondem ao ponteiro:
  - **nome animado:** as letras do nome entram uma a uma e, com o ponteiro em cima, uma onda percorre as letras (sobem e
    ganham a cor de destaque), sem mudar a largura da linha;
  - **luz que segue o ponteiro:** um brilho roxo suave no fundo do Hero acompanha o ponteiro, e as formas do fundo reagem
    à posição dele;
  - **foto de perfil em 3D, no Sobre:** a foto inclina conforme o ponteiro, com um reflexo de luz, e os números dos
    fatos contam até o valor ao aparecer. Os números saem do currículo.
  - Os três só existem com ponteiro fino e sem movimento reduzido. No toque, com movimento reduzido ou sem JavaScript,
    tudo aparece pronto e parado.
- **Tema escuro como padrão** (decisão da dona em 2026-11-18): quem abre o site pela primeira vez vê o tema escuro, mesmo
  com o sistema em modo claro. O claro fica como escolha da pessoa, lembrada entre visitas e entre idiomas. Isso resolve o
  "tema inicial" que a rodada de protótipos deixaria em aberto.
- **Cena 3D de backend em Three.js:** um conceito escolhido no protótipo entre três, todos ligados a arquitetura e
  deploy:
  - camadas abaixo da superfície;
  - um cluster que escala e se recupera sozinho;
  - um porto de containers que leva o build até a produção.
  - A cena carrega depois do conteúdo, reage ao ponteiro e à rolagem e acompanha o tema.
  - Ela tem uma imagem estática de mesma composição para movimento reduzido, falta de WebGL e aparelho fraco.
- **Textos de acessibilidade traduzidos:** "Pular para o conteúdo", `aria-label` e `alt` nos três idiomas. Movimento
  reduzido e teclado são cobertos por testes.

**O que quem visita percebe:**
- Ao abrir o site pela primeira vez, ele está no tema escuro. O título e a apresentação aparecem na hora, em roxo, preto e
  branco: as letras do nome entram uma a uma e, um instante depois, a cena 3D ganha vida ao lado do texto.
- O site tem a mesma cara organizada do portfólio de referência (as mesmas larguras, faixas, títulos e componentes), em
  roxo, preto e branco.
- Movendo o mouse pelo Hero, uma luz roxa acompanha o ponteiro e o nome ondula sob ele; no Sobre, a foto inclina em 3D.
- No Contato, a pessoa agenda uma conversa direto na agenda da Evelym ou abre o formulário.
- Rolando, a pessoa vê a arquitetura de um sistema se montar, da requisição que chega até o deploy em produção, e as
  seções entram com movimento contido.
- A pesquisa aparece com o mesmo destaque da experiência, e as recomendações reais dão prova social.
- Quem pede menos movimento, não tem WebGL ou usa um celular fraco vê o mesmo conteúdo completo, parado e legível.
- Sem JavaScript, o portfólio continua inteiro.

## Fora do escopo

- **SEO e compartilhamento:** metadados por idioma, `hreflang`, sitemap, imagem OG e dados estruturados ficam na change
  `seo-e-compartilhamento`.
- **Conteúdo novo sem fonte:**
  - nenhum número, cliente, resultado ou nome de projeto que não esteja no currículo ou que a dona não confirme;
  - os nomes "API Gateway de Microsserviços" e "Pipeline ETL para Varejo" só entram com a confirmação dela.
- **Itens dos pacotes da Mangue que contrariam as regras do projeto:**
  - Lenis e qualquer rolagem suave;
  - ícones Solar;
  - preloader que segure o conteúdo;
  - imagens geradas por IA como prova;
  - os scripts dos pacotes.
- **Áudio, pós-processamento pesado** (bloom em tela cheia, profundidade de campo) **e modelos 3D externos (GLTF):** a
  cena é geométrica e procedural.
- **Content-Security-Policy completa:** fica para quando os scripts finais estiverem definidos, na change de SEO ou numa
  própria.
- **Troca do script de tradução DeepL por tradução à mão:** a dona decide no bloco de conteúdo. Até lá, `en.json` e
  `es.json` são gerados e revisados.

## Capabilities

### New Capabilities
- `estrutura-e-conteudo`: as seções da página, a ordem delas, a navegação por âncoras, a origem dos textos (currículo e
  `messages/` em pt/en/es) e a leitura completa sem JavaScript.
- `identidade-visual`: tokens de cor dos temas claro e escuro com contraste AA, sobre o layout e a tipografia da
  referência, com orçamento de peso das fontes, tema inicial e troca de tema sem divergência de hidratação.
- `movimento-e-rolagem`: as animações ligadas à rolagem, a sequência presa da arquitetura, a transição de tema e o
  comportamento com movimento reduzido, teclado e sem JavaScript.
- `cena-3d`: quando a cena 3D aparece, como substitui a imagem estática, como reage a ponteiro, rolagem e tema, e os
  limites de custo que ela não pode passar.
- `recomendacoes`: a recomendação em destaque e o carrossel de recomendações reais, como na referência, com controle
  por teclado e leitor de tela.

### Modified Capabilities
(nenhuma: ainda não há specs em `openspec/specs/`, e as specs da fundação, `formulario-de-contato` e
`cabecalhos-de-seguranca`, não mudam. O formulário muda de aparência, não de comportamento.)

## Impact

- **Dependências:**
  - entra `three`, carregado só depois do LCP e só quando a cena vai rodar;
  - sai `framer-motion`;
  - GSAP só entra se o protótipo provar que a sequência presa precisa dele (decisão na design.md, com o custo em KB).
- **Código:**
  - `components/sections/*`, reescritas como seções de servidor, com novas `Research` e `Recommendations`;
  - `components/layout/*`, com a marca animada e a troca de tema com transição;
  - novos `components/motion/` (efeitos de cliente) e `components/scene/` (carregador e módulo da cena);
  - `lib/content/` (dados estruturados de carreira, projetos, pesquisa e recomendações);
  - `app/globals.css` (tokens `@theme` da identidade nova);
  - sai `components/animations/`.
- **Conteúdo:** `messages/pt.json`, `en.json` e `es.json` reorganizados por seção, com os textos de acessibilidade.
- **Arquivos:**
  - protótipos em `design/prototipos/`;
  - imagens estáticas da cena em `public/images/scene/`;
  - logos de tecnologia numa folha SVG própria.
- **Testes:**
  - capturas de referência novas (a identidade muda de propósito);
  - testes de navegador para movimento reduzido, sem WebGL, sem JavaScript, teclado no carrossel e na sequência presa;
  - axe sem violações novas: a lista de exceções da fundação precisa ficar vazia no fim desta change.
- **Ordem:** a implementação começa depois dos blocos 3 a 5 da fundação (testes, Next 16 e Tailwind 4). O bloco de
  protótipos desta change é só HTML em `design/prototipos/` e pode começar antes.
- **Prova de fidelidade:** o protótipo e as capturas do site são comparados lado a lado com a referência, seção por
  seção, em 1440 e 390 px.
- **Plano:** a tarefa 9.4 da fundação ("abrir a change `identidade-visual`") passa a apontar para esta change.
