import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ButtonWithIcon } from "./ButtonWithIcon";

describe("ButtonWithIcon", () => {
  it('기본값(brand/fill/md)으로 type="button" 버튼과 data-* · aria-label 을 렌더한다', () => {
    const { getByRole } = render(
      <ButtonWithIcon aria-label="추가">
        <span data-testid="icon" />
      </ButtonWithIcon>,
    );
    const btn = getByRole("button", { name: "추가" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-color", "brand");
    expect(btn).toHaveAttribute("data-variant", "fill");
    expect(btn).toHaveAttribute("data-size", "md");
  });

  it("type 을 넘기면 그대로 반영한다", () => {
    const { getByRole } = render(
      <ButtonWithIcon aria-label="전송" type="submit">
        <span />
      </ButtonWithIcon>,
    );
    expect(getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("클릭하면 onClick 이 호출된다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <ButtonWithIcon aria-label="추가" onClick={onClick}>
        <span />
      </ButtonWithIcon>,
    );
    await user.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 면 클릭해도 onClick 이 호출되지 않는다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <ButtonWithIcon aria-label="추가" onClick={onClick} disabled>
        <span />
      </ButtonWithIcon>,
    );
    const btn = getByRole("button");
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("size 별 정사각 · radius 유틸 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(
      <ButtonWithIcon aria-label="추가" size="2xl">
        <span />
      </ButtonWithIcon>,
    );
    expect(getByRole("button")).toHaveClass("size-(--sz-54)", "rounded-xl");

    rerender(
      <ButtonWithIcon aria-label="추가" size="sm">
        <span />
      </ButtonWithIcon>,
    );
    expect(getByRole("button")).toHaveClass("size-(--sz-32)", "rounded-sm");
  });

  it("아이콘 슬롯(inner span)에 size 별 아이콘 크기 클래스를 적용한다", () => {
    const { getByRole } = render(
      <ButtonWithIcon aria-label="추가" size="md">
        <span />
      </ButtonWithIcon>,
    );
    expect(getByRole("button").firstElementChild).toHaveClass("size-(--sz-16)");
  });

  it("variant/color 별 배경 클래스는 루트에, 아이콘 색 클래스는 inner span 에 적용한다", () => {
    const { getByRole, rerender } = render(
      <ButtonWithIcon aria-label="추가" color="brand" variant="fill">
        <span />
      </ButtonWithIcon>,
    );
    let btn = getByRole("button");
    expect(btn).toHaveClass(
      "bg-bg-brand-normal",
      "hover:bg-bg-brand-deep",
      "disabled:opacity-(--alpha-60)",
    );
    expect(btn.firstElementChild).toHaveClass("text-icon-inverse-normal");

    rerender(
      <ButtonWithIcon aria-label="추가" color="warning" variant="bright">
        <span />
      </ButtonWithIcon>,
    );
    btn = getByRole("button");
    expect(btn).toHaveClass(
      "bg-bg-warning-bright",
      "disabled:opacity-(--alpha-40)",
    );
    expect(btn.firstElementChild).toHaveClass("text-icon-warning-deep");

    rerender(
      <ButtonWithIcon aria-label="추가" color="brand" variant="outline">
        <span />
      </ButtonWithIcon>,
    );
    btn = getByRole("button");
    expect(btn).toHaveClass(
      "bg-bg-neutral-normal",
      "hover:bg-bg-brand-bright",
      "focus-visible:bg-bg-brand-bright",
      "border-xs",
      "border-border-brand-subtle",
    );
  });

  it("focus/pressed opacity(--alpha-80)는 루트(Button)에서 적용되고 inner 에는 없다", () => {
    const { getByRole, rerender } = render(
      <ButtonWithIcon aria-label="추가" variant="fill">
        <span />
      </ButtonWithIcon>,
    );
    const fillBtn = getByRole("button");
    expect(fillBtn).toHaveClass(
      "focus-visible:opacity-(--alpha-80)",
      "active:opacity-(--alpha-80)",
    );
    expect(fillBtn.firstElementChild?.className ?? "").not.toMatch(
      /group-(focus-visible|active):opacity-/,
    );

    rerender(
      <ButtonWithIcon aria-label="추가" variant="outline">
        <span />
      </ButtonWithIcon>,
    );
    // outline 도 동일 --alpha-80 (전 variant 통일)
    expect(getByRole("button")).toHaveClass(
      "focus-visible:opacity-(--alpha-80)",
      "active:opacity-(--alpha-80)",
    );
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <ButtonWithIcon aria-label="추가" color="danger" variant="bright">
        <span>i</span>
      </ButtonWithIcon>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { getByRole } = render(
      <ButtonWithIcon aria-label="추가" className="w-full">
        <span />
      </ButtonWithIcon>,
    );
    expect(getByRole("button")).toHaveClass("w-full", "group", "inline-flex");
  });
});
