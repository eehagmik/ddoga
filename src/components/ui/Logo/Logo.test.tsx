import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo, type LogoLockup } from "./Logo";

describe("Logo", () => {
  it('기본값은 horizontal / color 락업의 role="img" SVG 를 렌더한다', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg[role="img"]');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("data-lockup", "horizontal");
    expect(svg).toHaveAttribute("data-tone", "color");
    expect(svg).toHaveAttribute("aria-label", "또하나의가족");
  });

  it("락업별 viewBox 가 Figma 프레임 치수와 일치한다", () => {
    const cases: Record<LogoLockup, string> = {
      symbol: "0 0 70 70",
      wordmark: "0 0 287.487 50.8972",
      horizontal: "0 0 373 70",
      vertical: "0 0 245.647 145",
    };
    for (const [lockup, viewBox] of Object.entries(cases) as [
      LogoLockup,
      string,
    ][]) {
      const { container } = render(<Logo lockup={lockup} />);
      expect(container.querySelector("svg")).toHaveAttribute(
        "viewBox",
        viewBox,
      );
    }
  });

  it("width prop 은 inline style 에 반영되고 height 는 auto 로 종횡비를 고정한다", () => {
    const w = 320;
    const { container } = render(<Logo width={w} />);
    const style = container.querySelector("svg")?.getAttribute("style") ?? "";
    expect(style).toContain(`width: ${w}px`);
    expect(style).toContain("height: auto");
  });

  it("width 미지정 시 100% 로 렌더한다", () => {
    const { container } = render(<Logo />);
    expect(
      container.querySelector("svg")?.getAttribute("style") ?? "",
    ).toContain("width: 100%");
  });

  it("모든 fill 은 리터럴 색이 아닌 var(--color-*) 토큰이다", () => {
    const lockups: LogoLockup[] = [
      "symbol",
      "wordmark",
      "horizontal",
      "vertical",
    ];
    const tones = [
      "color",
      "white",
      "transparentColor",
      "transparentWhite",
    ] as const;
    for (const lockup of lockups) {
      for (const tone of tones) {
        const { container } = render(<Logo lockup={lockup} tone={tone} />);
        const filled = container.querySelectorAll("[fill]");
        expect(filled.length).toBeGreaterThan(0);
        filled.forEach((el) => {
          const fill = el.getAttribute("fill") ?? "";
          expect(fill.startsWith("var(--color-logo-")).toBe(true);
          expect(fill).not.toMatch(/#[0-9a-fA-F]{3,}/);
        });
      }
    }
  });

  it('tone="white" 는 knockout(fill-rule="evenodd") path 로 렌더한다', () => {
    const { container } = render(<Logo lockup="symbol" tone="white" />);
    expect(container.querySelector('path[fill-rule="evenodd"]')).not.toBeNull();
  });

  it('tone="color" 심볼은 사각형 + 글리프 2개 path 로 렌더한다', () => {
    const { container } = render(<Logo lockup="symbol" tone="color" />);
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelector('path[fill-rule="evenodd"]')).toBeNull();
  });

  it("expand 는 symbol + transparent tone 에서만 글리프 path 를 바꾼다", () => {
    const base = render(
      <Logo lockup="symbol" tone="transparentColor" expand={false} />,
    );
    const expanded = render(
      <Logo lockup="symbol" tone="transparentColor" expand />,
    );
    const basePath = base.container.querySelector("path")?.getAttribute("d");
    const expandedPath = expanded.container
      .querySelector("path")
      ?.getAttribute("d");
    expect(basePath).toBeTruthy();
    expect(expandedPath).toBeTruthy();
    expect(expandedPath).not.toBe(basePath);
    expect(expanded.container.querySelector("svg")).toHaveAttribute(
      "data-expand",
      "true",
    );
  });

  it("expand 는 비-symbol 락업에서 무시된다 (data-expand=false)", () => {
    const { container } = render(
      <Logo lockup="horizontal" tone="color" expand />,
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "data-expand",
      "false",
    );
  });

  it("title prop 은 aria-label 과 <title> 에 반영된다", () => {
    const { container } = render(<Logo title="또가" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-label", "또가");
    expect(container.querySelector("title")?.textContent).toBe("또가");
  });
});
