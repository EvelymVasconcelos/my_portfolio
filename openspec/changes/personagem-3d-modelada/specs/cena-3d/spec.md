## MODIFIED Requirements

### Requirement: Evelym programando, com o trabalho de backend à vista

A cena SHALL mostrar a Evelym como personagem 3D com acabamento de animação de cinema (rosto fino, queixo pequeno, olhos
grandes e amendoados castanho-escuros, nariz fino, pele dourada, cabelo preto até os ombros repartido ao meio, moletom
lilás com capuz e headphone), concentrada, programando num notebook, e em volta o trabalho de backend em três painéis: o
código Python de uma API sendo digitado, os testes automáticos rodando e passando, e o selo de deploy em produção. A
história SHALL rodar sozinha, devagar (um ciclo de cerca de 24 segundos), para quem olha o Hero ver o fim dela. A
personagem SHALL digitar com as duas mãos enquanto o código aparece, piscar de vez em quando e acompanhar o ponteiro com a
cabeça. A personagem SHALL vir de um modelo 3D com origem e licença registradas no repositório; os objetos da mesa, os
painéis e o fundo continuam feitos no código. A cena SHALL não mostrar logotipos de terceiros. O texto dos painéis vem de
`messages/` nos três idiomas (decisão da dona em 2026-11-19; a arquitetura continua contada na sequência do Sobre).

#### Scenario: Leitura sem a cena

- **WHEN** a pessoa usa leitor de tela
- **THEN** o canvas fica escondido da tecnologia assistiva, e a descrição da cena está disponível em texto traduzido

#### Scenario: Personagem digitando

- **WHEN** a cena roda num computador com WebGL e o código do painel está sendo digitado
- **THEN** as mãos da personagem se movem sobre o teclado, e elas param de digitar quando o código termina

#### Scenario: Teclado

- **WHEN** a pessoa navega só com o teclado
- **THEN** a personagem continua animada pela história, e nada nela recebe foco nem depende do ponteiro

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a imagem estática mostra a Evelym, no modelo novo, programando, com os três painéis visíveis

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** a imagem estática do modelo novo e a descrição em texto comunicam o mesmo conceito, e o modelo 3D não é baixado

### Requirement: Limites de custo

A cena SHALL limitar a densidade de pixels a 2 (1,5 em telas de toque), pausar fora da tela e com a aba oculta, não
alocar memória por quadro e liberar todos os recursos ao sair, inclusive os do modelo da personagem. O código da cena
SHALL somar no máximo 200 KB gzip, e o modelo da personagem no máximo 1,5 MB transferidos, os dois baixados só quando a
cena vai rodar. Se a média de quadros cair abaixo de 30 por segundo por 3 segundos, a cena SHALL reduzir a qualidade e,
se não bastar, dar lugar à imagem.

#### Scenario: Fora da tela

- **WHEN** a pessoa rola até a seção de Contato
- **THEN** a cena para de desenhar quadros

#### Scenario: Aparelho lento

- **WHEN** a cena roda abaixo de 30 quadros por segundo por 3 segundos
- **THEN** ela diminui a densidade de pixels e, persistindo a lentidão, dá lugar à imagem estática

#### Scenario: Modelo que não carrega

- **WHEN** o arquivo do modelo da personagem não chega ou chega corrompido
- **THEN** a imagem estática fica no lugar, sem erro visível na página, e o resto da página não é afetado

#### Scenario: Página aberta pela primeira vez

- **WHEN** a página `/pt` abre num celular, com o cache vazio
- **THEN** o modelo da personagem não está entre os arquivos baixados antes do LCP

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** nenhum quadro da cena é desenhado e o modelo da personagem não é baixado

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** nada da cena é baixado nem executado

## ADDED Requirements

### Requirement: Modelo da personagem reproduzível e de origem livre

O modelo da personagem SHALL ser gerado por scripts versionados no repositório, a partir de partes com licença que
permite uso e modificação num site público (CC0 ou equivalente). A origem e a licença de cada parte (base do corpo e do
rosto, cabelo, roupa, headphone) SHALL ficar registradas num arquivo do repositório ao lado dos scripts. Rodar os scripts
de novo, com as mesmas versões das ferramentas, SHALL produzir um modelo com a mesma forma e o mesmo peso.

#### Scenario: Gerar o modelo de novo

- **WHEN** alguém roda o script de geração do modelo numa máquina com as ferramentas registradas
- **THEN** sai um arquivo de modelo com a mesma contagem de vértices e um tamanho com diferença menor que 1% do versionado

#### Scenario: Conferir a licença

- **WHEN** alguém quer saber de onde veio uma parte da personagem
- **THEN** o arquivo de origem nos scripts diz a fonte, a versão e a licença dessa parte

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a imagem estática, gerada a partir do mesmo modelo, mostra a personagem igual à da cena

#### Scenario: Sem WebGL

- **WHEN** o navegador não tem WebGL
- **THEN** a imagem estática, gerada a partir do mesmo modelo, mostra a personagem igual à da cena
