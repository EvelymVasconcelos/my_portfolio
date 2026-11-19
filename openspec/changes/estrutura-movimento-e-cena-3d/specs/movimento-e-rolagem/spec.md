## Purpose

Define as animações da página ligadas à rolagem (títulos, entradas, pilha de cartões, parallax e a sequência presa da
arquitetura) e a transição de tema, com o comportamento obrigatório para movimento reduzido, teclado, falta de WebGL e
JavaScript desligado.

## ADDED Requirements

### Requirement: Rolagem nativa

A página SHALL usar a rolagem nativa do navegador. Nenhum efeito SHALL substituir, suavizar ou sequestrar a rolagem, nem
mudar a velocidade dela, nem impedir que a pessoa pare ou volte em qualquer ponto.

#### Scenario: Rolagem com roda, teclado e toque

- **WHEN** a pessoa rola com a roda do mouse, as teclas Page Down, espaço e setas, ou o dedo no celular
- **THEN** a página anda na mesma distância e velocidade que uma página sem efeitos

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a rolagem continua nativa e nenhum elemento se move por causa dela

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** a rolagem e os efeitos de página funcionam igual, porque não dependem de WebGL

### Requirement: Entrada de títulos e blocos

Os títulos de seção SHALL entrar palavra por palavra e os blocos de conteúdo SHALL subir e aparecer quando entram na tela.
O título SHALL manter o nome acessível inteiro (as palavras separadas ficam escondidas da tecnologia assistiva) e o
conteúdo SHALL estar no HTML no estado final, para nada ficar invisível se a animação não rodar.

#### Scenario: Título lido inteiro

- **WHEN** o leitor de tela chega ao título de uma seção animada
- **THEN** ele anuncia a frase inteira uma vez, sem soletrar as palavras separadas

#### Scenario: Conteúdo que chega pela âncora

- **WHEN** a pessoa pula direto para `#pesquisa` por um link
- **THEN** o título e os cartões da seção estão visíveis assim que a rolagem termina, sem espaço vazio

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** títulos e blocos aparecem no estado final, sem deslocamento nem opacidade animada

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** títulos e blocos animam do mesmo jeito

#### Scenario: Foco do teclado em bloco animado

- **WHEN** a pessoa leva o foco com Tab a um link dentro de um bloco que ainda não entrou
- **THEN** o bloco aparece no estado final antes de o foco ficar visível nele

### Requirement: Sequência presa da arquitetura

A seção Sobre SHALL terminar com uma sequência presa à rolagem, sem virar uma seção nova, em que a arquitetura de um sistema se monta em
etapas na ordem requisição, serviços, dados, testes e deploy. Cada etapa SHALL ter um texto curto em HTML, ligado à
competência real do currículo. O estado visual SHALL ser determinado só pela posição da rolagem, nos dois sentidos, e a
sequência SHALL soltar a página no fim, sem prender a pessoa.

#### Scenario: Ida e volta

- **WHEN** a pessoa rola até o meio da sequência e depois volta
- **THEN** a arquitetura desmonta na ordem inversa, e o mesmo ponto da rolagem mostra sempre o mesmo estado

#### Scenario: Teclado

- **WHEN** a pessoa atravessa a sequência só com Tab e Page Down
- **THEN** todas as etapas e seus textos ficam visíveis em ordem, e nenhum foco fica preso dentro da sequência

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a sequência não fica presa e mostra as etapas como uma lista em ordem, cada uma com o diagrama no estado final

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** a sequência funciona com o diagrama em SVG ou HTML, porque não depende de WebGL

#### Scenario: Celular

- **WHEN** a tela tem 390 px de largura
- **THEN** a sequência usa no máximo duas telas de altura de rolagem por etapa, o texto não cobre o diagrama e não há
  rolagem lateral

### Requirement: Pilha de cartões e parallax contidos

A página SHALL ter no máximo duas cenas presas à rolagem (contando a da arquitetura). O parallax SHALL deslocar elementos
no máximo 15% da altura deles, e nenhum efeito SHALL atrapalhar a leitura do texto que está na tela.

