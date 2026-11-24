/**
 * Dados estruturais dos projetos, a partir do currículo: endereços e stack (nomes próprios, que não se traduzem).
 * O texto de cada projeto fica em messages/<idioma>.json, em `projects.items.<id>`.
 * Os títulos são descritivos (o que foi feito), sem nome de produto inventado (decisão da dona em 2026-11-19).
 */

export interface Project {
  id: string;
  /** Endereço público (artigo, produto); `null` quando não há. */
  url: string | null;
  /** Stack curta, mostrada na página (3 a 5 itens). Vazia quando o texto se traduz (`projects.items.<id>.stack`). */
  stack: readonly string[];
}

/** Projeto em destaque na seção, com o diagrama do pipeline (components/sections/PipelineDiagram.tsx). */
export const FEATURED_PROJECT_ID = "e2e-ciflow";

/** Ordem de exibição: o destaque primeiro, depois a lista numerada. */
export const PROJECTS: readonly Project[] = [
  {
    id: "e2e-ciflow",
    // DOI da ACM: entra quando a dona enviar (artigo já publicado, decisão de 2026-11-19).
    url: null,
    stack: ["Python", "Playwright", "GitHub Actions", "CI/CD", "Docker"],
  },
  {
    id: "sidia-apis",
    url: null,
    stack: ["Python", "FastAPI", "Docker", "Kubernetes", "PostgreSQL"],
  },
  {
    id: "bemol-etl",
    url: null,
    stack: ["Python", "PostgreSQL", "Redis", "SQL"],
  },
  {
    id: "agile-blueprint",
    url: "https://doi.org/10.1109/SEAI62072.2024.10674366",
    stack: [],
  },
];
