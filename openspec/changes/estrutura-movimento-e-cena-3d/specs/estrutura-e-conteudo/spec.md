## Purpose

Define as seções do portfólio, a ordem e a navegação entre elas, de onde vêm os textos e os dados profissionais, e a
garantia de que a página inteira é legível e navegável sem JavaScript, em pt, en e es.

## ADDED Requirements

### Requirement: Seções e ordem da página
A página de cada idioma SHALL ter, nesta ordem: barra do topo, Hero, Sobre (com as competências), Projetos, Trajetória
(com a formação), Pesquisa, Recomendações, Contato e rodapé. Cada seção SHALL ter um título visível (`h2`, ou `h1` no
Hero) ligado a ela por `aria-labelledby` e uma âncora estável (`#sobre`, `#projetos`, `#trajetoria`, `#pesquisa`,
`#recomendacoes`, `#contato`, com os nomes traduzidos só no texto, não na âncora). A barra do topo SHALL ter, como na
referência, a marca, os links Sobre, Projetos, Trajetória, Pesquisa e Contato, a troca de idioma, o botão de tema e os
botões "Agendar call" (só com link configurado) e "Baixar CV".

#### Scenario: Ordem das seções
- **WHEN** alguém abre `/pt`, `/en` ou `/es`
- **THEN** as seções aparecem na ordem acima, cada uma com um único título visível

#### Scenario: Link da barra leva à seção
- **WHEN** a pessoa ativa o link "Pesquisa" (ou "Research", "Investigación") da barra do topo
- **THEN** a página vai até a seção de Pesquisa, e o foco do teclado passa para o título dela

#### Scenario: Navegação só com teclado
- **WHEN** a pessoa usa apenas Tab, Shift+Tab e Enter a partir do topo da página
- **THEN** o primeiro foco é o link "Pular para o conteúdo", todos os links da barra são alcançáveis na ordem visual e
  cada um leva à seção certa com o foco visível

### Requirement: Recomendações só com texto real
A seção de Recomendações SHALL aparecer só quando houver ao menos uma recomendação real cadastrada, com o texto exato, o
nome e o cargo de quem escreveu e o idioma original. Sem nenhuma recomendação, a seção SHALL ficar fora da página.

#### Scenario: Sem recomendações cadastradas
- **WHEN** a lista de recomendações está vazia
- **THEN** a página não mostra a seção, e nenhum link aponta para `#recomendacoes`

#### Scenario: Recomendação em outro idioma
- **WHEN** uma recomendação foi escrita em português e a pessoa está em `/en`
- **THEN** o texto aparece no idioma original, com uma indicação traduzida do idioma em que foi escrito

### Requirement: Pesquisa com o peso da Experiência
A seção de Pesquisa SHALL listar as publicações do currículo (ICSCA 2026, IEEE SEAI 2024 e o TCC da UFAM) com título
original, evento, ano, local, papel da Evelym (autora principal) e, quando houver, o link permanente (DOI). A situação de
cada publicação SHALL seguir o currículo (por exemplo, "publicação prevista na ACM Digital Library") até a dona confirmar
outra.

#### Scenario: Publicação com DOI
- **WHEN** a pessoa vê o artigo do IEEE SEAI 2024
- **THEN** ele traz o DOI `10.1109/SEAI62072.2024.10674366` como link que abre `doi.org`

#### Scenario: Situação da publicação
- **WHEN** a pessoa vê o artigo do ICSCA 2026
- **THEN** o texto diz a situação que está no currículo, e não "publicado", enquanto a dona não confirmar a publicação

### Requirement: Conteúdo com fonte
Todo dado profissional exibido (cargos, empresas, datas, competências, projetos, publicações e números) SHALL vir dos PDFs
de `curriculum/` ou de confirmação escrita da dona. Nenhum número, cliente, resultado ou nome de projeto sem fonte SHALL
ir ao ar.

#### Scenario: Número no Hero
- **WHEN** o Hero mostra "6+ anos" ou "2 artigos internacionais"
- **THEN** o número corresponde ao que está no currículo

#### Scenario: Nome de projeto sem confirmação
- **WHEN** um nome de projeto não está no currículo e a dona não o confirmou
- **THEN** ele não aparece no site, e o projeto usa a descrição do currículo como título

### Requirement: Textos nos três idiomas
Todo texto visível, inclusive `aria-label`, `alt`, títulos de seção, rótulos de botão e mensagens do formulário, SHALL
vir de `messages/` e existir em pt, en e es, com o atributo `lang` da página correspondente ao idioma.

#### Scenario: Chave faltando
- **WHEN** uma chave existe em `pt.json` e falta em `en.json` ou `es.json`
- **THEN** o teste de mensagens falha antes do build

#### Scenario: Texto de acessibilidade traduzido
- **WHEN** a pessoa está em `/es` e o leitor de tela anuncia o link "Pular para o conteúdo" e o botão de tema
- **THEN** os dois são anunciados em espanhol

