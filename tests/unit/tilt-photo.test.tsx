import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TiltPhoto } from "@/components/motion/TiltPhoto";

function setMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
}

function mount() {
  const view = render(
    <>
      <div id="foto" />
      <TiltPhoto targetId="foto" />
    </>
  );
  const box = view.container.querySelector<HTMLElement>("#foto")!;
  box.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200 }) as DOMRect;
  return box;
}

const move = (x: number, y: number) => {
  const e = new Event("pointermove", { bubbles: true }) as PointerEvent;
  Object.assign(e, { clientX: x, clientY: y });
  return e;
};

describe("TiltPhoto", () => {
  const raf = window.requestAnimationFrame;
  afterEach(() => {
    cleanup();
    window.requestAnimationFrame = raf;
  });

  it("inclina até 8° na direção do ponteiro e volta ao plano quando ele sai", () => {
    setMedia(true);
    window.requestAnimationFrame = (cb: FrameRequestCallback) => (cb(0), 0);
    const box = mount();

    // Canto superior direito: gira para a direita (ry > 0) e para cima (rx > 0), no limite de 8°.
    act(() => void box.dispatchEvent(move(200, 0)));
    expect(box.style.getPropertyValue("--ry")).toBe("8.00deg");
    expect(box.style.getPropertyValue("--rx")).toBe("8.00deg");
    expect(box.style.getPropertyValue("--shine")).toBe("1");

    act(() => void box.dispatchEvent(new Event("pointerleave")));
    expect(box.style.getPropertyValue("--ry")).toBe("0deg");
    expect(box.style.getPropertyValue("--shine")).toBe("0");
  });

  it("não faz nada com movimento reduzido ou toque (sem ponteiro fino)", () => {
    setMedia(false);
    const box = mount();
    act(() => void box.dispatchEvent(move(200, 0)));
    expect(box.style.getPropertyValue("--ry")).toBe("");
  });
});
