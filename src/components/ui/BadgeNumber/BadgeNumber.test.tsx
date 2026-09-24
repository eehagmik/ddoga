import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BadgeNumber, type BadgeNumberProps } from "./BadgeNumber";

describe("BadgeNumber", () => {
  it('기본값은 count 0 / size "xs" 배지를 렌더한다', () => {
    const { container } = render(<BadgeNumber />);
    const badge = container.querySelector("span");
    expect(badge).not.toBeNull();
    expect(badge).toHaveAttribute("data-size", "xs");
    expect(badge).toHaveTextContent("0");
  });

  it("count 를 그대로 문자열로 표시한다", () => {
    const { container } = render(<BadgeNumber count={7} />);
    expect(container.querySelector("span")).toHaveTextContent("7");
  });

  it("count 가 max 를 초과하면 `${max}+` 로 축약한다 (기본 max=99)", () => {
    const { container } = render(<BadgeNumber count={100} />);
    expect(container.querySelector("span")).toHaveTextContent("99+");
  });

  it("max 를 커스텀하면 그 값으로 축약한다", () => {
    const { container } = render(<BadgeNumber count={12} max={5} />);
    expect(container.querySelector("span")).toHaveTextContent("5+");
  });

  it("count === max 는 축약하지 않는다 (경계값)", () => {
    const { container } = render(<BadgeNumber count={99} max={99} />);
    expect(container.querySelector("span")).toHaveTextContent("99");
    expect(container.querySelector("span")).not.toHaveTextContent("+");
  });

  it("size 별 최소 크기·합성 타이포 클래스가 적용된다", () => {
    const cases: Record<
      NonNullable<BadgeNumberProps["size"]>,
      [string, string]
    > = {
      xs: ["min-w-[var(--sz-14)]", "text-label-3"],
      sm: ["min-w-[var(--sz-16)]", "text-label-2"],
      md: ["min-w-[var(--sz-20)]", "text-label-1"],
    };
    for (const [size, classes] of Object.entries(cases) as [
      NonNullable<BadgeNumberProps["size"]>,
      [string, string],
    ][]) {
      const { container } = render(<BadgeNumber size={size} />);
      expect(container.querySelector("span")).toHaveClass(...classes);
    }
  });

  it('전 사이즈에 font-feature-settings "case" 토큰을 적용한다', () => {
    const featureClass = "[font-feature-settings:var(--font-feature-case)]";
    for (const size of ["xs", "sm", "md"] as const) {
      const { container } = render(<BadgeNumber size={size} />);
      expect(container.querySelector("span")).toHaveClass(featureClass);
    }
  });

  it("색은 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { container } = render(<BadgeNumber count={3} />);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass(
      "bg-bg-danger-normal",
      "text-typo-inverse-normal",
    );
    expect(badge?.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <BadgeNumber count={1} className="absolute top-0 right-0" />,
    );
    expect(container.querySelector("span")).toHaveClass(
      "absolute",
      "top-0",
      "right-0",
      "bg-bg-danger-normal",
    );
  });
});
