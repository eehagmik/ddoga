import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfoCard } from "./InfoCard";

describe("InfoCard", () => {
  it("기본값은 color neutral / variant horizontal 로 렌더한다", () => {
    const { container } = render(
      <InfoCard titleValue="제목" textValue="본문" />,
    );
    const root = container.querySelector("[data-color]");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-color", "neutral");
    expect(root).toHaveAttribute("data-variant", "horizontal");
    expect(root).toHaveClass(
      "flex",
      "w-full",
      "flex-col",
      "rounded-2xl",
      "bg-bg-neutral-deep",
    );
  });

  it("titleValue 가 있으면 아이콘+제목 header 를 렌더한다", () => {
    const { container, getByText } = render(
      <InfoCard titleValue="제목입니다" />,
    );
    expect(getByText("제목입니다")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("titleValue 가 없으면 header(아이콘+제목) 영역을 렌더하지 않는다", () => {
    const { container } = render(<InfoCard textValue="본문만" />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("p.text-body-3-bold")).toBeNull();
  });

  it("textValue 가 있으면 본문을 렌더하고, 없으면 렌더하지 않는다", () => {
    const { getByText, queryByText, rerender } = render(
      <InfoCard titleValue="T" textValue="본문 텍스트" />,
    );
    expect(getByText("본문 텍스트")).toBeInTheDocument();

    rerender(<InfoCard titleValue="T" />);
    expect(queryByText("본문 텍스트")).toBeNull();
  });

  it("children 슬롯은 있을 때만 렌더한다", () => {
    const { container, rerender } = render(
      <InfoCard titleValue="T" textValue="B" />,
    );
    expect(container.textContent).not.toContain("슬롯콘텐츠");

    rerender(
      <InfoCard titleValue="T" textValue="B">
        <span>슬롯콘텐츠</span>
      </InfoCard>,
    );
    expect(container.textContent).toContain("슬롯콘텐츠");
  });

  it("variant='horizontal' 은 header 를 가로 flex 로, variant='vertical' 은 flex-col 로 렌더한다", () => {
    const { container: h } = render(
      <InfoCard titleValue="T" variant="horizontal" />,
    );
    const headerH = h.querySelector("[data-color] > div")!;
    expect(headerH).toHaveClass("flex", "items-start");
    expect(headerH).not.toHaveClass("flex-col");

    const { container: v } = render(
      <InfoCard titleValue="T" variant="vertical" />,
    );
    const headerV = v.querySelector("[data-color] > div")!;
    expect(headerV).toHaveClass("flex", "flex-col", "items-start");
  });

  it("color 별 배경/아이콘/제목/본문 토큰이 적용된다", () => {
    const cases = {
      neutral: {
        bg: "bg-bg-neutral-deep",
        title: "text-typo-neutral-normal",
        text: "text-typo-neutral-subtle",
      },
      danger: {
        bg: "bg-bg-danger-bright",
        title: "text-typo-danger-dark",
        text: "text-typo-danger-deep",
      },
      info: {
        bg: "bg-bg-info-bright",
        title: "text-typo-info-dark",
        text: "text-typo-info-deep",
      },
      warning: {
        bg: "bg-bg-warning-bright",
        title: "text-typo-warning-dark",
        text: "text-typo-warning-deep",
      },
    } as const;

    for (const [color, expected] of Object.entries(cases)) {
      const { container } = render(
        <InfoCard
          color={color as keyof typeof cases}
          titleValue="제목"
          textValue="본문"
        />,
      );
      const root = container.querySelector("[data-color]")!;
      expect(root).toHaveClass(expected.bg);

      const title = [...container.querySelectorAll("p")].find(
        (p) => p.textContent === "제목",
      )!;
      expect(title).toHaveClass(expected.title, "text-body-3-bold");

      const text = [...container.querySelectorAll("p")].find(
        (p) => p.textContent === "본문",
      )!;
      expect(text).toHaveClass(expected.text, "text-body-4");
    }
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <InfoCard titleValue="T" className="max-w-[var(--sz-320)]" />,
    );
    expect(container.querySelector("[data-color]")).toHaveClass(
      "max-w-[var(--sz-320)]",
      "rounded-2xl",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <InfoCard color="danger" variant="vertical" titleValue="T" textValue="B">
        <span>slot</span>
      </InfoCard>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
