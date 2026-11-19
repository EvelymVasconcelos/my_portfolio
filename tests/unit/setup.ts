import "@testing-library/jest-dom/vitest";
import { createElement, type ImgHTMLAttributes } from "react";
import { vi } from "vitest";

// APIs de navegador que o jsdom não implementa e que os componentes usam.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class ObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
vi.stubGlobal("IntersectionObserver", ObserverStub);
vi.stubGlobal("ResizeObserver", ObserverStub);

// Canvas sem contexto: o componente de partículas sai cedo, como num navegador sem canvas.
HTMLCanvasElement.prototype.getContext = vi.fn(
  () => null
) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// next/image vira <img> simples: o otimizador de imagens não existe fora do Next.
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    priority: _priority,
    fill: _fill,
    ...rest
  }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean; src: string }) =>
    createElement("img", { src, alt, ...rest }),
}));

// Fora do Next não existe o roteador do App Router. O next-intl 3 carrega "next/navigation" por require (CommonJS),
// que o vi.mock não intercepta; por isso a simulação fica na navegação do próprio projeto (i18n/navigation.ts).
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children?: unknown }) =>
    createElement("a", { href, ...rest }, children as never),
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  redirect: vi.fn(),
}));
