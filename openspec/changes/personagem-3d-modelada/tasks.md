## 1. Ferramentas e base humana

Termina com: um render de teste da base do MPFB saindo do Blender por script, sem abrir a interface.

- [x] 1.1 Instalar a extensão MPFB e o pacote de modelos de sistema (CC0) no Blender 5.3 do Flatpak, por linha de comando,
      e conferir que o Python do Blender chama o MPFB sem interface. Se não funcionar, aplicar o plano do risco da design
      (Blender 4.5 LTS numa pasta do usuário)
- [x] 1.2 Criar `scripts/personagem/` com o script de geração (`gerar.py`), um script de renders (`render.py`) e um
      `npm run personagem` que chama o Blender sem interface, com as versões das ferramentas fixadas
- [x] 1.3 Criar `scripts/personagem/ORIGEM.md` com a fonte, a versão e a licença de cada parte usada (D1)
- [x] 1.4 Gerar a base humana (mulher adulta, proporções da Evelym) com esqueleto, olhos, sobrancelhas e cílios, e
      renderizar frente, três quartos e perfil

## 2. Rosto e estilo (protótipo: renders para a dona aprovar)

Termina com: a página `design/prototipos/personagem-3d/index.html` com os renders, aberta no Chrome para a dona.

- [x] 2.1 Ajustar os parâmetros do MPFB pelas fotos da dona: rosto fino, queixo pequeno, nariz fino, olhos amendoados
      castanho-escuros, pele dourada (D2)
- [ ] 2.2 Aplicar a forma extra do estilo de animação por regiões (olhos e órbitas maiores, mandíbula mais fina, queixo
      mais curto), com quedas suaves e sem emenda (D2)
- [x] 2.3 Cabelo preto até os ombros repartido ao meio, do pacote do MPFB ou em mechas geradas por script (D3)
- [x] 2.4 Moletom lilás com capuz e cordões, do pacote do MPFB ou gerado a partir do corpo (D3)
- [x] 2.5 Renders de frente, três quartos e perfil, com luz parecida com a da cena, na página do protótipo (D8)
- [x] 2.6 A dona aprova os renders, ou pede ajustes (cada rodada é mudança de parâmetro e renders novos)

## 3. Arquivo do modelo

Termina com: o `.glb` em `public/models/` dentro do orçamento, aberto numa página de teste local.

- [ ] 3.1 Reduzir o esqueleto aos ossos da cena (cabeça, braços, mãos, dedos, pálpebras ou forma de olho fechado) e fundir
      o resto ao osso pai (D4)
- [x] 3.2 Exportar o glTF binário com as texturas e comprimir com o glTF-Transform (meshopt e WebP, versão fixada), com o
      nome trocando a cada versão (D6, D7)
- [x] 3.3 Conferir as metas: até 40 mil triângulos, texturas de até 1024 px (pele até 2048, se fizer diferença) e até 1,5 MB
- [ ] 3.4 Rodar a geração duas vezes e conferir que a contagem de vértices é a mesma e o tamanho difere menos de 1% (spec:
      modelo reproduzível)

## 4. Integração na cena

Termina com: a cena no navegador local com a personagem nova digitando, piscando e seguindo o ponteiro.

- [x] 4.1 Tirar a personagem feita no código de `hero-scene.ts`, mantendo mesa, objetos, painéis, luzes, câmera e história
- [ ] 4.2 Carregar o modelo com o `GLTFLoader` e o `MeshoptDecoder`, em paralelo ao módulo da cena, e manter o pôster se o
      modelo falhar (D7)
- [x] 4.3 Trocar os materiais pelos de `MeshPhysicalMaterial` (pele, cabelo, olhos e moletom com a cor do tema) (D5)
- [x] 4.4 Prender o headphone feito no código ao osso da cabeça (D3)
- [ ] 4.5 Mover os ossos pelo código: braços ao teclado por cinemática inversa de dois ossos, dedos digitando junto com o
      painel de código, cabeça seguindo o ponteiro e piscada (D4)
- [ ] 4.6 Liberar geometrias, texturas e esqueleto ao destruir a cena
- [x] 4.7 Gerar os pôsteres de novo (`npm run scene:posters`) e comparar com a cena rodando, nos dois temas
- [ ] 4.8 A dona confere a cena no navegador local

