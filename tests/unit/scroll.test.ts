import { describe, expect, it } from "vitest";
import { coverAmount, stepAt, stickyProgress } from "@/lib/motion/scroll";

describe("condutor de rolagem", () => {
  // Trilho de 4680 px numa tela de 900 px: a área presa percorre 3780 px de rolagem.
  const H = 4680;
  const V = 900;

  it("vai de 0 a 1 ao rolar o trilho e volta pelo mesmo caminho", () => {
    const tops = Array.from({ length: 41 }, (_, i) => 200 - i * 100); // de 200 px abaixo do topo até -3800
    const down = tops.map((top) => stickyProgress(top, H, V));
    const up = [...tops].reverse().map((top) => stickyProgress(top, H, V));

    expect(down[0]).toBe(0);
    expect(down.at(-1)).toBe(1);
    // Monotônico na descida e idêntico na volta: o progresso só depende da posição, não do caminho.
    down.forEach((p, i) => i && expect(p).toBeGreaterThanOrEqual(down[i - 1]));
    expect([...up].reverse()).toEqual(down);
  });

  it("divide o progresso em cinco etapas iguais", () => {
    expect([0, 0.19, 0.2, 0.5, 0.79, 0.8, 1].map((p) => stepAt(p, 5))).toEqual([
      0, 0, 1, 2, 3, 4, 4,
    ]);
  });

  it("calcula quanto o próximo cartão da pilha cobre o atual", () => {
    expect(coverAmount(100, 400, 600)).toBe(0); // o próximo está uma altura inteira abaixo
    expect(coverAmount(100, 400, 300)).toBe(0.5);
    expect(coverAmount(100, 400, 100)).toBe(1); // chegou ao mesmo topo
  });
});
