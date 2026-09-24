import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GalleryCard } from "./GalleryCard";

describe("GalleryCard", () => {
  it("기본값(ratio=16:9)은 role=button div 루트로 렌더하고 타이틀/배지/아이콘을 보여준다", () => {
    const { container } = render(<GalleryCard ratio="16:9" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabIndex", "0");
    expect(screen.getByText("Title Text")).toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(container.querySelector("[data-size][data-color]")).not.toBeNull();
  });

  it("ratio 에 따라 Thumbnail area 에 aspect-video/aspect-square 유틸을 적용한다", () => {
    const { container, rerender } = render(<GalleryCard ratio="16:9" />);
    let thumbnail = container.querySelector('[data-name="Thumbnail area"]');
    expect(thumbnail).toHaveClass("aspect-video");

    rerender(<GalleryCard ratio="1:1" />);
    thumbnail = container.querySelector('[data-name="Thumbnail area"]');
    expect(thumbnail).toHaveClass("aspect-square");
  });

  it("badge=false 는 배지(Dot)를 렌더하지 않는다", () => {
    const { container } = render(<GalleryCard ratio="16:9" badge={false} />);
    expect(container.querySelector("[data-size][data-color]")).toBeNull();
  });

  it("multipleIcon=false 는 복수 사진 아이콘을 렌더하지 않는다", () => {
    const { container } = render(
      <GalleryCard ratio="16:9" multipleIcon={false} />,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("title=false 는 타이틀 텍스트를 렌더하지 않는다", () => {
    render(<GalleryCard ratio="16:9" title={false} />);
    expect(screen.queryByText("Title Text")).not.toBeInTheDocument();
  });

  it("titleValue 로 타이틀 텍스트를 바꿀 수 있다", () => {
    render(<GalleryCard ratio="16:9" titleValue="공지 사진" />);
    expect(screen.getByText("공지 사진")).toBeInTheDocument();
  });

  it("children 슬롯을 렌더한다(기본값 없음)", () => {
    render(
      <GalleryCard ratio="16:9">
        <img alt="thumb" data-testid="thumb" />
      </GalleryCard>,
    );
    expect(screen.getByTestId("thumb")).toBeInTheDocument();
  });

  it("onClick 이 없어도 루트는 항상 role=button tabIndex=0 이다(카드 전체 클릭 가능)", () => {
    const { container } = render(<GalleryCard ratio="16:9" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabIndex", "0");
    expect(root).toHaveClass("cursor-pointer");
  });

  it("onClick 이 있으면 클릭 시 호출된다", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <GalleryCard ratio="16:9" onClick={onClick} />,
    );
    const root = container.firstElementChild as HTMLElement;

    await userEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onClick 이 있으면 Enter/Space 키 입력도 동일하게 트리거한다", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <GalleryCard ratio="16:9" onClick={onClick} />,
    );
    const root = container.firstElementChild as HTMLElement;
    root.focus();

    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("className prop 을 루트에 병합한다", () => {
    const { container } = render(
      <GalleryCard ratio="16:9" className="custom-class" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-class");
  });

  it("focus 시 루트에 --alpha-80 투명도 dip 을 적용한다(TextCard/ImageCard 와 통일, 포커스 링 없음)", () => {
    const { container } = render(<GalleryCard ratio="16:9" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("focus-visible:opacity-[var(--alpha-80)]");
    expect(root).toHaveClass("focus-visible:outline-none");
  });
});
