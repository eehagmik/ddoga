import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CheckboxWithLabel } from "./CheckboxWithLabel";

describe("CheckboxWithLabel", () => {
  it("기본값은 variant circle / size md / unchecked / enable / bold=false 로 렌더한다", () => {
    const { container } = render(
      <CheckboxWithLabel>동의합니다</CheckboxWithLabel>,
    );
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute("data-variant", "circle");
    expect(label).toHaveAttribute("data-size", "md");
    expect(label).toHaveAttribute("data-checked", "false");
    expect(label).toHaveAttribute("data-state", "enable");
    expect(label).toHaveAttribute("data-bold", "false");
    expect(label).toHaveClass(
      "group",
      "inline-flex",
      "items-start",
      "gap-[var(--sz-8)]",
      "cursor-pointer",
    );
    expect(label?.textContent).toContain("동의합니다");
  });

  it("visually-hidden native checkbox 를 렌더하고 Checkbox 아톰(svg)을 합성한다", () => {
    const { container } = render(<CheckboxWithLabel>라벨</CheckboxWithLabel>);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input).toHaveClass("peer", "sr-only");
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("[data-variant]")).toBeInTheDocument();
  });

  it("size 별 gap / 체크박스 래퍼 pt / 라벨 타이포가 적용된다", () => {
    const cases = {
      sm: ["gap-[var(--sz-8)]", "pt-[var(--sz-2)]", "text-body-4"],
      md: ["gap-[var(--sz-8)]", "pt-[var(--sz-1)]", "text-body-3"],
      lg: ["gap-[var(--sz-10)]", "pt-[var(--sz-1)]", "text-body-2"],
    } as const;
    for (const [size, [gap, pt, typo]] of Object.entries(cases)) {
      const { container } = render(
        <CheckboxWithLabel size={size as "sm" | "md" | "lg"}>
          L
        </CheckboxWithLabel>,
      );
      const label = container.querySelector("label");
      const directSpans = container.querySelectorAll("label > span");
      expect(label).toHaveClass(gap);
      expect(directSpans[0]).toHaveClass(pt); // 체크박스 래퍼
      expect(directSpans[1]).toHaveClass(typo); // 라벨 텍스트
    }
  });

  it("bold=true 는 라벨에 -bold 타이포 유틸을 쓴다", () => {
    const { container } = render(
      <CheckboxWithLabel size="lg" bold>
        L
      </CheckboxWithLabel>,
    );
    const labelText = container.querySelectorAll("label > span")[1];
    expect(labelText).toHaveClass("text-body-2-bold");
    expect(labelText).not.toHaveClass("text-body-2");
    expect(container.querySelector("label")).toHaveAttribute(
      "data-bold",
      "true",
    );
  });

  it("uncontrolled: 라벨 클릭 시 토글된다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CheckboxWithLabel defaultChecked={false}>클릭</CheckboxWithLabel>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    expect(input.checked).toBe(false);
    expect(label).toHaveAttribute("data-checked", "false");

    await user.click(label);
    expect(input.checked).toBe(true);
    expect(label).toHaveAttribute("data-checked", "true");
    expect(container.querySelector("[data-variant]")).toHaveAttribute(
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
      <CheckboxWithLabel checked={false} onChange={onChange}>
        약관
      </CheckboxWithLabel>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;

    await user.click(label);
    expect(onChange).toHaveBeenCalledTimes(1);
    // 부모가 checked 를 갱신하지 않으므로 시각 상태는 그대로.
    expect(input.checked).toBe(false);
    expect(label).toHaveAttribute("data-checked", "false");
  });

  it("disabled 는 토글되지 않고 라벨 색·input disabled·cursor 가 바뀐다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <CheckboxWithLabel disabled onChange={onChange}>
        비활성
      </CheckboxWithLabel>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    const labelText = container.querySelectorAll("label > span")[1];

    expect(input).toBeDisabled();
    expect(label).toHaveClass("cursor-not-allowed");
    expect(label).not.toHaveClass("cursor-pointer");
    expect(labelText).toHaveClass("text-typo-disabled-normal");
    expect(container.querySelector("[data-variant]")).toHaveAttribute(
      "data-state",
      "disabled",
    );

    await user.click(label);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it("variant 를 아톰에 그대로 전달한다", () => {
    const { container } = render(
      <CheckboxWithLabel variant="mark">M</CheckboxWithLabel>,
    );
    expect(container.querySelector("[data-variant]")).toHaveAttribute(
      "data-variant",
      "mark",
    );
  });

  it("checked 외 input 속성을 <input> 에 spread 한다", () => {
    const { container } = render(
      <CheckboxWithLabel name="terms" value="agree" required>
        L
      </CheckboxWithLabel>,
    );
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("name", "terms");
    expect(input).toHaveAttribute("value", "agree");
    expect(input).toBeRequired();
  });

  it("className 을 루트 label 에 병합한다", () => {
    const { container } = render(
      <CheckboxWithLabel className="w-full">L</CheckboxWithLabel>,
    );
    expect(container.querySelector("label")).toHaveClass(
      "w-full",
      "group",
      "gap-[var(--sz-8)]",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <CheckboxWithLabel checked variant="square" bold>
        L
      </CheckboxWithLabel>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
