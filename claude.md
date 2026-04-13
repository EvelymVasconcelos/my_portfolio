# Portfolio — Professional Prompt


## Context


Build a complete, production-ready personal portfolio website for **Evelym Marinho**, a Backend Software Engineer (Pleno/Sênior).
The codebase must be clean, scalable, fully accessible, and visually professional.

**She** is a backend developer — the portfolio must communicate technical depth, rigor and research credibility.


Before writing any code:
- Read all files inside `/curriculum` to extract professional data (experience, education, skills, contact).
- Read all images inside `/inspirations` to understand the desired visual direction.


---


## Stack


| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| Icons | Samsung SDS Icons (outline style) via Lucide React as fallback |
| i18n | next-intl |
| Forms | React Hook Form + Zod |
| Theme | next-themes (dark/light toggle) |
| Linting | ESLint + Prettier |


---


## Design System — Samsung Inspired


Reference: https://developer.samsung.com/design-system


### Principles (Samsung Design Language)
- **Clear**: elements capture the essence of their concept — immediately recognizable.
- **Minimal**: unnecessary details are kept to a minimum; simplicity and emphasis express essential characteristics.
- **Connected**: every step of the user journey is connected with a consistent experience across devices and services.
- **Purposeful motion**: animations communicate state and guide attention — never decorative noise.
- **Accessibility**: WCAG 2.1 AA minimum across all components.


### Typography
Samsung's type system uses **SamsungOne** as the primary face. Since SamsungOne is proprietary, load it via `@font-face` if available, otherwise fall back to **"Roboto"** (Google Fonts) for body and **"Roboto Slab"** for display headings.

```
Font Family (body):    "SamsungOne", "Roboto", sans-serif
Display / headings:    "Samsung Sharp Sans", "Roboto Slab", serif

Scale (rem, base 16px):
  display:  3.5rem / 800 weight   — hero name, main headline
  h1:       2.5rem / 700 weight
  h2:       1.75rem / 700 weight
  h3:       1.25rem / 600 weight
  body-lg:  1.125rem / 400 weight
  body:     1rem   / 400 weight
  caption:  0.875rem / 400 weight
  label:    0.75rem  / 500 weight — badges, tags, nav items
```

Add to `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Slab:wght@600;700;800&display=swap');
```


### Color Tokens — Samsung Design System (Lilac Variant)
Define all colors as CSS variables in `globals.css` and consume via Tailwind config.

The portfolio uses a **Samsung-style Lilac** (`#6852D6`) as the primary accent.
This is inspired by Samsung's Galaxy Bora Purple line and passes WCAG AA (contrast 5.46:1 on white).

```css
/* ─── Light mode (default) ─── */
:root {
  --background:        #FFFFFF;
  --surface:           #F5F6FA;
  --surface-elevated:  #FFFFFF;
  --border:            rgba(0, 0, 0, 0.10);
  --text-primary:      #12172A;
  --text-secondary:    #4A4F66;
  --text-muted:        #9EA3B8;
  --accent-primary:       #6852D6;   /* Samsung Lilac — CTA, links, badges */
  --accent-primary-hover: #5740C0;   /* Lilac darker on hover */
  --accent-secondary:     #9B7AE8;   /* Lilac light — highlights */
  --accent-teal:          #00B4D8;
  --accent-success:       #00C853;
  --accent-warning:       #FFB300;
  --accent-danger:        #D32F2F;
}

/* ─── Dark mode ─── */
.dark {
  --background:        #0A0E1A;
  --surface:           #12172A;
  --surface-elevated:  #1C1830;   /* deep purple-navy */
  --border:            rgba(255, 255, 255, 0.08);
  --text-primary:      #F0F2FF;
  --text-secondary:    #9EA3C8;
  --text-muted:        #5A6080;
  --accent-primary:       #A98AEF;   /* Lilac pastel — legível no escuro */
  --accent-primary-hover: #BBA4F5;
  --accent-secondary:     #C4AEFF;
  --accent-teal:          #00B4D8;
  --accent-success:       #00E676;
  --accent-warning:       #FFD740;
  --accent-danger:        #FF5252;
}
```

