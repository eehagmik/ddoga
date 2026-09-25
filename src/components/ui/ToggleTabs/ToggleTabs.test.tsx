import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "../Toggle";
import { ToggleTabs } from "./ToggleTabs";

function renderItems() {
  return (
    <>
      <Toggle variant="round">탭 1</Toggle>
      <Toggle variant="round">탭 2</Toggle>
    </>
  );
}

describe("ToggleTabs", () => {
  it("children 으로 전달한 Toggle 인스턴스를 그대로 렌더한다", () => {
    render(<ToggleTabs>{renderItems()}</ToggleTabs>);
    expect(screen.getByRole("button", { name: "탭 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "탭 2" })).toBeInTheDocument();
  });

  it("subMenu=false(기본값) 면 chevron 인디케이터 버튼을 렌더하지 않는다", () => {
    render(<ToggleTabs>{renderItems()}</ToggleTabs>);
    expect(screen.queryByRole("button", { name: "", hidden: true })).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(2);
  });

  it("subMenu=true 면 chevron 인디케이터 버튼을 렌더하고 기본은 collapsed 다", () => {
    render(<ToggleTabs subMenu>{renderItems()}</ToggleTabs>);
    const buttons = screen.getAllByRole("button");
    const indicator = buttons[buttons.length - 1];
    expect(indicator).toHaveAttribute("aria-expanded", "false");

    const contentId = indicator.getAttribute("aria-controls")!;
    expect(document.getElementById(contentId)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("uncontrolled: 인디케이터 클릭 시 펼침/접힘이 토글되고 아이콘이 바뀐다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ToggleTabs subMenu subMenuContent="서브메뉴 콘텐츠">
        {renderItems()}
      </ToggleTabs>,
    );
    const buttons = screen.getAllByRole("button");
    const indicator = buttons[buttons.length - 1];
    const contentId = indicator.getAttribute("aria-controls")!;
    const content = document.getElementById(contentId)!;
    const collapsedIconHtml = indicator.querySelector("svg")!.outerHTML;

    expect(content).toHaveAttribute("aria-hidden", "true");

    await user.click(indicator);
    expect(indicator).toHaveAttribute("aria-expanded", "true");
    expect(content).toHaveAttribute("aria-hidden", "false");
    expect(content).toHaveTextContent("서브메뉴 콘텐츠");
    const expandedIconHtml = indicator.querySelector("svg")!.outerHTML;
    expect(expandedIconHtml).not.toBe(collapsedIconHtml);

    await user.click(indicator);
    expect(indicator).toHaveAttribute("aria-expanded", "false");
    expect(content).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("button svg")).not.toBeNull();
  });

  it("controlled: expanded 를 고정하고 onExpandedChange 를 호출한다", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(
      <ToggleTabs subMenu expanded={false} onExpandedChange={onExpandedChange}>
        {renderItems()}
      </ToggleTabs>,
    );
    const buttons = screen.getAllByRole("button");
    const indicator = buttons[buttons.length - 1];

    await user.click(indicator);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    // controlled 이므로 prop 이 그대로면 내부 상태는 바뀌지 않는다.
    expect(indicator).toHaveAttribute("aria-expanded", "false");
  });

  it("defaultExpanded=true 면 초기부터 펼침 상태로 렌더한다", () => {
    render(
      <ToggleTabs subMenu defaultExpanded>
        {renderItems()}
      </ToggleTabs>,
    );
    const buttons = screen.getAllByRole("button");
    const indicator = buttons[buttons.length - 1];
    expect(indicator).toHaveAttribute("aria-expanded", "true");
  });

  it("size prop 을 data-size 로 노출한다", () => {
    const { container, rerender } = render(
      <ToggleTabs size="sm">{renderItems()}</ToggleTabs>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-size", "sm");

    rerender(<ToggleTabs size="md">{renderItems()}</ToggleTabs>);
    expect(container.firstElementChild).toHaveAttribute("data-size", "md");
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <ToggleTabs className="max-w-(--sz-320)">{renderItems()}</ToggleTabs>,
    );
    expect(container.firstElementChild).toHaveClass(
      "max-w-(--sz-320)",
      "w-full",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <ToggleTabs subMenu defaultExpanded subMenuContent="서브메뉴 콘텐츠">
        {renderItems()}
      </ToggleTabs>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
