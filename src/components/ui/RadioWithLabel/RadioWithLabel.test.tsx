import { useState } from "react";

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioWithLabel } from "./RadioWithLabel";

describe("RadioWithLabel", () => {
  it("기본값은 size md / unchecked / enable / bold=false 로 렌더한다", () => {
    const { container } = render(<RadioWithLabel>동의합니다</RadioWithLabel>);
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
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

  it("visually-hidden native radio input 을 렌더하고 Radio 아톰을 합성한다", () => {
    const { container } = render(<RadioWithLabel>라벨</RadioWithLabel>);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "radio");
    expect(input).toHaveClass("peer", "sr-only");
    expect(container.querySelector("[data-size]")).toBeInTheDocument();
    // Radio 는 svg 가 없다 — 내부 점은 배경색 span 이다.
    expect(container.querySelector("svg")).toBeNull();
  });

  it("size 별 gap / 라디오 래퍼 pt / 라벨 타이포가 적용된다", () => {
    const cases = {
      sm: ["gap-[var(--sz-8)]", "pt-[var(--sz-2)]", "text-body-4"],
      md: ["gap-[var(--sz-8)]", "pt-[var(--sz-1)]", "text-body-3"],
      lg: ["gap-[var(--sz-10)]", "pt-[var(--sz-1)]", "text-body-2"],
    } as const;
    for (const [size, [gap, pt, typo]] of Object.entries(cases)) {
      const { container } = render(
        <RadioWithLabel size={size as "sm" | "md" | "lg"}>L</RadioWithLabel>,
      );
      const label = container.querySelector("label");
      const directSpans = container.querySelectorAll("label > span");
      expect(label).toHaveClass(gap);
      expect(directSpans[0]).toHaveClass(pt); // 라디오 래퍼
      expect(directSpans[1]).toHaveClass(typo); // 라벨 텍스트
    }
  });

  it("bold=true 는 라벨에 -bold 타이포 유틸을 쓴다", () => {
    const { container } = render(
      <RadioWithLabel size="lg" bold>
        L
      </RadioWithLabel>,
    );
    const labelText = container.querySelectorAll("label > span")[1];
    expect(labelText).toHaveClass("text-body-2-bold");
    expect(labelText).not.toHaveClass("text-body-2");
    expect(container.querySelector("label")).toHaveAttribute(
      "data-bold",
      "true",
    );
  });

  it("checked 여부와 무관하게 라벨 색이 유지된다(CheckboxCard 와 달리 브랜드색으로 안 바뀜)", () => {
    const { container } = render(
      <RadioWithLabel defaultChecked>선택됨</RadioWithLabel>,
    );
    const labelText = container.querySelectorAll("label > span")[1];
    expect(labelText).toHaveClass("text-typo-neutral-normal");
    expect(labelText).not.toHaveClass("text-typo-brand-dark");
  });

  it("uncontrolled: 라벨 클릭 시 선택된다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RadioWithLabel defaultChecked={false}>클릭</RadioWithLabel>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    expect(input.checked).toBe(false);
    expect(label).toHaveAttribute("data-checked", "false");

    await user.click(label);
    expect(input.checked).toBe(true);
    expect(label).toHaveAttribute("data-checked", "true");
    expect(container.querySelector("[data-size]")).toHaveAttribute(
      "data-checked",
      "true",
    );
  });

  it("controlled: checked 를 고정하고 onChange 를 호출한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <RadioWithLabel checked={false} onChange={onChange}>
        약관
      </RadioWithLabel>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;

    await user.click(label);
    expect(onChange).toHaveBeenCalledTimes(1);
    // 부모가 checked 를 갱신하지 않으므로 시각 상태는 그대로.
    expect(input.checked).toBe(false);
    expect(label).toHaveAttribute("data-checked", "false");
  });

  it("disabled 는 선택되지 않고 라벨 색·input disabled·cursor 가 바뀐다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <RadioWithLabel disabled onChange={onChange}>
        비활성
      </RadioWithLabel>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    const labelText = container.querySelectorAll("label > span")[1];

    expect(input).toBeDisabled();
    expect(label).toHaveClass("cursor-not-allowed");
    expect(label).not.toHaveClass("cursor-pointer");
    expect(labelText).toHaveClass("text-typo-disabled-normal");
    expect(container.querySelector("[data-size]")).toHaveAttribute(
      "data-state",
      "disabled",
    );

    await user.click(label);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it("size 를 아톰에 그대로 전달한다", () => {
    const { container } = render(<RadioWithLabel size="lg">L</RadioWithLabel>);
    expect(container.querySelector("[data-size]")).toHaveAttribute(
      "data-size",
      "lg",
    );
  });

  it("controlled 라디오 그룹: 부모가 checked 를 갈아끼우면 상호 배타적으로 동작한다", async () => {
    // 그룹 상호배타성은 Figma 범위 밖이라 RadioGroup 을 만들지 않는다(승인된 계획) — 대신
    // 부모가 checked+onChange 로 그룹을 관리하는 권장 패턴을 검증한다. (uncontrolled 인스턴스를
    // 여러 개 name 만 공유해 렌더하면, 브라우저가 형제를 native 하게 선택 해제해도 각 인스턴스가
    // 독립된 React state 를 갖고 있어 시각 갱신이 지연될 수 있다 — controlled 패턴을 권장하는 이유.)
    function Group() {
      const [value, setValue] = useState<"basic" | "pro">("basic");
      return (
        <div>
          <RadioWithLabel
            name="plan"
            checked={value === "basic"}
            onChange={() => setValue("basic")}
          >
            basic
          </RadioWithLabel>
          <RadioWithLabel
            name="plan"
            checked={value === "pro"}
            onChange={() => setValue("pro")}
          >
            pro
          </RadioWithLabel>
        </div>
      );
    }

    const user = userEvent.setup();
    const { container } = render(<Group />);
    const labels = container.querySelectorAll("label");
    const inputs = container.querySelectorAll("input");

    expect(inputs[0]).toHaveProperty("checked", true);
    expect(inputs[1]).toHaveProperty("checked", false);

    await user.click(labels[1]);
    expect(inputs[0]).toHaveProperty("checked", false);
    expect(inputs[1]).toHaveProperty("checked", true);
    expect(labels[0]).toHaveAttribute("data-checked", "false");
    expect(labels[1]).toHaveAttribute("data-checked", "true");
  });

  it("checked 외 input 속성을 <input> 에 spread 한다", () => {
    const { container } = render(
      <RadioWithLabel name="terms" value="agree" required>
        L
      </RadioWithLabel>,
    );
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("name", "terms");
    expect(input).toHaveAttribute("value", "agree");
    expect(input).toBeRequired();
  });

  it("className 을 루트 label 에 병합한다", () => {
    const { container } = render(
      <RadioWithLabel className="w-full">L</RadioWithLabel>,
    );
    expect(container.querySelector("label")).toHaveClass(
      "w-full",
      "group",
      "gap-[var(--sz-8)]",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <RadioWithLabel checked bold>
        L
      </RadioWithLabel>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
