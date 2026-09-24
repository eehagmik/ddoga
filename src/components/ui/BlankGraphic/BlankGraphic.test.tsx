import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlankGraphic } from "./BlankGraphic";

describe("BlankGraphic", () => {
  it('data-blank="graphic" 을 가진 div 를 렌더한다', () => {
    const { container } = render(<BlankGraphic />);
    const root = container.querySelector('[data-blank="graphic"]');
    expect(root).not.toBeNull();
    expect(root?.tagName.toLowerCase()).toBe("div");
  });

  it("기본 ratio 는 1/1 이며 data-ratio 와 inline style 에 반영된다", () => {
    const { container } = render(<BlankGraphic />);
    const root = container.querySelector('[data-blank="graphic"]');
    expect(root).toHaveAttribute("data-ratio", "1/1");
    expect(root?.getAttribute("style") ?? "").toContain("aspect-ratio: 1/1");
  });

  it("ratio prop 은 data-ratio 와 inline style 에 반영된다", () => {
    const { container } = render(<BlankGraphic ratio="16/9" />);
    const root = container.querySelector('[data-blank="graphic"]');
    expect(root).toHaveAttribute("data-ratio", "16/9");
    expect(root?.getAttribute("style") ?? "").toContain("aspect-ratio: 16/9");
  });

  it("루트는 width 100% 로 부모 폭을 채운다", () => {
    const { container } = render(<BlankGraphic />);
    expect(
      container
        .querySelector('[data-blank="graphic"]')
        ?.getAttribute("style") ?? "",
    ).toContain("width: 100%");
  });

  it("중앙에 이미지 아이콘 svg 를 렌더한다", () => {
    const { container } = render(<BlankGraphic />);
    expect(
      container.querySelector('[data-blank="graphic"] svg'),
    ).not.toBeNull();
  });

  it("내부 아이콘은 항상 aria-hidden 인 장식 요소다", () => {
    const { container } = render(<BlankGraphic />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(container.querySelector("svg")).not.toHaveAttribute("role");
    expect(container.querySelector("title")).toBeNull();
  });

  it("className 은 루트에 병합되고 기본 클래스도 유지된다", () => {
    const { container } = render(<BlankGraphic className="rounded-lg" />);
    const root = container.querySelector('[data-blank="graphic"]');
    expect(root).toHaveClass("rounded-lg");
    expect(root).toHaveClass("bg-bg-neutral-deep");
  });

  it("렌더 마크업에 리터럴 hex 색상이 없다", () => {
    const { container } = render(<BlankGraphic />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
