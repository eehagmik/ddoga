import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CheckSelectRadio } from "./CheckSelectRadio";

describe("CheckSelectRadio", () => {
  it("기본값은 radio / unchecked / enable 로 렌더하고 체크마크 아톰(mark)을 합성한다", () => {
    const { container } = render(
      <CheckSelectRadio>약관에 동의합니다</CheckSelectRadio>,
    );
    const label = container.querySelector("label")!;
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute("data-type", "radio");
    expect(label).toHaveAttribute("data-checked", "false");
    expect(label).toHaveAttribute("data-state", "enable");
    expect(label).toHaveClass(
      "group",
      "flex",
      "w-full",
      "items-center",
      "gap-[var(--sz-8)]",
      "py-[var(--sz-10)]",
      "cursor-pointer",
    );
    expect(label.textContent).toContain("약관에 동의합니다");

    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("type", "radio");
    expect(input).toHaveClass("peer", "sr-only");

    // 합성된 Checkbox 아톰 — mark / md
    const atom = container.querySelector("span[data-variant]")!;
    expect(atom).toHaveAttribute("data-variant", "mark");
    expect(atom).toHaveAttribute("data-size", "md");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("unchecked 는 라벨 typo/neutral/normal + Medium, hover/focus 전이 클래스를 갖고 체크마크는 opacity-0", () => {
    const { container } = render(<CheckSelectRadio>L</CheckSelectRadio>);
    const labelSpan = [...container.querySelectorAll("span")].find(
      (s) => s.textContent === "L",
    )!;
    expect(labelSpan).toHaveClass(
      "flex-1",
      "text-body-3",
      "text-typo-neutral-normal",
      "group-hover:text-typo-brand-dark",
      "group-focus-within:text-typo-brand-dark",
    );
    expect(labelSpan).not.toHaveClass("text-body-3-bold");

    const markWrapper = container.querySelector("span[aria-hidden]")!;
    expect(markWrapper).toHaveClass("opacity-0");
    expect(markWrapper).not.toHaveClass("opacity-100");
  });

  it("checked 는 라벨 typo/brand/deep + Bold, 체크마크 래퍼는 opacity-100, 아톰도 checked", () => {
    const { container } = render(
      <CheckSelectRadio checked onChange={() => {}}>
        L
      </CheckSelectRadio>,
    );
    const labelSpan = [...container.querySelectorAll("span")].find(
      (s) => s.textContent === "L",
    )!;
    expect(labelSpan).toHaveClass("text-body-3-bold", "text-typo-brand-deep");
    expect(labelSpan).not.toHaveClass("group-hover:text-typo-brand-dark");

    const markWrapper = container.querySelector("span[aria-hidden]")!;
    expect(markWrapper).toHaveClass("opacity-100");
    expect(container.querySelector("span[data-variant]")).toHaveAttribute(
      "data-checked",
      "true",
    );
  });

  it("startSlot 은 있을 때만 34px 슬롯으로 렌더한다", () => {
    const { container, rerender } = render(
      <CheckSelectRadio>L</CheckSelectRadio>,
    );
    expect(container.querySelector(".size-\\[var\\(--sz-34\\)\\]")).toBeNull();

    rerender(
      <CheckSelectRadio startSlot={<span>아이콘</span>}>L</CheckSelectRadio>,
    );
    const slot = container.querySelector(".size-\\[var\\(--sz-34\\)\\]")!;
    expect(slot).toHaveClass("shrink-0", "items-center", "justify-center");
    expect(slot.textContent).toBe("아이콘");
  });

  it("type='checkbox' 를 input 에 전달한다", () => {
    const { container } = render(
      <CheckSelectRadio type="checkbox">L</CheckSelectRadio>,
    );
    expect(container.querySelector("label")).toHaveAttribute(
      "data-type",
      "checkbox",
    );
    expect(container.querySelector("input")).toHaveAttribute(
      "type",
      "checkbox",
    );
  });

  it("uncontrolled(checkbox): 행 클릭 시 토글된다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CheckSelectRadio type="checkbox" defaultChecked={false}>
        클릭
      </CheckSelectRadio>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector<HTMLInputElement>("input")!;
    expect(input.checked).toBe(false);

    await user.click(label);
    expect(input.checked).toBe(true);
    expect(label).toHaveAttribute("data-checked", "true");
    expect(container.querySelector("span[data-variant]")).toHaveAttribute(
      "data-checked",
      "true",
    );

    await user.click(label);
    expect(input.checked).toBe(false);
  });

  it("controlled: checked 를 고정하고 onChange 를 호출한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <CheckSelectRadio checked={false} onChange={onChange}>
        약관
      </CheckSelectRadio>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector<HTMLInputElement>("input")!;

    await user.click(label);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(false);
    expect(label).toHaveAttribute("data-checked", "false");
  });

  it("checked 외 input 속성을 <input> 에 spread 한다", () => {
    const { container } = render(
      <CheckSelectRadio name="plan" value="pro" required>
        L
      </CheckSelectRadio>,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;
    expect(input).toHaveAttribute("name", "plan");
    expect(input).toHaveAttribute("value", "pro");
    expect(input).toBeRequired();
  });

  it("className 을 루트 label 에 병합한다", () => {
    const { container } = render(
      <CheckSelectRadio className="max-w-[var(--sz-320)]">L</CheckSelectRadio>,
    );
    expect(container.querySelector("label")).toHaveClass(
      "max-w-[var(--sz-320)]",
      "group",
      "w-full",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <CheckSelectRadio checked onChange={() => {}}>
        L
      </CheckSelectRadio>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
