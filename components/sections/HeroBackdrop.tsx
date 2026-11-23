import type { CSSProperties, ReactElement } from "react";

/** Gerador com semente fixa: as mesmas formas no servidor, em todo build (nada de Math.random na renderização). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const f1 = (n: number) => n.toFixed(1);

/**
 * Formas do fundo do Hero, como no protótipo: hexágonos, quadrados, círculos, triângulos e cruzes em traço fino,
 * algumas na cor de destaque, e uma poeira de pontos. Decorativo (`aria-hidden`), renderizado no servidor. Cada forma
 * tem uma profundidade (`--d`) que a desloca com o ponteiro (`--px`/`--py`, components/motion/HeroPointer.tsx).
 */
export function HeroBackdrop() {
  const rnd = seeded(7);
  const shapes: ReactElement[] = [];

  for (let i = 0; i < 26; i++) {
    const x = rnd() * 100;
    const y = rnd() * 100;
    const t = 10 + rnd() * 18;
    const kind = Math.floor(rnd() * 5);
    const accent = rnd() < 0.3;
    const depth = Math.round((rnd() - 0.5) * 60);
    const rot = Math.round(rnd() * 90);

    let shape: ReactElement;
    if (kind === 0) {
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k;
        return `${f1(t * Math.cos(a))},${f1(t * Math.sin(a))}`;
      });
      shape = <polygon points={pts.join(" ")} />;
    } else if (kind === 1) {
      shape = <rect x={f1(-t / 2)} y={f1(-t / 2)} width={f1(t)} height={f1(t)} rx="2" />;
    } else if (kind === 2) {
      shape = <circle r={f1(t / 2)} />;
    } else if (kind === 3) {
      shape = (
        <polygon points={`0,${f1(-t / 2)} ${f1(t / 2)},${f1(t / 2)} ${f1(-t / 2)},${f1(t / 2)}`} />
      );
    } else {
      const h = f1(t / 2);
      shape = <path d={`M-${h},-${h}L${h},${h}M${h},-${h}L-${h},${h}`} />;
    }

    // Em tela estreita, o texto ocupa a largura toda da parte de cima do Hero: as formas que caem ali somem (CSS
    // `.hero-backdrop .atras-do-texto`), e ficam as das bordas e as de perto da cena, embaixo.
    const behindText = y < 78 && x > 5 && x < 95;
    shapes.push(
      <svg
        key={`f${i}`}
        x={`${f1(x)}%`}
        y={`${f1(y)}%`}
        overflow="visible"
        className={behindText ? "atras-do-texto" : undefined}
      >
        <g className={accent ? "f a" : "f"} style={{ "--d": depth } as CSSProperties}>
          <g transform={`rotate(${rot})`}>{shape}</g>
        </g>
      </svg>
    );
  }

  for (let i = 0; i < 70; i++) {
    shapes.push(
      <circle
        key={`p${i}`}
        className="p"
        cx={`${f1(rnd() * 100)}%`}
        cy={`${f1(rnd() * 100)}%`}
        r="1.3"
      />
    );
  }

  return (
    <div aria-hidden="true" className="hero-backdrop">
      <svg>{shapes}</svg>
    </div>
  );
}
