import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Igual ao portfólio de referência: jsdom, Testing Library e o alias "@" do tsconfig.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    css: false,
    // O next-intl importa "next/navigation" sem extensão; processado pelo Vite, o import resolve (e o mock vale).
    server: { deps: { inline: ["next-intl"] } },
  },
});
