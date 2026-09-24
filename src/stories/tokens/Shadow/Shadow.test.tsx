import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Shadow } from "./Shadow";

describe("Shadow", () => {
  it("전체 렌더 시 5개 그룹을 순서대로 표시한다", () => {
    const { container } = render(<Shadow />);
    const sections = Array.from(
      container.querySelectorAll("[data-section]"),
    ).map((el) => el.getAttribute("data-section"));
    expect(sections).toEqual([
      "black",
      "greenGray",
      "bottomNav",
      "borderNeutral",
      "borderBrand",
    ]);
  });

  it("section prop 지정 시 해당 그룹만 렌더한다", () => {
    const { container } = render(<Shadow section="borderBrand" />);
    expect(container.querySelectorAll("[data-section]")).toHaveLength(1);
    expect(
      container.querySelector('[data-section="borderBrand"]'),
    ).not.toBeNull();
  });

  it("Figma Shadow 문서의 17개 --shadow 효과 토큰을 렌더한다", () => {
    const { container } = render(<Shadow />);
    expect(container.querySelectorAll("[data-token]")).toHaveLength(17);
    expect(
      container.querySelectorAll('[data-token^="--shadow-black-"]'),
    ).toHaveLength(5);
    expect(
      container.querySelectorAll('[data-token^="--shadow-greenGray-"]'),
    ).toHaveLength(5);
    expect(
      container.querySelectorAll('[data-token^="--shadow-borderNeutral-"]'),
    ).toHaveLength(3);
    expect(
      container.querySelectorAll('[data-token^="--shadow-borderBrand-"]'),
    ).toHaveLength(3);
  });

  it("bottomNav 그룹은 스텝 없는 단일 토큰이다", () => {
    const { container } = render(<Shadow section="bottomNav" />);
    const tokens = container.querySelectorAll("[data-token]");
    expect(tokens).toHaveLength(1);
    expect(
      container.querySelector('[data-token="--shadow-bottomNav"]'),
    ).not.toBeNull();
  });

  it("프리뷰 그림자는 토큰(var(--shadow-*)) 으로만 지정한다", () => {
    const { container } = render(<Shadow section="black" />);
    const preview = container.querySelector('[data-token="--shadow-black-md"]');
    expect(preview?.getAttribute("style")).toContain("var(--shadow-black-md)");
  });
});
