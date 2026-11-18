## Context

Estado medido em 2026-11-18 (motivação em proposal.md):
- **Stack:** Next 14.2, React 18, next-intl 3, Tailwind 3, Zod 3, ESLint 8 com `.eslintrc.json`, framer-motion 11 e
  next-themes.
- **Sem uso:** `lottie-react` e `@anthropic-ai/sdk`.
- **Qualidade:** lockfile ignorado no `.gitignore`, nenhum teste e nenhum workflow.
- **Formulário:** React Hook Form + Zod só no cliente. A rota `app/api/contact/route.ts` interpola nome, e-mail,
  assunto e mensagem direto no HTML, devolve `error.message` do Resend para quem visita e tem o destinatário fixo no
  código.
- **`claude.md` minúsculo:** o Claude Code no Linux procura `CLAUDE.md`, então esse arquivo provavelmente nunca foi lido
  como instrução do projeto.

O ponto de partida é o mesmo do portfólio do Francisco em 2026-11-10. A change `fundacao-stack-e-qualidade` dele já fez
este caminho, e as decisões abaixo reaproveitam o que deu certo lá, inclusive o que só se descobriu na implementação
(Node 24, por exemplo).

## Goals / Non-Goals

**Goals:**
- Deixar o projeto com as mesmas ferramentas do portfólio do Francisco: OpenSpec, graphify, skills da Mangue, Pencil
  e `CLAUDE.md` em português.
- Subir a stack sem mudar o que quem visita vê, e provar isso com testes de navegador antes e depois.
- Deixar uma rede de segurança que roda sozinha a cada push: lint, tipos, testes, build, axe e Lighthouse.
- Cumprir as specs `formulario-de-contato` e `cabecalhos-de-seguranca`.
- Registrar a linha de base de qualidade que as changes 2 a 5 vão melhorar.

**Non-Goals:**
- Identidade visual, 3D, conteúdo e SEO (proposal.md, "Fora do escopo").

## Decisions

### 1. Ferramentas primeiro, antes de qualquer upgrade
O primeiro bloco só instala as ferramentas: graphify, skills da Mangue, Pencil e `CLAUDE.md`. Assim os blocos seguintes
já usam o grafo, as skills e as regras.

- **`CLAUDE.md`:** reescrito em português, no formato do portfólio do Francisco (comandos, ponto de partida medido,
  regras que não se negociam, convenções, "antes de entregar", OpenSpec, Pencil, graphify).
  - Do `claude.md` antigo ficam: o currículo em `curriculum/` como fonte da verdade, os pronomes ela/dela, a seção de
    pesquisa com o mesmo peso da experiência e o modo claro como experiência principal. O modo claro é a reavaliar no
    briefing.
  - Sai a identidade "Samsung" (o briefing define a nova).
  - Sai a ordem "Do NOT ask clarifying questions", que contradiz o fluxo de especificação.
- **graphify:** `graphify install --platform claude` no projeto e o mesmo `.claude/settings.json` de ganchos
  (`graphify hook-guard`) do portfólio do Francisco. Depois, `graphify update .` gera o primeiro grafo, e
  `graphify-out/` entra no `.gitignore`.
- **Skills da Mangue:** cópia de `~/Downloads/skills-mangue-codex/skills/` para `~/.claude/skills/`, só das que servem a
  um portfólio:
  - a principal, `montar-site-mangue`;
  - 3D e rolagem: `build-threejs-scroll-worlds`, `build-awwwards-quality-sites`, `cinematic-scroll-storytelling` e
    `scroll-scrubbed-visual-sequence`;
  - texto e conversão: `copywriting`, `copy-editing`, `stop-slop` e `cro`;
  - SEO e dados estruturados: `seo`, `seo-audit`, `ai-seo` e `schema`;
  - qualidade: `accessibility`, `core-web-vitals`, `performance`, `best-practices` e `web-quality-audit`.
  - Ficam de fora:
    - as de app (`montar-app-mangue`, `qa-escrevendo`), porque o site não tem app;
    - as `gsap-*`, porque o GSAP ainda não foi escolhido (decisão 9) e entram com a change 3 se ele for.
  - A cópia vai para a máquina e não para o repositório:
    - as principais são da Mangue Tech, sem licença de redistribuição declarada;
    - as de apoio são MIT, mas somam 16 MB com os exemplos;
    - o repositório da Evelym pode ser público.
  - O `CLAUDE.md` lista quais skills usar e os conflitos com as regras do projeto, os mesmos do portfólio do Francisco:
    - a skill usa Lenis, e aqui a rolagem é nativa;
    - a skill usa ícones Solar, e aqui só lucide-react;
    - os scripts dos pacotes baixados não são executados.
  - *Alternativa descartada:* copiar para `.claude/skills/` do projeto. Publicaria material de terceiros e pesaria o
    repositório.
