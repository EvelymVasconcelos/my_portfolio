/**
 * Modelo 3D da personagem do Hero, gerado por scripts/personagem/ (`npm run personagem`, `personagem:exportar` e
 * `personagem:comprimir`). Fica fora de components/scene/hero-scene.ts para o carregador da cena poder começar o
 * download sem importar o Three.js.
 */
export const MODEL_URL = "/models/evelym.glb";

/** Baixa o modelo, com prioridade baixa: ele nunca disputa banda com o conteúdo da página. */
export function fetchModel(): Promise<ArrayBuffer> {
  return fetch(MODEL_URL, { priority: "low" } as RequestInit).then((response) => {
    if (!response.ok) throw new Error(`modelo da personagem: HTTP ${response.status}`);
    return response.arrayBuffer();
  });
}
