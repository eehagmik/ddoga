import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Size } from "./Size";

describe("Size", () => {
  it("전체 렌더 시 3개 섹션을 순서대로 표시한다", () => {
    const { container } = render(<Size />);
    const sections = Array.from(
      container.querySelectorAll("[data-section]"),
    ).map((el) => el.getAttribute("data-section"));
    expect(sections).toEqual(["sz", "radius", "borderWidth"]);
  });

  it("section prop 지정 시 해당 섹션만 렌더한다", () => {
    const { container } = render(<Size section="radius" />);
    expect(container.querySelectorAll("[data-section]")).toHaveLength(1);
    expect(container.querySelector('[data-section="radius"]')).not.toBeNull();
  });

  it("sz 섹션은 Figma Size 문서의 53개 --sz 토큰을 렌더한다", () => {
    const { container } = render(<Size section="sz" />);
    const tokens = container.querySelectorAll('[data-token^="--sz-"]');
    expect(tokens).toHaveLength(53);
    expect(container.querySelector('[data-token="--sz-16"]')).not.toBeNull();
    expect(container.querySelector('[data-token="--sz-9999"]')).not.toBeNull();
  });

  it("radius 섹션은 8개, borderWidth 섹션은 6개 시맨틱 토큰을 렌더한다", () => {
    const { container } = render(<Size />);
    expect(
      container.querySelectorAll('[data-token^="--radius-"]'),
    ).toHaveLength(8);
    expect(
      container.querySelectorAll('[data-token^="--border-width-"]'),
    ).toHaveLength(6);
  });

  it("프리뷰 크기는 토큰(var(--sz-*)) 으로만 지정한다", () => {
    const { container } = render(<Size section="sz" />);
    const bar = container.querySelector('[data-token="--sz-24"] span[style]');
    expect(bar?.getAttribute("style")).toContain("var(--sz-24)");
  });
});
