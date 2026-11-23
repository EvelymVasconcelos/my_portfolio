/**
 * Portão da cena 3D do Hero (spec cena-3d, "Imagem estática como estado final"; decisão 6 da design).
 * A decisão é uma função pura sobre o ambiente, para ser testada sem navegador.
 */

export interface SceneEnv {
  reducedMotion: boolean;
  webgl: boolean;
  /** WebGL desenhado pela CPU (SwiftShader, llvmpipe): sem GPU, a cena trava a página. */
  softwareWebGL?: boolean;
  /** `navigator.connection.saveData`, quando o navegador informa. */
  saveData?: boolean;
  /** `navigator.deviceMemory` em GB, quando o navegador informa. */
  deviceMemory?: number;
  /** `navigator.hardwareConcurrency`, quando o navegador informa. */
  cores?: number;
}

/** Aparelho fraco, pela spec: 4 GB de memória ou menos **e** até 4 núcleos. */
export const WEAK_MEMORY_GB = 4;
export const WEAK_CORES = 4;

export function isWeakDevice(env: Pick<SceneEnv, "deviceMemory" | "cores">): boolean {
  if (env.deviceMemory === undefined || env.cores === undefined) return false;
  return env.deviceMemory <= WEAK_MEMORY_GB && env.cores <= WEAK_CORES;
}

export function canRunScene(env: SceneEnv): boolean {
  if (env.reducedMotion || !env.webgl || env.softwareWebGL) return false;
  if (env.saveData) return false;
  return !isWeakDevice(env);
}

/** Nome do renderizador que indica WebGL desenhado pela CPU, sem GPU. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * Testa WebGL com um canvas descartável e libera o contexto logo em seguida. Também diz se ele é desenhado por software:
 * sem GPU, a cena custou mais de 10 s de thread principal no Lighthouse de celular (2026-11-23).
 */
export function probeWebGL(): { webgl: boolean; software: boolean } {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ??
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { webgl: false, software: false };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? ""
    );
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { webgl: true, software: SOFTWARE_RENDERER.test(renderer) };
  } catch {
    return { webgl: false, software: false };
  }
}

/** Só a presença de WebGL (com ou sem GPU). */
export function hasWebGL(): boolean {
  return probeWebGL().webgl;
}

/** Lê o ambiente do navegador. Só no cliente, depois da hidratação. */
export function readSceneEnv(): SceneEnv {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const gl = probeWebGL();
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl: gl.webgl,
    softwareWebGL: gl.software,
    saveData: nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency || undefined,
  };
}
