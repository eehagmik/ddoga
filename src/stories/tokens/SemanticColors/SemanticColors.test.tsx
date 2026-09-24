import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SemanticColors } from "./SemanticColors";

describe("SemanticColors", () => {
  it("전체 렌더 시 5개 UI Element 섹션을 모두 표시한다", () => {
    const { container } = render(<SemanticColors />);
    const elements = Array.from(
      container.querySelectorAll("[data-element]"),
    ).map((el) => el.getAttribute("data-element"));
    expect(elements).toEqual(["bg", "typo", "border", "icon", "shadow"]);
  });

  it("element prop 지정 시 해당 섹션만 렌더한다", () => {
    const { container } = render(<SemanticColors element="shadow" />);
    expect(container.querySelectorAll("[data-element]")).toHaveLength(1);
    expect(container.querySelector('[data-element="shadow"]')).not.toBeNull();
  });

  it("각 스와치는 semantic 토큰을 var() 로 참조한다 (Primitive 직접 참조 없음)", () => {
    const { container } = render(<SemanticColors element="bg" />);
    const swatches = container.querySelectorAll("[data-token]");
    expect(swatches.length).toBeGreaterThan(0);
    swatches.forEach((node) => {
      expect(node.getAttribute("data-token")).toMatch(
        /^--color-bg-[A-Za-z]+-[A-Za-z]+$/,
      );
      expect(node.getAttribute("style")).toContain("var(--color-bg-");
    });
  });

  it("알려진 토큰 라벨을 노출한다", () => {
    render(<SemanticColors element="bg" />);
    expect(screen.getByText("bg-neutral-normal")).toBeInTheDocument();
    expect(screen.getByText("bg-overlay-greenGrayDark")).toBeInTheDocument();
  });
});
