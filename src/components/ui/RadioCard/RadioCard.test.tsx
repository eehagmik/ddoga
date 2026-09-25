import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioCard } from "./RadioCard";

describe("RadioCard", () => {
  it("기본값은 size md / unchecked / enable 로 렌더한다", () => {
    const { container } = render(<RadioCard label="제목" />);
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute("data-size", "md");
    expect(label).toHaveAttribute("data-checked", "false");
    expect(label).toHaveAttribute("data-state", "enable");
    expect(label).toHaveClass(
      "group",
      "w-full",
      "flex-col",
      "gap-(--sz-10)",
      "rounded-lg",
      "bg-bg-neutral-normal",
      "shadow-borderNeutral-xs",
      "cursor-pointer",
    );
    expect(label?.textContent).toContain("제목");
  });

  it("visually-hidden native radio input 을 렌더하고 Radio 아톰을 합성한다", () => {
    const { container } = render(<RadioCard label="제목" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "radio");
    expect(input).toHaveClass("peer", "sr-only");
    expect(container.querySelector("[data-size]")).toBeInTheDocument();
  });

  it("subTextValue 가 있을 때만 서브텍스트를 렌더한다", () => {
    const { container: withSub } = render(
      <RadioCard label="제목" subTextValue="설명" />,
    );
    expect(withSub.querySelector("label")?.textContent).toContain("설명");

    const { container: withoutSub } = render(<RadioCard label="제목" />);
    expect(withoutSub.querySelector("label")?.textContent).not.toContain(
      "설명",
    );
  });

  it("children 슬롯이 있을 때만 하단 콘텐츠를 렌더한다", () => {
    const { container } = render(
      <RadioCard label="제목">
        <button type="button">액션</button>
      </RadioCard>,
    );
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("size 별 gap/radius/아톰 size/래퍼 pt/타이포가 적용된다(CheckboxCard 대비 sm pt 차이 포함)", () => {
    const cases = {
      sm: {
        gap: "gap-(--sz-8)",
        radius: "rounded-md",
        pt: "pt-(--sz-2)",
        typo: "text-body-4",
        atomSize: "sm",
      },
      md: {
        gap: "gap-(--sz-10)",
        radius: "rounded-lg",
        pt: "pt-(--sz-1)",
        typo: "text-body-3",
        atomSize: "md",
      },
      lg: {
        gap: "gap-(--sz-12)",
        radius: "rounded-xl",
        pt: "pt-(--sz-5)",
        typo: "text-body-1",
        atomSize: "md", // lg 카드도 md(24px) 아톰을 쓴다 — Figma 실측 쿼크
      },
    } as const;

    for (const [size, expected] of Object.entries(cases)) {
      const { container } = render(
        <RadioCard size={size as "sm" | "md" | "lg"} label="제목" />,
      );
      const label = container.querySelector("label")!;
      expect(label).toHaveClass(expected.gap, expected.radius);

      const leftWrapper = container.querySelector("label > div > div > span")!;
      expect(leftWrapper).toHaveClass(expected.pt);

      // 카드 루트 <label> 도 data-size 를 갖고 있어 `span[data-size]` 로 아톰만 특정한다.
      const atom = container.querySelector("span[data-size]")!;
      expect(atom).toHaveAttribute("data-size", expected.atomSize);

      const labelText = container.querySelectorAll(
        "label > div > div > span",
      )[1];
      expect(labelText).toHaveClass(expected.typo);
    }
  });

  it("checked 는 브랜드 배경/외곽선 + Bold + brand 라벨색을 쓴다", () => {
    const { container } = render(
      <RadioCard label="제목" checked onChange={() => {}} />,
    );
    const cardLabel = container.querySelector("label")!;
    expect(cardLabel).toHaveClass(
      "bg-bg-brand-bright",
      "shadow-borderBrand-sm",
    );

    const titleText = container.querySelectorAll("label > div > div > span")[1];
    expect(titleText).toHaveClass("text-body-3-bold", "text-typo-brand-dark");
  });

  it("hover 유틸: unchecked 는 카드 자신에 hover:(checked 무관 배경) + borderBrand-xs 를 쓴다", () => {
    const { container } = render(<RadioCard label="제목" />);
    const cardLabel = container.querySelector("label")!;
    expect(cardLabel).toHaveClass(
      "hover:bg-bg-brandGrayish-deep",
      "hover:shadow-borderBrand-xs",
    );
  });

  it("hover 유틸: checked 는 hover 배경이 brandGrayish/deep 로(brand/bright 유지 아님) 전이한다", () => {
    const { container } = render(
      <RadioCard label="제목" checked onChange={() => {}} />,
    );
    const cardLabel = container.querySelector("label")!;
    expect(cardLabel).toHaveClass("hover:bg-bg-brandGrayish-deep");
  });

  it("disabled 는 선택되지 않고 카드/라벨/서브텍스트 색이 바뀐다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <RadioCard
        label="제목"
        subTextValue="설명"
        disabled
        onChange={onChange}
      />,
    );
    const cardLabel = container.querySelector("label")!;
    const input = container.querySelector("input")!;

    expect(input).toBeDisabled();
    expect(cardLabel).toHaveClass(
      "cursor-not-allowed",
      "bg-bg-disabled-subtle",
    );
    expect(cardLabel).not.toHaveClass("cursor-pointer");
    expect(cardLabel.textContent).toContain("설명");

    await user.click(cardLabel);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it("disabled + checked 는 borderNeutral-sm 외곽선을 쓴다(disabled 는 항상 Neutral 계열)", () => {
    const { container } = render(
      <RadioCard label="제목" checked disabled onChange={() => {}} />,
    );
    expect(container.querySelector("label")).toHaveClass(
      "bg-bg-disabled-subtle",
      "shadow-borderNeutral-sm",
    );
  });

  it("uncontrolled: 카드 클릭 시 선택된다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RadioCard label="제목" defaultChecked={false} />,
    );
    const cardLabel = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    expect(input.checked).toBe(false);

    await user.click(cardLabel);
    expect(input.checked).toBe(true);
    expect(cardLabel).toHaveAttribute("data-checked", "true");
  });

  it("controlled: checked 를 고정하고 onChange 를 호출한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <RadioCard label="제목" checked={false} onChange={onChange} />,
    );
    const cardLabel = container.querySelector("label")!;

    await user.click(cardLabel);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(cardLabel).toHaveAttribute("data-checked", "false");
  });

  it("className 을 루트 label 에 병합한다", () => {
    const { container } = render(
      <RadioCard label="제목" className="max-w-(--sz-320)" />,
    );
    expect(container.querySelector("label")).toHaveClass(
      "max-w-(--sz-320)",
      "group",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <RadioCard
        label="제목"
        subTextValue="설명"
        checked
        onChange={() => {}}
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
