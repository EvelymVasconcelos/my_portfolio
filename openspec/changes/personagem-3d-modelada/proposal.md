## Why

A personagem do Hero é montada no código com esferas, cilindros e cascas (`components/scene/hero-scene.ts`). Depois de
várias rodadas de ajuste (2026-11-20 a 2026-11-22), ela chegou ao limite desse método: o rosto não fica fino nem
expressivo como a dona pediu, o cabelo é uma casca e o corpo parece de bloco. A dona quer a qualidade de um jogo ou de
uma animação de cinema, com rosto fino, queixo pequeno, olhos grandes e traços parecidos com os dela. Esse nível exige
um modelo esculpido de verdade, feito numa ferramenta 3D.

## What Changes

- A personagem passa a ser um modelo 3D feito no Blender, a partir de uma base humana de licença livre (MPFB, a extensão
  do MakeHuman para o Blender, com modelos CC0), ajustada por script ao rosto da Evelym no estilo de animação:
  - rosto fino, queixo pequeno, olhos grandes e amendoados, nariz fino;
  - cabelo preto até os ombros, repartido ao meio, em mechas de verdade (não uma casca);
  - moletom lilás com capuz e cordões, e o headphone.
- O modelo tem esqueleto só onde a cena precisa: cabeça, braços, mãos e dedos (para digitar) e pálpebras (para piscar).
- O modelo é gerado por scripts versionados no repositório, que qualquer pessoa roda de novo para obter o mesmo arquivo.
  O arquivo final é um glTF binário (`.glb`) comprimido, servido como arquivo estático.
- A cena atual continua: mesa, notebook, caneca da Evelym, garrafa, planta, os três painéis (código, testes e deploy),
  a história de 24 segundos, a reação ao ponteiro, à rolagem e ao tema, os pôsteres e todas as alternativas (sem WebGL,
  movimento reduzido, economia de dados, aparelho fraco).
- A personagem feita no código sai de `hero-scene.ts`.

**O que quem visita percebe:** no lugar da boneca de formas simples, aparece uma personagem com acabamento de animação
de cinema, com pele, olhos e cabelo realistas, digitando, piscando e acompanhando o ponteiro com a cabeça. Quem não
recebe a cena (sem WebGL, movimento reduzido, celular fraco) vê a imagem estática dessa mesma personagem nova. A página
abre igual: o modelo chega depois do conteúdo, como a cena chega hoje.

## Fora do escopo

- Os objetos da mesa, os painéis e o fundo: continuam feitos no código.
- Fala, sincronia labial e expressões além de piscar e de um leve sorriso.
- Escaneamento 3D do rosto, fotogrametria ou rosto gerado por IA a partir das fotos.
- Corpo inteiro: só o que aparece atrás da mesa (cabeça, tronco, braços e mãos).
- Outras seções do site.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `cena-3d`: a personagem deixa de ser "só geometria procedural, sem modelos externos" e passa a ser um modelo 3D com
  origem e licença rastreáveis, gerado por scripts no repositório. O limite de custo ganha um orçamento para o modelo
  baixado. O cabelo passa a ser repartido ao meio (decisão da dona em 2026-11-20).

## Impact

- **Dependência:** a spec `cena-3d` nasce na change `estrutura-movimento-e-cena-3d`. Esta change é arquivada depois dela.
- **Código:**
  - `components/scene/hero-scene.ts`: sai a personagem feita no código e entram o carregamento do modelo, a animação dos
    ossos e a troca de cores pelo tema;
  - `scripts/personagem/`: scripts do Blender (Python) que geram o modelo;
  - `public/models/`: o `.glb` final;
  - `public/images/scene/`: os pôsteres, gerados de novo.
- **Ferramentas, fora do site:**
  - Blender 5.3 (Flatpak, instalado no usuário em 2026-11-22) e a extensão MPFB com os modelos CC0;
  - uma ferramenta de linha de comando para comprimir o `.glb`, só no desenvolvimento.
- **Navegador:** o carregador de glTF do Three.js e, se a compressão escolhida exigir, um decodificador. O peso de cada um
  entra na design.
- **Licenças:** os modelos do MPFB são CC0. A origem de cada parte (base, cabelo, roupa) fica registrada no repositório.
- **Trabalho:** no branch `personagem-3d-modelada`, separado do `nova-versao`.
