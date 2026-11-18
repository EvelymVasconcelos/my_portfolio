## Purpose

Define a identidade visual em roxo, preto e branco: os tokens de cor dos temas claro e escuro com contraste verificado,
a tipografia com orçamento de peso, o tema inicial e a troca de tema sem divergência de hidratação.

## ADDED Requirements

### Requirement: Identidade aprovada em protótipo
A identidade visual (paleta, tipografia, raio, espaçamento e conceito da cena) SHALL ser a escolhida pela dona numa rodada
de protótipos HTML navegáveis em `design/prototipos/`, antes de qualquer código de produção. A escolha SHALL ficar
registrada na design.md desta change, com a data.

#### Scenario: Código antes da escolha
- **WHEN** ainda não há direção escolhida e registrada
- **THEN** nenhum token, fonte ou componente da identidade nova entra no código do site

### Requirement: Cores por tokens com contraste AA
Todas as cores do site SHALL vir de tokens definidos em CSS para os temas claro e escuro. Todo par de texto e fundo usado
SHALL ter contraste de pelo menos 4,5:1 (3:1 para texto grande), e bordas de campos e controles, pelo menos 3:1 contra o
fundo, nos dois temas.

#### Scenario: Verificação automática de contraste
- **WHEN** os testes rodam
- **THEN** um teste calcula o contraste de cada par de tokens declarado como texto/fundo e falha se algum ficar abaixo do
  mínimo

#### Scenario: Cor fora dos tokens
- **WHEN** um componente usa uma cor literal (hex, rgb) fora do arquivo de tokens
- **THEN** a revisão ou o lint aponta o uso, exceto nas cores próprias de logos de marca

### Requirement: Tipografia com orçamento
O site SHALL usar no máximo três famílias tipográficas, servidas do próprio domínio, com até 120 KB de fonte no
carregamento inicial e sem deslocamento de layout visível quando a fonte termina de carregar.

#### Scenario: Peso das fontes
- **WHEN** o build de produção é medido no carregamento de `/pt`
- **THEN** a soma dos arquivos de fonte baixados antes da interação é de 120 KB ou menos

#### Scenario: Troca de fonte sem salto
- **WHEN** a fonte final substitui a fonte de reserva
- **THEN** o CLS da página continua abaixo de 0,1

### Requirement: Tema inicial e troca sem divergência
O tema inicial SHALL ser o escolhido no protótipo (claro, escuro ou o do sistema), e a escolha da pessoa SHALL ser
lembrada entre visitas e entre idiomas. A classe do tema SHALL estar aplicada antes da primeira pintura, sem piscar e sem
aviso de divergência de hidratação.

#### Scenario: Primeira visita
- **WHEN** alguém abre o site pela primeira vez
- **THEN** a página pinta direto no tema inicial definido, sem trocar de cor depois de carregar

#### Scenario: Tema lembrado ao trocar de idioma
- **WHEN** a pessoa escolhe o tema escuro em `/pt` e troca para `/en`
- **THEN** `/en` abre no tema escuro, sem piscar o claro

#### Scenario: Troca de tema pelo teclado
- **WHEN** a pessoa foca o botão de tema com Tab e aperta Enter ou Espaço
- **THEN** o tema troca, o rótulo do botão passa a descrever a próxima troca no idioma da página e o foco continua no
  botão

#### Scenario: Hidratação sem divergência
- **WHEN** o teste de hidratação roda nos dois temas
- **THEN** nenhum aviso de divergência é emitido
