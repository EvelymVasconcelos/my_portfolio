import { CHANNELS } from "@/lib/contact/channels";

/**
 * Recomendações publicadas no LinkedIn, transcritas do print enviado pela dona em 2026-11-20. São citações: o texto fica
 * exatamente como no original, sem tradução nem correção, e por isso mora aqui, e não em `messages/`. O cargo é o início
 * do título de cada pessoa no LinkedIn. Ordem: da mais recente para a mais antiga; a primeira aparece em destaque.
 * Com a lista vazia, a seção some da página (spec `estrutura-e-conteudo`).
 */

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  /** Data da recomendação no LinkedIn (AAAA-MM-DD). */
  date: string;
  /** Relação contada pelo LinkedIn; o texto traduzido está em `recommendations.relation.<chave>`. */
  relation: "same_team" | "different_companies" | "studied_together";
  lang: "pt-BR" | "en";
  /** Parágrafos, como no original. */
  text: string[];
}

const LINKEDIN = CHANNELS.find((channel) => channel.id === "linkedin")!.href.replace(/\/$/, "");
export const LINKEDIN_RECOMMENDATIONS_URL = `${LINKEDIN}/details/recommendations/`;

export const RECOMMENDATIONS: readonly Recommendation[] = [
  {
    id: "francisco-gabriel",
    name: "Francisco Gabriel",
    role: "Frontend Engineer · HostGator",
    date: "2021-08-25",
    relation: "different_companies",
    lang: "pt-BR",
    text: [
      "Evelym é uma profissional muito valiosa! Ela possui amplo conhecimento de áreas distintas como Engenharia de Dados e Desenvolvimento Web, além de diversas habilidades que agregam muito valor ao time, consegue ter estratégias inteligentes e bastante eficazes ao resolver problemas. Além do mais, sabe repassar o conhecimento de forma bastante didática, clara e direto ao ponto. Ela é estudiosa, dedicada, responsável e muito humilde. Evelym é incrível! O time ganha muito com ela.",
    ],
  },
  {
    id: "micaelle-queiroz",
    name: "Micaelle Queiroz",
    role: "Software Engineer · Full Stack Web Developer Senior",
    date: "2021-07-11",
    relation: "studied_together",
    lang: "pt-BR",
    text: [
      "Evelyn é uma pessoa muito perspicaz, dedicada e sempre encarando os desafios com vigor. Tivemos oportunidade de compartilhar conhecimento. Que você alcance todos os seus objetivos em sua carreira profissional.",
    ],
  },
  {
    id: "jailson-pereira",
    name: "Jailson Pereira",
    role: "Data Engineer",
    date: "2021-06-02",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Conheci a Evelym na Bemol Digital e com quem tive o grande privilégio de trabalhar e compartilhar muitos conhecimentos a cerca de desenvolvimento de software e engenharia de dados. Uma pessoa fantástica, dedicada, ágil, precisa nas horas certas em tomadas de decisões e uma pessoa fantástica.",
    ],
  },
];

/** Iniciais do primeiro e do último nome, para o círculo no lugar da foto. */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
