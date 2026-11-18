# Evelym Marinho — Portfólio

Portfólio pessoal de Evelym Marinho, Engenheira de Software Backend e autora de pesquisas publicadas na ACM e na IEEE.
Página única em português, inglês e espanhol, com tema claro e escuro.

## Stack

- **Framework:** Next.js 14 (App Router), no Node.js 24 LTS
- **Linguagem:** TypeScript (strict)
- **Estilo:** Tailwind CSS 3 + variáveis CSS
- **Animações:** Framer Motion
- **Idiomas:** next-intl (pt, en, es)
- **Tema:** next-themes (claro e escuro)
- **Formulário:** React Hook Form + Zod, com envio pelo Resend
- **Ícones:** Lucide React

A stack está sendo atualizada (Next.js 16, React 19, Tailwind 4). O plano está em `openspec/changes/`.

## Como rodar

```bash
nvm use        # Node 24, lido do .nvmrc
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A página redireciona para `/pt`.

Instruções completas em [SETUP.md](./SETUP.md).

## O que tem

- Três idiomas (pt, en, es). O inglês e o espanhol são gerados a partir do português pelo DeepL
- Tema claro e escuro
- Layout para celular, tablet e computador
- Link para pular para o conteúdo; com movimento reduzido, as animações de entrada e o fundo de partículas param
- Seções: Hero, Sobre, Projetos, Experiência e Contato
- Currículo para baixar no idioma da página

## Scripts

| Comando             | O que faz                                                   |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                                 |
| `npm run build`     | Build de produção                                           |
| `npm run start`     | Serve o build de produção                                   |
| `npm run lint`      | ESLint                                                      |
| `npm run format`    | Formata com o Prettier                                      |
| `npm run translate` | Gera `en.json` e `es.json` a partir do `pt.json` pelo DeepL |
