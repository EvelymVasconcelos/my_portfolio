/**
 * Limite de envios por origem, em memória, com janela deslizante (decisão 7 da design da change
 * `fundacao-ferramentas-e-stack`).
 *
 * Em hospedagem serverless cada instância tem a própria memória, então o limite vale por instância: segura abuso
 * simples, não ataque distribuído. O campo isca e o limite da hospedagem complementam.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Segundos até a origem poder enviar de novo (só quando `ok` é falso). */
  retryAfter: number;
}

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  /** Tira as origens sem envio na janela, para a memória não crescer sem fim. */
  function prune(now: number) {
    for (const [key, times] of hits) {
      if (times[times.length - 1] <= now - windowMs) hits.delete(key);
    }
  }

  return {
    /** Quantas origens estão na memória agora. */
    get size() {
      return hits.size;
    },
    hit(key: string, now = Date.now()): RateLimitResult {
      if (hits.size > 1000) prune(now);
      const recent = (hits.get(key) ?? []).filter((time) => time > now - windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return {
          ok: false,
          retryAfter: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)),
        };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true, retryAfter: 0 };
    },
  };
}

/** Origem de quem envia: primeiro IP de `x-forwarded-for`, depois `x-real-ip`. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "desconhecida";
}

/** 5 envios a cada 10 minutos, como pede a spec `formulario-de-contato`. */
export const contactLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
