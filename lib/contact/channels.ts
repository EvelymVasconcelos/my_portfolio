/**
 * Canais de contato e link de agendamento: endereços públicos, que não se traduzem.
 * O rótulo de cada canal fica em messages/, em `contact.channels.<id>`.
 */

/**
 * Página de agendamento (Google Agenda ou outra). Vazio: "Agendar call" não aparece em lugar nenhum, para não haver
 * link morto, e o Contato abre direto o formulário. A dona ainda não tem o link (2026-11-19).
 */
export const AGENDA_URL = "";

export interface Channel {
  id: "email" | "linkedin" | "github" | "lattes";
  href: string;
  /** Endereço como aparece na página. */
  display: string;
}

export const CHANNELS: readonly Channel[] = [
  {
    id: "email",
    href: "mailto:evelymmarinho.dev@gmail.com",
    display: "evelymmarinho.dev@gmail.com",
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/evelym-marinho-0741a6121/",
    display: "linkedin.com/in/evelym-marinho-0741a6121",
  },
  {
    id: "github",
    href: "https://github.com/EvelymVasconcelos",
    display: "github.com/EvelymVasconcelos",
  },
  {
    id: "lattes",
    href: "https://lattes.cnpq.br/5534406024447727",
    display: "lattes.cnpq.br/5534406024447727",
  },
];

export const LATTES_URL = CHANNELS.find((c) => c.id === "lattes")!.href;