### Requirement: Página completa sem JavaScript
Todas as seções SHALL ser renderizadas no servidor como HTML final: com o JavaScript desligado, todo o conteúdo fica
visível, legível e navegável, e nenhum elemento fica escondido à espera de animação.

#### Scenario: JavaScript desligado
- **WHEN** a página carrega com o JavaScript desligado
- **THEN** todas as seções e textos aparecem no estado final, os links funcionam e a imagem estática da cena ocupa o lugar
  da cena 3D

#### Scenario: Movimento reduzido no conteúdo
- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** todo o conteúdo aparece no estado final desde o primeiro quadro, sem entrada animada

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** todo o conteúdo continua igual, e só a cena 3D dá lugar à imagem estática

### Requirement: Layout igual ao da referência
O layout SHALL ser o do portfólio de referência (`~/Documentos/Gabriel Projetos/my-portfolio`), mudando só a paleta e o
conteúdo: a mesma largura de container (`min(96rem, 100% - 8rem)` a partir de 900 px e `100% - 2.5rem` abaixo), o mesmo
espaçamento vertical das seções, as mesmas faixas (normal, alternada e invertida, com a trama de pontos), a mesma escala
tipográfica e os mesmos componentes em cada seção:
- **Hero:** status com ponto, nome gigante, texto de apoio, botões "Ver projetos" e "Baixar CV", a cena 3D solta no
  fundo da faixa (sem caixa) com formas geométricas espalhadas, e a faixa "Onde já construí" no rodapé do Hero;
- **cabeçalho de seção:** rótulo "NN — Nome" na cor de destaque, frase-título grande e, nas seções que têm, um texto de
  apoio alinhado à direita;
- **Sobre:** frase-título, foto, texto e quatro fatos curtos em colunas, e as competências em seis cartões numerados (com
  a contagem de itens) e logos das tecnologias, mais a linha "Também:";
- **Projetos:** um em destaque (texto, "O que eu fiz", stack e imagem) e os outros numa lista de linhas com número, nome,
  empresa, stack e seta;
- **Trajetória:** barras por ano com os períodos reais, linhas com período, cargo e empresa e descrição, e a formação em
  três colunas;
- **Recomendações e Contato:** como nas specs `recomendacoes` e no requisito "Contato como na referência".
A Pesquisa, que a referência não tem, SHALL usar os mesmos componentes e o mesmo cabeçalho de seção.

#### Scenario: Largura do container
- **WHEN** a página é aberta com 1440 px de largura
- **THEN** o conteúdo ocupa 1312 px, centralizado, como na referência

#### Scenario: Comparação lado a lado
- **WHEN** cada seção é capturada em 1440 e 390 px, na referência e neste site, no mesmo tema
- **THEN** as posições, tamanhos de texto e espaçamentos coincidem; mudam só as cores, os textos e as imagens

#### Scenario: Competências com logos
- **WHEN** a pessoa vê a área de competências do Sobre
- **THEN** cada um dos seis grupos mostra o nome, a contagem de itens e as tecnologias com o logo, e todas as tecnologias
  estão no currículo

#### Scenario: Celular
- **WHEN** a página é aberta com 390 px de largura
- **THEN** as seções se empilham como na referência, sem rolagem lateral

### Requirement: Contato como na referência
O Contato SHALL ficar numa faixa invertida, com o rótulo "NN — Contato", o título gigante, um texto de apoio e duas
colunas: à esquerda, linhas com rótulo e valor (e-mail, LinkedIn, GitHub e Lattes) com seta e o botão "Baixar CV"; à
direita, o cartão "Agendar call", que abre o link de agendamento da Evelym em nova aba, e o bloco "Prefere escrever por
aqui?", que abre e fecha o formulário de contato. O bloco do formulário SHALL usar um elemento nativo de abrir e fechar,
para funcionar sem JavaScript. Sem link de agendamento configurado, o cartão e o botão "Agendar call" da barra SHALL
ficar fora da página, e o formulário SHALL aparecer aberto.

#### Scenario: Agendar call pelo teclado
- **WHEN** a pessoa foca o cartão "Agendar call" com Tab e aperta Enter
- **THEN** o agendamento abre em nova aba, e o leitor de tela já tinha anunciado que o link abre em nova aba

#### Scenario: Formulário pelo teclado
- **WHEN** a pessoa foca "Prefere escrever por aqui?" e aperta Enter
- **THEN** o formulário abre, o foco segue para o primeiro campo com Tab, e o estado aberto é anunciado

#### Scenario: Sem JavaScript
- **WHEN** o JavaScript está desligado
- **THEN** as linhas de contato funcionam como links, o cartão de agendamento abre o link, e o bloco do formulário abre e
  fecha

#### Scenario: Sem link de agendamento
- **WHEN** não há link de agendamento configurado
- **THEN** o Contato mostra o formulário aberto no lugar do cartão, e a barra do topo não mostra "Agendar call"
