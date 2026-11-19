/**
 * Portão da cena 3D do Hero (spec cena-3d, "Imagem estática como estado final"; decisão 6 da design).
 * A decisão é uma função pura sobre o ambiente, para ser testada sem navegador.
 */

export interface SceneEnv {
  reducedMotion: boolean;
  webgl: boolean;
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
  if (env.reducedMotion || !env.webgl) return false;
  if (env.saveData) return false;
  return !isWeakDevice(env);
}

/** Testa WebGL com um canvas descartável e libera o contexto logo em seguida. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ??
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Lê o ambiente do navegador. Só no cliente, depois da hidratação. */
export function readSceneEnv(): SceneEnv {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl: hasWebGL(),
    saveData: nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency || undefined,
  };
}