- **Pencil:** `.mcp.json` igual ao do portfólio do Francisco. O caminho do servidor é desta máquina, como lá.

### 2. Upgrade em blocos, com o que é acoplado no mesmo bloco
- **Juntos:** Next 16, React 19, next-intl 4 e ESLint flat, porque um depende do outro (`params` assíncronos, plugin do
  next-intl, fim do `next lint`).
- **Num bloco próprio:** Tailwind 4, para comparar o visual isolado.
- **Codemods oficiais** (`@next/codemod upgrade` e `@tailwindcss/upgrade`) com o diff revisado, em vez de editar à mão.
- `middleware.ts` passa a `proxy.ts`, a convenção do Next 16.
- *Alternativa descartada:* tudo de uma vez. Um erro visual depois de seis upgrades simultâneos não tem culpado claro.

### 3. Node 24 LTS desde o começo
No portfólio do Francisco, descobriu-se na implementação que Vitest 5, jsdom 31, jest-dom 7 e axe 4.14 exigem Node
22.12 ou mais. O Node 20 já saiu de suporte. Aqui o `.nvmrc` com Node 24 entra no primeiro bloco, e a CI lê dele.

### 4. Tema sem next-themes
O next-themes sai, e o tema passa a usar um script próprio no `<head>`: classe e `color-scheme` aplicados antes da
pintura, preferência salva e o sistema como padrão. É o mesmo padrão de `lib/theme-script.ts` do portfólio do Francisco.
Remove uma dependência e evita a divergência de hidratação que o next-themes contorna com `suppressHydrationWarning`.
*Alternativa descartada:* manter o next-themes. Funciona, mas a regra "hidratação sem divergência" fica mais fácil de
testar sem ele.

### 5. framer-motion fica, só atualizado
Os componentes animados continuam com framer-motion, na versão compatível com React 19. A troca por CSS ou por `motion`
acontece na change 4, que reescreve esses componentes de qualquer forma.

### 6. Schema de contato compartilhado, com códigos de erro
`lib/contact/schema.ts` define as regras da spec com Zod 4 e devolve códigos (`name_min`, `email_invalid` e outros).
- O cliente (React Hook Form + `zodResolver`) traduz os códigos com next-intl, e o servidor devolve os mesmos códigos no
  JSON do 400. O texto fica em `messages/` e as regras num lugar só.
- *Alternativa considerada:* tirar React Hook Form e Zod, como fez o portfólio do Francisco para economizar KB. A decisão
  fica para a change 4, que mede o JavaScript da página inteira.

### 7. Limite de envios em memória, campo isca e e-mail escapado
- **Limite:** janela deslizante em memória por origem (primeiro IP de `x-forwarded-for`, depois `x-real-ip`), com 5
  envios a cada 10 minutos e `Retry-After`. Em serverless o limite é por instância: segura abuso simples, não ataque
  distribuído. Isso fica documentado.
- **E-mail:**
  - `escapeHtml`, pequena e testada, monta o HTML, e o e-mail leva também a versão em texto puro;
  - o assunto perde `\r` e `\n`;
  - destinatário e remetente vêm de `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL`.
- **Falhas:** o erro do Resend só vai para o log; quem visita recebe um código genérico.
- *Alternativa descartada:* Redis gerenciado (Upstash), que traz serviço, chave e custo para um formulário de baixo
  volume.

### 8. Cabeçalhos pelo `headers()` do `next.config`
Uma regra para `/:path*` aplica os cinco cabeçalhos da spec, e `poweredByHeader: false` remove o `X-Powered-By`. A CSP
completa fica para a change 3, com o Three.js.

