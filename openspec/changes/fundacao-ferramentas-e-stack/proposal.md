## Why

O portfólio da Evelym vai ganhar o mesmo nível do portfólio do Francisco: animações ligadas à rolagem, uma cena 3D em
Three.js, identidade própria em roxo, preto e branco, e acessibilidade de verdade. Hoje o projeto não tem nada do que
torna esse trabalho seguro e rápido. Faltam:
- o fluxo de especificação (OpenSpec);
- o mapa do código (graphify);
- as skills de site da Mangue;
- testes, CI e lockfile versionado.

Ele também roda numa stack dois anos atrás da atual e tem um formulário de contato inseguro. O servidor põe o texto
digitado direto no HTML do e-mail, não valida o que recebe, não limita envios e devolve a mensagem de erro do provedor
para quem visita.

Para um site de backend, o formulário é a única parte de servidor que quem visita toca. Ele precisa mostrar o rigor que
o site promete.

Esta é a primeira de cinco changes. As outras entram depois dela, uma por vez:
1. **fundacao-ferramentas-e-stack** (esta): ferramentas, stack atual, testes, CI, formulário seguro e cabeçalhos.
2. **identidade-visual**: paleta roxo/preto/branco, tipografia, tokens e protótipo. Parte do briefing que a dona
   responde (`briefing-identidade-visual.md`, nesta pasta).
3. **cena-3d**: a cena em Three.js com um conceito de backend (escolhido no briefing), carregada depois do LCP, com
   alternativa sem WebGL e com movimento reduzido.
4. **conteudo-e-secoes**: seções renderizadas no servidor, narrativa, pesquisa com o mesmo peso da experiência,
   animações de rolagem e textos de acessibilidade traduzidos.
5. **seo-e-compartilhamento**: metadados por idioma, `hreflang`, sitemap, robots, imagem OG e dados estruturados.

## What Changes

- **Ferramentas de trabalho:**
  - **OpenSpec:** `openspec/` com o contexto e as regras do projeto, e os comandos `/opsx` no Claude Code (já
    inicializado para receber esta change).
  - **Instruções do projeto:** `claude.md` (em inglês, escrito como prompt de geração única e com a identidade "Samsung"
    antiga) vira `CLAUDE.md` em português. Ficam as regras que valem: o currículo é a fonte da verdade, ela/dela e a
    pesquisa com destaque. Entram os comandos, as regras inegociáveis, o fluxo OpenSpec e as ferramentas.
  - **graphify:** grafo do código em `graphify-out/` (fora do Git), skill e ganchos do Claude Code iguais aos do
    portfólio do Francisco.
  - **Skills de site da Mangue:** `montar-site-mangue` e as de apoio (Three.js, rolagem, copy, CRO, SEO, acessibilidade,
    Core Web Vitals), instaladas para o Claude Code. Os conflitos com as regras do projeto ficam registrados no
    `CLAUDE.md`.
  - **Pencil:** servidor MCP para protótipos em `design/prototipos/`.
- **Stack nas versões estáveis atuais**, a mesma do portfólio do Francisco: Next.js 16, React 19, next-intl 4,
  Tailwind CSS 4, Zod 4, ESLint (configuração flat) e as demais dependências diretas. Quem visita não vê diferença.
  **BREAKING** para quem desenvolve: muda a configuração do Tailwind (CSS-first) e do ESLint.
- **Limpeza:**
  - versionar o `package-lock.json`, hoje ignorado no `.gitignore`;
  - tirar o que não tem uso (`lottie-react` e `LottiePlayer`, `@anthropic-ai/sdk`) e o PDF de manual de fechadura
    esquecido em `public/images/`;
  - remover os CVs duplicados de `public/` (`cv.pdf` fica sem uso, já que `lib/cv.ts` aponta para `cv-pt/en/es.pdf`).
- **Testes:** Vitest com Testing Library, teste de hidratação sem divergência, e Playwright com axe nas páginas em pt,
  en e es.
- **CI no GitHub Actions:** lint, tipos, testes, build, testes de navegador com axe e Lighthouse no perfil de celular. A
  primeira execução registra a linha de base de desempenho, acessibilidade, SEO e boas práticas.
- **Formulário de contato seguro:**
  - o mesmo schema Zod no cliente e no servidor;
  - limite de envios por origem e campo isca contra robôs;
  - texto escapado no e-mail, com versão em texto puro;
  - limites de tamanho e erros genéricos;
  - destinatário vindo de variável de ambiente.
- **Cabeçalhos de segurança HTTP** em todas as respostas.

**O que quem visita percebe:** a aparência não muda. O formulário passa a explicar, no idioma da página, quando a
mensagem é inválida ou quando houve envios demais. Uma mensagem com código no nome chega à Evelym como texto, sem
executar nada.

## Fora do escopo

- Qualquer mudança de identidade, cor, conteúdo, animação ou 3D. A paleta roxo/preto/branco e a cena Three.js são as
  changes 2 e 3 e partem do briefing respondido. O framer-motion fica até a change 4.
- Corrigir as violações de acessibilidade que o axe encontrar. A fundação **mede** e registra a linha de base; a
  correção vem nas changes 2 e 4.
- SEO, que é a change 5.
- Content-Security-Policy completa: entra com os scripts de 3D e animação, para não ser escrita duas vezes.
- Trocar o script de tradução DeepL por tradução à mão: decisão da dona, a ser tomada na change 4.
- Publicar as skills da Mangue no repositório. Elas ficam instaladas na máquina, porque as três principais são da Mangue
  Tech e o repositório pode ser público.

## Capabilities

### New Capabilities
- `formulario-de-contato`: como o servidor recebe, valida, limita e entrega as mensagens do formulário de contato, e como
  quem visita fica sabendo do resultado.
- `cabecalhos-de-seguranca`: os cabeçalhos HTTP de segurança presentes em todas as respostas do site.

### Modified Capabilities
(nenhuma: ainda não há specs em `openspec/specs/`)

## Impact

- **Dependências:** praticamente todas as diretas sobem de versão maior. Saem `lottie-react`, `@anthropic-ai/sdk` e
  `next-themes` (tema por script próprio, como no portfólio do Francisco). Entram como dependências de desenvolvimento
  Vitest, Testing Library, jsdom, Playwright, axe e Lighthouse CI.
- **Configuração:**
  - `tailwind.config.ts` vira `@theme` em `app/globals.css`, e `.eslintrc.json` vira `eslint.config.mjs`;
  - `next.config.mjs` ganha os cabeçalhos, e `postcss.config.mjs` passa a usar `@tailwindcss/postcss`;
  - `middleware.ts` vira `proxy.ts` (convenção do Next 16);
  - `.gitignore` passa a versionar o lockfile e a ignorar `graphify-out/`.
- **Código:**
  - `app/[locale]/*` (parâmetros assíncronos do Next 16) e `i18n/*` (next-intl 4);
  - `app/api/contact/route.ts` e `components/sections/Contact.tsx`, com o schema compartilhado em `lib/`;
  - os componentes com framer-motion (compatibilidade com React 19).
- **Mensagens:** chaves novas de erro do formulário em `messages/pt.json`, `en.json` e `es.json`.
- **Ferramentas:**
  - `CLAUDE.md`, `.claude/` (skills do OpenSpec e do graphify e ganchos) e `.mcp.json` (Pencil);
  - skills da Mangue em `~/.claude/skills/`, fora do repositório.
- **Infraestrutura:**
  - variáveis de ambiente novas (`CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL`);
  - workflow em `.github/workflows/`.
