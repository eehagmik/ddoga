import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountLabel } from "./CountLabel";

describe("CountLabel", () => {
  it("기본 props(color=black/size=md)로 렌더하고 data-* 속성을 부여한다", () => {
    const { container } = render(
      <CountLabel currentCount={1} totalCount={3} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveAttribute("data-color", "black");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveClass(
      "inline-flex",
      "items-center",
      "gap-[var(--sz-2)]",
      "text-typo-neutral-subtle",
    );
    // 기본 unit 값은 "Unit"
    expect(root).toHaveTextContent("Unit");
  });

  it("color 3종의 텍스트 색 유틸 클래스를 적용한다", () => {
    const { container, rerender } = render(
      <CountLabel color="black" currentCount={1} totalCount={3} />,
    );
    expect(container.firstElementChild).toHaveClass("text-typo-neutral-subtle");

    rerender(<CountLabel color="gray" currentCount={1} totalCount={3} />);
    expect(container.firstElementChild).toHaveClass("text-typo-neutral-light");

    rerender(<CountLabel color="white" currentCount={1} totalCount={3} />);
    expect(container.firstElementChild).toHaveClass("text-typo-inverse-normal");
  });

  it("size sm 은 값 그룹에 gap 이 없고 --text-xs 텍스트 유틸을 적용한다", () => {
    const { container } = render(
      <CountLabel size="sm" currentCount={1} totalCount={3} unit="개" />,
    );
    const root = container.firstElementChild as HTMLElement;
    const valueGroup = root.querySelector("span > span") as HTMLElement | null;
    expect(valueGroup).not.toBeNull();
    expect(valueGroup).toHaveClass(
      "inline-flex",
      "items-center",
      "text-[length:var(--text-xs)]",
      "tracking-[-0.14px]",
    );
    expect(valueGroup?.className ?? "").not.toMatch(/gap-\[var\(--sz-2\)\]/);
  });

  it("size md 는 값 그룹에 gap-[var(--sz-2)] 와 --text-sm 텍스트 유틸을 적용한다", () => {
    const { container } = render(
      <CountLabel size="md" currentCount={1} totalCount={3} unit="개" />,
    );
    const root = container.firstElementChild as HTMLElement;
    const valueGroup = root.querySelector("span > span") as HTMLElement | null;
    expect(valueGroup).toHaveClass(
      "inline-flex",
      "items-center",
      "gap-[var(--sz-2)]",
      "text-[length:var(--text-sm)]",
      "tracking-[-0.16px]",
    );
  });

  it('color="white" & size="md" 조합만 unit 텍스트가 --text-xs 로 한 단계 작아진다', () => {
    const { container } = render(
      <CountLabel
        color="white"
        size="md"
        currentCount={1}
        totalCount={3}
        unit="개"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const unitSpan = root.lastElementChild as HTMLElement;
    expect(unitSpan).toHaveTextContent("개");
    expect(unitSpan).toHaveClass(
      "text-[length:var(--text-xs)]",
      "tracking-[-0.14px]",
    );
  });

  it.each([
    ["black", "sm"],
    ["black", "md"],
    ["gray", "sm"],
    ["gray", "md"],
    ["white", "sm"],
  ] as const)(
    "color=%s & size=%s 조합은 unit 텍스트가 size 기본 텍스트 크기를 유지한다(예외 아님)",
    (color, size) => {
      const { container } = render(
        <CountLabel
          color={color}
          size={size}
          currentCount={1}
          totalCount={3}
          unit="개"
        />,
      );
      const root = container.firstElementChild as HTMLElement;
      const unitSpan = root.lastElementChild as HTMLElement;
      const expectedTextClass =
        size === "sm"
          ? "text-[length:var(--text-xs)]"
          : "text-[length:var(--text-sm)]";
      expect(unitSpan).toHaveClass(expectedTextClass);
    },
  );

  it("currentCount/totalCount/unit 값을 올바르게 조합해 렌더한다", () => {
    const { getByText } = render(
      <CountLabel currentCount={2} totalCount={5} unit="개" />,
    );
    expect(getByText("2")).toBeInTheDocument();
    expect(getByText("/")).toBeInTheDocument();
    expect(getByText("5")).toBeInTheDocument();
    expect(getByText("개")).toBeInTheDocument();
  });

  it('unit 을 빈 문자열("")로 넘기면 단위 텍스트를 렌더하지 않는다', () => {
    const { container, queryByText } = render(
      <CountLabel currentCount={1} totalCount={3} unit="" />,
    );
    expect(queryByText("Unit")).not.toBeInTheDocument();
    const root = container.firstElementChild as HTMLElement;
    // 값 그룹(숫자 3개 span)만 남고 unit span 은 없다
    expect(root.children).toHaveLength(1);
  });

  it("unit 을 지정하지 않으면 기본값 'Unit' 을 렌더한다", () => {
    const { getByText } = render(
      <CountLabel currentCount={1} totalCount={3} />,
    );
    expect(getByText("Unit")).toBeInTheDocument();
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(
      <CountLabel currentCount={1} totalCount={3} className="w-full" />,
    );
    expect(container.firstElementChild).toHaveClass(
      "w-full",
      "inline-flex",
      "items-center",
    );
  });

  it("aria-live=polite 를 루트에 부여한다", () => {
    const { container } = render(
      <CountLabel currentCount={1} totalCount={3} />,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-live", "polite");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다(토큰만 사용)", () => {
    const { container } = render(
      <CountLabel color="white" size="md" currentCount={1} totalCount={3} />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