### 9. Three.js e GSAP não entram nesta change
O Three.js é o motor do 3D, e a dependência entra na change 3, quando o conceito da cena estiver aprovado no briefing e
num protótipo. Instalar agora seria dependência sem uso no bundle.

A escolha entre CSS, `motion` e GSAP para as animações de rolagem é tomada na change 4, com o efeito na mão. A
referência é o portfólio do Francisco: Three.js puro (sem react-three-fiber), carregado só depois do LCP e só onde há
WebGL.

### 10. Pirâmide de testes enxuta
- **Vitest + jsdom + Testing Library:** o schema, `escapeHtml`, o limitador, a rota da API (com `Request` real e o Resend
  simulado) e o componente de contato (fluxo com teclado e mensagens por idioma).
- **Hidratação sem divergência:** renderizar no servidor, hidratar no jsdom e falhar com qualquer aviso de hidratação.
- **Playwright + axe** contra `next start`:
  - `/pt`, `/en` e `/es` com o `lang` certo, sem erro no console e com os cabeçalhos;
  - o formulário com a API interceptada;
  - axe com as regras WCAG 2.2 A e AA.
- **Violações do axe que já existem:** entram numa lista de exceções nomeada, cada uma com a change que a corrige.
  Violação nova quebra o CI, e a lista só pode diminuir.

### 11. CI no GitHub Actions, com o Lighthouse primeiro como medida
- Um workflow em push e pull request: `npm ci`, lint, `tsc --noEmit`, Vitest, build, Playwright (só Chromium) e
  Lighthouse CI no perfil de celular nas três páginas de idioma.
- As asserções começam como aviso, e a primeira execução registra a linha de base em `tasks.md`.
- **Orçamento de desempenho:** LCP abaixo de 2,5 s, CLS abaixo de 0,1 e TBT abaixo de 200 ms, medidos no celular. O TBT
  é o substituto de laboratório do INP. As metas viram erro a partir da change 2.

### 12. Lockfile versionado e limpeza de `public/`
- O `package-lock.json` sai do `.gitignore` e é commitado depois dos upgrades, já que a CI usa `npm ci`.
- `public/cv.pdf` é cópia idêntica de `cv-pt.pdf` e não é referenciado em lugar nenhum, então sai.
- O PDF de manual de fechadura em `public/images/` não faz parte do site e sai. Ele nunca foi commitado e só será
  apagado com o ok da dona.

## Risks / Trade-offs

- [next-intl 4 muda a configuração e o `requestLocale`] → guia de migração oficial, e as três rotas cobertas por
  Playwright antes de mexer.
- [Tailwind 4 muda cor, borda padrão e ordem de utilitários] → capturas em 1440 e 390 px, claro e escuro, antes e
  depois. Só diferenças imperceptíveis passam.
- [Sem o next-themes, o tema pisca ou diverge na hidratação] → script no `<head>` antes da pintura e teste de hidratação
  nos dois temas.
- [As skills da Mangue na máquina não acompanham o repositório] → o `CLAUDE.md` diz de onde instalá-las. Em outra
  máquina, o fluxo funciona sem elas, só sem o roteiro.
- [O limite em memória não é global] → documentado na decisão 7. O campo isca e a regra da hospedagem complementam.
- [O Lighthouse na CI é ruidoso] → três execuções por página, com a mediana. Só aviso nesta change.

## Migration Plan

1. Cada bloco de `tasks.md` termina com lint, build e o site conferido no navegador local pela dona antes do próximo.
2. Os testes de navegador são escritos e passam **na stack antiga** antes do upgrade, e servem de prova de "visualmente
   idêntico".
3. `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL` entram no `.env.local` e na hospedagem antes do deploy do bloco de contato.
4. Cada bloco é um commit isolado: reverter o commit volta ao estado anterior, e o lockfile garante as mesmas versões.

## Open Questions

- **Hospedagem:** onde o site está (Vercel?) e qual o domínio. Define se vale configurar o limite de requisições da
  hospedagem e qual URL a CI usa. Não muda o código desta change.
- **Comentários no `.env.local`:** há chaves do Resend em linhas comentadas. O arquivo está no `.gitignore` e as chaves
  não aparecem no histórico do Git, mas as que não estão em uso devem ser revogadas no painel do Resend e apagadas.
