## Purpose

Define como as recomendações reais do LinkedIn aparecem no portfólio, como no portfólio de referência: uma em destaque e
as outras num carrossel que funciona com ponteiro, toque, teclado e leitor de tela, e que continua completo sem
JavaScript e com movimento reduzido.

## ADDED Requirements

### Requirement: Recomendação com autoria
Cada recomendação SHALL mostrar o texto exato aprovado pela dona, o nome, o cargo e a empresa de quem escreveu (como estão
no LinkedIn), a relação de trabalho e o mês e ano. No lugar da foto SHALL aparecer um círculo com as iniciais do nome,
como na referência, escondido da tecnologia assistiva; nenhuma foto de terceiros é usada.

#### Scenario: Iniciais
- **WHEN** a pessoa vê um cartão de recomendação
- **THEN** ele mostra as iniciais de quem escreveu num círculo, e o leitor de tela anuncia o nome por extenso, não as
  iniciais

#### Scenario: Texto longo com "Ler completa"
- **WHEN** a recomendação passa do número de linhas visíveis do cartão
- **THEN** o texto aparece cortado com esmaecimento e um "Ler completa", que abre o texto inteiro no próprio cartão; o
  leitor de tela sempre recebe o texto inteiro

#### Scenario: "Ler completa" pelo teclado e sem JavaScript
- **WHEN** a pessoa foca "Ler completa" com Tab e aperta Enter, com ou sem JavaScript
- **THEN** o texto inteiro aparece e o controle passa a oferecer "Fechar"

### Requirement: Recomendação em destaque
A seção SHALL abrir com uma recomendação em destaque, em texto grande, com as aspas na cor de destaque e a autoria abaixo,
e depois o carrossel com as demais, como na referência.

#### Scenario: Destaque
- **WHEN** a pessoa chega à seção de Recomendações
- **THEN** vê primeiro a recomendação em destaque e, abaixo, o carrossel com as outras

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** o destaque e os cartões aparecem no estado final, sem entrada animada

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** o destaque aparece igual, porque não depende de WebGL

### Requirement: Carrossel acessível
As recomendações SHALL ficar num carrossel com botões "anterior" e "próxima" e indicação de posição no formato da
referência ("02 / 08", com uma barra de progresso), todos traduzidos. O carrossel SHALL ter `aria-roledescription` traduzido, anunciar a recomendação atual a quem usa leitor de
tela e nunca avançar sozinho.

#### Scenario: Só com teclado
- **WHEN** a pessoa foca o botão "próxima" com Tab e aperta Enter
- **THEN** a próxima recomendação aparece, a posição é anunciada e o foco continua no botão

#### Scenario: Toque
- **WHEN** a pessoa arrasta o carrossel para o lado no celular
- **THEN** ele passa para a recomendação seguinte sem impedir a rolagem vertical da página

#### Scenario: Sem JavaScript
- **WHEN** o JavaScript está desligado
- **THEN** todas as recomendações aparecem em sequência, legíveis, numa faixa com rolagem lateral nativa

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede `prefers-reduced-motion: reduce`
- **THEN** a troca de recomendação é instantânea, sem deslizar

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** o carrossel funciona igual, porque não depende de WebGL
