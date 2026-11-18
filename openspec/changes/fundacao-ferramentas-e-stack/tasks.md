## 1. Ferramentas de trabalho

- [ ] 1.1 Reescrever `claude.md` como `CLAUDE.md` em português, no formato do portfólio do Francisco (comandos, ponto de
      partida medido, regras inegociáveis, convenções, "antes de entregar", OpenSpec, Pencil, graphify, skills da
      Mangue com os conflitos). Manter: currículo como fonte da verdade, ela/dela e a pesquisa com destaque. Tirar a
      identidade "Samsung" e o "não faça perguntas" (D1)
- [ ] 1.2 `graphify install --platform claude`, `.claude/settings.json` com os ganchos `graphify hook-guard`,
      `graphify-out/` no `.gitignore` e o primeiro `graphify update .`
- [ ] 1.3 Copiar as skills da Mangue escolhidas (D1) de `~/Downloads/skills-mangue-codex/skills/` para `~/.claude/skills/`,
      sem rodar os scripts delas, e listar no `CLAUDE.md` quais existem e de onde reinstalar
- [ ] 1.4 Criar `.mcp.json` com o servidor do Pencil e a pasta `design/prototipos/`
- [ ] 1.5 Conferir numa sessão nova do Claude Code no projeto: `/opsx:*`, `/graphify` e as skills da Mangue aparecem, e
      `graphify query` responde

## 2. Organização e limpeza (sem mudar versões)

- [ ] 2.1 Tirar `package-lock.json` do `.gitignore` e criar `.nvmrc` com o Node 24 LTS (D3)
- [ ] 2.2 Remover `lottie-react`, `components/animations/LottiePlayer.tsx` e `@anthropic-ai/sdk`, confirmando que nada os
      importa
- [ ] 2.3 Remover `public/cv.pdf` (cópia sem uso de `cv-pt.pdf`) e, com o ok da dona, o PDF de manual de fechadura em
      `public/images/` (D12)
- [ ] 2.4 Corrigir `README.md` e `SETUP.md` para o estado real (DeepL, CVs em `public/cv-*.pdf`, Node 24)
- [ ] 2.5 `npm install`, `npm run lint` e `npm run build`. A dona confere `/pt`, `/en` e `/es` no navegador local

## 3. Rede de testes na stack atual

- [ ] 3.1 Configurar Vitest com jsdom e Testing Library (`vitest.config.mts`, `npm test`)
- [ ] 3.2 Teste de hidratação sem divergência das seções da página
- [ ] 3.3 Playwright contra o build de produção (`npm run test:e2e`), só Chromium
- [ ] 3.4 Testes de navegador: `/pt`, `/en` e `/es` carregam com o `lang` certo e sem erro no console
- [ ] 3.5 Capturas de referência em 1440 e 390 px, claro e escuro, nos três idiomas, para provar "visualmente idêntico"
      (usar `--update-snapshots=all`, porque o padrão ignora mudanças abaixo de 1%)
- [ ] 3.6 Varredura axe WCAG 2.2 A/AA com a lista de exceções nomeada (cada uma com a change que a corrige), falhando com
      qualquer violação nova
- [ ] 3.7 `npm run lint`, `npm test`, `npm run test:e2e` e `npm run build` passando. A dona revisa o relatório do axe

## 4. Next 16, React 19, next-intl 4 e ESLint flat

- [ ] 4.1 Migrar para o Next 16 pela documentação em `node_modules/next/dist/docs`: `middleware.ts` vira `proxy.ts`,
      `params` assíncronos e `setRequestLocale` no layout e na página para manter `/pt`, `/en` e `/es` estáticas
