## Purpose

Define como as recomendações reais do LinkedIn aparecem no portfólio: um carrossel que funciona com ponteiro, toque,
teclado e leitor de tela, e que continua completo sem JavaScript e com movimento reduzido.

## ADDED Requirements

### Requirement: Recomendação com autoria
Cada recomendação SHALL mostrar o texto exato aprovado pela dona, o nome, o cargo e a empresa de quem escreveu (como estão
no LinkedIn) e o mês e ano. Uma foto de quem escreveu SHALL aparecer só se a dona fornecer a foto com autorização; sem
ela, nenhuma imagem de pessoa, iniciais ou silhueta ocupa o lugar.

#### Scenario: Sem foto
- **WHEN** uma recomendação não tem foto autorizada
- **THEN** o cartão mostra só o texto e a autoria, sem espaço vazio de imagem

#### Scenario: Texto longo
- **WHEN** a recomendação tem mais de 600 caracteres
- **THEN** o cartão mostra o texto inteiro, sem cortar com reticências

### Requirement: Carrossel acessível
As recomendações SHALL ficar num carrossel com botões "anterior" e "próxima" e indicação de posição ("2 de 5"), todos
traduzidos. O carrossel SHALL ter `aria-roledescription` traduzido, anunciar a recomendação atual a quem usa leitor de
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
