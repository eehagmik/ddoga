import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dot, type DotProps } from "./Dot";

describe("Dot", () => {
  it('기본값은 size "xs" / color "red" / isBorder false 인 점을 렌더한다', () => {
    const { container } = render(<Dot />);
    const dot = container.querySelector("span");
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("data-size", "xs");
    expect(dot).toHaveAttribute("data-color", "red");
    expect(dot).toHaveAttribute("data-border", "false");
    expect(dot).toHaveClass(
      "inline-block",
      "shrink-0",
      "rounded-circle",
      "size-(--sz-6)",
      "bg-bg-danger-normal",
    );
    expect(dot).not.toHaveClass("border-xs");
    expect(dot?.textContent).toBe("");
  });

  it("size 별 고정 정사각 클래스가 적용된다", () => {
    const cases: Record<NonNullable<DotProps["size"]>, string> = {
      xs: "size-(--sz-6)",
      sm: "size-(--sz-8)",
      md: "size-(--sz-10)",
    };
    for (const [size, cls] of Object.entries(cases) as [
      NonNullable<DotProps["size"]>,
      string,
    ][]) {
      const { container } = render(<Dot size={size} />);
      const dot = container.querySelector("span");
      expect(dot).toHaveClass(cls);
      expect(dot).toHaveAttribute("data-size", size);
    }
  });

  it("color 별 배경 토큰 유틸이 적용된다", () => {
    const cases: Record<NonNullable<DotProps["color"]>, string> = {
      red: "bg-bg-danger-normal",
      brand: "bg-bg-brand-normal",
    };
    for (const [color, cls] of Object.entries(cases) as [
      NonNullable<DotProps["color"]>,
      string,
    ][]) {
      const { container } = render(<Dot color={color} />);
      const dot = container.querySelector("span");
      expect(dot).toHaveClass(cls);
      expect(dot).toHaveAttribute("data-color", color);
    }
  });

  it("isBorder true 는 1px 흰색 외곽선 클래스를 덧붙인다", () => {
    const { container } = render(<Dot isBorder />);
    const dot = container.querySelector("span");
    expect(dot).toHaveClass(
      "border-xs",
      "border-solid",
      "border-border-inverse-dark",
    );
    expect(dot).toHaveAttribute("data-border", "true");
  });

  it("isBorder false 는 외곽선 클래스를 붙이지 않는다", () => {
    const { container } = render(<Dot isBorder={false} />);
    const dot = container.querySelector("span");
    expect(dot).not.toHaveClass("border-xs");
    expect(dot).not.toHaveClass("border-border-inverse-dark");
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<Dot className="absolute top-0 right-0" />);
    expect(container.querySelector("span")).toHaveClass(
      "absolute",
      "top-0",
      "right-0",
      "rounded-circle",
      "bg-bg-danger-normal",
    );
  });

  it("색은 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { container } = render(<Dot color="brand" isBorder />);
    const dot = container.querySelector("span");
    expect(dot?.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