#### Scenario: Pilha de cartões

- **WHEN** a seção com a pilha de cartões passa pela tela
- **THEN** cada cartão fica legível por inteiro antes de o próximo cobri-lo

#### Scenario: Teclado na pilha

- **WHEN** a pessoa leva o foco com Tab a um link num cartão da pilha
- **THEN** o cartão com o foco fica inteiro visível, por cima dos outros

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** os cartões aparecem empilhados em fluxo normal e nenhum elemento tem parallax

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** a pilha e o parallax funcionam igual

### Requirement: Transição circular do tema

Ao trocar o tema, o tema novo SHALL se espalhar num círculo que nasce no botão de tema, inclusive quando a troca é feita
pelo teclado. Onde o navegador não oferece suporte à transição, a troca SHALL ser instantânea.

#### Scenario: Troca pelo teclado

- **WHEN** a pessoa aperta Enter no botão de tema
- **THEN** o círculo nasce no centro do botão e o foco continua nele

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a troca de tema é instantânea, sem círculo

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** a transição funciona igual, e a imagem estática da cena acompanha o tema novo

### Requirement: Custo do movimento

Os efeitos de página SHALL animar só `transform`, `opacity`, `clip-path` e variáveis CSS, sem forçar novo cálculo de
layout a cada quadro. O JavaScript de movimento SHALL carregar sem atrasar o LCP e não SHALL fazer o INP passar de 200 ms
no celular.

#### Scenario: Medição no celular

- **WHEN** o Lighthouse roda no perfil de celular em `/pt`
- **THEN** o LCP fica abaixo de 2,5 s, o CLS abaixo de 0,1 e o TBT abaixo de 200 ms

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** nenhum laço de animação fica rodando

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** o custo dos efeitos de página continua dentro do mesmo orçamento

### Requirement: Apresentação interativa no Hero e no Sobre
O Hero SHALL ter dois efeitos que respondem ao ponteiro: o nome com as letras entrando uma a uma e uma onda sob o
ponteiro; e um brilho de destaque no fundo que acompanha o ponteiro, com as formas do fundo reagindo à posição dele. O
Sobre SHALL ter a foto de perfil inclinando em 3D conforme o ponteiro, com um reflexo de luz, e os números dos fatos
contando até o valor ao aparecer. Os efeitos SHALL existir só com ponteiro fino (`hover: hover` e `pointer: fine`) e sem movimento reduzido. Eles
MUST NOT mudar a largura nem a posição do texto (nada de reflow), MUST NOT reduzir o contraste abaixo do AA e MUST NOT
rodar código a cada quadro quando o ponteiro está parado. Os números SHALL ser os do currículo.

#### Scenario: Nome sob o ponteiro
- **WHEN** a pessoa passa o mouse sobre o nome no computador
- **THEN** as letras perto do ponteiro sobem e ganham a cor de destaque, e voltam quando ele sai, sem nenhuma letra
  cortada (curvas e pingos inteiros)

#### Scenario: Nome lido inteiro
- **WHEN** o leitor de tela chega ao título do Hero
- **THEN** ele lê o nome como uma frase, não letra por letra

#### Scenario: Luz que segue o ponteiro
- **WHEN** a pessoa move o mouse pelo Hero
- **THEN** o brilho do fundo acompanha o ponteiro e as formas do fundo se deslocam de leve, sem tapar nem esmaecer o texto

#### Scenario: Foto de perfil no Sobre
- **WHEN** a pessoa passa o mouse sobre a foto do Sobre
- **THEN** a foto inclina na direção do ponteiro, com um reflexo que acompanha, e volta ao plano quando o ponteiro sai

#### Scenario: Toque, movimento reduzido ou sem JavaScript
- **WHEN** a página é aberta num celular, com `prefers-reduced-motion: reduce` ou com o JavaScript desligado
- **THEN** o nome, o fundo e a foto aparecem no estado final, parados, e os números mostram o valor final
