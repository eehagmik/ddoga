import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CheckboxCard } from "./CheckboxCard";

describe("CheckboxCard", () => {
  it("기본값은 size md / unchecked / enable 로 렌더하고 아톰은 circle 을 합성한다", () => {
    const { container } = render(<CheckboxCard label="약관에 동의합니다" />);
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute("data-variant", "circle");
    expect(label).toHaveAttribute("data-size", "md");
    expect(label).toHaveAttribute("data-checked", "false");
    expect(label).toHaveAttribute("data-state", "enable");
    expect(label).toHaveClass(
      "group",
      "relative",
      "flex",
      "w-full",
      "cursor-pointer",
      "rounded-lg",
      "bg-bg-neutral-normal",
      "shadow-borderNeutral-xs",
    );
    expect(label?.textContent).toContain("약관에 동의합니다");

    // 합성된 Checkbox 아톰
    const atom = container.querySelector("span[data-variant]");
    expect(atom).toHaveAttribute("data-variant", "circle");
    expect(atom).toHaveAttribute("data-size", "md");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("visually-hidden native checkbox 를 렌더한다", () => {
    const { container } = render(<CheckboxCard label="L" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input).toHaveClass("peer", "sr-only");
  });

  it("size 별 카드 gap/radius, 체크박스 래퍼 pt, 라벨·subTextValue 타이포가 적용된다", () => {
    const cases = {
      sm: {
        card: ["gap-[var(--sz-8)]", "rounded-md"],
        pt: "pt-[var(--sz-1)]",
        label: "text-body-4",
        sub: "text-body-5",
        pl: "pl-[var(--sz-30)]",
        atom: "sm",
      },
      md: {
        card: ["gap-[var(--sz-10)]", "rounded-lg"],
        pt: "pt-[var(--sz-1)]",
        label: "text-body-3",
        sub: "text-body-4",
        pl: "pl-[var(--sz-32)]",
        atom: "md",
      },
      lg: {
        card: ["gap-[var(--sz-12)]", "rounded-xl"],
        pt: "pt-[var(--sz-5)]",
        label: "text-body-1",
        sub: "text-body-3",
        pl: "pl-[var(--sz-32)]",
        atom: "md",
      },
    } as const;

    for (const [size, c] of Object.entries(cases)) {
      const { container } = render(
        <CheckboxCard
          size={size as "sm" | "md" | "lg"}
          label="L"
          subTextValue="S"
        />,
      );
      const label = container.querySelector("label")!;
      expect(label).toHaveClass(...c.card);

      const leftWrapper = container.querySelector("label span")!;
      expect(leftWrapper).toHaveClass(c.pt);

      expect(container.querySelector("span[data-variant]")).toHaveAttribute(
        "data-size",
        c.atom,
      );

      const spans = [...container.querySelectorAll("span")];
      const labelSpan = spans.find((s) => s.textContent === "L")!;
      expect(labelSpan).toHaveClass(c.label, "flex-1");

      const subSpan = spans.find((s) => s.textContent === "S")!;
      expect(subSpan).toHaveClass(c.sub, "text-typo-neutral-light");
      expect(subSpan.parentElement).toHaveClass(c.pl);
    }
  });

  it("checked 는 카드 표면 강조 + 라벨 bold/brand 색을 적용한다", () => {
    const { container } = render(
      <CheckboxCard label="L" subTextValue="S" checked onChange={() => {}} />,
    );
    const label = container.querySelector("label")!;
    expect(label).toHaveClass(
      "bg-bg-brand-bright",
      "shadow-borderBrand-sm",
      "hover:bg-bg-brandGrayish-deep",
    );
    const labelSpan = [...container.querySelectorAll("span")].find(
      (s) => s.textContent === "L",
    )!;
    expect(labelSpan).toHaveClass("text-body-3-bold", "text-typo-brand-dark");
  });

  it("hover 표면 스타일은 루트 자신에 `hover:` 로 걸고 disabled 엔 걸지 않는다", () => {
    const { container: enabled } = render(<CheckboxCard label="L" />);
    const enabledLabel = enabled.querySelector("label")!;
    expect(enabledLabel).toHaveClass(
      "hover:bg-bg-brandGrayish-deep",
      "hover:shadow-borderBrand-xs",
    );
    // `.group` 자손 전용 접두사는 카드 표면에 쓰지 않는다.
    expect(enabledLabel.className).not.toMatch(/group-hover:bg-bg-/);

    const { container: off } = render(<CheckboxCard label="L" disabled />);
    const offLabel = off.querySelector("label")!;
    expect(offLabel.className).not.toMatch(/hover:/);
  });

  it("subTextValue 가 없으면 서브텍스트 영역을 렌더하지 않는다", () => {
    const { container } = render(<CheckboxCard label="L" />);
    const spans = [...container.querySelectorAll("span")];
    expect(spans.some((s) => s.textContent === "S")).toBe(false);
  });

  it("children 슬롯은 있을 때만 렌더한다", () => {
    const { container, rerender } = render(<CheckboxCard label="L" />);
    expect(container.textContent).not.toContain("슬롯콘텐츠");
    rerender(
      <CheckboxCard label="L">
        <span>슬롯콘텐츠</span>
      </CheckboxCard>,
    );
    expect(container.textContent).toContain("슬롯콘텐츠");
  });

  it("uncontrolled: 카드 클릭 시 토글된다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CheckboxCard label="클릭" defaultChecked={false} />,
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
      <CheckboxCard label="약관" checked={false} onChange={onChange} />,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector<HTMLInputElement>("input")!;

    await user.click(label);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(false);
    expect(label).toHaveAttribute("data-checked", "false");
  });

  it("disabled 는 토글되지 않고 표면/텍스트 색·input disabled·cursor 가 바뀐다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <CheckboxCard
        label="비활성"
        subTextValue="S"
        disabled
        onChange={onChange}
      />,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector<HTMLInputElement>("input")!;

    expect(input).toBeDisabled();
    expect(label).toHaveClass(
      "cursor-not-allowed",
      "bg-bg-disabled-subtle",
      "shadow-borderNeutral-xs",
    );
    expect(label).not.toHaveClass("cursor-pointer");

    const labelSpan = [...container.querySelectorAll("span")].find(
      (s) => s.textContent === "비활성",
    )!;
    expect(labelSpan).toHaveClass("text-typo-disabled-normal");
    const subSpan = [...container.querySelectorAll("span")].find(
      (s) => s.textContent === "S",
    )!;
    expect(subSpan).toHaveClass("text-typo-disabled-subtle");
    expect(container.querySelector("span[data-variant]")).toHaveAttribute(
      "data-state",
      "disabled",
    );

    await user.click(label);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it("disabled + checked 는 외곽선을 borderNeutral-sm 으로 준다", () => {
    const { container } = render(
      <CheckboxCard label="L" disabled checked onChange={() => {}} />,
    );
    expect(container.querySelector("label")).toHaveClass(
      "shadow-borderNeutral-sm",
      "bg-bg-disabled-subtle",
    );
  });

  it("checked 외 input 속성을 <input> 에 spread 한다", () => {
    const { container } = render(
      <CheckboxCard label="L" name="plan" value="pro" required />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;
    expect(input).toHaveAttribute("name", "plan");
    expect(input).toHaveAttribute("value", "pro");
    expect(input).toBeRequired();
  });

  it("className 을 루트 label 에 병합한다", () => {
    const { container } = render(
      <CheckboxCard label="L" className="max-w-[var(--sz-320)]" />,
    );
    expect(container.querySelector("label")).toHaveClass(
      "max-w-[var(--sz-320)]",
      "group",
      "rounded-lg",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <CheckboxCard
        label="L"
        subTextValue="S"
        checked
        disabled
        onChange={() => {}}
      >
        <span>slot</span>
      </CheckboxCard>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
