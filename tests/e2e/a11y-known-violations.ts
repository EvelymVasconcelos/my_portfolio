/**
 * Violações de acessibilidade que já existiam quando a rede de testes foi criada (2026-11-19, stack Next 14,
 * identidade provisória "Samsung Lilac"). Cada uma tem a change que vai removê-la. Esta lista só pode diminuir:
 * uma violação nova, fora daqui, reprova o CI. Medição em pt/en/es, claro/escuro, 1440 e 390 px.
 *
 * Saíram: `color-contrast` (26 a 30 elementos por página), com os tokens AA da identidade nova
 * (estrutura-movimento-e-cena-3d, bloco 2, 2026-11-19).
 */
export const KNOWN_VIOLATIONS: Record<string, string> = {
  // O seletor de idioma tem aria-label "Idioma"/"Language", que não contém o texto visível (ex.: "PT"); o mesmo num link
  // de destaque. Sai com a barra do topo da referência na change estrutura-movimento-e-cena-3d.
  "label-content-name-mismatch": "estrutura-movimento-e-cena-3d (bloco 3: estrutura e conteúdo)",
};
