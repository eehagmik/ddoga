import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TextCard } from "./TextCard";

describe("TextCard", () => {
  it("기본값은 role=button div 루트로 렌더하고 제목/날짜를 보여준다", () => {
    const { container } = render(<TextCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabIndex", "0");
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("YYYY.MM.DD")).toBeInTheDocument();
  });

  it("title/dateValue prop 으로 텍스트를 바꿀 수 있다", () => {
    render(<TextCard title="공지사항" dateValue="2026.09.19" />);
    expect(screen.getByText("공지사항")).toBeInTheDocument();
    expect(screen.getByText("2026.09.19")).toBeInTheDocument();
  });

  it("showDate=false 는 날짜 줄을 렌더하지 않는다(Figma deletable 을 정정한 이름)", () => {
    render(<TextCard showDate={false} />);
    expect(screen.queryByText("YYYY.MM.DD")).not.toBeInTheDocument();
  });

  it("badge=true 는 제목 옆에 Dot(size=xs, color=red) 을 렌더한다", () => {
    const { container } = render(<TextCard badge />);
    const dot = container.querySelector('[data-size="xs"][data-color="red"]');
    expect(dot).not.toBeNull();
  });

  it("badge=false(기본) 는 Dot 을 렌더하지 않는다", () => {
    const { container } = render(<TextCard />);
    expect(container.querySelector('[data-color="red"]')).toBeNull();
  });

  it("titleLines 에 따라 line-clamp-1/line-clamp-2 유틸을 적용한다", () => {
    const { rerender } = render(<TextCard title="한 줄 제목" />);
    expect(screen.getByText("한 줄 제목")).toHaveClass("line-clamp-1");

    rerender(<TextCard title="두 줄 제목" titleLines={2} />);
    expect(screen.getByText("두 줄 제목")).toHaveClass("line-clamp-2");
  });

  it("startSlot/endSlot=true 일 때만 슬롯 콘텐츠를 렌더한다", () => {
    const { rerender } = render(
      <TextCard
        startSlot
        startSlotContents={<span data-testid="start">S</span>}
        endSlot
        endSlotContents={<span data-testid="end">E</span>}
      />,
    );
    expect(screen.getByTestId("start")).toBeInTheDocument();
    expect(screen.getByTestId("end")).toBeInTheDocument();

    rerender(
      <TextCard
        startSlotContents={<span data-testid="start">S</span>}
        endSlotContents={<span data-testid="end">E</span>}
      />,
    );
    expect(screen.queryByTestId("start")).not.toBeInTheDocument();
    expect(screen.queryByTestId("end")).not.toBeInTheDocument();
  });

  it("divider 기본값은 true 로 구분선을 렌더하고, false 면 렌더하지 않는다", () => {
    const { container, rerender } = render(<TextCard />);
    expect(container.querySelector('[role="separator"]')).not.toBeNull();

    rerender(<TextCard divider={false} />);
    expect(container.querySelector('[role="separator"]')).toBeNull();
  });

  it("클릭 시 onClick 이 호출된다", async () => {
    const onClick = vi.fn();
    render(<TextCard onClick={onClick} />);
    // 접근성 이름이 제목+날짜 텍스트를 모두 포함해 name 필터 없이 단일 버튼으로 조회한다.
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Enter/Space 키 입력도 onClick 을 동일하게 트리거한다", async () => {
    const onClick = vi.fn();
    render(<TextCard onClick={onClick} />);
    const card = screen.getByRole("button");
    card.focus();

    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("hover/focus-visible 배경 유틸 클래스를 루트에 직접 부여한다(group- 접두사 없음)", () => {
    const { container } = render(<TextCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("hover:bg-bg-neutral-deep");
    expect(root).toHaveClass("focus-visible:bg-bg-neutral-deep");
  });

  it("focus 시 inner 콘텐츠에 --alpha-80 투명도 dip 을 자손(group-focus-visible)으로 적용한다(ImageCard/GalleryCard 와 통일)", () => {
    const { container } = render(<TextCard />);
    const inner = container.querySelector('[data-name="inner"]');
    expect(inner).toHaveClass("group-focus-visible:opacity-(--alpha-80)");
  });

  it("className prop 을 루트에 병합한다", () => {
    const { container } = render(<TextCard className="custom-class" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-class");
  });
});
