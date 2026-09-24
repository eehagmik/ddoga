import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlankIcon } from "./BlankIcon";

describe("BlankIcon", () => {
  it('data-blank="icon" 을 가진 svg 를 렌더한다', () => {
    const { container } = render(<BlankIcon />);
    const svg = container.querySelector('[data-blank="icon"]');
    expect(svg).not.toBeNull();
    expect(svg?.tagName.toLowerCase()).toBe("svg");
  });

  it("기본 size 는 24 로 width/height 에 반영된다", () => {
    const { container } = render(<BlankIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("size prop 은 width/height 에 반영되며 1:1 비율을 유지한다", () => {
    const { container } = render(<BlankIcon size={40} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
    expect(svg?.getAttribute("width")).toBe(svg?.getAttribute("height"));
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("항상 aria-hidden 인 장식용 svg 다", () => {
    const { container } = render(<BlankIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(container.querySelector("title")).toBeNull();
  });

  it("className 은 루트 svg 에 전달된다", () => {
    const { container } = render(<BlankIcon className="size-6" />);
    expect(container.querySelector("svg")).toHaveClass("size-6");
  });

  it("모든 path fill 은 currentColor — 부모 color 를 상속한다(하드코딩 색 없음)", () => {
    const { container } = render(<BlankIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach((p) => {
      const fill = p.getAttribute("fill") ?? "";
      expect(fill).toBe("currentColor");
      expect(fill).not.toMatch(/#[0-9a-fA-F]{3,}/);
    });
  });

  it("렌더 마크업에 리터럴 hex 색상이 없다", () => {
    const { container } = render(<BlankIcon />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
