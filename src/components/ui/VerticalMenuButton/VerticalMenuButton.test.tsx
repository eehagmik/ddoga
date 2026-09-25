import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { VerticalMenuButtonSize } from "./VerticalMenuButton";
import { VerticalMenuButton } from "./VerticalMenuButton";

const SIZES: VerticalMenuButtonSize[] = ["sm", "md", "lg", "xl", "2xl"];

describe("VerticalMenuButton", () => {
  it('기본값은 type="button" / size="sm" / badge=false 로 렌더한다', () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label">
        <span aria-hidden="true">graphic</span>
      </VerticalMenuButton>,
    );
    const btn = getByRole("button", { name: "Label" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-size", "sm");
    expect(btn).toHaveAttribute("data-badge", "false");
    expect(btn).toHaveClass(
      "w-(--sz-68)",
      "cursor-pointer",
      "rounded-md",
      "p-(--sz-4)",
    );
  });

  it("children(그래픽)을 렌더한다", () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label">
        <span>graphic-content</span>
      </VerticalMenuButton>,
    );
    expect(getByRole("button")).toHaveTextContent("graphic-content");
  });

  it.each(SIZES)(
    "size=%s 별 그래픽 정사각 크기·라벨 타이포 유틸을 적용한다",
    (size) => {
      const { getByRole } = render(
        <VerticalMenuButton size={size} label="Label">
          <span>g</span>
        </VerticalMenuButton>,
      );
      const btn = getByRole("button");
      expect(btn).toHaveAttribute("data-size", size);

      const graphicSize: Record<VerticalMenuButtonSize, string> = {
        sm: "size-(--sz-28)",
        md: "size-(--sz-32)",
        lg: "size-(--sz-42)",
        xl: "size-(--sz-52)",
        "2xl": "size-(--sz-60)",
      };
      const graphic = btn.querySelector('[data-name="image"] > span');
      expect(graphic).toHaveClass(graphicSize[size]);

      const typo = size === "sm" ? "text-body-5" : "text-body-4";
      const label = btn.querySelector('[data-name="inner"] > span:last-child');
      expect(label).toHaveClass(typo);
    },
  );

  it("badge=false(기본값) 면 Dot 를 렌더하지 않는다", () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label">
        <span>g</span>
      </VerticalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn.querySelector('[data-color="red"]')).toBeNull();
  });

  it("badge=true 면 size 별 Dot 크기로 렌더한다(sm/md=xs, lg~2xl=sm)", () => {
    const { getByRole, rerender } = render(
      <VerticalMenuButton size="sm" badge label="Label">
        <span>g</span>
      </VerticalMenuButton>,
    );
    expect(
      getByRole("button").querySelector('[data-size="xs"][data-color="red"]'),
    ).not.toBeNull();

    rerender(
      <VerticalMenuButton size="lg" badge label="Label">
        <span>g</span>
      </VerticalMenuButton>,
    );
    expect(
      getByRole("button").querySelector('[data-size="sm"][data-color="red"]'),
    ).not.toBeNull();
  });

  it("endSlot 이 없으면 렌더하지 않는다", () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label">
        <span>g</span>
      </VerticalMenuButton>,
    );
    expect(
      getByRole("button").querySelector('[data-name="endSlot"]'),
    ).toBeNull();
  });

  it("endSlot 이 있으면 고정 높이 박스에 담아 렌더한다", () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label" endSlot={<span>extra</span>}>
        <span>g</span>
      </VerticalMenuButton>,
    );
    const btn = getByRole("button");
    const slot = btn.querySelector('[data-name="endSlot"]');
    expect(slot).not.toBeNull();
    expect(slot).toHaveClass("h-(--sz-32)", "w-full");
    expect(btn).toHaveTextContent("extra");
  });

  it("hover/focus 는 CSS 의사클래스로만 처리한다(disabled 없음)", () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label">
        <span>g</span>
      </VerticalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveClass(
      "hover:opacity-(--alpha-80)",
      "focus-visible:opacity-(--alpha-60)",
    );
  });

  it("클릭하면 onClick 을 호출한다", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <VerticalMenuButton label="Label" onClick={onClick}>
        <span>g</span>
      </VerticalMenuButton>,
    );
    fireEvent.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("className 을 루트 button 에 병합한다", () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label" className="mt-(--sz-8)">
        <span>g</span>
      </VerticalMenuButton>,
    );
    expect(getByRole("button")).toHaveClass("mt-(--sz-8)", "w-(--sz-68)");
  });

  it("색·크기를 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { getByRole } = render(
      <VerticalMenuButton label="Label">
        <span>g</span>
      </VerticalMenuButton>,
    );
    const btn = getByRole("button");
    expect(btn.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
