import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Loader, type LoaderColor, type LoaderSize } from "./Loader";

/** 트랙(첫째)·인디케이터(둘째) span 을 반환 */
function layers(container: HTMLElement) {
  const spans = container.querySelectorAll("span > span");
  return { track: spans[0], indicator: spans[1] };
}

describe("Loader", () => {
  it('기본값은 color "brand" / size "md" / label "로딩 중" 인 로더를 렌더한다', () => {
    const { container } = render(<Loader />);
    const root = container.querySelector("span");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-label", "로딩 중");
    expect(root).toHaveAttribute("data-color", "brand");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveClass(
      "relative",
      "inline-block",
      "shrink-0",
      "size-(--sz-50)",
    );
  });

  it("size 별 정사각 + 링 두께 클래스가 적용된다", () => {
    const cases: Record<LoaderSize, { root: string; thickness: string }> = {
      sm: { root: "size-(--sz-28)", thickness: "border-md" },
      md: { root: "size-(--sz-50)", thickness: "border-lg" },
    };
    for (const [size, cls] of Object.entries(cases) as [
      LoaderSize,
      { root: string; thickness: string },
    ][]) {
      const { container } = render(<Loader size={size} />);
      const root = container.querySelector("span");
      expect(root).toHaveClass(cls.root);
      expect(root).toHaveAttribute("data-size", size);
      const { track, indicator } = layers(container);
      expect(track).toHaveClass(cls.thickness);
      expect(indicator).toHaveClass(cls.thickness);
    }
  });

  it("color 별 트랙/인디케이터 색 토큰 유틸이 적용된다", () => {
    const cases: Record<LoaderColor, { track: string; indicator: string }> = {
      brand: {
        track: "border-border-brand-subtle",
        indicator: "border-t-border-brand-normal",
      },
      white: {
        track: "border-border-inverse-dark",
        indicator: "border-t-border-inverse-dark",
      },
    };
    for (const [color, cls] of Object.entries(cases) as [
      LoaderColor,
      { track: string; indicator: string },
    ][]) {
      const { container } = render(<Loader color={color} />);
      const root = container.querySelector("span");
      expect(root).toHaveAttribute("data-color", color);
      const { track, indicator } = layers(container);
      expect(track).toHaveClass(cls.track, "opacity-(--alpha-20)");
      expect(indicator).toHaveClass(cls.indicator);
    }
  });

  it("인디케이터 span 은 회전하고 감속 모션 선호를 존중한다", () => {
    const { container } = render(<Loader />);
    const { indicator } = layers(container);
    expect(indicator).toHaveClass(
      "animate-spin",
      "motion-reduce:animate-none",
      "border-transparent",
    );
  });

  it("label prop 으로 aria-label 을 덮어쓴다", () => {
    const { container } = render(<Loader label="불러오는 중" />);
    expect(container.querySelector("span")).toHaveAttribute(
      "aria-label",
      "불러오는 중",
    );
  });

  it("className 을 루트에 병합하고 base 클래스를 유지한다", () => {
    const { container } = render(<Loader className="absolute top-0" />);
    expect(container.querySelector("span")).toHaveClass(
      "absolute",
      "top-0",
      "relative",
      "inline-block",
      "shrink-0",
      "size-(--sz-50)",
    );
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(<Loader color="white" size="sm" />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
