# CLAUDE.md — Portfólio Evelym Marinho

Portfólio pessoal de Evelym Marinho, Engenheira de Software Backend (Python, APIs, microsserviços) e autora de pesquisas
publicadas (ICSCA 2026 na ACM, IEEE SEAI 2024). Página única em pt/en/es, tema claro e escuro. Quem lê são recrutadores
e líderes técnicos: o site é a própria prova de competência e precisa comunicar profundidade técnica de backend
(arquitetura, dados, confiabilidade, testes), não só aparência. Responder e documentar em português do Brasil.

## Comandos

```bash
npm run dev        # http://localhost:3000, redireciona para /pt
npm run lint
npm run build
npm run format     # Prettier com a configuração do projeto (.prettierrc)
npm run translate  # gera en.json e es.json a partir de pt.json pelo DeepL (precisa de DEEPL_API_KEY)
```

## Ponto de partida (medido em 2026-11-18)

Next.js 14.2 (App Router), React 18, TypeScript strict, Tailwind v3, framer-motion 11, next-intl 3, next-themes,
react-hook-form + Zod 3, lucide-react 0.400 e Resend. Node 20 na máquina. `lint` e `build` passam. A rota `/[locale]`
carrega 206 kB de JS.

Lacunas encontradas no ponto de partida:

- **Qualidade:** sem testes e sem CI. O `package-lock.json` está no `.gitignore`, então o build não é reproduzível.
- **Sem uso:** `lottie-react` e `components/animations/LottiePlayer.tsx` (nada importa), `@anthropic-ai/sdk` e
  `public/cv.pdf` (cópia idêntica de `cv-pt.pdf`; `lib/cv.ts` aponta para `cv-pt/en/es.pdf`).
- **Pesquisa sem seção:** o link "Pesquisa" da `Navbar` aponta para `#research`, que não existe na página. As
  publicações aparecem dentro de `Projects`, e as chaves `research.*` de `messages/` não são usadas.
- **Acessibilidade:** o link "Pular para o conteúdo principal" de `app/[locale]/layout.tsx` é fixo em português.
- **Formulário de contato (`app/api/contact/route.ts`):** não valida no servidor, não limita envios, põe o que a pessoa
  digitou direto no HTML do e-mail, devolve o erro do Resend para quem visita e tem o destinatário fixo no código.
- **Documentação desatualizada:** o `README.md` fala em tradução pela API do Claude (é DeepL), e o `SETUP.md` pede Node
  18+ e fala em `public/cv.pdf` (os CVs são `public/cv-pt.pdf`, `cv-en.pdf` e `cv-es.pdf`).

## Direção do upgrade

Nível dos melhores sites do mercado (Awwwards, Linear, Vercel, Apple): animações ligadas à rolagem, 3D em tempo real
(Three.js), efeitos visuais e acessibilidade de verdade, no mesmo padrão do portfólio do Francisco
(`~/Documentos/Gabriel Projetos/my-portfolio`, só leitura: referência de stack e de processo, nunca editar). A
stack-alvo está em `openspec/config.yaml`. O plano em andamento é a change `fundacao-ferramentas-e-stack`, a primeira de
cinco (a ordem está no `proposal.md` dela).

Regras que não se negociam:

- **Conteúdo primeiro:** o texto é HTML real renderizado no servidor, e o LCP nunca depende de canvas ou WebGL. Sem
  JavaScript, o portfólio continua legível.
- **Todo efeito tem alternativa:** movimento reduzido, falta de WebGL e celular fraco têm comportamento definido. 3D
  entra por import dinâmico, sem SSR, depois do LCP, e pausa fora da tela.
- **Acessibilidade WCAG 2.2 AA:** teclado em tudo, foco visível, contraste e `aria-*` traduzidos. Movimento nunca
  atrapalha a leitura nem sequestra a rolagem.
- **Hidratação sem divergência:** nada de `window`, `document` ou `localStorage` durante a renderização.
- **Biblioteca nova se justifica** pelo custo em KB e pelo que permite. Uma ferramenta por finalidade.
- **Mudança visual nova passa por protótipo** (Pencil ou HTML) antes do código.

## Conteúdo

- **O currículo é a fonte da verdade:** dados profissionais saem de `curriculum/*.pdf` (pt, en e es). Nada de
  experiência, número, data ou publicação inventada. O que não tiver fonte fica marcado para a dona validar.
- **Pronomes:** Evelym usa ela/dela em todo texto gerado, em qualquer idioma.
- **Pesquisa com destaque:** as publicações (ICSCA 2026 na ACM, IEEE SEAI 2024) são o diferencial e têm o mesmo peso
  visual da experiência.
