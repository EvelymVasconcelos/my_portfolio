## Purpose

Define as seções do portfólio, a ordem e a navegação entre elas, de onde vêm os textos e os dados profissionais, e a
garantia de que a página inteira é legível e navegável sem JavaScript, em pt, en e es.

## ADDED Requirements

### Requirement: Seções e ordem da página
A página de cada idioma SHALL ter, nesta ordem: barra do topo, Hero, Sobre (com as competências), Projetos, Experiência
(com a formação), Pesquisa, Recomendações, Contato e rodapé. Cada seção SHALL ter um título visível (`h2`, ou `h1` no
Hero) ligado a ela por `aria-labelledby` e uma âncora estável (`#sobre`, `#projetos`, `#experiencia`, `#pesquisa`,
`#recomendacoes`, `#contato`, com os nomes traduzidos só no texto, não na âncora).

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
nome e o cargo de quem escreveu e o idioma original. Sem nenhuma recomendação, a seção e o link dela na barra SHALL ficar
fora da página.

#### Scenario: Sem recomendações cadastradas
- **WHEN** a lista de recomendações está vazia
- **THEN** a página não mostra a seção nem o link "Recomendações", e nenhuma âncora fica quebrada

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
