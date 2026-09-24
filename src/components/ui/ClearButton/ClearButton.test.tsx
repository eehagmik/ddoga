import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ClearButton } from "./ClearButton";

describe("ClearButton", () => {
  it('기본값은 type="button" / aria-label "지우기" / size xs 로 렌더한다', () => {
    const { container } = render(<ClearButton />);
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("aria-label", "지우기");
    expect(btn).toHaveAttribute("data-size", "xs");
    expect(btn).toHaveClass(
      "inline-flex",
      "shrink-0",
      "cursor-pointer",
      "text-icon-neutral-bright",
      "size-[var(--sz-14)]",
    );
  });

  it("label 을 커스텀하면 aria-label 에 반영된다", () => {
    const { container } = render(<ClearButton label="입력 지우기" />);
    expect(container.querySelector("button")).toHaveAttribute(
      "aria-label",
      "입력 지우기",
    );
  });

  it("x_circle_solid 아이콘을 size 별 px 로 렌더한다", () => {
    const { container, rerender } = render(<ClearButton size="xs" />);
    let svg = container.querySelector("button svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");

    rerender(<ClearButton size="md" />);
    svg = container.querySelector("button svg");
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
  });

  it("size 별 정사각 크기 유틸을 적용한다", () => {
    const { container, rerender } = render(<ClearButton size="xs" />);
    expect(container.querySelector("button")).toHaveClass(
      "size-[var(--sz-14)]",
    );

    rerender(<ClearButton size="sm" />);
    expect(container.querySelector("button")).toHaveClass(
      "size-[var(--sz-16)]",
    );

    rerender(<ClearButton size="md" />);
    expect(container.querySelector("button")).toHaveClass(
      "size-[var(--sz-18)]",
    );
  });

  it("클릭하면 onClick 을 호출한다", () => {
    const onClick = vi.fn();
    const { container } = render(<ClearButton onClick={onClick} />);
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 면 클릭해도 onClick 이 호출되지 않는다", () => {
    const onClick = vi.fn();
    const { container } = render(<ClearButton disabled onClick={onClick} />);
    const btn = container.querySelector("button")!;
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("className 을 루트 button 에 병합한다 (색 오버라이드)", () => {
    const { container } = render(
      <ClearButton className="text-icon-inverse-normal" />,
    );
    expect(container.querySelector("button")).toHaveClass(
      "text-icon-inverse-normal",
      "size-[var(--sz-14)]",
    );
  });

  it("색·크기를 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { container } = render(<ClearButton />);
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