**Color usage rules:**
- `accent-primary` (`#6852D6` / `#A98AEF`) → CTAs, active nav, links, badges.
- `accent-secondary` (`#9B7AE8` / `#C4AEFF`) → highlights, hover states, skill tags.
- Background: predominantemente branco no light mode.
- Dark mode: navy profundo com toque roxo (`#0A0E1A` / `#1C1830`), mantém identidade Samsung.


### Spacing Scale (8px grid — same as Samsung's grid)
```
4px   → space-1
8px   → space-2
16px  → space-4
24px  → space-6
32px  → space-8
48px  → space-12
64px  → space-16
96px  → space-24
128px → space-32
```


### Border Radius — Samsung is conservative (less rounded than Apple)
```
xs:   4px   — tags, inputs, table cells
sm:   8px   — buttons, small cards
md:   12px  — cards, panels
lg:   20px  — modals, hero containers
full: 9999px — avatar, pill badges
```


### Elevation / Shadows — Samsung: flat with subtle depth
```css
/* Card — light mode */
background: #FFFFFF;
border: 1px solid rgba(0, 0, 0, 0.08);
box-shadow: 0 2px 12px rgba(20, 40, 160, 0.08);   /* blue-tinted shadow */

/* Card — dark mode */
background: rgba(28, 34, 64, 0.80);
border: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: 0 4px 32px rgba(0, 0, 0, 0.40);
backdrop-filter: blur(12px);

/* Primary button */
background: #1428A0;
box-shadow: 0 4px 16px rgba(20, 40, 160, 0.30);
```


### Buttons — Samsung style
Based on `developer.samsung.com/design-system` screenshots:

```
Primary (CTA):   bg lilac (#6852D6), white text, border-radius 4px, NO glow/shadow
Secondary:       bg white, border 1px solid text-muted (#9EA3B8), dark text
                 hover → border turns lilac, text turns lilac
                 ("Saber mais" / "Read More" pattern from Samsung DS)
Outline:         border 1px solid accent-primary, text lilac, fill on hover
Ghost:           no border, no bg — text color changes only
```

Rules:
- `border-radius: 4px` on all buttons (Samsung: nearly square, not pill-shaped)
- NO `active:scale` press animation
- NO shadow/glow on buttons
- Font weight: 500 (Medium), `tracking-wide`

### Icons
- Style: **outline/line icons** (Samsung DS: "Clear" and "Minimal" principles).
- Library: Lucide React — closest open-source match to Samsung's icon language.
- Grid: 24px base, shown at 16px / 20px / 24px — never arbitrary sizes.
- Stroke width: `1.5` (Lucide default) — keeps the outline feel.
- Color: inherit from text or `accent-primary`.


---


## Professional Data — Evelym Marinho


Extract everything from `/curriculum/Evelym_Marinho_-_Engenharia_de_Software_Backend_ptbr.pdf`.

Key data summary (use the PDF as source of truth):

**Identity**
- Name: Evelym Marinho
- Role: Engenheira de Software Backend Pleno / Sênior
- Location: Manaus, Brasil
- Email: evelymmarinho.dev@gmail.com
- Phone: 92992877778
- Links: LinkedIn, GitHub, Lattes

**Profile / Bio**
Engenheira de Software Backend com mais de 6 anos de experiência sólida no ecossistema Python.
Especializada na construção de APIs RESTful escaláveis e de alta disponibilidade.
Expert em FastAPI e Django, com forte rigor técnico: TDD, Pytest, Clean Code, SOLID.
Autora de pesquisas internacionais sobre automação de testes e CI/CD (ICSCA 2026, IEEE SEAI 2024).
Experiência robusta em Docker, Kubernetes, PostgreSQL e NoSQL.

