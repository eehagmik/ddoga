import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Radio, type RadioSize } from "./Radio";

describe("Radio", () => {
  it("기본값은 size md / unchecked / state enable 인 원을 렌더한다", () => {
    const { container } = render(<Radio />);
    const root = container.querySelector("span");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-checked", "false");
    expect(root).toHaveAttribute("data-state", "enable");
    expect(root).toHaveClass(
      "inline-flex",
      "rounded-circle",
      "size-(--sz-24)",
      "bg-bg-neutral-normal",
      "border-sm",
      "border-solid",
      "border-border-neutral-light",
    );
    // 루트에 `group` 을 붙이지 않는다 — hover 는 조상 `.group` 에 위임한다.
    expect(root).not.toHaveClass("group");
  });

  it("내부 점은 배경색을 가진 원형 span 이다(커스텀 path 없음)", () => {
    const { container } = render(<Radio />);
    const dot = container.querySelector("span > span");
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("aria-hidden");
    expect(dot).toHaveClass(
      "rounded-circle",
      "size-(--sz-12)",
      "bg-icon-brandGrayish-light",
      "opacity-(--alpha-40)",
    );
    // Radio 는 variant(circle/square/mark) 축이 없다 — Checkbox 와 달리 svg/path 가 없다.
    expect(container.querySelector("svg")).toBeNull();
  });

  it("size 별 상자/점 크기 클래스가 적용된다", () => {
    const box: Record<RadioSize, [string, string]> = {
      sm: ["size-(--sz-22)", "size-(--sz-10)"],
      md: ["size-(--sz-24)", "size-(--sz-12)"],
      lg: ["size-(--sz-28)", "size-(--sz-14)"],
    };
    for (const [size, [rootCls, dotCls]] of Object.entries(box) as [
      RadioSize,
      [string, string],
    ][]) {
      const { container } = render(<Radio size={size} />);
      expect(container.querySelector("span")).toHaveClass(rootCls);
      expect(container.querySelector("span > span")).toHaveClass(dotCls);
    }
  });

  it("checked 는 브랜드 배경 + 흰 점으로 전환하고 테두리를 투명하게 한다(폭은 유지)", () => {
    const { container } = render(<Radio checked />);
    const root = container.querySelector("span");
    expect(root).toHaveAttribute("data-checked", "true");
    expect(root).toHaveClass(
      "bg-bg-brand-normal",
      "hover:bg-bg-brand-deep",
      "group-hover:bg-bg-brand-deep",
    );
    // border-sm/border-solid 는 checked 와 무관하게 루트에 항상 적용된다(폭 고정) —
    // checked 는 border-transparent 로 색만 투명하게 해 unchecked 전환 시 검은 테두리
    // 플래시(currentColor 기본값 전이)를 막는다.
    expect(root).toHaveClass("border-sm", "border-solid", "border-transparent");
    expect(root).not.toHaveClass("border-border-neutral-light");
    const dot = container.querySelector("span > span");
    expect(dot).toHaveClass("bg-icon-inverse-normal");
    expect(dot).not.toHaveClass("opacity-(--alpha-40)");
  });

  it("unchecked 는 hover(단독) 와 group-hover(조상 .group) 로 brandGrayish 배경/점에 전이한다", () => {
    const { container } = render(<Radio />);
    expect(container.querySelector("span")).toHaveClass(
      "hover:bg-bg-brandGrayish-deep",
      "group-hover:bg-bg-brandGrayish-deep",
    );
    expect(container.querySelector("span > span")).toHaveClass(
      "group-hover:bg-icon-brandGrayish-subtle",
    );
  });

  it("disabled unchecked 는 disabled 토큰 배경/테두리/점을 쓰고 hover 유틸과 opacity 가 없다", () => {
    const { container } = render(<Radio disabled />);
    const root = container.querySelector("span");
    expect(root).toHaveAttribute("data-state", "disabled");
    expect(root).toHaveClass(
      "bg-bg-disabled-subtle",
      "border-sm",
      "border-border-disabled-normal",
    );
    expect(root).not.toHaveClass(
      "hover:bg-bg-brandGrayish-deep",
      "group-hover:bg-bg-brandGrayish-deep",
    );
    const dot = container.querySelector("span > span");
    expect(dot).toHaveClass("bg-icon-disabled-light");
    // Checkbox 와 달리 disabled 점은 opacity-40% 가 없다(Figma SVG 가 이미 흐린 색으로 구워짐).
    expect(dot).not.toHaveClass("opacity-(--alpha-40)");
  });

  it("disabled checked 는 Checkbox 와 다른 disabled/deep 배경 + 흰 점을 쓴다", () => {
    const { container } = render(<Radio checked disabled />);
    const root = container.querySelector("span");
    // Checkbox 의 checked+disabled 는 bg-bg-disabled-normal 을 쓰지만 Radio 는 disabled/deep 을 쓴다.
    expect(root).toHaveClass("bg-bg-disabled-deep");
    expect(root).not.toHaveClass("bg-bg-disabled-normal");
    expect(root).toHaveClass("border-sm", "border-solid", "border-transparent");
    expect(root).not.toHaveClass("border-border-disabled-normal");
    const dot = container.querySelector("span > span");
    expect(dot).toHaveClass("bg-icon-inverse-normal");
    expect(dot).not.toHaveClass("opacity-(--alpha-40)");
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<Radio className="absolute top-0 left-0" />);
    expect(container.querySelector("span")).toHaveClass(
      "absolute",
      "top-0",
      "left-0",
      "rounded-circle",
      "bg-bg-neutral-normal",
    );
  });

  it("색은 토큰 유틸로만 지정하고 마크업에 hex 가 없다", () => {
    const { container } = render(<Radio checked />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
