# Evelym Marinho — Portfólio: configuração

## Requisitos

- Node.js 24 LTS (a versão está em `.nvmrc`: rode `nvm use`)
- npm 10 ou mais

---

## Instalação

```bash
nvm use
npm install
```

O `package-lock.json` é versionado. Para instalar exatamente as versões dele, use `npm ci`.

---

## Rodar localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A página redireciona para `/pt`.

Rotas: `/pt`, `/en` e `/es`.

---

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variável             | Quando é preciso      | Onde conseguir                                                                                                                                                                                 |
| -------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEEPL_API_KEY`      | Só para as traduções  | Chave grátis em [deepl.com/pro-api](https://deepl.com/pro-api)                                                                                                                                 |
| `RESEND_API_KEY`     | Formulário de contato | Chave grátis em [resend.com](https://resend.com)                                                                                                                                               |
| `CONTACT_TO_EMAIL`   | Formulário de contato | E-mail que recebe as mensagens                                                                                                                                                                 |
| `CONTACT_FROM_EMAIL` | Formulário de contato | Remetente, como `Portfólio <onboarding@resend.dev>`. Com esse remetente de teste, o Resend só entrega para o e-mail da conta dona da chave; para outro destino, verifique um domínio no Resend |

O `.env.local` não vai para o Git. Sem as três variáveis do formulário, a rota de contato responde 503 e não tenta enviar.

O limite de 5 envios a cada 10 minutos por origem fica na memória do servidor: em hospedagem serverless, vale por instância.

---

## Traduções

Edite `messages/pt.json` em português e rode:

```bash
npm run translate
```

O script (`scripts/translate.ts`) chama a API do DeepL e sobrescreve `messages/en.json` e `messages/es.json`. Revise o
resultado antes de commitar. O plano grátis do DeepL dá 500.000 caracteres por mês.

---

## Conteúdo

### Foto

A foto fica em `public/images/profile.jpeg` e aparece no Hero e na seção Sobre. Para trocar, substitua o arquivo
mantendo o nome.

### Currículo

Os dados profissionais saem dos PDFs em `curriculum/` (pt, en e es). O botão "Download CV" serve o currículo no idioma
da página, pelos arquivos `public/cv-pt.pdf`, `public/cv-en.pdf` e `public/cv-es.pdf` (configurados em `lib/cv.ts`).
Ao atualizar o currículo, troque os três arquivos de `public/` junto com os de `curriculum/`.

### Imagens dos projetos

Os projetos ficam em `messages/pt.json`, em `projects.items[]`. Hoje o campo `image` aponta para imagens provisórias
(`picsum.photos`). Para usar imagens próprias, coloque os arquivos em `public/images/projects/` e aponte o `image` para
eles.

---

## Estrutura

```
├── app/
│   ├── [locale]/          # páginas por idioma (pt, en, es)
│   └── api/contact/       # rota do formulário de contato (Resend)
├── components/
│   ├── animations/        # CountUp, FadeInView, Particles, StaggerChildren
│   ├── layout/            # Navbar, Footer, ThemeToggle, LanguageSwitcher
│   ├── sections/          # Hero, About, Projects, Experience, Contact
│   └── ui/                # Button, Badge, Card, Input, Textarea e ícones de marca
├── curriculum/            # PDFs do currículo (fonte da verdade)
├── design/prototipos/     # protótipos (Pencil e HTML)
├── i18n/                  # configuração e navegação do next-intl
├── lib/                   # utilitários, links do CV e redes sociais
├── messages/              # textos (pt, en, es)
├── openspec/              # especificações e mudanças planejadas
├── public/                # arquivos estáticos (CVs e imagens)
└── scripts/
    └── translate.ts       # tradução pelo DeepL
```

---

## Build de produção

```bash
npm run build
npm run start
```
