import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";

const STEPS = ["request", "services", "data", "tests", "deploy"] as const;

/** Em que ponto da sequência (0 a 5, uma unidade por etapa) cada parte do diagrama acende. */
const from = (n: number) => ({ "--from": n }) as CSSProperties;

/**
 * Sequência presa da arquitetura, no fim do Sobre (decisão 4 da design): uma área `position: sticky` com o diagrama
 * em SVG, montado etapa por etapa conforme a rolagem (`--p`, components/motion/ScrollConductor.tsx). O texto de cada
 * etapa fica em HTML. Sem JavaScript ou com movimento reduzido, não há área presa: a lista e o diagrama aparecem
 * completos (CSS em `.seq`, globals.css).
 */
export async function Architecture() {
  const t = await getTranslations("about.sequence");
  const d = (key: string) => t(`diagram.${key}`);

  return (
    <div className="seq" data-scrub="sequence" role="group" aria-labelledby="seq-title">
      <div className="seq-stage">
        <div>
          <p className="type-eyebrow">{t("eyebrow")}</p>
          <h3 id="seq-title" className="mt-3 type-title text-text">
            {t("title")}
          </h3>
          <p className="seq-intro mt-3 text-text-2">{t("intro")}</p>
          <ol className="seq-steps">
            {STEPS.map((step, i) => (
              <li key={step} data-step>
                <b data-n={String(i + 1).padStart(2, "0")}>{t(`steps.${step}.title`)}</b>
                {t(`steps.${step}.text`)}
              </li>
            ))}
          </ol>
        </div>

        <svg
          className="seq-svg"
          viewBox="-4 -14 658 474"
          role="img"
          aria-labelledby="seq-svg-title"
        >
          <title id="seq-svg-title">{d("title")}</title>
          <g className="n" style={from(0)}>
            <rect x="16" y="40" width="112" height="52" rx="10" />
            <text x="30" y="62">
              {d("client")}
            </text>
            <text className="sub" x="30" y="80">
              HTTPS
            </text>
          </g>
          <g className="n" style={from(0.3)}>
            <rect x="186" y="40" width="160" height="52" rx="10" />
            <text x="200" y="62">
              {d("api")}
            </text>
            <text className="sub" x="200" y="80">
              FastAPI
            </text>
          </g>
          <path className="lnk" pathLength={1} style={from(0.15)} d="M128 66H186" />
          <path className="pkt" pathLength={1} style={from(0.2)} d="M128 66H186" />

          {(["A", "B", "C"] as const).map((name, i) => (
            <g key={name} className="n" style={from(1 + i * 0.2)}>
              <rect x="420" y={8 + i * 54} width="150" height="40" rx="10" />
              <text x="434" y={33 + i * 54}>
                {d("service")} {name}
              </text>
            </g>
          ))}
          <path className="lnk" pathLength={1} style={from(1.1)} d="M346 60C384 60 384 28 420 28" />
          <path className="lnk" pathLength={1} style={from(1.3)} d="M346 70C384 70 384 82 420 82" />
          <path
            className="lnk"
            pathLength={1}
            style={from(1.5)}
            d="M346 80C384 80 384 136 420 136"
          />
          <path className="pkt" pathLength={1} style={from(1.4)} d="M346 70C384 70 384 82 420 82" />

          <g className="n" style={from(2)}>
            <rect x="186" y="200" width="160" height="52" rx="10" />
            <text x="200" y="222">
              {d("queue")}
            </text>
            <text className="sub" x="200" y="240">
              {d("queue_sub")}
            </text>
          </g>
          <g className="n" style={from(2.3)}>
            <path className="shape" d="M420 214a54 12 0 0 1 108 0v52a54 12 0 0 1-108 0Z" />
            <path className="shape" d="M420 214a54 12 0 0 0 108 0" style={{ fill: "none" }} />
            <text x="440" y="252">
              MongoDB
            </text>
          </g>
          <g className="n" style={from(2.5)}>
            <rect x="546" y="206" width="96" height="52" rx="10" />
            <text x="560" y="228">
              Redis
            </text>
            <text className="sub" x="560" y="246">
              NoSQL
            </text>
          </g>
          <path className="lnk" pathLength={1} style={from(2.1)} d="M266 92V200" />
          <path className="lnk" pathLength={1} style={from(2.35)} d="M495 156V202" />
          <path
            className="lnk"
            pathLength={1}
            style={from(2.55)}
            d="M560 156C590 170 594 186 594 206"
          />
          <path className="pkt" pathLength={1} style={from(2.4)} d="M495 156V202" />

          <g className="n" style={from(3)}>
            <rect x="16" y="200" width="140" height="52" rx="10" />
            <text x="30" y="222">
              {d("tests")}
            </text>
            <text className="sub" x="30" y="240">
              TDD · Pytest · E2E
            </text>
          </g>
          {(
            [
              [346, 40, 3.2],
              [570, 8, 3.35],
              [528, 210, 3.5],
              [346, 200, 3.65],
            ] as const
          ).map(([cx, cy, at]) => (
            <g key={`${cx}-${cy}`} className="chk" style={from(at)}>
              <circle cx={cx} cy={cy} r="10" />
              <path d={`M${cx - 5} ${cy}l3.5 3.5 6-6.5`} />
            </g>
          ))}

          <rect
            className="box-out"
            style={from(4)}
            x="174"
            y="-2"
            width="472"
            height="290"
            rx="16"
          />
          <text className="lbl" style={from(4)} x="186" y="282">
            {d("container")}
          </text>
          <path className="lnk" pathLength={1} style={from(4.2)} d="M86 252V384H174" />
          <text className="lbl2" style={from(4.2)} x="26" y="374">
            GitHub Actions
          </text>
          <g className="n" style={from(4.4)}>
            <rect x="174" y="320" width="472" height="128" rx="16" />
            <text x="190" y="346">
              Kubernetes
            </text>
            <text className="sub" x="190" y="364">
              {d("replicas")}
            </text>
          </g>
          <g style={from(4.55)}>
            <rect className="prod" x="330" y="374" width="90" height="50" rx="10" />
            <rect className="prod" x="434" y="374" width="90" height="50" rx="10" />
            <rect className="prod" x="538" y="374" width="90" height="50" rx="10" />
          </g>
          <text className="okt" style={from(4.7)} x="190" y="420">
            ● {d("production")}
          </text>
        </svg>
      </div>
    </div>
  );
}
