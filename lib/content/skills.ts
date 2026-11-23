/**
 * Competências (seção Sobre): ordem dos grupos e das tecnologias e o ícone de cada uma, só com o que está no
 * currículo. Os nomes ficam em `messages/*.json` (`about.skills.<grupo>.items.<id>`).
 *
 * Ícones: `si-<slug>` vem do Simple Icons (logotipo da marca, CC0) e `lu-<nome>` do lucide, quando não há logotipo.
 * Os dois vivem em public/icons/tech.svg, gerado por scripts/tech-icons/build.mjs a partir desta lista.
 */

export interface Skill {
  id: string;
  icon: string;
}

export const SKILL_GROUPS = [
  {
    id: "languages",
    items: [
      { id: "python", icon: "si-python" },
      { id: "fastapi", icon: "si-fastapi" },
      { id: "django", icon: "si-django" },
      { id: "flask", icon: "si-flask" },
      { id: "java", icon: "si-openjdk" },
      { id: "javascript", icon: "si-javascript" },
    ],
  },
  {
    id: "architecture",
    items: [
      { id: "rest", icon: "lu-braces" },
      { id: "microservices", icon: "lu-network" },
      { id: "design_patterns", icon: "lu-layers" },
      { id: "solid", icon: "lu-box" },
    ],
  },
  {
    id: "data",
    items: [
      { id: "postgresql", icon: "si-postgresql" },
      { id: "mysql", icon: "si-mysql" },
      { id: "redis", icon: "si-redis" },
      { id: "mongodb", icon: "si-mongodb" },
      { id: "etl", icon: "lu-workflow" },
    ],
  },
  {
    id: "infra",
    items: [
      { id: "docker", icon: "si-docker" },
      { id: "kubernetes", icon: "si-kubernetes" },
      { id: "aws", icon: "lu-cloud" },
      { id: "linux", icon: "si-linux" },
      { id: "git", icon: "si-git" },
      { id: "github", icon: "si-github" },
    ],
  },
  {
    id: "quality",
    items: [
      { id: "tdd", icon: "lu-test-tube" },
      { id: "pytest", icon: "si-pytest" },
      { id: "bdd", icon: "lu-list-checks" },
      { id: "clean_code", icon: "lu-code" },
      { id: "code_review", icon: "lu-git-pull-request" },
      { id: "playwright", icon: "lu-drama" },
    ],
  },
  {
    id: "delivery",
    items: [
      { id: "github_actions", icon: "si-githubactions" },
      { id: "cicd", icon: "lu-infinity" },
      { id: "e2e_tests", icon: "lu-monitor-play" },
      { id: "agile", icon: "lu-kanban" },
    ],
  },
] as const satisfies ReadonlyArray<{ id: string; items: ReadonlyArray<Skill> }>;

export type SkillGroupId = (typeof SKILL_GROUPS)[number]["id"];

export const TECH_SPRITE = "/icons/tech.svg";
