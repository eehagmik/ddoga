import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Scroll } from "./Scroll";

describe("Scroll", () => {
  it("기본값은 axis=y 로 렌더한다", () => {
    const { container } = render(<Scroll>내용</Scroll>);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-axis", "y");
    expect(root).toHaveClass("overflow-y-auto");
    expect(root).not.toHaveClass("overflow-x-auto");
  });

  it("axis=x 는 overflow-x-auto 로 렌더한다", () => {
    const { container } = render(<Scroll axis="x">내용</Scroll>);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-axis", "x");
    expect(root).toHaveClass("overflow-x-auto");
    expect(root).not.toHaveClass("overflow-y-auto");
  });

  it("axis 와 무관하게 네이티브 스크롤바 트리트먼트 클래스를 항상 포함한다", () => {
    const y = render(<Scroll>내용</Scroll>).container.firstElementChild!;
    const x = render(<Scroll axis="x">내용</Scroll>).container
      .firstElementChild!;

    for (const root of [y, x]) {
      expect(root).toHaveClass("[scrollbar-width:thin]");
      expect(root).toHaveClass(
        "[scrollbar-color:var(--color-bg-overlay-greenGrayDeep)_var(--color-bg-overlay-greenGraySubtle)]",
      );
      expect(root).toHaveClass("[&::-webkit-scrollbar]:size-[var(--sz-2)]");
      expect(root).toHaveClass(
        "[&::-webkit-scrollbar-track]:bg-bg-overlay-greenGraySubtle",
        "[&::-webkit-scrollbar-track]:rounded-circle",
      );
      expect(root).toHaveClass(
        "[&::-webkit-scrollbar-thumb]:bg-bg-overlay-greenGrayDeep",
        "[&::-webkit-scrollbar-thumb]:rounded-circle",
      );
    }
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<Scroll className="h-[var(--sz-160)]" />);
    expect(container.firstElementChild).toHaveClass(
      "h-[var(--sz-160)]",
      "overflow-y-auto",
    );
  });

  it("children 및 임의의 HTML 속성(...rest)을 그대로 전달한다", () => {
    const onScroll = vi.fn();
    const { getByText, container } = render(
      <Scroll id="scroll-1" aria-label="목록" onScroll={onScroll}>
        <p>본문</p>
      </Scroll>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("id", "scroll-1");
    expect(root).toHaveAttribute("aria-label", "목록");
    expect(getByText("본문")).toBeInTheDocument();
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(<Scroll axis="x">내용</Scroll>);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
