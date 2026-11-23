/**
 * Publicações (seção Pesquisa), a partir do currículo: ids, anos, DOI e o título original, que não se traduzem
 * (o tradutor automático não alcança o título). Contexto, papel, local e situação ficam em messages/, em
 * `research.items.<id>`.
 */

export interface Publication {
  id: string;
  year: number;
  /** Título como foi publicado, no idioma original (`lang`). */
  title: string;
  lang: "en" | "pt";
  /** DOI sem o prefixo https://doi.org/; `null` quando ainda não há. */
  doi: string | null;
}

/** Da mais recente para a mais antiga. */
export const PUBLICATIONS: readonly Publication[] = [
  // Aceito; publicação prevista para 2027 na ACM Digital Library (dona, 2026-11-23). O DOI entra quando sair.
  {
    id: "icsca-2026",
    year: 2026,
    title: "E2E-CIFlow: An automated End-to-End testing process",
    lang: "en",
    doi: null,
  },
  {
    id: "seai-2024",
    year: 2024,
    title:
      "Agile Blueprint Model Method in the Software Development Process with Increment of Version",
    lang: "en",
    doi: "10.1109/SEAI62072.2024.10674366",
  },
  {
    id: "tcc-2019",
    year: 2019,
    title: "Uma Análise sobre a Participação Feminina na Área da Tecnologia da Informação",
    lang: "pt",
    doi: null,
  },
];

export const doiUrl = (doi: string) => `https://doi.org/${doi}`;
