import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alpha } from "./Alpha";

describe("Alpha", () => {
  it("전체 렌더 시 7개 스텝을 낮은 → 높은 순서로 표시한다", () => {
    const { container } = render(<Alpha />);
    const sections = Array.from(
      container.querySelectorAll("[data-section]"),
    ).map((el) => el.getAttribute("data-section"));
    expect(sections).toEqual(["00", "05", "10", "20", "40", "60", "80"]);
  });

  it("Figma Alpha 문서의 7개 --alpha 토큰을 렌더한다", () => {
    const { container } = render(<Alpha />);
    const tokens = Array.from(container.querySelectorAll("[data-token]")).map(
      (el) => el.getAttribute("data-token"),
    );
    expect(tokens).toEqual([
      "--alpha-00",
      "--alpha-05",
      "--alpha-10",
      "--alpha-20",
      "--alpha-40",
      "--alpha-60",
      "--alpha-80",
    ]);
  });

  it("section prop 지정 시 해당 스텝만 렌더한다", () => {
    const { container } = render(<Alpha section="40" />);
    expect(container.querySelectorAll("[data-section]")).toHaveLength(1);
    expect(container.querySelector('[data-section="40"]')).not.toBeNull();
    expect(container.querySelector('[data-token="--alpha-40"]')).not.toBeNull();
  });

  it("데모 칩은 opacity 를 --alpha 토큰의 정적 유틸 클래스로 지정한다", () => {
    const { container } = render(<Alpha section="20" />);
    const chip = container.querySelector('[data-token="--alpha-20"]');
    expect(chip?.className).toContain("opacity-(--alpha-20)");
  });
});
