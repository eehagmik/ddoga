import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FooterAccordion } from "./FooterAccordion";

describe("FooterAccordion", () => {
  it("기본값은 collapsed 로 렌더하고 콘텐츠를 aria-hidden 처리한다", () => {
    render(<FooterAccordion title="제목">콘텐츠</FooterAccordion>);
    const header = screen.getByRole("button", { name: "제목" });
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(header).toHaveAttribute("data-expanded", "false");

    const contentId = header.getAttribute("aria-controls")!;
    expect(document.getElementById(contentId)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("aria-controls 와 콘텐츠 id 가 일치한다", () => {
    render(<FooterAccordion title="제목">콘텐츠</FooterAccordion>);
    const header = screen.getByRole("button", { name: "제목" });

    const controlsId = header.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId!)).toHaveTextContent("콘텐츠");
  });

  it("uncontrolled: 클릭 시 펼침/접힘이 토글되고 아이콘 이름이 바뀐다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FooterAccordion title="제목" defaultExpanded={false}>
        콘텐츠
      </FooterAccordion>,
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
      <FooterAccordion
        title="제목"
        expanded={false}
        onExpandedChange={onExpandedChange}
      >
        콘텐츠
      </FooterAccordion>,
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

  it("children 이 없으면 콘텐츠 영역을 렌더하지 않는다", async () => {
    const user = userEvent.setup();
    render(<FooterAccordion title="제목" />);
    const header = screen.getByRole("button", { name: "제목" });

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(header.getAttribute("aria-controls")!),
    ).toBeNull();
  });

  it("divider(구분선)를 렌더하지 않는다 — Figma 에 하단 구분선 레이어가 없다", () => {
    const { container } = render(
      <FooterAccordion title="제목">콘텐츠</FooterAccordion>,
    );
    expect(container.querySelector('[role="separator"]')).toBeNull();
  });

  it("className 을 루트(카드) 요소에 병합한다 — 버튼이 아니라 바깥 div", () => {
    const { container } = render(
      <FooterAccordion title="제목" className="max-w-[400px]">
        콘텐츠
      </FooterAccordion>,
    );
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("max-w-[400px]", "rounded-2xl");
  });

  it("헤더 버튼이 콘텐츠를 포함하지 않는다 — 카드(div) 안에 버튼과 콘텐츠가 형제로 존재한다", () => {
    const { container } = render(
      <FooterAccordion title="제목" defaultExpanded>
        <button type="button">중첩 버튼</button>
      </FooterAccordion>,
    );
    const header = screen.getByRole("button", { name: "제목" });
    expect(header.querySelector("button")).toBeNull();

    const root = container.firstElementChild!;
    expect(root.querySelector("button")).not.toBeNull();
  });

  it("콘텐츠 wrapper 에 motion-reduce:transition-none 이 있다", () => {
    render(<FooterAccordion title="제목">콘텐츠</FooterAccordion>);
    const header = screen.getByRole("button", { name: "제목" });
    const content = document.getElementById(
      header.getAttribute("aria-controls")!,
    );
    expect(content).toHaveClass("motion-reduce:transition-none");
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <FooterAccordion title="제목" defaultExpanded>
        콘텐츠
      </FooterAccordion>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
