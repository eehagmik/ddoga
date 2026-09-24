import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HorizontalMenuButtonSize } from "./HorizontalMenuButton";
import { HorizontalMenuButton } from "./HorizontalMenuButton";

const SIZES: HorizontalMenuButtonSize[] = ["sm", "md", "lg", "xl", "2xl"];

describe("HorizontalMenuButton", () => {
  it('기본값은 type="button" / variant="text" / size="sm" / bold=false 로 렌더한다', () => {
    const { getByRole } = render(
      <HorizontalMenuButton>Label</HorizontalMenuButton>,
    );
    const btn = getByRole("button", { name: "Label" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-variant", "text");
    expect(btn).toHaveAttribute("data-size", "sm");
    expect(btn).toHaveAttribute("data-bold", "false");
    expect(btn).toHaveClass(
      "w-full",
      "cursor-pointer",
      "min-h-[var(--sz-36)]",
      "rounded-sm",
    );
  });

  it("variant=outline 이면 배경·테두리 유틸을 적용한다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton variant="outline">Label</HorizontalMenuButton>,
    );
    expect(getByRole("button")).toHaveClass(
      "bg-bg-neutral-normal",
      "border-xs",
      "border-solid",
      "border-border-neutral-bright",
      "min-h-[var(--sz-40)]",
    );
  });

  it("variant=text 는 배경·테두리 유틸이 없다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton variant="text">Label</HorizontalMenuButton>,
    );
    expect(getByRole("button")).not.toHaveClass("bg-bg-neutral-normal");
  });

  it.each(SIZES)(
    "size=%s 별 min-height·radius·타이포 유틸을 적용한다",
    (size) => {
      const { getByRole } = render(
        <HorizontalMenuButton size={size}>Label</HorizontalMenuButton>,
      );
      const btn = getByRole("button");
      expect(btn).toHaveAttribute("data-size", size);

      const radius = size === "sm" ? "rounded-sm" : "rounded-md";
      expect(btn).toHaveClass(radius);

      const typo =
        size === "sm"
          ? "text-body-4"
          : size === "md" || size === "lg"
            ? "text-body-3"
            : "text-body-2";
      const label = btn.querySelector("span > span:last-child");
      expect(label).toHaveClass(typo);
    },
  );

  it("bold=true 면 -bold 타이포 유틸로 전환한다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton bold>Label</HorizontalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveAttribute("data-bold", "true");
    const label = btn.querySelector("span > span:last-child");
    expect(label).toHaveClass("text-body-4-bold");
  });

  it("chevron 기본값 true — chevron_right_line 아이콘을 렌더한다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton>Label</HorizontalMenuButton>,
    );
    const svg = getByRole("button").querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "16");
  });

  it("chevron=false 면 option 영역 자체를 렌더하지 않는다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton chevron={false}>Label</HorizontalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn.querySelector("svg")).toBeNull();
    expect(btn.querySelector('[data-name="option"]')).toBeNull();
  });

  it("endSlot 이 있으면 chevron=false 여도 option 영역을 렌더한다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton chevron={false} endSlot={<span>extra</span>}>
        Label
      </HorizontalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn.querySelector('[data-name="option"]')).not.toBeNull();
    expect(btn).toHaveTextContent("extra");
  });

  it("startSlot 이 있으면 size 별 정사각 슬롯에 담아 렌더한다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton size="md" startSlot={<span>icon</span>}>
        Label
      </HorizontalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveTextContent("icon");
    const slot = btn.querySelector('[data-name="left"] > span:first-child');
    expect(slot).toHaveClass("size-[var(--sz-28)]");
  });

  it("startSlot 이 없으면 슬롯 wrapper 를 렌더하지 않는다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton>Label</HorizontalMenuButton>,
    );
    const left = getByRole("button").querySelector('[data-name="left"]');
    expect(left?.children).toHaveLength(1);
  });

  it("hover/focus 는 CSS 의사클래스로만 처리한다(disabled 없음)", () => {
    const { getByRole } = render(
      <HorizontalMenuButton>Label</HorizontalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveClass(
      "hover:opacity-[var(--alpha-80)]",
      "focus-visible:opacity-[var(--alpha-60)]",
    );
  });

  it("클릭하면 onClick 을 호출한다", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <HorizontalMenuButton onClick={onClick}>Label</HorizontalMenuButton>,
    );
    fireEvent.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("className 을 루트 button 에 병합한다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton className="mt-[var(--sz-8)]">
        Label
      </HorizontalMenuButton>,
    );
    expect(getByRole("button")).toHaveClass("mt-[var(--sz-8)]", "w-full");
  });

  it("색·크기를 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { getByRole } = render(
      <HorizontalMenuButton>Label</HorizontalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
