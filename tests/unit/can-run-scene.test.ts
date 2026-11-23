import { describe, expect, it } from "vitest";
import { canRunScene, type SceneEnv } from "@/lib/scene/can-run-scene";

const ok: SceneEnv = {
  reducedMotion: false,
  webgl: true,
  saveData: false,
  deviceMemory: 8,
  cores: 8,
};

describe("portão da cena 3D", () => {
  it("roda num aparelho capaz, sem pedidos de economia", () => {
    expect(canRunScene(ok)).toBe(true);
  });

  it("não roda com movimento reduzido", () => {
    expect(canRunScene({ ...ok, reducedMotion: true })).toBe(false);
  });

  it("não roda sem WebGL", () => {
    expect(canRunScene({ ...ok, webgl: false })).toBe(false);
    // WebGL desenhado pela CPU (sem GPU): a cena trava a página, então fica a imagem.
    expect(canRunScene({ ...ok, softwareWebGL: true })).toBe(false);
  });

  it("não roda com economia de dados", () => {
    expect(canRunScene({ ...ok, saveData: true })).toBe(false);
  });

  it("não roda num aparelho fraco: 4 GB ou menos e até 4 núcleos", () => {
    expect(canRunScene({ ...ok, deviceMemory: 4, cores: 4 })).toBe(false);
    expect(canRunScene({ ...ok, deviceMemory: 2, cores: 2 })).toBe(false);
  });

  it("roda quando só uma das duas medidas é baixa", () => {
    expect(canRunScene({ ...ok, deviceMemory: 4, cores: 8 })).toBe(true);
    expect(canRunScene({ ...ok, deviceMemory: 8, cores: 4 })).toBe(true);
  });

  it("roda quando o navegador não informa memória, núcleos nem economia", () => {
    expect(canRunScene({ reducedMotion: false, webgl: true })).toBe(true);
  });
});