- [ ] 4.2 React, React DOM e tipos na 19, e framer-motion na versão compatível
- [ ] 4.3 next-intl 4 pelo guia oficial (`i18n/request.ts`, `routing`, navegação), com `timeZone` configurado no servidor
- [ ] 4.4 Trocar `.eslintrc.json` por `eslint.config.mjs` com `eslint-config-next` e ajustar o script `lint`
- [ ] 4.5 TypeScript na versão mais nova que o Next 16 suporta, e script `typecheck`
- [ ] 4.6 Demais dependências diretas (Zod 4, `@hookform/resolvers`, `lucide-react`, `resend`, Prettier). O lucide 1.x
      removeu os ícones de marca: GitHub e LinkedIn viram componentes próprios, como o `DiscordIcon` que já existe
- [ ] 4.7 Trocar o next-themes pelo script de tema no `<head>` (D4), com teste de hidratação nos dois temas
- [ ] 4.8 Lint, tipos, testes, capturas e build passando. A dona confere no navegador

## 5. Tailwind CSS 4

- [ ] 5.1 `@tailwindcss/upgrade`, tokens de `tailwind.config.ts` para `@theme` em `app/globals.css` e PostCSS com
      `@tailwindcss/postcss`
- [ ] 5.2 Revisar as classes que mudaram de comportamento (borda padrão, sombras, opacidade com `/`) e o plugin do
      Prettier
- [ ] 5.3 Capturas sem diferença perceptível em claro e escuro, 1440 e 390. A dona confere no navegador

## 6. Formulário de contato seguro

- [ ] 6.1 `lib/contact/schema.ts` com Zod 4 e códigos de erro, usado pelo cliente e pelo servidor (D6), com testes
- [ ] 6.2 `escapeHtml`, limpeza do assunto e testes (incluindo `<script>` e quebra de linha com `Bcc:`)
- [ ] 6.3 Limitador de envios em memória (5 a cada 10 minutos, `Retry-After`) com testes de janela
- [ ] 6.4 Reescrever `app/api/contact/route.ts`: tipo de conteúdo, tamanho, JSON, campo isca, schema, limite, escape,
      texto puro, variáveis de ambiente e erros genéricos (400, 413, 415, 429, 502 e 503)
- [ ] 6.5 Testes da rota cobrindo todos os cenários da spec `formulario-de-contato`, com o Resend simulado
- [ ] 6.6 `components/sections/Contact.tsx`: schema compartilhado, campo isca fora do teclado e do leitor de tela,
      mensagens por status
- [ ] 6.7 Mensagens novas em `messages/pt.json`, `en.json` e `es.json`
- [ ] 6.8 Teste de componente e de navegador: envio só com teclado, aviso anunciado e erros traduzidos em `/en` e `/es`
- [ ] 6.9 Documentar `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL` no `SETUP.md`. A dona testa um envio real no navegador
      local

## 7. Cabeçalhos de segurança

- [ ] 7.1 Os cinco cabeçalhos em `next.config` para todas as rotas, e `poweredByHeader: false`
- [ ] 7.2 Teste de navegador conferindo os cabeçalhos em `/pt` e na API, e a ausência de `X-Powered-By`

## 8. CI e linha de base

- [ ] 8.1 `.github/workflows/ci.yml` com `npm ci`, lint, tipos, Vitest, build, Playwright e cache, e Node lido do
      `.nvmrc`
- [ ] 8.2 Lighthouse CI (perfil celular, 3 execuções, `/pt`, `/en` e `/es`) com asserções em modo aviso
- [ ] 8.3 Registrar neste arquivo a linha de base do Lighthouse (desempenho, acessibilidade, boas práticas, SEO, LCP,
      CLS e TBT) e as exceções do axe
- [ ] 8.4 Rodar o workflow num branch e confirmar que passa

## 9. Fechamento

- [ ] 9.1 Conferência final em pt/en/es, claro/escuro, celular e computador, só com teclado, com leitor de tela e com
      movimento reduzido
- [ ] 9.2 `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` e `npm run build` passando
- [ ] 9.3 Atualizar o `CLAUDE.md` (ponto de partida e comandos novos) e rodar `graphify update .`
- [ ] 9.4 Revisar o briefing (`briefing-identidade-visual.md`) com a dona e abrir a change `identidade-visual` a partir
      das respostas
