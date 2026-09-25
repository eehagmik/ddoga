import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ButtonWithLabel } from "./ButtonWithLabel";

describe("ButtonWithLabel", () => {
  it('기본값(brand/fill/md)으로 type="button" 버튼과 data-* 속성을 렌더한다', () => {
    const { getByRole } = render(<ButtonWithLabel>라벨</ButtonWithLabel>);
    const btn = getByRole("button", { name: "라벨" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-color", "brand");
    expect(btn).toHaveAttribute("data-variant", "fill");
    expect(btn).toHaveAttribute("data-size", "md");
  });

  it("type 을 넘기면 그대로 반영한다", () => {
    const { getByRole } = render(
      <ButtonWithLabel type="submit">전송</ButtonWithLabel>,
    );
    expect(getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("클릭하면 onClick 이 호출된다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <ButtonWithLabel onClick={onClick}>라벨</ButtonWithLabel>,
    );
    await user.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 면 클릭해도 onClick 이 호출되지 않는다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <ButtonWithLabel onClick={onClick} disabled>
        라벨
      </ButtonWithLabel>,
    );
    const btn = getByRole("button");
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("startIcon 은 라벨 앞, endIcon 은 라벨 뒤에 렌더된다", () => {
    const { getByRole } = render(
      <ButtonWithLabel
        startIcon={<span data-testid="start">s</span>}
        endIcon={<span data-testid="end">e</span>}
      >
        라벨
      </ButtonWithLabel>,
    );
    const text = getByRole("button").textContent ?? "";
    expect(text.indexOf("s")).toBeLessThan(text.indexOf("라벨"));
    expect(text.indexOf("라벨")).toBeLessThan(text.indexOf("e"));
  });

  it("아이콘 슬롯을 넘기지 않으면 렌더하지 않는다", () => {
    const { getByRole } = render(<ButtonWithLabel>라벨</ButtonWithLabel>);
    expect(getByRole("button").querySelectorAll("span")).toHaveLength(2); // inner + label
  });

  it("size 별 min-height · padding · 타이포 유틸 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(
      <ButtonWithLabel size="2xl">라벨</ButtonWithLabel>,
    );
    expect(getByRole("button")).toHaveClass(
      "min-h-(--sz-54)",
      "px-(--sz-14)",
      "rounded-xl",
      "text-body-1",
    );

    rerender(<ButtonWithLabel size="sm">라벨</ButtonWithLabel>);
    expect(getByRole("button")).toHaveClass(
      "min-h-(--sz-32)",
      "px-(--sz-8)",
      "rounded-sm",
      "text-body-5",
    );
  });

  it('variant="text" 는 좌우 padding 클래스를 적용하지 않는다', () => {
    const { getByRole } = render(
      <ButtonWithLabel variant="text" size="md">
        라벨
      </ButtonWithLabel>,
    );
    expect(getByRole("button").className).not.toMatch(/px-\[var\(--sz-/);
  });

  it("variant/color 별 배경·라벨 색 유틸 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(
      <ButtonWithLabel color="brand" variant="fill">
        라벨
      </ButtonWithLabel>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-brand-normal",
      "hover:bg-bg-brand-deep",
      "text-typo-inverse-normal",
      "disabled:opacity-(--alpha-60)",
    );

    rerender(
      <ButtonWithLabel color="warning" variant="outline">
        라벨
      </ButtonWithLabel>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-neutral-normal",
      "border-border-warning-normal",
      "text-typo-warning-deep",
      "border-xs",
    );

    rerender(
      <ButtonWithLabel color="brand" variant="bright">
        라벨
      </ButtonWithLabel>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-brand-bright",
      "disabled:opacity-(--alpha-40)",
    );
  });

  it("focus/pressed opacity(--alpha-80)는 루트에서 적용되고 inner 에는 없다", () => {
    const { getByRole, rerender } = render(
      <ButtonWithLabel color="brand" variant="outline">
        라벨
      </ButtonWithLabel>,
    );
    // 합성 variant: opacity 는 Button(BUTTON_BASE) 루트가 담당, 전 variant --alpha-80 동일
    const outlineBtn = getByRole("button");
    expect(outlineBtn).toHaveClass(
      "focus-visible:opacity-(--alpha-80)",
      "active:opacity-(--alpha-80)",
    );
    expect(outlineBtn.firstElementChild?.className ?? "").not.toMatch(
      /group-(focus-visible|active):opacity-/,
    );

    rerender(
      <ButtonWithLabel color="brand" variant="text">
        라벨
      </ButtonWithLabel>,
    );
    // text: 루트에 hover/focus/active opacity (배경 없음)
    expect(getByRole("button")).toHaveClass(
      "hover:opacity-(--alpha-80)",
      "focus-visible:opacity-(--alpha-80)",
      "active:opacity-(--alpha-80)",
    );
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <ButtonWithLabel
        color="danger"
        variant="bright"
        startIcon={<span>i</span>}
      >
        라벨
      </ButtonWithLabel>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { getByRole } = render(
      <ButtonWithLabel className="w-full">라벨</ButtonWithLabel>,
    );
    expect(getByRole("button")).toHaveClass("w-full", "group", "inline-flex");
  });

  it("rest props(aria-label 등)를 루트 button 으로 전달한다", () => {
    const { getByRole } = render(
      <ButtonWithLabel aria-label="저장">라벨</ButtonWithLabel>,
    );
    expect(getByRole("button", { name: "저장" })).toBeInTheDocument();
  });
});
