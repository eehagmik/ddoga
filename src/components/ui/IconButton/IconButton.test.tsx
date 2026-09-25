import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Icon } from "../../../icons";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it('기본값은 type="button" / 배지 없음 / 아이콘 슬롯만 렌더한다', () => {
    const { container } = render(
      <IconButton aria-label="알림">
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("aria-label", "알림");
    expect(btn).toHaveAttribute("data-badge", "none");
    expect(btn).toHaveClass(
      "relative",
      "inline-flex",
      "shrink-0",
      "cursor-pointer",
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("배지를 생략하면 Dot/BadgeNumber 노드를 렌더하지 않는다", () => {
    const { container } = render(
      <IconButton aria-label="알림">
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    // 아이콘 svg 외에 추가 span(배지) 이 없어야 한다
    expect(container.querySelectorAll("[data-size]")).toHaveLength(0);
  });

  it('badge="dot" 이면 Dot(size xs / color red) 을 우측 상단에 렌더한다', () => {
    const { container } = render(
      <IconButton aria-label="알림" badge="dot">
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    expect(container.querySelector("button")).toHaveAttribute(
      "data-badge",
      "dot",
    );
    const dot = container.querySelector('[data-size="xs"][data-color="red"]');
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass("absolute", "-top-(--sz-2)", "-right-(--sz-2)");
  });

  it('badge="number" 이면 count/max 를 BadgeNumber 로 전달한다', () => {
    const { container } = render(
      <IconButton aria-label="알림" badge="number" count={5}>
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    const badge = container.querySelector('[data-size="xs"]');
    expect(badge).toHaveTextContent("5");
    expect(badge).toHaveClass("absolute", "-top-(--sz-3)", "-right-(--sz-6)");
  });

  it('badge="number" + count 가 max 초과면 `${max}+` 로 축약한다', () => {
    const { container } = render(
      <IconButton aria-label="알림" badge="number" count={150} max={99}>
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    expect(container.querySelector('[data-size="xs"]')).toHaveTextContent(
      "99+",
    );
  });

  it("disabled 면 아이콘 wrapper 에만 opacity 토큰이 붙고 배지는 불변이다", () => {
    const { container } = render(
      <IconButton aria-label="알림" badge="dot" disabled>
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    const btn = container.querySelector("button")!;
    expect(btn).toBeDisabled();
    const iconWrap = btn.querySelector("span");
    expect(iconWrap).toHaveClass("opacity-(--alpha-40)");
    // 배지에는 opacity 토큰이 없다
    expect(container.querySelector('[data-color="red"]')).not.toHaveClass(
      "opacity-(--alpha-40)",
    );
  });

  it("disabled 면 클릭해도 onClick 이 호출되지 않는다", () => {
    const onClick = vi.fn();
    const { container } = render(
      <IconButton aria-label="알림" disabled onClick={onClick}>
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("클릭하면 onClick 을 호출한다", () => {
    const onClick = vi.fn();
    const { container } = render(
      <IconButton aria-label="알림" onClick={onClick}>
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("className 을 루트 button 에 병합한다 (색 오버라이드)", () => {
    const { container } = render(
      <IconButton aria-label="알림" className="text-icon-brand-normal">
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    expect(container.querySelector("button")).toHaveClass(
      "text-icon-brand-normal",
      "relative",
    );
  });

  it("인라인 style 에 hex 컬러가 없다", () => {
    const { container } = render(
      <IconButton aria-label="알림" badge="number" count={3}>
        <Icon name="bell_01_line" />
      </IconButton>,
    );
    expect(container.innerHTML).not.toMatch(/style="[^"]*#[0-9a-fA-F]{3,}/);
  });
});
