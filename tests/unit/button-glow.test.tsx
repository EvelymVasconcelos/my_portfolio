import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ButtonGlow } from "@/components/motion/ButtonGlow";
import { Button } from "@/components/ui/Button";

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
      <Button>
        <span>Agendar uma call</span>
      </Button>
      <ButtonGlow />
    </>
  );
  const button = view.getByRole("button");
  button.getBoundingClientRect = () => ({ left: 100, top: 50, width: 160, height: 40 }) as DOMRect;
  return button;
}

const move = (target: Element, x: number, y: number) => {
  const e = new Event("pointermove", { bubbles: true }) as PointerEvent;
  Object.assign(e, { clientX: x, clientY: y });
  target.dispatchEvent(e);
};

describe("ButtonGlow", () => {
  const raf = window.requestAnimationFrame;
  afterEach(() => {
    cleanup();
    window.requestAnimationFrame = raf;
  });

  it("o botão não sobe no hover: não há deslocamento nas classes", () => {
    setMedia(false);
    const button = mount();
    expect(button.className).toContain("btn-luz");
    expect(button.className).not.toMatch(/hover:-?translate/);
  });

  it("grava a posição do ponteiro no botão, mesmo vindo de um filho", () => {
    setMedia(true);
    window.requestAnimationFrame = (cb: FrameRequestCallback) => (cb(0), 0);
    const button = mount();
    act(() => move(button.querySelector("span")!, 180, 70));
    expect(button.style.getPropertyValue("--x")).toBe("80px");
    expect(button.style.getPropertyValue("--y")).toBe("20px");
  });

  it("não faz nada com movimento reduzido ou toque (sem ponteiro fino)", () => {
    setMedia(false);
    const button = mount();
    act(() => move(button, 180, 70));
    expect(button.style.getPropertyValue("--x")).toBe("");
  });
});
