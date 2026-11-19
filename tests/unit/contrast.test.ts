import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Lê os tokens de cor direto de app/globals.css, para o teste acompanhar qualquer mudança de valor.
const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf-8");

function tokensOf(selector: string): Record<string, string> {
  const start = css.indexOf(`\n${selector} {`);
  if (start < 0) throw new Error(`bloco ${selector} não encontrado em globals.css`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const tokens: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g))
    tokens[name] = value;
  return tokens;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Todos os pares usados no site, num lugar só: [cor, fundos sobre os quais ela pode aparecer, mínimo].
 * 4,5:1 para texto; 3:1 para bordas de campo e controle, anel de foco e formas que carregam sentido (WCAG 1.4.11).
 * Spec `identidade-visual` da change estrutura-movimento-e-cena-3d.
 */
const RULES: Array<[string, string[], number]> = [
  ["text", ["bg", "surface", "surface-2"], 4.5],
  ["text-2", ["bg", "surface", "surface-2"], 4.5],
  ["text-3", ["bg", "surface"], 4.5], // nunca sobre --surface-2
  ["accent-text", ["bg", "surface", "surface-2"], 4.5],
  ["accent-2-text", ["bg", "surface", "surface-2"], 4.5],
  ["ok", ["bg", "surface", "surface-2"], 4.5],
  ["danger", ["bg", "surface", "surface-2"], 4.5],
  ["on-accent", ["accent"], 4.5], // texto dos botões cheios
  ["bg", ["danger"], 4.5], // texto do botão de perigo
  ["line-strong", ["bg", "surface"], 3],
  ["focus", ["bg", "surface", "surface-2"], 3],
  // Retoques em orquídea. Sobre --surface o escuro dá 2,97:1: lá a orquídea só pode ser decorativa (sem sentido próprio).
  ["accent-2", ["bg"], 3],
];

// Fundos aprovados pela dona no protótipo (roxo 1 violeta, 2026-11-19).
const APPROVED = {
  claro: { bg: "#f6f4f9", accent: "#7c3aed" },
  escuro: { bg: "#121117", accent: "#7c3aed" },
};

describe.each([
  ["claro", ":root"],
  ["escuro", ".dark"],
] as const)("contraste dos tokens no tema %s", (name, selector) => {
  const light = tokensOf(":root");
  // O tema escuro herda de :root o que não redefine.
  const tokens = selector === ":root" ? light : { ...light, ...tokensOf(".dark") };

  it.each(RULES)("--%s sobre %j atinge %s:1", (fg, backgrounds, min) => {
    for (const bg of backgrounds) {
      expect(tokens[fg], `--${fg}`).toBeDefined();
      expect(tokens[bg], `--${bg}`).toBeDefined();
      expect(contrast(tokens[fg], tokens[bg]), `--${fg} sobre --${bg}`).toBeGreaterThanOrEqual(min);
    }
  });

  it("usa o fundo e o violeta aprovados", () => {
    expect(tokens.bg.toLowerCase()).toBe(APPROVED[name].bg);
    expect(tokens.accent.toLowerCase()).toBe(APPROVED[name].accent);
  });
});

describe("faixa invertida (Contato e rodapé)", () => {
  // A faixa usa a paleta do outro tema; as cópias precisam ser idênticas às originais para herdar o AA.
  it("no tema claro, repete a paleta escura", () => {
    expect(tokensOf("html:not(.dark) .band-invert")).toEqual(tokensOf(".dark"));
  });

  it("no tema escuro, repete a paleta clara", () => {
    expect(tokensOf(".dark .band-invert")).toEqual(tokensOf(":root"));
  });
});

describe("cores fora dos tokens", () => {
  // Componentes usam só tokens; cor literal fica em app/globals.css (exceto logos de marca).
  it("nenhum componente usa hex ou rgb literal", async () => {
    const { globSync } = await import("node:fs");
    const files = globSync("{components,app}/**/*.tsx", { cwd: process.cwd() }).filter(
      // Particles.tsx não é usado e sai no bloco 3 (tarefa 3.8).
      (f) => !/Icon\.tsx$|animations\/Particles\.tsx$/.test(f)
    );
    const offenders = files.flatMap((f) => {
      const src = readFileSync(path.join(process.cwd(), f), "utf-8");
      const hits = src.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])|rgba?\(/g) ?? [];
      return hits.length ? [`${f}: ${hits.join(", ")}`] : [];
    });
    expect(offenders).toEqual([]);
  });
});
