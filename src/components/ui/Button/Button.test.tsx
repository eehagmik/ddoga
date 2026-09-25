import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BUTTON_BASE, Button } from "./Button";

describe("Button", () => {
  it('기본값(brand/fill/md)으로 type="button" 버튼과 data-* 속성을 렌더한다', () => {
    const { getByRole } = render(<Button>내용</Button>);
    const btn = getByRole("button", { name: "내용" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-color", "brand");
    expect(btn).toHaveAttribute("data-variant", "fill");
    expect(btn).toHaveAttribute("data-size", "md");
  });

  it("type 을 넘기면 그대로 반영한다", () => {
    const { getByRole } = render(<Button type="submit">전송</Button>);
    expect(getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("children 을 그대로 렌더한다(자유 슬롯)", () => {
    const { getByRole } = render(
      <Button>
        <span data-testid="slot">임의 노드</span>
      </Button>,
    );
    expect(
      getByRole("button").querySelector('[data-testid="slot"]'),
    ).not.toBeNull();
  });

  it("클릭하면 onClick 이 호출된다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(<Button onClick={onClick}>내용</Button>);
    await user.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 면 클릭해도 onClick 이 호출되지 않는다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Button onClick={onClick} disabled>
        내용
      </Button>,
    );
    const btn = getByRole("button");
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("size 별 min-height · radius 유틸 클래스를 적용한다(padding·타이포 없음)", () => {
    const { getByRole, rerender } = render(<Button size="2xl">내용</Button>);
    expect(getByRole("button")).toHaveClass("min-h-(--sz-54)", "rounded-xl");
    expect(getByRole("button").className).not.toMatch(/px-\[var\(--sz-/);
    expect(getByRole("button").className).not.toMatch(/text-body-/);

    rerender(<Button size="sm">내용</Button>);
    expect(getByRole("button")).toHaveClass("min-h-(--sz-32)", "rounded-sm");
  });

  it("variant/color 별 배경·테두리·hover·focus 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(
      <Button color="brand" variant="fill">
        내용
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-brand-normal",
      "hover:bg-bg-brand-deep",
      "focus-visible:bg-bg-brand-deep",
      "disabled:opacity-(--alpha-60)",
    );
    // pressed(:active) 는 hover/focus 와 동일 토큰
    expect(getByRole("button")).toHaveClass("active:bg-bg-brand-deep");

    rerender(
      <Button color="brand" variant="outline">
        내용
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-neutral-normal",
      "hover:bg-bg-brand-bright",
      "focus-visible:bg-bg-brand-bright",
      "border-xs",
      "border-border-brand-subtle",
    );
    expect(getByRole("button")).toHaveClass("active:bg-bg-brand-bright");

    rerender(
      <Button color="warning" variant="bright">
        내용
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-warning-bright",
      "disabled:opacity-(--alpha-40)",
    );
    expect(getByRole("button")).toHaveClass(
      "hover:bg-bg-warning-light",
      "active:bg-bg-warning-light",
    );
  });

  it("focus/pressed 는 배경 교체 + 루트 opacity --alpha-80 (hover 는 opacity 없음)", () => {
    const { getByRole } = render(<Button>내용</Button>);
    const btn = getByRole("button");
    expect(btn).toHaveClass(
      "focus-visible:opacity-(--alpha-80)",
      "active:opacity-(--alpha-80)",
    );
    expect(btn.className).not.toMatch(/hover:opacity-/);
  });

  it("텍스트/아이콘 색 유틸을 루트에 지정하지 않는다(슬롯의 몫)", () => {
    const { getByRole } = render(
      <Button color="brand" variant="fill">
        내용
      </Button>,
    );
    expect(getByRole("button").className).not.toMatch(/text-(typo|icon)-/);
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Button color="danger" variant="bright">
        내용
      </Button>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("className 을 루트에 병합하고 BUTTON_BASE 를 유지한다", () => {
    const { getByRole } = render(<Button className="w-full">내용</Button>);
    const btn = getByRole("button");
    expect(btn).toHaveClass("w-full", "group", "inline-flex");
    for (const cls of BUTTON_BASE.split(" ")) {
      expect(btn).toHaveClass(cls);
    }
  });

  it("rest props(aria-label 등)를 루트 button 으로 전달한다", () => {
    const { getByRole } = render(<Button aria-label="저장">내용</Button>);
    expect(getByRole("button", { name: "저장" })).toBeInTheDocument();
  });
});
