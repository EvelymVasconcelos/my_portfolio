# Briefing de identidade visual — portfólio da Evelym

Preencha a parte 1 (pode ser em tópicos, do jeito que vier). Depois, cole a parte 2 numa sessão do Claude Code neste
projeto. O resultado vira a change `identidade-visual`: protótipos para comparar no navegador, e só depois o código.

---

## Parte 1 — Perguntas para você responder

### 1. Quem é você no site
1. Em uma frase, o que você quer que um recrutador pense depois de 10 segundos no site? (ex.: "ela projeta sistemas
   que não caem", "ela une pesquisa e produção")
2. Três palavras que descrevem o seu jeito de trabalhar (ex.: rigorosa, curiosa, calma, direta).
3. Três palavras que o site **não** pode transmitir (ex.: infantil, genérico, "template de dev").
4. Vaga que você busca agora: cargo, nível (pleno, sênior), remoto ou presencial, Brasil ou exterior.
5. Seu trabalho mais forte e que você quer em destaque: um sistema, uma API, um ganho medido, a pesquisa. O que você
   consegue mostrar ou contar dele sem quebrar sigilo?

### 2. Cores (roxo, preto e branco)
6. Qual roxo é o seu? Marque um ou descreva:
   - (a) violeta elétrico, vivo e tecnológico (perto de `#7C3AED`);
   - (b) lilás suave, como o atual (`#6852D6`);
   - (c) roxo profundo, quase berinjela, sóbrio (perto de `#4C1D95`);
   - (d) roxo com brilho de neon, só em detalhes, sobre preto.
7. Qual é a base?
   - (a) preto de verdade (`#0A0A0A`);
   - (b) preto azulado ou arroxeado;
   - (c) branco como base, com o preto e o roxo em blocos.
8. Qual tema abre primeiro: escuro, claro ou o do sistema da pessoa?
9. O roxo aparece onde?
   - (a) só em detalhes (links, botões, destaques);
   - (b) em blocos grandes;
   - (c) em gradientes e luzes no 3D.
10. Alguma cor de apoio que você aceita ou recusa? (ex.: um verde de "status OK" para combinar com o tema de backend)

### 3. Tipografia e tom
11. A letra dos títulos é mais:
    - (a) técnica e monoespaçada, de terminal;
    - (b) geométrica e moderna;
    - (c) com personalidade, editorial.
12. O texto do site fala:
    - (a) em primeira pessoa ("eu construo");
    - (b) em terceira pessoa ("Evelym constrói").
13. Tom:
    - (a) sério e técnico;
    - (b) técnico, mas acolhedor;
    - (c) com humor leve.

### 4. O 3D e o movimento (Three.js)
14. Qual destas ideias combina com você? Pode marcar mais de uma ou propor outra:
    - (a) **Requisições em fluxo:** pontos de luz roxa percorrem uma rede de serviços (API, fila, banco, cache). Na
      rolagem, a requisição atravessa o sistema, e cada etapa vira uma seção do site.
    - (b) **Pipeline de testes:** uma esteira 3D onde cada commit passa por build, testes e deploy. Conversa direto com a
      sua pesquisa E2E-CIFlow.
    - (c) **Esquema vivo:** tabelas e relações de um banco de dados que se montam no espaço e se reorganizam com a
      rolagem.
    - (d) **Terminal em profundidade:** linhas de log e código Python em camadas 3D, com o cursor piscando no Hero.
    - (e) **Constelação de microsserviços:** nós que se conectam e mostram resiliência; um nó cai e o tráfego desvia
      sozinho.
15. Quanto movimento você quer?
    - (a) discreto, que quase não se nota;
    - (b) presente no Hero e nas transições;
    - (c) uma história inteira contada na rolagem.
16. Algo que você **não** quer ver? (ex.: partículas genéricas, robôs, "matrix" verde)

Quem pede menos movimento no sistema e quem não tem WebGL sempre recebe uma versão estática bonita, então pode sonhar
com o 3D sem medo.

### 5. Referências
17. Até 5 sites de que você gosta (de qualquer área) e o que gosta em cada um. Pode colar prints em `inspirations/`.
18. Algum portfólio de dev backend que você achou bom ou ruim, e por quê?

### 6. Conteúdo
19. Quer uma seção de **projetos** com estudos de caso (problema, arquitetura, decisão, resultado)? Quais, e o que pode
    ser mostrado?
20. A **pesquisa** (ICSCA 2026, IEEE SEAI 2024, TCC) fica como seção própria com o mesmo peso da experiência?
21. Quer um botão "Agendar conversa" (Google Agenda ou Calendly)? Se sim, qual link?
22. Tem recomendações do LinkedIn que possam aparecer no site, com o texto exato e o nome de quem escreveu?

---

## Parte 2 — Prompt para colar no Claude Code

```
/opsx:propose identidade-visual

Contexto: portfólio da Evelym Marinho, Engenheira de Software Backend (Python, FastAPI, Django, microsserviços,
Docker/Kubernetes, testes) e pesquisadora (ICSCA 2026/ACM, IEEE SEAI 2024). Pronomes ela/dela. O site precisa
comunicar profundidade técnica de backend: arquitetura, dados, confiabilidade e qualidade. Não pode parecer um
template de dev frontend.

Cores preferidas: roxo, preto e branco. Respostas do briefing:
[cole aqui as respostas da parte 1]

O que eu quero nesta change:
1. Use a skill montar-site-mangue como roteiro (pesquisa de referências, conceitos, protótipos navegáveis), respeitando
   as regras do CLAUDE.md. Em especial: rolagem nativa sem Lenis, só lucide-react, conteúdo em HTML real no servidor,
   e o LCP nunca dependendo de canvas.
2. Proponha 3 direções visuais diferentes dentro de roxo/preto/branco. Para cada uma:
   - paleta com tokens para claro e escuro e contraste AA conferido em cada par texto/fundo;
   - tipografia (até 3 famílias, com o peso em KB);
   - um conceito de cena 3D em Three.js ligado a backend (a partir da minha resposta 14);
   - uma frase de Hero escrita a partir do currículo, sem inventar nada.
3. Monte um protótipo HTML navegável de cada direção em design/prototipos/, com claro e escuro, versão sem WebGL e
   versão com movimento reduzido, para eu comparar no navegador.
4. Depois que eu escolher, escreva os artefatos da change identidade-visual (proposal, specs, design e tasks). A cena 3D
   em si fica para a change cena-3d.

Regras: nada de dados inventados (fonte: curriculum/*.pdf). Pergunte quando faltar informação. Avalie cada direção pelas
10 heurísticas de Nielsen e pelo WCAG 2.2 AA.
```
