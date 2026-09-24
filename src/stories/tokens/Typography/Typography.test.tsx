import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Typography } from "./Typography";

describe("Typography", () => {
  it("전체 렌더 시 8개 섹션을 순서대로 표시한다", () => {
    const { container } = render(<Typography />);
    const sections = Array.from(
      container.querySelectorAll("[data-section]"),
    ).map((el) => el.getAttribute("data-section"));
    expect(sections).toEqual([
      "family",
      "weight",
      "size",
      "display",
      "title",
      "body",
      "label",
      "other",
    ]);
  });

  it("section prop 지정 시 해당 섹션만 렌더한다", () => {
    const { container } = render(<Typography section="body" />);
    expect(container.querySelectorAll("[data-section]")).toHaveLength(1);
    expect(container.querySelector('[data-section="body"]')).not.toBeNull();
  });

  it("원시 토큰 — family 1 · weight 2 · size 9 를 렌더한다", () => {
    const { container } = render(<Typography />);
    expect(
      container.querySelectorAll('[data-token="--font-sans"]'),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll('[data-token^="--font-weight-"]'),
    ).toHaveLength(2);
    const size = container.querySelector('[data-section="size"]');
    expect(size?.querySelectorAll("[data-token]")).toHaveLength(9);
  });

  it("size 스케일에 4xl 단계는 없다", () => {
    const { container } = render(<Typography section="size" />);
    expect(container.querySelector('[data-token="--text-2xs"]')).not.toBeNull();
    expect(container.querySelector('[data-token="--text-5xl"]')).not.toBeNull();
    expect(container.querySelector('[data-token="--text-4xl"]')).toBeNull();
  });

  it("weight 는 Medium·Bold 2단계뿐이다", () => {
    const { container } = render(<Typography section="weight" />);
    expect(
      container.querySelector('[data-token="--font-weight-normal"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-token="--font-weight-bold"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-token="--font-weight-medium"]'),
    ).toBeNull();
  });

  it("합성 텍스트 스타일 — display 1 · title 3 · body 12 · label 6 · other 3 (총 25종)", () => {
    const { container } = render(<Typography />);
    const count = (cat: string) =>
      container
        .querySelector(`[data-section="${cat}"]`)
        ?.querySelectorAll("[data-token]").length;
    expect(count("display")).toBe(1);
    expect(count("title")).toBe(3);
    expect(count("body")).toBe(12);
    expect(count("label")).toBe(6);
    expect(count("other")).toBe(3);
  });

  it("합성 스타일 미리보기는 --text-<name> 및 컴패니언 토큰으로만 지정한다", () => {
    const { container } = render(<Typography section="body" />);
    const preview = container.querySelector(
      '[data-token="--text-body-1-bold"] span[style]',
    );
    const style = preview?.getAttribute("style") ?? "";
    expect(style).toContain("var(--text-body-1-bold)");
    expect(style).toContain("var(--text-body-1-bold--line-height)");
    expect(style).toContain("var(--text-body-1-bold--letter-spacing)");
    expect(style).toContain("var(--text-body-1-bold--font-weight)");
  });

  it("other 스타일은 권장 색상 유틸(text-typo-*)을 미리보기에 적용한다", () => {
    const { container } = render(<Typography section="other" />);
    const preview = container.querySelector(
      '[data-token="--text-other-store-card"] span[style]',
    );
    expect(preview?.className).toContain("text-typo-neutral-subtle");
  });
});
