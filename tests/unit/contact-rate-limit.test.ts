import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "@/lib/contact/rate-limit";

const MIN = 60 * 1000;

describe("limite de envios", () => {
  it("aceita 5 envios em 2 minutos e recusa o sexto com o tempo de espera", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 10 * MIN });
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) expect(limiter.hit("a", start + i * 24_000).ok).toBe(true);

    const sixth = limiter.hit("a", start + 2 * MIN);
    expect(sixth.ok).toBe(false);
    // O primeiro envio sai da janela 10 minutos depois dele: faltam 8 minutos.
    expect(sixth.retryAfter).toBe(8 * 60);
  });

  it("libera de novo quando o primeiro envio sai da janela", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 10 * MIN });
    for (let i = 0; i < 5; i++) limiter.hit("a", i * 1000);
    expect(limiter.hit("a", 9 * MIN).ok).toBe(false);
    expect(limiter.hit("a", 10 * MIN).ok).toBe(true);
  });

  it("conta cada origem separadamente", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: MIN });
    expect(limiter.hit("a", 0).ok).toBe(true);
    expect(limiter.hit("b", 0).ok).toBe(true);
    expect(limiter.hit("a", 1).ok).toBe(false);
  });

  it("recusas não estendem a janela", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: MIN });
    limiter.hit("a", 0);
    limiter.hit("a", 30_000);
    limiter.hit("a", 50_000);
    expect(limiter.hit("a", MIN).ok).toBe(true);
  });

  it("esquece origens antigas quando a lista cresce", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: MIN });
    for (let i = 0; i < 1000; i++) limiter.hit(`ip-${i}`, 0);
    // Uma origem ainda dentro da janela não pode ser esquecida.
    limiter.hit("recente", 1.5 * MIN);
    expect(limiter.size).toBe(1001);

    limiter.hit("nova", 2 * MIN);
    expect(limiter.size).toBe(2);
    expect(limiter.hit("recente", 2 * MIN).ok).toBe(false);
  });

  it("usa o primeiro IP de x-forwarded-for, depois x-real-ip", () => {
    expect(
      clientKey(new Headers({ "x-forwarded-for": "1.1.1.1, 10.0.0.1", "x-real-ip": "2.2.2.2" }))
    ).toBe("1.1.1.1");
    expect(clientKey(new Headers({ "x-real-ip": "2.2.2.2" }))).toBe("2.2.2.2");
    expect(clientKey(new Headers())).toBe("desconhecida");
  });
});
