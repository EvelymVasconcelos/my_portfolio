/**
 * Violações de acessibilidade que já existiam quando a rede de testes foi criada (2026-11-19, stack Next 14,
 * identidade provisória "Samsung Lilac"). Cada uma tem a change que vai removê-la. Esta lista só pode diminuir:
 * uma violação nova, fora daqui, reprova o CI. Medição em pt/en/es, claro/escuro, 1440 e 390 px.
 *
 * Saíram: `color-contrast` (26 a 30 elementos por página), com os tokens AA da identidade nova
 * (estrutura-movimento-e-cena-3d, bloco 2, 2026-11-19), e `label-content-name-mismatch`, com a troca de idioma em
 * links que começam pelo texto visível (bloco 3, 2026-11-19).
 */
export const KNOWN_VIOLATIONS: Record<string, string> = {};
