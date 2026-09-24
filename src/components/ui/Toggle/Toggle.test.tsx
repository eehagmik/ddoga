import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("기본값(square/multi/md)으로 <button type=button> 을 렌더하고 data-* 를 부여한다", () => {
    const { getByRole } = render(<Toggle>라벨</Toggle>);
    const btn = getByRole("button", { name: "라벨" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-variant", "square");
    expect(btn).toHaveAttribute("data-type", "multi");
    expect(btn).toHaveAttribute("data-size", "md");
    expect(btn).toHaveAttribute("data-pressed", "false");
    expect(btn).toHaveAttribute("data-disabled", "false");
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("클릭하면 pressed 가 토글되고 onPressedChange 가 호출된다(uncontrolled)", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Toggle onPressedChange={onPressedChange}>라벨</Toggle>,
    );
    const btn = getByRole("button");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-pressed", "true");
    expect(onPressedChange).toHaveBeenLastCalledWith(true);

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it("defaultPressed=true 면 처음부터 선택 상태다", () => {
    const { getByRole } = render(<Toggle defaultPressed>라벨</Toggle>);
    expect(getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("controlled(pressed) 는 내부 상태로 바뀌지 않고 콜백만 호출한다", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        라벨
      </Toggle>,
    );
    const btn = getByRole("button");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("disabled 면 클릭해도 토글되지 않고 콜백도 호출되지 않는다", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Toggle disabled onPressedChange={onPressedChange}>
        라벨
      </Toggle>,
    );
    const btn = getByRole("button");
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("type=multi 는 aria-pressed, type=single 은 role=radio + aria-checked 를 쓴다", () => {
    const { getByRole, rerender } = render(
      <Toggle type="multi" defaultPressed>
        라벨
      </Toggle>,
    );
    const multi = getByRole("button");
    expect(multi).toHaveAttribute("aria-pressed", "true");
    expect(multi).not.toHaveAttribute("aria-checked");

    rerender(
      <Toggle type="single" defaultPressed>
        라벨
      </Toggle>,
    );
    const radio = getByRole("radio");
    expect(radio).toHaveAttribute("aria-checked", "true");
    expect(radio).not.toHaveAttribute("aria-pressed");
  });

  it("type=single 도 클릭으로 aria-checked 가 토글된다", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Toggle type="single">라벨</Toggle>);
    const radio = getByRole("radio");
    expect(radio).toHaveAttribute("aria-checked", "false");
    await user.click(radio);
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  it("variant 별 radius / 표면 유틸 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(<Toggle>라벨</Toggle>);
    expect(getByRole("button")).toHaveClass(
      "rounded-md",
      "bg-bg-neutral-normal",
      "shadow-borderNeutral-xs",
      "min-w-[var(--sz-42)]",
    );

    rerender(<Toggle variant="round">라벨</Toggle>);
    expect(getByRole("button")).toHaveClass("rounded-circle");

    rerender(<Toggle variant="text">라벨</Toggle>);
    const text = getByRole("button");
    expect(text).toHaveClass("rounded-md", "text-typo-neutral-normal");
    expect(text).not.toHaveClass("min-w-[var(--sz-42)]");
    expect(text.className).not.toMatch(/shadow-border/);
  });

  it("pressed 면 배경·아웃라인·라벨색이 checked 토큰으로, 라벨 타이포가 -bold 로 바뀐다", () => {
    const { getByRole } = render(<Toggle defaultPressed>라벨</Toggle>);
    const btn = getByRole("button");
    expect(btn).toHaveClass(
      "bg-bg-brand-bright",
      "shadow-borderBrand-sm",
      "text-typo-brand-dark",
      "text-body-4-bold",
    );
    expect(btn).not.toHaveClass("text-body-4");
  });

  it("disabled + checked 는 disabled-subtle 배경 + neutral 2px 아웃라인 + disabled 라벨색을 쓴다", () => {
    const { getByRole } = render(
      <Toggle disabled defaultPressed>
        라벨
      </Toggle>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-disabled-subtle",
      "shadow-borderNeutral-sm",
      "text-typo-disabled-normal",
    );
  });

  it("size 별 타이포·padding 유틸 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(<Toggle size="xs">라벨</Toggle>);
    expect(getByRole("button")).toHaveClass(
      "text-body-5",
      "px-[var(--sz-8)]",
      "py-[var(--sz-3)]",
    );

    rerender(
      <Toggle size="lg" variant="round">
        라벨
      </Toggle>,
    );
    expect(getByRole("button")).toHaveClass(
      "text-body-3",
      "px-[var(--sz-12)]",
      "py-[var(--sz-10)]",
    );
  });

  it("className 을 병합하고 기본 클래스도 유지한다", () => {
    const { getByRole } = render(<Toggle className="w-full">라벨</Toggle>);
    expect(getByRole("button")).toHaveClass("w-full", "group", "inline-flex");
  });

  it("rest props(id 등)를 루트 button 으로 전달한다", () => {
    const { getByRole } = render(
      <Toggle id="t-1" title="설명">
        라벨
      </Toggle>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveAttribute("id", "t-1");
    expect(btn).toHaveAttribute("title", "설명");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Toggle variant="round" defaultPressed>
        라벨
      </Toggle>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
