import { getTranslations } from "next-intl/server";

/**
 * Diagrama do pipeline do E2E-CIFlow (imagem do projeto em destaque), em SVG com texto traduzido.
 * Cores pelos tokens (.diagrama em globals.css), nos dois temas.
 */
export async function PipelineDiagram() {
  const t = await getTranslations("projects.diagram");

  return (
    <svg
      className="diagrama aspect-[16/10] h-auto w-full"
      viewBox="0 0 640 400"
      role="img"
      aria-label={t("alt")}
    >
      <rect className="st" x="30" y="170" width="120" height="60" rx="10" />
      <text x="90" y="206" textAnchor="middle">
        {t("commit")}
      </text>
      <rect className="st" x="180" y="170" width="120" height="60" rx="10" />
      <text x="240" y="206" textAnchor="middle">
        {t("build")}
      </text>
      <rect className="st on" x="330" y="150" width="140" height="100" rx="10" />
      <text x="400" y="194" textAnchor="middle">
        {t("tests")}
      </text>
      <text className="sub" x="400" y="216" textAnchor="middle">
        Playwright
      </text>
      <rect className="st" x="500" y="170" width="110" height="60" rx="10" />
      <text x="555" y="206" textAnchor="middle">
        {t("deploy")}
      </text>
      <path className="ar" d="M150 200h30M300 200h30M470 200h30" />
      <circle className="ok" cx="150" cy="170" r="8" />
      <circle className="ok" cx="300" cy="170" r="8" />
      <circle className="ok" cx="470" cy="150" r="8" />
      <circle className="ok" cx="610" cy="170" r="8" />
      <text className="sub" x="320" y="310" textAnchor="middle">
        {t("caption")}
      </text>
    </svg>
  );
}
