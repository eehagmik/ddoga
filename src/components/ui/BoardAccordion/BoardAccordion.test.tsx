import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BoardAccordion } from "./BoardAccordion";

describe("BoardAccordion", () => {
  it("기본값은 collapsed 로 렌더하고 콘텐츠를 aria-hidden 처리한다", () => {
    render(<BoardAccordion title="제목">콘텐츠</BoardAccordion>);
    const header = screen.getByRole("button", { name: "제목" });
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(header).toHaveAttribute("data-expanded", "false");
    expect(header).toHaveAttribute("data-title-direction", "horizontal");

    const contentId = header.getAttribute("aria-controls")!;
    expect(document.getElementById(contentId)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("aria-controls 와 콘텐츠 id 가 일치한다", () => {
    render(<BoardAccordion title="제목">콘텐츠</BoardAccordion>);
    const header = screen.getByRole("button", { name: "제목" });

    const controlsId = header.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId!)).toHaveTextContent("콘텐츠");
  });

  it("uncontrolled: 클릭 시 펼침/접힘이 토글되고 아이콘 이름이 바뀐다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <BoardAccordion title="제목" defaultExpanded={false}>
        콘텐츠
      </BoardAccordion>,
    );
    const header = screen.getByRole("button", { name: "제목" });
    const contentId = header.getAttribute("aria-controls")!;
    const content = document.getElementById(contentId)!;
    const collapsedIconHtml = container.querySelector("button svg")!.outerHTML;

    expect(content).toHaveAttribute("aria-hidden", "true");

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(content).toHaveAttribute("aria-hidden", "false");
    const expandedIconHtml = container.querySelector("button svg")!.outerHTML;
    expect(expandedIconHtml).not.toBe(collapsedIconHtml);

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(content).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("button svg")!.outerHTML).toBe(
      collapsedIconHtml,
    );
  });

  it("controlled: expanded 를 고정하고 onExpandedChange 를 호출한다", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(
      <BoardAccordion
        title="제목"
        expanded={false}
        onExpandedChange={onExpandedChange}
      >
        콘텐츠
      </BoardAccordion>,
    );
    const header = screen.getByRole("button", { name: "제목" });
    const contentId = header.getAttribute("aria-controls")!;

    await user.click(header);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(contentId)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("divider=false 면 구분선을 렌더하지 않는다", () => {
    const { container: withDivider } = render(
      <BoardAccordion title="제목">콘텐츠</BoardAccordion>,
    );
    expect(withDivider.querySelector('[role="separator"]')).not.toBeNull();

    const { container: withoutDivider } = render(
      <BoardAccordion title="제목" divider={false}>
        콘텐츠
      </BoardAccordion>,
    );
    expect(withoutDivider.querySelector('[role="separator"]')).toBeNull();
  });

  it("children 이 없으면 콘텐츠 영역을 렌더하지 않는다", async () => {
    const user = userEvent.setup();
    render(<BoardAccordion title="제목" />);
    const header = screen.getByRole("button", { name: "제목" });

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(header.getAttribute("aria-controls")!),
    ).toBeNull();
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <BoardAccordion title="제목" className="w-full">
        콘텐츠
      </BoardAccordion>,
    );
    expect(container.firstElementChild).toHaveClass("w-full", "flex");
  });

  it("titleDirection 기본값은 horizontal 이고, vertical 로 바꿀 수 있다", () => {
    const { rerender } = render(
      <BoardAccordion title="제목">콘텐츠</BoardAccordion>,
    );
    expect(screen.getByRole("button", { name: "제목" })).toHaveAttribute(
      "data-title-direction",
      "horizontal",
    );

    rerender(
      <BoardAccordion title="제목" titleDirection="vertical">
        콘텐츠
      </BoardAccordion>,
    );
    expect(screen.getByRole("button", { name: "제목" })).toHaveAttribute(
      "data-title-direction",
      "vertical",
    );
  });

  it("date 가 없으면 날짜 텍스트를 렌더하지 않고, 있으면 렌더한다", () => {
    const { rerender } = render(
      <BoardAccordion title="제목">콘텐츠</BoardAccordion>,
    );
    expect(screen.queryByText("2026.09.13")).toBeNull();

    rerender(
      <BoardAccordion title="제목" date="2026.09.13">
        콘텐츠
      </BoardAccordion>,
    );
    expect(screen.getByText("2026.09.13")).toBeInTheDocument();
  });

  it("startSlot 이 없으면 슬롯을 렌더하지 않고, 있으면 렌더한다", () => {
    const { rerender } = render(
      <BoardAccordion title="제목">콘텐츠</BoardAccordion>,
    );
    expect(screen.queryByTestId("start-slot")).toBeNull();

    rerender(
      <BoardAccordion
        title="제목"
        startSlot={<span data-testid="start-slot">아이콘</span>}
      >
        콘텐츠
      </BoardAccordion>,
    );
    expect(screen.getByTestId("start-slot")).toBeInTheDocument();
  });

  it("collapsed 일 때 제목에 line-clamp-2 가 적용되고, expanded 면 제거된다", async () => {
    const user = userEvent.setup();
    render(<BoardAccordion title="제목">콘텐츠</BoardAccordion>);
    const header = screen.getByRole("button", { name: "제목" });

    expect(header.querySelector(".line-clamp-2")).not.toBeNull();

    await user.click(header);
    expect(header.querySelector(".line-clamp-2")).toBeNull();
  });

  it("헤더에 motion-reduce:transition-none 이 있다", () => {
    render(<BoardAccordion title="제목">콘텐츠</BoardAccordion>);
    expect(screen.getByRole("button", { name: "제목" })).toHaveClass(
      "motion-reduce:transition-none",
    );
  });

  it("콘텐츠 wrapper 에 motion-reduce:transition-none 이 있다", () => {
    render(<BoardAccordion title="제목">콘텐츠</BoardAccordion>);
    const header = screen.getByRole("button", { name: "제목" });
    const content = document.getElementById(
      header.getAttribute("aria-controls")!,
    );
    expect(content).toHaveClass("motion-reduce:transition-none");
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <BoardAccordion title="제목" defaultExpanded date="2026.09.13">
        콘텐츠
      </BoardAccordion>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
