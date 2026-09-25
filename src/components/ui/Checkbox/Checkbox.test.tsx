import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox, type CheckboxSize } from "./Checkbox";

describe("Checkbox", () => {
  it("기본값은 variant circle / size md / unchecked / state enable 인 상자를 렌더한다", () => {
    const { container } = render(<Checkbox />);
    const root = container.querySelector("span");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-variant", "circle");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-checked", "false");
    expect(root).toHaveAttribute("data-state", "enable");
    expect(root).toHaveClass(
      "inline-flex",
      "size-(--sz-24)",
      "rounded-circle",
      "bg-bg-neutral-normal",
      "border-sm",
      "border-solid",
      "border-border-neutral-light",
    );
    // 루트에 `group` 을 붙이지 않는다 — hover 는 조상 `.group` 에 위임한다.
    expect(root).not.toHaveClass("group");
  });

  it("체크마크는 currentColor 로 채운 인라인 SVG 다", () => {
    const { container } = render(<Checkbox />);
    const path = container.querySelector("svg path");
    expect(path).not.toBeNull();
    expect(path).toHaveAttribute("fill", "currentColor");
    expect(container.querySelector("svg")).toHaveClass(
      "size-(--sz-18)",
      "text-icon-brandGrayish-light",
      "opacity-(--alpha-40)",
    );
  });

  it("variant 별 모서리/상자 클래스가 적용된다", () => {
    const circle = render(
      <Checkbox variant="circle" />,
    ).container.querySelector("span");
    expect(circle).toHaveClass("rounded-circle", "bg-bg-neutral-normal");

    const square = render(
      <Checkbox variant="square" />,
    ).container.querySelector("span");
    expect(square).toHaveClass("rounded-sm", "bg-bg-neutral-normal");
    expect(square).not.toHaveClass("rounded-circle");

    const mark = render(<Checkbox variant="mark" />).container.querySelector(
      "span",
    );
    expect(mark).not.toHaveClass("rounded-circle", "rounded-sm");
    expect(mark).not.toHaveClass("bg-bg-neutral-normal", "border-sm");
    expect(mark).toHaveAttribute("data-variant", "mark");
  });

  it("size 별 상자/글리프 크기 클래스가 적용된다", () => {
    const box: Record<CheckboxSize, [string, string]> = {
      sm: ["size-(--sz-22)", "size-(--sz-16)"],
      md: ["size-(--sz-24)", "size-(--sz-18)"],
      lg: ["size-(--sz-28)", "size-(--sz-20)"],
    };
    for (const [size, [rootCls, glyphCls]] of Object.entries(box) as [
      CheckboxSize,
      [string, string],
    ][]) {
      const { container } = render(<Checkbox size={size} />);
      expect(container.querySelector("span")).toHaveClass(rootCls);
      expect(container.querySelector("svg")).toHaveClass(glyphCls);
    }
  });

  it("mark 는 상자 크기(sm 22 / md 24 / lg 28)로 글리프가 채운다", () => {
    const { container } = render(<Checkbox variant="mark" size="lg" />);
    expect(container.querySelector("span")).toHaveClass("size-(--sz-28)");
    expect(container.querySelector("svg")).toHaveClass("size-(--sz-28)");
  });

  it("checked 는 브랜드 배경 + 흰 체크마크로 전환하고 테두리를 제거한다", () => {
    const { container } = render(<Checkbox checked />);
    const root = container.querySelector("span");
    expect(root).toHaveAttribute("data-checked", "true");
    expect(root).toHaveClass(
      "bg-bg-brand-normal",
      "hover:bg-bg-brand-deep",
      "group-hover:bg-bg-brand-deep",
    );
    expect(root).not.toHaveClass("border-sm");
    expect(container.querySelector("svg")).toHaveClass(
      "text-icon-inverse-normal",
    );
    expect(container.querySelector("svg")).not.toHaveClass(
      "opacity-(--alpha-40)",
    );
  });

  it("unchecked 는 hover(단독) 와 group-hover(조상 .group) 로 brandGrayish 배경/체크마크에 전이한다", () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector("span")).toHaveClass(
      "hover:bg-bg-brandGrayish-deep",
      "group-hover:bg-bg-brandGrayish-deep",
    );
    expect(container.querySelector("svg")).toHaveClass(
      "group-hover:text-icon-brandGrayish-subtle",
    );
  });

  it("disabled unchecked 는 disabled 토큰 배경/테두리/체크마크를 쓰고 hover 유틸이 없다", () => {
    const { container } = render(<Checkbox disabled />);
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
    expect(container.querySelector("svg")).toHaveClass(
      "text-icon-disabled-normal",
      "opacity-(--alpha-40)",
    );
  });

  it("disabled checked 는 disabled/normal 배경 + 흰 체크마크를 쓴다", () => {
    const { container } = render(<Checkbox checked disabled />);
    const root = container.querySelector("span");
    expect(root).toHaveClass("bg-bg-disabled-normal");
    expect(root).not.toHaveClass("border-sm");
    expect(container.querySelector("svg")).toHaveClass(
      "text-icon-inverse-normal",
    );
  });

  it("mark 색상: enable/disabled × checked 별 체크마크 토큰", () => {
    expect(
      render(<Checkbox variant="mark" />).container.querySelector("svg"),
    ).toHaveClass(
      "text-icon-brandGrayish-light",
      "group-hover:text-icon-brandGrayish-subtle",
    );
    expect(
      render(<Checkbox variant="mark" checked />).container.querySelector(
        "svg",
      ),
    ).toHaveClass("text-icon-brand-normal", "group-hover:text-icon-brand-deep");
    expect(
      render(<Checkbox variant="mark" disabled />).container.querySelector(
        "svg",
      ),
    ).toHaveClass("text-icon-disabled-light");
    expect(
      render(
        <Checkbox variant="mark" checked disabled />,
      ).container.querySelector("svg"),
    ).toHaveClass("text-icon-disabled-subtle");
  });

  it("mark 는 40% 불투명도를 적용하지 않는다", () => {
    const { container } = render(<Checkbox variant="mark" />);
    expect(container.querySelector("svg")).not.toHaveClass(
      "opacity-(--alpha-40)",
    );
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <Checkbox className="absolute top-0 left-0" />,
    );
    expect(container.querySelector("span")).toHaveClass(
      "absolute",
      "top-0",
      "left-0",
      "rounded-circle",
      "bg-bg-neutral-normal",
    );
  });

  it("색은 토큰 유틸로만 지정하고 마크업에 hex 가 없다", () => {
    const { container } = render(<Checkbox checked variant="square" />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