**Experience**
1. Software Engineer | Backend — Sidia Instituto de Ciência e Tecnologia (Jan 2022 – Presente, Manaus)
   - Desenvolvimento de soluções backend em Python e Java para produtos globais
   - APIs REST de alta performance em arquiteturas de microsserviços
   - Docker, Kubernetes, CI/CD pipelines
   - TDD, Pytest, code review

2. Software Engineer | Backend — Bemol Digital (Ago 2019 – Jan 2022, Manaus)
   - Sistemas de alta disponibilidade para varejo, grandes volumes de dados
   - ETL, otimização de SQL (Postgres + Redis)
   - Integração segura entre APIs e interfaces, ciclos ágeis

**Education**
- Universidade Federal do Amazonas — Sistemas de Informação (Jun 2014 – Ago 2019, Itacoatiara - AM)

**Skills (grouped)**
- Linguagens/Frameworks: Python (Sênior), FastAPI, Django, Flask, Java, JavaScript
- Qualidade e Engenharia: TDD, Pytest, Clean Code, SOLID, Design Patterns, Code Review, BDD
- Infraestrutura/Cloud: Docker, Kubernetes, CI/CD, GitHub Actions, AWS, Linux, Git/GitHub
- Dados e Integração: SQL (PostgreSQL, MySQL), NoSQL (Redis, MongoDB), ETL, Microsserviços, APIs RESTful

**Academic Highlights**
1. ICSCA 2026 (Langkawi, Malásia) — "E2E-CIFlow: An automated End-to-End testing process" — ACM Digital Library
2. IEEE SEAI 2024 (Xiamen, China) — "Agile Blueprint Model Method..." — DOI: 10.1109/SEAI62072.2024.10674366
3. TCC nota 10 (UFAM, 2019) — "Uma Análise sobre a Participação Feminina na Área da TI"

**Languages**
- Português do Brasil: Falante nativo
- Inglês: Comando muito bom


---


## Project Structure


```
/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── globals.css
├── components/
│   ├── ui/              # Atomic: Button, Badge, Card, Input, Tooltip, etc.
│   ├── sections/        # Hero, About, Skills, Experience, Research, Contact, Footer
│   ├── layout/          # Navbar, ThemeToggle, LanguageSwitcher
│   └── animations/      # FadeInView, StaggerChildren
├── content/
│   └── pt.json          # ← ALL text in Portuguese. DO NOT hardcode strings.
├── lib/
│   ├── i18n.ts
│   └── utils.ts
├── public/
│   ├── images/          # Placeholder public images
│   └── cv.pdf           # Linked from /curriculum/...pdf
├── curriculum/          # ← Read this folder for professional data
├── inspirations/        # ← Read these images for visual direction
├── messages/
│   ├── pt.json          # Source of truth (Portuguese)
│   ├── en.json          # Auto-generated
│   └── es.json          # Auto-generated
└── scripts/
    └── translate.ts     # Script: reads pt.json → generates en.json + es.json
```


---


## Internationalization (i18n)


### Workflow
1. All UI text lives in `messages/pt.json` (Portuguese, source of truth).
2. Running `npm run translate` executes `scripts/translate.ts`, which:
   - Reads `messages/pt.json`
   - Calls the translation API (or uses a free i18n service)
   - Writes `messages/en.json` and `messages/es.json`
3. `next-intl` handles locale routing: `/pt`, `/en`, `/es`.
4. Default locale: `pt`. Language switcher in the navbar.


### Language Switcher Component
- Visible in the navbar on all breakpoints.
- Shows current locale as flag + abbreviation: `🇧🇷 PT | 🇺🇸 EN | 🇪🇸 ES`
- Switches locale without page reload (next-intl `useRouter`).


---


## Sections


### 1. Navbar
- Fixed, subtle border + background on scroll.
- Logo: initials **"EM"** on the left (monogram, Samsung Blue).
- Nav links: Sobre, Habilidades, Experiência, Pesquisa, Contato.
- Right side: LanguageSwitcher + ThemeToggle.
- Mobile: hamburger → slide-in menu with Framer Motion.
- `aria-label` on all interactive elements.