> Primeira integração em 2026-11-23, a pedido da dona ("vamos ver como fica na cena, com o moletom"), antes do fim do
> bloco 2 e do bloco 3:
>
> - o rosto vem do retrato projetado (rodada 6), com cabelo preto; moletom com mangas, tronco, capuz e cordões feitos
>   por script (`moletom.py` e `exportar.py`);
> - `npm run personagem:exportar` grava `public/models/evelym.glb`: 2,23 MB, 44.674 triângulos, ainda sem compressão
>   (3.2) e com o esqueleto inteiro (3.1). A meta de 1,5 MB e 40 mil triângulos fica para o bloco 3;
> - a cena carrega o modelo pelo `GLTFLoader` (código da cena: 125,1 → 148,5 kB gzip), prende os fones ao centro da
>   cabeça, usa o material do tema no moletom e mexe os dedos, as mãos e a cabeça pelos ossos;
> - ajustes de 2026-11-23, pedidos pela dona: moletom numa peça só (tronco e mangas na mesma folga, alisado, sem a blusa
>   curta do pacote; a máscara da blusa apagava a pele do peito e abria buracos), cabelo em três camadas repicadas, com
>   ondulação e pontas irregulares, faces viradas para fora e material próprio na cena (preto com fios de tons
>   variados, brilho discreto e pontas desfiadas), piscada (forma "piscar" nas pálpebras e nos cílios) e respiração;
> - modelo agora com 2,77 MB e 53.734 triângulos: a compressão e o enxugamento do bloco 3 precisam trazê-lo à meta;
> - braços (2026-11-23, decisão da dona): a tampa do notebook escondia antebraços e mãos, e os braços pareciam tocos. A
>   tampa abriu mais (cerca de 125°), a câmera subiu (1,55 → 2,3) e os cotovelos abriram; o moletom cai reto na frente
>   do tronco e não marca o corpo; os cordões descem por cima do tecido;
> - enquadramento final (2026-11-23, decisão da dona): a cena inteira, com a câmera de volta ao ângulo original, e a
>   tampa do notebook em pé, cobrindo o peito e os braços; acima dela aparecem só a cabeça, o capuz e o alto dos ombros;
> - compressão (3.2 e 3.3): `npm run personagem:comprimir` (glTF-Transform 4.5.1: dedup, prune mantendo o
>   `centro_cabeca`, texturas de até 1024 px em WebP e meshopt) leva o modelo de 2,60 MB a 0,64 MB (427 kB com gzip); a
>   cena usa o `MeshoptDecoder` e passa a 154,9 kB gzip. A expressão fica neutra (decisão da dona); o esqueleto não foi
>   reduzido (3.1), porque o arquivo já está dentro da meta;
> - testes: 114 de unidade e 72 de navegador passando; os testes de estrutura e contato foram atualizados para as
>   Recomendações e o "Agendar call", os de movimento esperam o `data-motion="ready"` e as capturas visuais foram
>   refeitas;
> - sorriso animado (2026-11-23, ideia da dona): forma "sorriso" no corpo (cantos da boca, largura da boca e maçãs do
>   rosto); ela fica séria e sorri de leve quando o selo vira "Em produção" (16 s), voltando a ficar séria antes do quadro
>   do pôster (20 s), que segue neutro;
> - falta: o carregamento em paralelo do modelo (4.2) e o resto do bloco 5.

## 5. Desempenho e fechamento

- [ ] 5.1 Medir: código da cena (até 200 kB gzip), modelo (até 1,5 MB), quadros por segundo na Iris Xe e com a CPU 4x mais
      lenta, e conferir que o modelo não é baixado antes do LCP. Registrar em `docs/otimizacao-de-desempenho.md`
- [ ] 5.2 Testes de navegador: modelo que não carrega (pôster fica), movimento reduzido e sem WebGL (modelo não é
      baixado), e a cena só com teclado
- [ ] 5.3 Conferir no navegador, de verdade, movimento reduzido e WebGL desligado
- [ ] 5.4 Conferir em pt/en/es, claro/escuro, celular e computador, teclado e leitor de tela, com o axe sem violações
      WCAG 2.2 AA
- [ ] 5.5 `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` e `npm run build` passando
- [ ] 5.6 Lighthouse no perfil de celular em `/pt`: LCP abaixo de 2,5 s, CLS abaixo de 0,1, sem piora em relação ao
      `nova-versao`
- [ ] 5.7 Rodar `graphify update .` e, com a aprovação da dona, juntar o branch ao `nova-versao`
