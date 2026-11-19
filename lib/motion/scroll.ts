/**
 * Contas do condutor de rolagem (components/motion/ScrollConductor.tsx), puras para poderem ser testadas sem
 * navegador. Tudo sai da posição nativa da rolagem: nada prende nem desvia a rolagem (decisão 5 da design).
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Progresso (0 a 1) de uma área presa (`position: sticky`) dentro de um trilho mais alto que a tela: 0 quando o
 * topo do trilho chega ao topo da tela, 1 quando o fim do trilho chega ao fim da tela.
 */
export function stickyProgress(top: number, height: number, viewport: number): number {
  return clamp01(-top / Math.max(1, height - viewport));
}

/** Etapa atual (0 a `steps - 1`) de uma sequência com `steps` etapas de mesmo tamanho. */
export function stepAt(progress: number, steps: number): number {
  return Math.min(steps - 1, Math.floor(progress * steps));
}

/**
 * Quanto um cartão da pilha está coberto pelo próximo (0 a 1): 0 enquanto o próximo está a uma altura de cartão ou
 * mais abaixo, 1 quando ele chega ao mesmo topo.
 */
export function coverAmount(currentTop: number, currentHeight: number, nextTop: number): number {
  return clamp01(1 - (nextTop - currentTop) / Math.max(1, currentHeight));
}