- **Tema:** o modo claro é a experiência principal e o escuro precisa ter o mesmo cuidado. A reavaliar no briefing de
  identidade visual (`openspec/changes/fundacao-ferramentas-e-stack/briefing-identidade-visual.md`).
- **Identidade:** a identidade "Samsung Lilac" atual é provisória. A nova (roxo, preto e branco) sai do briefing, na
  change `identidade-visual`.

## Convenções

- Conteúdo em `messages/*.json`, nunca no componente. `pt.json` é a origem; `en.json` e `es.json` são gerados por
  `npm run translate` (DeepL) e revisados. Trocar por tradução à mão é decisão da dona, na change 4.
- Links internos e troca de idioma por `i18n/navigation.ts`.
- Cores por tokens de `app/globals.css`, nunca hex ou rgb no componente. Classes com `cn()` de `lib/utils.ts`.
- Ícones só de `lucide-react`. Logos de marca são componentes próprios em `components/ui/` (como o `DiscordIcon`).
- Novas telas são avaliadas contra as 10 heurísticas de usabilidade de Nielsen.

## Antes de entregar

`npm run lint`, `npm run build` e conferir no navegador: pt/en/es, claro/escuro, celular e computador, só com teclado,
movimento reduzido e WebGL desligado. Depois de mexer no código, `graphify update .`.

Commits em Conventional Commits, em português, no imperativo, com título de até 72 caracteres e sem ponto final.

## OpenSpec

Trabalho não trivial passa por uma change antes do código.

- `openspec/specs/<capability>/spec.md`: o que o site faz hoje.
- `openspec/changes/<nome>/`: mudança em andamento (`proposal.md`, `design.md`, `tasks.md` e delta de spec).
- `openspec/changes/archive/`: mudanças concluídas.

```
/opsx:explore  → (opcional) pensar antes de formalizar, sem escrever código
/opsx:propose  → cria a change com todos os artefatos
/opsx:update   → revisa os artefatos de uma change
/opsx:apply    → implementa as tasks
/opsx:sync     → aplica o delta na spec principal
/opsx:archive  → arquiva a change concluída
```

Entregar em partes: um bloco por vez, com status curto, para a dona testar no navegador local antes de seguir.

## Pencil — protótipos visuais (`.pen`)

MCP `pencil`, registrado em `.mcp.json` (o caminho do servidor é desta máquina). Protótipos em
`design/prototipos/<nome-do-fluxo>.pen`; protótipos em HTML ficam na mesma pasta.

- `.pen` é criptografado: **nunca** abrir com `Read` ou `Grep`, só pelas tools do MCP.
- As tools operam sobre o `.pen` aberto como aba ativa no VS Code. Se não estiver aberto, pedir para abrir.
- Logo depois de inserir ou atualizar nós, os diagnósticos podem vir desatualizados. Confirmar em uma chamada posterior
  antes de tratar como erro.

## Skills de site da Mangue

Instaladas na máquina, em `~/.claude/skills/`, e **não** no repositório: as três principais são da Mangue Tech, sem
licença de redistribuição declarada, e as de apoio (MIT) somam 16 MB com os exemplos. Para reinstalar em outra máquina,
copiar as pastas abaixo de `skills-mangue-codex/skills/` (pacote baixado em `~/Downloads/skills-mangue-codex`) para
`~/.claude/skills/` e abrir uma sessão nova. Sem elas, o fluxo funciona, só sem o roteiro.

- **Principal:** `montar-site-mangue` (roteiro de pesquisa, conceitos, protótipos e site em produção).
- **3D e rolagem:** `build-threejs-scroll-worlds`, `build-awwwards-quality-sites`, `cinematic-scroll-storytelling`,
  `scroll-scrubbed-visual-sequence`.
- **Texto e conversão:** `copywriting`, `copy-editing`, `stop-slop`, `cro`.
- **SEO e dados estruturados:** `seo`, `seo-audit`, `ai-seo`, `schema`.
- **Qualidade:** `accessibility`, `core-web-vitals`, `performance`, `best-practices`, `web-quality-audit`.
- **De fora:** `montar-app-mangue` e `qa-escrevendo` (o site não tem app) e as `gsap-*` (o GSAP só entra se for
  escolhido na change 4). `product-marketing` e `site-architecture`, citadas pela `montar-site-mangue`, também não
  foram instaladas.

Conflitos com as regras do projeto (vale a regra do projeto):

- a skill usa Lenis; aqui a rolagem é nativa;
- a skill usa ícones Solar; aqui só `lucide-react`;
- os scripts dos pacotes baixados (`scripts/*.sh` e afins) **não** são executados;
- as skills são a versão para o Codex: onde falam em "No Codex", ler a instrução original do Claude Code (Artifact,
  `AskUserQuestion`, subagentes).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
