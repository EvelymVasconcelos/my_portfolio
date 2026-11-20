/**
 * Canais de contato e link de agendamento: endereços públicos, que não se traduzem.
 * O rótulo de cada canal fica em messages/, em `contact.channels.<id>`.
 */

const EMAIL = "evelymmarinho.dev@gmail.com";

/**
 * Página de agendamento (Google Agenda ou outra). A dona vai mandar o link (2026-11-20); até lá fica vazio e o
 * "Agendar call" aparece mesmo assim, abrindo um e-mail com o assunto preenchido (ver `scheduleLink`).
 */
export const AGENDA_URL = "";

/**
 * Destino do "Agendar call" no menu e no Contato: a agenda, em nova aba, quando houver link; sem link, um e-mail para
 * a dona com o assunto já escrito no idioma da página. Assim o botão nunca fica sem destino.
 */
export function scheduleLink(subject: string) {
  return AGENDA_URL
    ? { href: AGENDA_URL, external: true }
    : { href: `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`, external: false };
}

export interface Channel {
  id: "email" | "linkedin" | "github" | "lattes";
  href: string;
  /** Endereço como aparece na página. */
  display: string;
}

export const CHANNELS: readonly Channel[] = [
  {
    id: "email",
    href: `mailto:${EMAIL}`,
    display: EMAIL,
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