### 2. Hero
- Full viewport height. Clean, predominantly white (light) / deep navy (dark).
- Greeting: "Olá, eu sou" — staggered word reveal (Framer Motion).
- Name **"Evelym Marinho"** in display size, Samsung Blue gradient.
- Subtitle: rotating roles — "Backend Engineer", "API Architect", "Researcher", "Python Expert" (Framer Motion `AnimatePresence`).
- Abstract geometric/code-line SVG decoration (no Lottie dependency — static SVG is fine).
- Two CTAs:
  - Primary: "Ver Experiência" (anchor scroll)
  - Secondary: "Download CV" → `/public/cv.pdf`
- Scroll indicator arrow (animated bounce).


### 3. About
- Placeholder circular profile photo (`https://i.pravatar.cc/300?img=47` — female avatar placeholder).
- Two-paragraph bio (from `messages/pt.json`).
- Language badges: 🇧🇷 Português Nativo | 🇺🇸 Inglês Avançado.
- `FadeInView` animation on scroll.


### 4. Skills
- Grouped by category with section headers:
  - **Linguagens & Frameworks** — Python, FastAPI, Django, Flask, Java, JavaScript
  - **Qualidade & Engenharia** — TDD, Pytest, Clean Code, SOLID, Design Patterns, BDD
  - **Infra & Cloud** — Docker, Kubernetes, CI/CD, GitHub Actions, AWS, Linux
  - **Dados & Integração** — PostgreSQL, MySQL, Redis, MongoDB, ETL, APIs RESTful
- Each skill: icon (Lucide or devicon SVG) + label badge in Samsung Blue accent.
- Skill proficiency: Python marked as "Sênior" with a distinct highlight.
- Grid: 2 col mobile / 3 col tablet / 4-5 col desktop.


### 5. Experience (Timeline)
- Vertical timeline, center line on desktop, left-aligned on mobile.
- Data from `/curriculum` / `messages/pt.json`.
- Each entry: company logo placeholder, role, date range, bullet points.
- Timeline line draw animation on scroll (Framer Motion `pathLength`).
- Entries:
  1. Sidia Instituto de Ciência e Tecnologia (Jan 2022 – Presente)
  2. Bemol Digital (Ago 2019 – Jan 2022)
  3. UFAM — Sistemas de Informação (Jun 2014 – Ago 2019) [education]


### 6. Research / Academic Highlights
- **This section is a key differentiator** — Evelym has international publications.
- Three cards:
  1. ICSCA 2026 — Malásia — ACM Digital Library — "E2E-CIFlow"
  2. IEEE SEAI 2024 — China — DOI link
  3. TCC nota 10 — UFAM 2019
- Card layout: conference badge (e.g. "ACM" / "IEEE"), title, year, location, short description.
- Subtle hover: border color shifts to Samsung Blue.


### 7. Contact
- Section heading + short description.
- Form: Name, Email, Subject, Message.
- Validated with React Hook Form + Zod.
- On submit: `mailto:evelymmarinho.dev@gmail.com` or a serverless API route.
- Social links: GitHub, LinkedIn, Lattes, Email — icon buttons, Samsung Blue on hover.


### 8. Footer
- Copyright: © 2025 Evelym Marinho.
- "Construído com TypeScript, Next.js e muito café ☕" — tech icon row.
- Back-to-top button (smooth scroll).


---


## Accessibility (WCAG 2.1 AA)


- All images have descriptive `alt` attributes.
- All interactive elements have `aria-label` or visible text labels.
- Color contrast ratio ≥ 4.5:1 — verify Samsung Blue #1428A0 on white passes AA.
- Focus-visible ring on all focusable elements (never `outline: none` without replacement).
- Skip-to-main-content link at the top of the page.
- Keyboard navigable: Tab order follows visual order.
- `prefers-reduced-motion` media query: disable or simplify animations.
- Semantic HTML: `<main>`, `<nav>`, `<section aria-label>`, `<article>`, `<header>`, `<footer>`.


---


## Animations


