import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dim } from "./Dim";

describe("Dim", () => {
  it("기본값은 variant normal 로 렌더한다", () => {
    const { container } = render(<Dim />);
    const dim = container.firstElementChild!;
    expect(dim).toHaveAttribute("data-variant", "normal");
    expect(dim).toHaveClass("bg-bg-overlay-blackNormal");
  });

  it("variant 별 배경 클래스가 적용된다", () => {
    const cases = {
      normal: "bg-bg-overlay-blackNormal",
      dark: "bg-bg-overlay-blackDark",
      gradient:
        "bg-[linear-gradient(to_bottom,var(--color-bg-overlay-blackNone),var(--color-bg-overlay-blackDeep))]",
      white: "bg-bg-overlay-whiteDeep",
    } as const;

    for (const [variant, className] of Object.entries(cases)) {
      const { container } = render(
        <Dim variant={variant as keyof typeof cases} />,
      );
      const dim = container.firstElementChild!;
      expect(dim).toHaveAttribute("data-variant", variant);
      expect(dim).toHaveClass(className);
    }
  });

  it("absolute inset-0 클래스를 기본으로 포함한다", () => {
    const { container } = render(<Dim />);
    expect(container.firstElementChild).toHaveClass("absolute", "inset-0");
  });

  it("className prop 을 병합한다", () => {
    const { container } = render(<Dim className="z-50" />);
    const dim = container.firstElementChild!;
    expect(dim).toHaveClass("z-50", "absolute", "inset-0");
  });

  it("...rest 로 전달한 속성을 루트에 spread 한다", () => {
    const { container } = render(<Dim data-testid="dim-overlay" />);
    expect(
      container.querySelector('[data-testid="dim-overlay"]'),
    ).not.toBeNull();
  });

  it("마크업에 hex 코드가 없다", () => {
    const { container } = render(<Dim variant="gradient" />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
