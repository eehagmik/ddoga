import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tab } from "./Tab";

describe("Tab", () => {
  it("href 없이 렌더하면 <button type=button> 이고 기본값(md/unselected) data-* 를 부여한다", () => {
    const { getByRole } = render(<Tab>라벨</Tab>);
    const btn = getByRole("button", { name: "라벨" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-size", "md");
    expect(btn).toHaveAttribute("data-selected", "false");
    expect(btn).not.toHaveAttribute("aria-current");
  });

  it("href 를 넘기면 <a href> 로 렌더된다", () => {
    const { getByRole } = render(
      <Tab href="/foo" selected>
        라벨
      </Tab>,
    );
    const link = getByRole("link", { name: "라벨" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/foo");
  });

  it("selected=true 면 aria-current=true 와 data-selected=true 를 부여한다", () => {
    const { getByRole } = render(<Tab selected>라벨</Tab>);
    const btn = getByRole("button");
    expect(btn).toHaveAttribute("aria-current", "true");
    expect(btn).toHaveAttribute("data-selected", "true");
  });

  it("size 별 타이포·밑줄 두께 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(<Tab size="sm">라벨</Tab>);
    expect(getByRole("button")).toHaveClass(
      "text-body-3",
      "border-b-[length:var(--border-width-sm)]",
    );

    rerender(<Tab size="md">라벨</Tab>);
    expect(getByRole("button")).toHaveClass(
      "text-body-2",
      "border-b-[length:var(--border-width-md)]",
    );
  });

  it("selected 면 -bold 타이포·brand 밑줄색·normal 라벨색으로 바뀐다", () => {
    const { getByRole, rerender } = render(<Tab size="sm">라벨</Tab>);
    const unselected = getByRole("button");
    expect(unselected).toHaveClass(
      "text-body-3",
      "text-typo-neutral-subtle",
      "border-transparent",
    );

    rerender(
      <Tab size="sm" selected>
        라벨
      </Tab>,
    );
    const selected = getByRole("button");
    expect(selected).toHaveClass(
      "text-body-3-bold",
      "text-typo-neutral-normal",
      "border-border-brand-normal",
    );
  });

  it("unselected 도 selected 와 동일한 밑줄 두께를 확보한다(레이아웃 시프트 방지)", () => {
    const { getByRole } = render(<Tab size="md">라벨</Tab>);
    expect(getByRole("button")).toHaveClass(
      "border-b-[length:var(--border-width-md)]",
    );
  });

  it("버튼 클릭 시 onClick 이 호출된다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(<Tab onClick={onClick}>라벨</Tab>);
    await user.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("className 을 병합하고 기본 클래스도 유지한다", () => {
    const { getByRole } = render(<Tab className="w-full">라벨</Tab>);
    expect(getByRole("button")).toHaveClass("w-full", "inline-flex");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Tab size="md" selected>
        라벨
      </Tab>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
