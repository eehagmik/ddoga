import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ImageCard } from "./ImageCard";

describe("ImageCard", () => {
  it("기본값(ratio=16:9, bottom=true)은 role=button div 루트로 렌더하고 타이틀/카운트를 보여준다", () => {
    const { container } = render(<ImageCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabIndex", "0");
    expect(screen.getByText("Title Text")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("ratio 에 따라 Image area 에 aspect-[16/9]/aspect-square 유틸을 적용한다", () => {
    const { container, rerender } = render(<ImageCard />);
    let imageArea = container.querySelector('[data-name="Image area"]');
    expect(imageArea).toHaveClass("aspect-[16/9]");

    rerender(<ImageCard ratio="1:1" />);
    imageArea = container.querySelector('[data-name="Image area"]');
    expect(imageArea).toHaveClass("aspect-square");
  });

  it("bottom=true 일 때만 하단 바와 테두리를 렌더한다", () => {
    const { container, rerender } = render(<ImageCard bottom />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("border", "border-border-neutral-bright");
    expect(
      container.querySelector('[data-name="like & period"]'),
    ).not.toBeNull();

    rerender(<ImageCard bottom={false} />);
    const rootNoBottom = container.firstElementChild as HTMLElement;
    expect(rootNoBottom).not.toHaveClass("border");
    expect(container.querySelector('[data-name="like & period"]')).toBeNull();
  });

  it("title=false 는 오버레이 타이틀을 렌더하지 않는다", () => {
    render(<ImageCard title={false} />);
    expect(screen.queryByText("Title Text")).not.toBeInTheDocument();
  });

  it("titleValue 로 오버레이 타이틀 텍스트를 바꿀 수 있다", () => {
    render(<ImageCard titleValue="공지 이미지" />);
    expect(screen.getByText("공지 이미지")).toBeInTheDocument();
  });

  it("dim=false 는 Dim(gradient) 오버레이를 렌더하지 않는다", () => {
    const { container, rerender } = render(<ImageCard dim />);
    expect(container.querySelector('[data-variant="gradient"]')).not.toBeNull();

    rerender(<ImageCard dim={false} />);
    expect(container.querySelector('[data-variant="gradient"]')).toBeNull();
  });

  it("postedTime=false 는 날짜 텍스트를 렌더하지 않지만 좋아요 영역은 유지한다", () => {
    const { container } = render(<ImageCard postedTime={false} />);
    expect(screen.queryByText("3일")).not.toBeInTheDocument();
    expect(container.querySelector('[data-name="like area"]')).not.toBeNull();
  });

  it("postedTimeValue/likeCount 로 텍스트를 바꿀 수 있다", () => {
    render(<ImageCard postedTimeValue="5분" likeCount={12} />);
    expect(screen.getByText("5분")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("children 슬롯을 렌더한다(기본값 없음)", () => {
    render(
      <ImageCard>
        <img alt="thumb" data-testid="thumb" />
      </ImageCard>,
    );
    expect(screen.getByTestId("thumb")).toBeInTheDocument();
  });

  it("내부 LikeToggleWithLabel 은 appearance=transparent/color=neutralLight 로 렌더된다(Figma 실측)", () => {
    render(<ImageCard />);
    const likeButton = screen.getByRole("button", { name: "좋아요" });
    expect(likeButton).toHaveAttribute("data-appearance", "transparent");
    expect(likeButton).toHaveAttribute("data-color", "neutralLight");
  });

  it("liked/defaultLiked/onLikeChange 가 내부 LikeToggleWithLabel 로 패스스루된다", async () => {
    const onLikeChange = vi.fn();
    render(<ImageCard defaultLiked onLikeChange={onLikeChange} />);
    const likeButton = screen.getByRole("button", { name: "좋아요" });
    expect(likeButton).toHaveAttribute("data-checked", "true");

    await userEvent.click(likeButton);
    expect(onLikeChange).toHaveBeenCalledWith(false);
  });

  it("onClick 이 없어도 루트는 항상 role=button tabIndex=0 이다(카드 전체 클릭 가능)", () => {
    const { container } = render(<ImageCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabIndex", "0");
    expect(root).toHaveClass("cursor-pointer");
  });

  it("onClick 이 있으면 클릭 시 호출된다", async () => {
    const onClick = vi.fn();
    const { container } = render(<ImageCard onClick={onClick} />);
    const root = container.firstElementChild as HTMLElement;

    await userEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onClick 이 있으면 Enter/Space 키 입력도 동일하게 트리거한다", async () => {
    const onClick = vi.fn();
    const { container } = render(<ImageCard onClick={onClick} />);
    const root = container.firstElementChild as HTMLElement;
    root.focus();

    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("className prop 을 루트에 병합한다", () => {
    const { container } = render(<ImageCard className="custom-class" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-class");
  });

  it("focus 시 루트에 --alpha-80 투명도 dip 을 적용한다(TextCard/GalleryCard 와 통일, 포커스 링 없음)", () => {
    const { container } = render(<ImageCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("focus-visible:opacity-(--alpha-80)");
    expect(root).toHaveClass("focus-visible:outline-none");
  });
});
