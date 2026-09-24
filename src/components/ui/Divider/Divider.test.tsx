import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Divider, type DividerProps } from "./Divider";

type Orientation = NonNullable<DividerProps["orientation"]>;
type Thickness = NonNullable<DividerProps["thickness"]>;

describe("Divider", () => {
  it("기본값은 horizontal / thin 으로 separator div 를 렌더한다", () => {
    const { container } = render(<Divider />);
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("div");
    expect(root).toHaveAttribute("role", "separator");
    expect(root).toHaveAttribute("data-orientation", "horizontal");
    expect(root).toHaveAttribute("data-thickness", "thin");
    expect(root).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("orientation 별 주축(길이) 클래스와 aria-orientation 이 적용된다", () => {
    const cases: Record<Orientation, string> = {
      horizontal: "w-full",
      vertical: "h-full",
    };
    for (const [orientation, mainClass] of Object.entries(cases) as [
      Orientation,
      string,
    ][]) {
      const { container } = render(<Divider orientation={orientation} />);
      const root = container.firstElementChild;
      expect(root).toHaveClass(mainClass);
      expect(root).toHaveAttribute("aria-orientation", orientation);
      expect(root).toHaveAttribute("data-orientation", orientation);
    }
  });

  it("orientation × thickness 별 교차축(두께) 토큰 클래스가 적용된다", () => {
    const cases: [Orientation, Thickness, string][] = [
      ["horizontal", "thin", "h-[var(--sz-1)]"],
      ["horizontal", "thick", "h-[var(--sz-8)]"],
      ["vertical", "thin", "w-[var(--sz-1)]"],
      ["vertical", "thick", "w-[var(--sz-8)]"],
    ];
    for (const [orientation, thickness, crossClass] of cases) {
      const { container } = render(
        <Divider orientation={orientation} thickness={thickness} />,
      );
      const root = container.firstElementChild;
      expect(root).toHaveClass(crossClass);
      expect(root).toHaveAttribute("data-thickness", thickness);
    }
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(<Divider className="my-[var(--sz-8)]" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass(
      "my-[var(--sz-8)]",
      "shrink-0",
      "bg-bg-overlay-blackSubtle",
    );
  });

  it("색은 토큰 유틸로만 지정하고 렌더 마크업에 리터럴 hex 가 없다", () => {
    const { container } = render(
      <Divider orientation="vertical" thickness="thick" />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
