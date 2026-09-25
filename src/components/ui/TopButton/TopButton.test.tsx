import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TopButton } from "./TopButton";

/** jsdom 은 scrollTo / matchMedia 를 구현하지 않으므로 테스트별로 스텁한다. */
let scrollToSpy: ReturnType<typeof vi.fn>;

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
}

beforeEach(() => {
  scrollToSpy = vi.fn();
  vi.stubGlobal("scrollTo", scrollToSpy);
  stubMatchMedia(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TopButton", () => {
  it('기본값은 type="button" / aria-label "맨 위로" / 초기 숨김 상태로 렌더한다', () => {
    const { container } = render(<TopButton />);
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("aria-label", "맨 위로");
    expect(btn).toHaveAttribute("data-visible", "false");
    expect(btn).toHaveAttribute("aria-hidden", "true");
    expect(btn).toHaveAttribute("tabindex", "-1");
    expect(btn).toHaveClass("opacity-0", "pointer-events-none");
  });

  it("색·크기·형태를 디자인 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { container } = render(<TopButton visible />);
    const btn = container.querySelector("button");
    expect(btn).toHaveClass(
      "bg-bg-neutral-dark",
      "text-icon-neutral-light",
      "shadow-black-md",
      "rounded-circle",
      "size-(--sz-54)",
      "fixed",
    );
    expect(btn?.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("arrow_up_line 아이콘을 22px 로 렌더한다", () => {
    const { container } = render(<TopButton visible />);
    const svg = container.querySelector("button svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "22");
    expect(svg).toHaveAttribute("height", "22");
  });

  it("visible prop 으로 노출 상태를 제어한다 (controlled)", () => {
    const { container, rerender } = render(<TopButton visible={false} />);
    const btn = container.querySelector("button");
    expect(btn).toHaveAttribute("data-visible", "false");
    expect(btn).toHaveClass("opacity-0", "pointer-events-none");
    expect(btn).toHaveAttribute("tabindex", "-1");

    rerender(<TopButton visible />);
    expect(btn).toHaveAttribute("data-visible", "true");
    expect(btn).toHaveClass("opacity-100");
    expect(btn).toHaveAttribute("tabindex", "0");
    expect(btn).toHaveAttribute("aria-hidden", "false");
  });

  it("클릭하면 window 를 부드럽게 최상단으로 스크롤한다", () => {
    const { container } = render(<TopButton visible />);
    fireEvent.click(container.querySelector("button")!);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("prefers-reduced-motion 사용자에게는 즉시(auto) 스크롤한다", () => {
    stubMatchMedia(true);
    const { container } = render(<TopButton visible />);
    fireEvent.click(container.querySelector("button")!);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("onClick 을 주면 기본 스크롤 대신 콜백만 실행한다", () => {
    const onClick = vi.fn();
    const { container } = render(<TopButton visible onClick={onClick} />);
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it("scrollTargetRef 를 주면 해당 요소를 스크롤한다", () => {
    const el = document.createElement("div");
    el.scrollTo = vi.fn();
    const { container } = render(
      <TopButton visible scrollTargetRef={{ current: el }} />,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(el.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it("label 을 커스텀하면 aria-label 에 반영된다", () => {
    const { container } = render(<TopButton visible label="처음으로" />);
    expect(container.querySelector("button")).toHaveAttribute(
      "aria-label",
      "처음으로",
    );
  });

  it("uncontrolled: 컨테이너를 showAfter 이상 스크롤하면 노출된다", () => {
    const el = document.createElement("div");
    let top = 0;
    Object.defineProperty(el, "scrollTop", { get: () => top });
    document.body.appendChild(el);

    const { container } = render(
      <TopButton scrollTargetRef={{ current: el }} showAfter={20} />,
    );
    const btn = container.querySelector("button")!;
    expect(btn).toHaveAttribute("data-visible", "false");

    top = 21;
    fireEvent.scroll(el);
    expect(btn).toHaveAttribute("data-visible", "true");

    top = 0;
    fireEvent.scroll(el);
    expect(btn).toHaveAttribute("data-visible", "false");

    el.remove();
  });

  it("className 을 루트 button 에 병합한다", () => {
    const { container } = render(
      <TopButton visible className="bottom-(--sz-96)" />,
    );
    expect(container.querySelector("button")).toHaveClass(
      "bottom-(--sz-96)",
      "bg-bg-neutral-dark",
    );
  });
});