| Element | Animation | Library |
|---|---|---|
| Page load | Staggered fade-in of Hero elements | Framer Motion |
| Scroll reveal | FadeInView wrapper (once, threshold 0.1) | Framer Motion |
| Navbar | Border + bg appear on scroll | Framer Motion useScroll |
| Hero subtitle | Rotating text (AnimatePresence) | Framer Motion |
| Skill cards | Subtle scale on hover | Framer Motion whileHover |
| Timeline line | Path draw on scroll | Framer Motion pathLength |
| Research cards | Border color transition on hover | CSS transition |
| Theme toggle | Icon morph (sun ↔ moon) | Framer Motion |

**Rule:** `prefers-reduced-motion: reduce` → all Framer Motion animations set `duration: 0`.

**No Lottie dependency** — keep the bundle lean. Use SVG illustrations or CSS animations for decorative elements.


---


## Dark / Light Mode Toggle


- Use `next-themes` with `attribute="class"`.
- Default: **light mode** (Samsung design language is predominantly white/light).
- Fallback: system preference.
- Toggle: animated sun/moon icon morph (Framer Motion).
- Persisted in `localStorage` via next-themes.
- Component: `components/layout/ThemeToggle.tsx`.


---


## Public Images (Placeholders)


```
Profile photo:  https://i.pravatar.cc/300?img=47   (female avatar)
Project images: https://picsum.photos/600/400?random=N
```

Wrap all `<img>` in Next.js `<Image>` with correct `width`, `height`, and `alt`.
Add `{/* TODO: replace with real photo */}` above each placeholder.


---


## Component Guidelines (Clean Code)


- One component per file.
- File naming: `PascalCase.tsx` for components, `kebab-case.ts` for utilities.
- No inline styles — use Tailwind classes only. Complex variants via `cva` (class-variance-authority).
- No magic numbers — use design tokens from Tailwind config.
- Props typed with explicit TypeScript interfaces, never `any`.
- Extract repeated logic into custom hooks (`useScrollProgress`, `useMediaQuery`, etc.).
- Comments only where logic is non-obvious.
- Each section component is self-contained: receives text from i18n, data from props or constants.


---


## Translation Script


Create `scripts/translate.ts`:

```typescript
// Usage: npm run translate
// Reads messages/pt.json and generates messages/en.json + messages/es.json
// Uses a free translation API or Claude API if ANTHROPIC_API_KEY is set

import fs from "fs"
import path from "path"

const sourceLocale = "pt"
const targetLocales = ["en", "es"]
// ... implementation: reads pt.json, translates each string, writes output files
```

Add to `package.json`:
```json
"scripts": {
  "translate": "tsx scripts/translate.ts"
}
```


---


## Deliverables Checklist


The final project must pass all of the following:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully (no TypeScript errors)
- [ ] All 3 locales work: `/pt`, `/en`, `/es`
- [ ] Light mode is default; dark mode toggle works and persists
- [ ] Contact form validates and opens email client or sends via API route
- [ ] "Download CV" button serves the PDF correctly
- [ ] Research section displays 3 academic publications correctly
- [ ] Lighthouse score ≥ 90 in Performance, Accessibility, Best Practices, SEO
- [ ] No `console.error` or `console.warn` in the browser
- [ ] Fully keyboard navigable
- [ ] Responsive at 375px, 768px, 1024px, 1440px


---


## Notes for the AI


- Do NOT ask clarifying questions. Start building immediately.
- Generate the full file tree and all files in a single response if possible, or section by section.
- After generating code, provide a `SETUP.md` with exact commands to install dependencies and run the project.
- All text content (bio, skill descriptions, experience bullets) must come from the `/curriculum` folder — do NOT invent data.
- The portfolio owner is **Evelym Marinho** — use **she/her** pronouns in all generated copy.
- The design must feel premium and technical — inspired by Samsung Design System, not a generic developer template.
- Light mode is the **primary** experience. Dark mode is a toggle — both must look polished.
- The Research/Publications section is a unique differentiator — give it visual weight equal to Experience.
