import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LikeToggle } from "../LikeToggle";
import { FixButton } from "./FixButton";

describe("FixButton", () => {
  it("single: 버튼 1개를 풀와이드로 렌더한다", () => {
    const { getByRole } = render(
      <FixButton variant="single" primaryLabel="확인" />,
    );
    const btn = getByRole("button", { name: "확인" });
    expect(btn).toHaveClass("flex-1");
  });

  it("symmetry: 보조/메인 버튼이 동일 폭(flex-1)으로 렌더된다", () => {
    const { getByRole } = render(
      <FixButton
        variant="symmetry"
        secondaryLabel="취소"
        primaryLabel="확인"
      />,
    );
    expect(getByRole("button", { name: "취소" })).toHaveClass("flex-1");
    expect(getByRole("button", { name: "확인" })).toHaveClass("flex-1");
  });

  it("asymmetry: 보조는 min-width 고정, 메인은 flex-1 이다", () => {
    const { getByRole } = render(
      <FixButton
        variant="asymmetry"
        secondaryLabel="이전"
        primaryLabel="다음"
      />,
    );
    expect(getByRole("button", { name: "이전" })).toHaveClass(
      "min-w-[var(--sz-100)]",
    );
    expect(getByRole("button", { name: "다음" })).toHaveClass("flex-1");
  });

  it("iconButton: 54×54 아이콘 버튼과 메인 버튼을 함께 렌더한다", () => {
    const { getByRole } = render(
      <FixButton
        variant="iconButton"
        icon={<span>icon</span>}
        iconAriaLabel="공유"
        primaryLabel="구매하기"
      />,
    );
    const iconBtn = getByRole("button", { name: "공유" });
    expect(iconBtn).toHaveClass("size-[var(--sz-54)]");
    expect(getByRole("button", { name: "구매하기" })).toBeInTheDocument();
  });

  it("likeToggle: toggleSlot을 <button>으로 추가 래핑하지 않는다", () => {
    const { container, getByRole } = render(
      <FixButton
        variant="likeToggle"
        toggleSlot={<LikeToggle variant="heart" />}
        primaryLabel="장바구니 담기"
      />,
    );
    expect(getByRole("button", { name: "좋아요" })).toBeInTheDocument();
    expect(getByRole("button", { name: "장바구니 담기" })).toBeInTheDocument();
    expect(container.querySelectorAll("button")).toHaveLength(2);
  });

  it("vertical: 메인(풀와이드) + 보조 텍스트 버튼(풀와이드)을 세로로 렌더한다", () => {
    const { getByRole } = render(
      <FixButton
        variant="vertical"
        primaryLabel="로그인"
        secondaryTextLabel="회원가입"
      />,
    );
    expect(getByRole("button", { name: "로그인" })).toHaveClass("w-full");
    expect(getByRole("button", { name: "회원가입" })).toHaveClass("w-full");
  });

  it("gradientVisible=true 면 상단에 장식용 그라데이션 레이어를 렌더한다", () => {
    const { container } = render(
      <FixButton variant="single" primaryLabel="확인" gradientVisible />,
    );
    const gradient = container.querySelector("[aria-hidden]");
    expect(gradient).not.toBeNull();
    expect(gradient).toHaveClass("h-[var(--sz-18)]");
  });

  it("gradientVisible 기본값(false)은 그라데이션 레이어를 렌더하지 않는다", () => {
    const { container } = render(
      <FixButton variant="single" primaryLabel="확인" />,
    );
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });

  it("루트는 화면 하단에 고정되고 safe-area를 padding-bottom에 흡수한다", () => {
    const { container } = render(
      <FixButton variant="single" primaryLabel="확인" />,
    );
    const root = container.querySelector("[data-variant]");
    expect(root).toHaveClass("fixed", "inset-x-0", "bottom-0", "z-50");

    const bar = root?.querySelector("div");
    expect(bar?.className).toMatch(/env\(safe-area-inset-bottom,0px\)/);
  });

  it("그림자·상단 보더 클래스를 전혀 사용하지 않는다(스펙 준수 회귀)", () => {
    const { container } = render(
      <FixButton variant="single" primaryLabel="확인" gradientVisible />,
    );
    const root = container.querySelector("[data-variant]") as HTMLElement;
    expect(root.className).not.toMatch(/shadow-|border-t/);
    const bar = root.querySelector("div") as HTMLElement;
    expect(bar.className).not.toMatch(/shadow-|border-t/);
  });

  it("리터럴 hex 색상값을 렌더 결과에 포함하지 않는다", () => {
    const { container } = render(
      <FixButton variant="single" primaryLabel="확인" gradientVisible />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("onPrimaryClick/onSecondaryClick 이 클릭 시 호출된다", async () => {
    const onPrimaryClick = vi.fn();
    const onSecondaryClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <FixButton
        variant="symmetry"
        secondaryLabel="취소"
        onSecondaryClick={onSecondaryClick}
        primaryLabel="확인"
        onPrimaryClick={onPrimaryClick}
      />,
    );
    await user.click(getByRole("button", { name: "취소" }));
    await user.click(getByRole("button", { name: "확인" }));
    expect(onSecondaryClick).toHaveBeenCalledTimes(1);
    expect(onPrimaryClick).toHaveBeenCalledTimes(1);
  });

  it("primaryDisabled 면 클릭해도 onPrimaryClick 이 호출되지 않는다", async () => {
    const onPrimaryClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <FixButton
        variant="single"
        primaryLabel="확인"
        primaryDisabled
        onPrimaryClick={onPrimaryClick}
      />,
    );
    const btn = getByRole("button", { name: "확인" });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onPrimaryClick).not.toHaveBeenCalled();
  });

  it("onIconClick/onSecondaryTextClick 이 클릭 시 호출된다", async () => {
    const onIconClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole, rerender } = render(
      <FixButton
        variant="iconButton"
        icon={<span>icon</span>}
        iconAriaLabel="공유"
        onIconClick={onIconClick}
        primaryLabel="구매하기"
      />,
    );
    await user.click(getByRole("button", { name: "공유" }));
    expect(onIconClick).toHaveBeenCalledTimes(1);

    const onSecondaryTextClick = vi.fn();
    rerender(
      <FixButton
        variant="vertical"
        primaryLabel="로그인"
        secondaryTextLabel="회원가입"
        onSecondaryTextClick={onSecondaryTextClick}
      />,
    );
    await user.click(getByRole("button", { name: "회원가입" }));
    expect(onSecondaryTextClick).toHaveBeenCalledTimes(1);
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <FixButton
        variant="single"
        primaryLabel="확인"
        className="bottom-[var(--sz-96)]"
      />,
    );
    expect(container.querySelector("[data-variant]")).toHaveClass(
      "bottom-[var(--sz-96)]",
      "fixed",
    );
  });
});
