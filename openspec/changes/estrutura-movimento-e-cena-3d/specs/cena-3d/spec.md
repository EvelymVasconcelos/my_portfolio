## Purpose

Define a cena 3D de backend do Hero: quando ela roda ou não, como substitui a imagem estática, como reage ao ponteiro, à
rolagem e ao tema, o que ela precisa comunicar sobre arquitetura e deploy e os limites de custo que não pode passar.

## ADDED Requirements

### Requirement: Imagem estática como estado final
O Hero SHALL renderizar no servidor uma imagem estática com a mesma composição do primeiro quadro da cena, nos temas claro
e escuro, com `alt` traduzido que descreve o que a cena mostra. Essa imagem SHALL ser o resultado final para quem não
recebe a cena, e o LCP da página SHALL ser um elemento de texto ou essa imagem, nunca o canvas.

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a cena não carrega, e a imagem estática do tema atual fica no lugar, sem nenhum download de Three.js

#### Scenario: Sem WebGL
- **WHEN** o navegador não consegue criar um contexto WebGL
- **THEN** a imagem estática fica no lugar, sem erro no console

#### Scenario: Economia de dados ou aparelho fraco
- **WHEN** o navegador indica economia de dados, ou o aparelho tem 4 GB de memória ou menos e até 4 núcleos
- **THEN** a imagem estática fica no lugar

#### Scenario: Falha da cena
- **WHEN** o módulo da cena não carrega, ou o contexto WebGL se perde depois de criado
- **THEN** a imagem estática volta ao lugar e o resto da página não é afetado

### Requirement: Carregamento depois do conteúdo
A cena SHALL carregar por import dinâmico, só no navegador, depois do LCP e com o navegador ocioso. Ao ficar pronta, SHALL
substituir a imagem sem salto de layout e sem diferença visível de composição.

#### Scenario: Troca da imagem pela cena
- **WHEN** a cena termina de carregar num computador com WebGL
- **THEN** ela aparece por cima da imagem estática na mesma posição, e o CLS da troca é zero

#### Scenario: Movimento reduzido ligado depois
- **WHEN** a cena está rodando e a pessoa liga o movimento reduzido no sistema
- **THEN** a cena para e dá lugar à imagem estática

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** o Three.js não é baixado

### Requirement: Evelym programando, com o trabalho de backend à vista
A cena SHALL mostrar a Evelym como personagem 3D estilizada (pele dourada, cabelo preto em chanel com risca de lado,
moletom roxo, headphone), concentrada, programando num notebook, e em volta o trabalho de backend em três painéis: o
código Python de uma API sendo digitado, os testes automáticos rodando e passando, e o selo de deploy em produção. A
história SHALL rodar sozinha, devagar (um ciclo de cerca de 24 segundos), para quem olha o Hero ver o fim dela. A cena
SHALL usar só geometria procedural, sem modelos externos e sem logotipos de terceiros. O texto dos painéis vem de
`messages/` nos três idiomas (decisão da dona em 2026-11-19; a arquitetura continua contada na sequência do Sobre).

#### Scenario: Leitura sem a cena
- **WHEN** a pessoa usa leitor de tela
- **THEN** o canvas fica escondido da tecnologia assistiva, e a descrição da cena está disponível em texto traduzido

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a imagem estática mostra a Evelym programando, com os três painéis visíveis

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** a imagem estática e a descrição em texto comunicam o mesmo conceito

### Requirement: Resposta ao ponteiro, à rolagem e ao tema
A cena SHALL reagir de leve ao ponteiro (a câmera e a cabeça acompanham) e aproximar a câmera conforme a rolagem, sem
prender a rolagem. Ela SHALL trocar de cores junto com o tema, sem recarregar.

#### Scenario: Teclado
- **WHEN** a pessoa navega só com o teclado, sem ponteiro
- **THEN** a cena continua avançando pela rolagem, nenhum controle depende do ponteiro e o canvas não recebe foco

#### Scenario: Toque
- **WHEN** a pessoa usa tela de toque
- **THEN** a cena não reage a arrasto que impeça a rolagem da página

#### Scenario: Troca de tema
- **WHEN** a pessoa troca o tema com a cena rodando
- **THEN** a cena passa para as cores do tema novo no mesmo quadro da transição de tema

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** nada reage ao ponteiro nem à rolagem, porque a imagem estática está no lugar

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** a imagem estática troca para a versão do tema novo

### Requirement: Limites de custo
A cena SHALL limitar a densidade de pixels a 2 (1,5 em telas de toque), pausar fora da tela e com a aba oculta, não
alocar memória por quadro e liberar todos os recursos ao sair. O código da cena SHALL somar no máximo 200 KB gzip,
baixados só quando ela vai rodar. Se a média de quadros cair abaixo de 30 por segundo por 3 segundos, a cena SHALL reduzir
a qualidade e, se não bastar, dar lugar à imagem.

#### Scenario: Fora da tela
- **WHEN** a pessoa rola até a seção de Contato
- **THEN** a cena para de desenhar quadros

#### Scenario: Aparelho lento
- **WHEN** a cena roda abaixo de 30 quadros por segundo por 3 segundos
- **THEN** ela diminui a densidade de pixels e, persistindo a lentidão, dá lugar à imagem estática

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** nenhum quadro da cena é desenhado

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** nada da cena é baixado nem executado
