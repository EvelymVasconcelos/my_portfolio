import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Configuração "flat" do ESLint 9+ (o `next lint` saiu no Next 16), como no portfólio de referência.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    // Protótipos, currículo e artefatos gerados não fazem parte do app.
    "design/**",
    "curriculum/**",
    "graphify-out/**",
    "openspec/**",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Ferramentas de linha de comando falam pelo console.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
]);
