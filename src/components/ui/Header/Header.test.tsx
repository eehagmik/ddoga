import { fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Header } from "./Header";

/** jsdom 의 window.scrollY 는 기본적으로 쓰기 불가능한 getter 라 테스트별로 재정의한다. */
function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    value,
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  setScrollY(0);
});

describe("Header", () => {
  it('기본값(type="normal")은 뒤로가기 버튼과 타이틀("Title")을 렌더한다', () => {
    const { getByRole } = render(<Header type="normal" />);
    expect(getByRole("button", { name: "뒤로가기" })).toBeInTheDocument();
    expect(getByRole("banner")).toHaveTextContent("Title");
  });

  it('type="home"/"search" 는 title 이 true 여도 타이틀을 렌더하지 않는다', () => {
    const { queryByText, rerender } = render(
      <Header type="home" titleValue="숨겨질 제목" />,
    );
    expect(queryByText("숨겨질 제목")).not.toBeInTheDocument();

    rerender(<Header type="search" titleValue="숨겨질 제목" />);
    expect(queryByText("숨겨질 제목")).not.toBeInTheDocument();
  });

  it('type="home" 은 back=true 여도 뒤로가기를 렌더하지 않고, 좌측에 Logo 를 렌더한다', () => {
    const { getByRole, queryByRole } = render(<Header type="home" back />);
    expect(queryByRole("button", { name: "뒤로가기" })).not.toBeInTheDocument();
    expect(getByRole("img", { name: "또하나의가족" })).toBeInTheDocument();
  });

  it('type="home" 은 다른 showX 를 전부 false 로 줘도 user/cart 아이콘을 항상 렌더한다', () => {
    const { getByRole, queryByRole } = render(
      <Header
        type="home"
        showHome
        showSlot
        showUser={false}
        showSearch
        showLike
        showShare
        showCart={false}
        showClose
      />,
    );
    expect(getByRole("button", { name: "마이페이지" })).toBeInTheDocument();
    expect(getByRole("button", { name: "장바구니" })).toBeInTheDocument();
    expect(queryByRole("button", { name: "홈" })).not.toBeInTheDocument();
    expect(queryByRole("button", { name: "검색" })).not.toBeInTheDocument();
    expect(queryByRole("button", { name: "공유" })).not.toBeInTheDocument();
    expect(queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    expect(queryByRole("button", { name: "북마크" })).not.toBeInTheDocument();
  });

  it('type="search" 는 back 이 정상 노출되고, 좌측에 Searchbar(트리거)가 렌더되며 클릭하면 onSearchbarClick 이 호출된다', async () => {
    const onSearchbarClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Header type="search" onSearchbarClick={onSearchbarClick} />,
    );
    expect(getByRole("button", { name: "뒤로가기" })).toBeInTheDocument();
    const searchbar = getByRole("button", { name: "검색" });
    expect(searchbar).toBeInTheDocument();

    await user.click(searchbar);
    expect(onSearchbarClick).toHaveBeenCalledTimes(1);
  });

  it('type="search" 는 searchPlaceholder 로 Searchbar 라벨을 바꿀 수 있다', () => {
    const { getByRole } = render(
      <Header type="search" searchPlaceholder="상품을 검색해보세요" />,
    );
    expect(
      getByRole("button", { name: "상품을 검색해보세요" }),
    ).toBeInTheDocument();
  });

  it('type="select" 는 chevron_down_solid 아이콘을 함께 렌더한다', () => {
    const { container } = render(<Header type="select" />);
    expect(container.querySelector("svg")).not.toBeNull();
    // back(chevron_left_line) + title chevron(chevron_down_solid) 두 개의 svg 가 있어야 한다
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
  });

  it('type="select" + onTitleClick 지정 시 타이틀이 <button> 으로 렌더되고 클릭하면 호출된다', async () => {
    const onTitleClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Header
        type="select"
        titleValue="옵션 선택"
        onTitleClick={onTitleClick}
      />,
    );
    const titleButton = getByRole("button", { name: "옵션 선택" });

    await user.click(titleButton);
    expect(onTitleClick).toHaveBeenCalledTimes(1);
  });

  it('type="select" 에 onTitleClick 이 없으면 타이틀은 버튼이 아닌 텍스트로 렌더된다', () => {
    const { queryByRole, getByText } = render(
      <Header type="select" titleValue="옵션 선택" />,
    );
    expect(
      queryByRole("button", { name: "옵션 선택" }),
    ).not.toBeInTheDocument();
    expect(getByText("옵션 선택")).toBeInTheDocument();
  });

  it('type="normal" 에서는 onTitleClick 을 지정해도 타이틀이 버튼으로 렌더되지 않는다', () => {
    const onTitleClick = vi.fn();
    const { queryByRole } = render(
      <Header type="normal" titleValue="Title" onTitleClick={onTitleClick} />,
    );
    expect(queryByRole("button", { name: "Title" })).not.toBeInTheDocument();
  });

  it("back=false 면 뒤로가기 버튼을 렌더하지 않는다", () => {
    const { queryByRole } = render(<Header type="normal" back={false} />);
    expect(queryByRole("button", { name: "뒤로가기" })).not.toBeInTheDocument();
  });

  it("showCart + cartCount 를 지정하면 IconButton 배지에 개수가 표시된다", () => {
    const { getByRole, getByText } = render(
      <Header type="normal" showCart cartCount={5} />,
    );
    expect(getByRole("button", { name: "장바구니" })).toBeInTheDocument();
    expect(getByText("5")).toBeInTheDocument();
  });

  it("showSlot 이 false 면 slot 콘텐츠를 지정해도 렌더하지 않는다", () => {
    const { queryByRole } = render(
      <Header
        type="normal"
        showSlot={false}
        slot={<button type="button">슬롯 버튼</button>}
      />,
    );
    expect(
      queryByRole("button", { name: "슬롯 버튼" }),
    ).not.toBeInTheDocument();
  });

  it("showSlot 이 true 면 slot 콘텐츠를 그대로 렌더한다", () => {
    const { getByRole } = render(
      <Header
        type="normal"
        showSlot
        slot={<button type="button">슬롯 버튼</button>}
      />,
    );
    expect(getByRole("button", { name: "슬롯 버튼" })).toBeInTheDocument();
  });

  it("showUser + userBadge 를 지정하면 dot 배지가 표시된다", () => {
    const { container } = render(<Header type="normal" showUser userBadge />);
    expect(
      container.querySelector('[data-size="xs"][data-color="red"]'),
    ).not.toBeNull();
  });

  it("showLike 를 지정하면 LikeToggle(북마크)이 렌더되고 클릭하면 onLikedChange 가 호출된다", async () => {
    const onLikedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Header
        type="normal"
        showLike
        liked={false}
        onLikedChange={onLikedChange}
      />,
    );
    const likeButton = getByRole("button", { name: "북마크" });
    await user.click(likeButton);
    expect(onLikedChange).toHaveBeenCalledWith(true);
  });

  it('variant="normal" 이면 스크롤해도 data-variant 가 항상 "normal" 이다(리스너 no-op)', () => {
    const { getByRole } = render(<Header type="normal" variant="normal" />);
    const header = getByRole("banner");
    expect(header).toHaveAttribute("data-variant", "normal");

    setScrollY(100);
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-variant", "normal");
  });

  it('variant="blur" 는 scrollThreshold 를 넘으면 data-variant/data-contents-color 가 normal/neutral 로 바뀌고, 되돌아오면 원복된다', () => {
    const { getByRole } = render(
      <Header
        type="normal"
        variant="blur"
        contentsColor="inverse"
        scrollThreshold={10}
      />,
    );
    const header = getByRole("banner");
    expect(header).toHaveAttribute("data-variant", "blur");
    expect(header).toHaveAttribute("data-contents-color", "inverse");

    setScrollY(11);
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-variant", "normal");
    expect(header).toHaveAttribute("data-contents-color", "neutral");

    setScrollY(0);
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-variant", "blur");
    expect(header).toHaveAttribute("data-contents-color", "inverse");
  });

  it("마운트 시 이미 threshold 를 넘은 스크롤 위치라면 처음부터 normal 로 렌더한다", () => {
    setScrollY(50);
    const { getByRole } = render(
      <Header type="normal" variant="transparent" scrollThreshold={4} />,
    );
    expect(getByRole("banner")).toHaveAttribute("data-variant", "normal");
  });

  it("className 을 루트 header 에 병합한다", () => {
    const { getByRole } = render(
      <Header type="normal" className="sticky top-0" />,
    );
    expect(getByRole("banner")).toHaveClass("sticky", "top-0");
  });

  it("색은 토큰 유틸/var(--*) 로만 지정하고 마크업에 hex 가 없다", () => {
    const { container } = render(
      <Header
        type="select"
        showHome
        showUser
        showSearch
        showLike
        showShare
        showCart
        showClose
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
