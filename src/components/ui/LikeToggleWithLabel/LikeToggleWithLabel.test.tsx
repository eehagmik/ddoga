import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LikeToggleWithLabel } from "./LikeToggleWithLabel";

describe("LikeToggleWithLabel", () => {
  it("기본값(heart/outline/unchecked)으로 <button type=button> 을 렌더하고 data-* 를 부여한다", () => {
    const { getByRole } = render(<LikeToggleWithLabel label="좋아요" />);
    const btn = getByRole("button", { name: "좋아요" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-variant", "heart");
    expect(btn).toHaveAttribute("data-appearance", "outline");
    expect(btn).toHaveAttribute("data-checked", "false");
    expect(btn).toHaveAttribute("data-readonly", "false");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveClass("rounded-circle", "bg-bg-neutral-normal");
  });

  it("count 를 지정하지 않으면 카운트를 렌더하지 않는다", () => {
    const { queryByText } = render(<LikeToggleWithLabel label="좋아요" />);
    expect(queryByText("0")).toBeNull();
  });

  it("count=0 도 표시한다(presence 기반, 0 도 유효한 값)", () => {
    const { getByText } = render(
      <LikeToggleWithLabel label="좋아요" count={0} />,
    );
    expect(getByText("0")).toBeInTheDocument();
  });

  it("count 를 지정하면 라벨 뒤에 표시한다", () => {
    const { getByText } = render(
      <LikeToggleWithLabel label="좋아요" count={12} />,
    );
    expect(getByText("12")).toBeInTheDocument();
  });

  it("appearance='transparent' 는 배경/테두리 클래스가 없다", () => {
    const { getByRole } = render(
      <LikeToggleWithLabel label="좋아요" appearance="transparent" />,
    );
    const btn = getByRole("button");
    expect(btn).not.toHaveClass("rounded-circle", "bg-bg-neutral-normal");
  });

  it("클릭하면 checked 가 토글되고 onCheckedChange 가 호출된다(uncontrolled)", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <LikeToggleWithLabel label="좋아요" onCheckedChange={onCheckedChange} />,
    );
    const btn = getByRole("button");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-checked", "true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("defaultChecked=true 면 처음부터 checked 상태이고 like 토큰 표면을 쓴다(heart)", () => {
    const { getByRole } = render(
      <LikeToggleWithLabel label="좋아요" defaultChecked />,
    );
    const btn = getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveClass("bg-bg-like-bright", "border-border-like-normal");
  });

  it("checked + variant='bookmark' 는 info 토큰 표면을 쓴다", () => {
    const { getByRole } = render(
      <LikeToggleWithLabel
        label="관심있어요"
        variant="bookmark"
        defaultChecked
      />,
    );
    const btn = getByRole("button");
    expect(btn).toHaveClass("bg-bg-info-bright", "border-border-info-normal");
  });

  it("controlled(checked) 는 내부 상태로 바뀌지 않고 콜백만 호출한다", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <LikeToggleWithLabel
        label="좋아요"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const btn = getByRole("button");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("readOnly 면 네이티브 disabled 로 클릭을 막고 콜백도 호출되지 않는다", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <LikeToggleWithLabel
        label="좋아요"
        readOnly
        onCheckedChange={onCheckedChange}
      />,
    );
    const btn = getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("data-readonly", "true");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("라벨과 count 는 checked 여부와 무관하게 항상 Medium 타이포를 쓴다(2026-09-19: count 도 Bold → Medium)", () => {
    const { getByText } = render(
      <LikeToggleWithLabel label="좋아요" count={1} defaultChecked />,
    );
    expect(getByText("좋아요")).toHaveClass("text-label-2");
    expect(getByText("좋아요")).not.toHaveClass("text-label-2-bold");
    expect(getByText("1")).toHaveClass("text-label-2");
    expect(getByText("1")).not.toHaveClass("text-label-2-bold");
  });

  it("checked=true + variant='heart' 는 그라데이션 SVG 글리프를 렌더한다(LikeToggleGlyph 재사용)", () => {
    const { container } = render(
      <LikeToggleWithLabel label="좋아요" defaultChecked />,
    );
    expect(container.querySelectorAll("stop")).toHaveLength(2);
  });

  it("className 을 루트에 병합한다", () => {
    const { getByRole } = render(
      <LikeToggleWithLabel label="좋아요" className="absolute top-0" />,
    );
    expect(getByRole("button")).toHaveClass("absolute", "top-0");
  });

  it("색은 토큰 유틸/var(--*) 로만 지정하고 마크업에 hex 가 없다", () => {
    const { container } = render(
      <LikeToggleWithLabel label="좋아요" count={1} defaultChecked />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  describe("label(옵션)", () => {
    it("label 을 생략하면 라벨 텍스트를 렌더하지 않는다", () => {
      const { queryByText, getByRole } = render(
        <LikeToggleWithLabel aria-label="좋아요" count={3} />,
      );
      expect(queryByText("좋아요")).toBeNull();
      expect(getByRole("button", { name: "좋아요" })).toBeInTheDocument();
    });

    it("label 을 생략해도 count 는 독립적으로 렌더된다(아이콘+숫자 조합)", () => {
      const { getByText, queryByText } = render(
        <LikeToggleWithLabel aria-label="좋아요" count={3} />,
      );
      expect(getByText("3")).toBeInTheDocument();
      expect(queryByText("좋아요")).toBeNull();
    });

    it("label='' (빈 문자열) 도 생략과 동일하게 렌더하지 않는다", () => {
      const { container } = render(
        <LikeToggleWithLabel aria-label="좋아요" label="" count={1} />,
      );
      expect(container.querySelectorAll("span")).toHaveLength(1);
    });

    it("label 을 지정하면 기존처럼 렌더된다(회귀 없음)", () => {
      const { getByText } = render(<LikeToggleWithLabel label="좋아요" />);
      expect(getByText("좋아요")).toBeInTheDocument();
    });
  });

  describe("color", () => {
    it("기본값은 'neutralNormal' 이고 data-color 로 노출되며 기존 unchecked 색상과 동일하다(회귀 없음)", () => {
      const { getByRole, getByText } = render(
        <LikeToggleWithLabel label="좋아요" count={0} />,
      );
      const btn = getByRole("button");
      expect(btn).toHaveAttribute("data-color", "neutralNormal");
      expect(getByText("좋아요")).toHaveClass("text-typo-neutral-normal");
      expect(getByText("0")).toHaveClass("text-typo-neutral-normal");
      expect(btn.querySelector("svg")).toHaveClass("text-icon-neutral-normal");
    });

    it("color='neutralLight' 는 unchecked 상태의 라벨/count/아이콘 라인 색을 바꾼다", () => {
      const { getByRole, getByText } = render(
        <LikeToggleWithLabel label="좋아요" count={0} color="neutralLight" />,
      );
      const btn = getByRole("button");
      expect(btn).toHaveAttribute("data-color", "neutralLight");
      expect(getByText("좋아요")).toHaveClass("text-typo-neutral-bright");
      expect(getByText("0")).toHaveClass("text-typo-neutral-light");
      expect(btn.querySelector("svg")).toHaveClass("text-icon-neutral-light");
    });

    it("color='neutralLight' 는 appearance='transparent' 에서도 동일하게 오버라이드한다(appearance 무관 고정)", () => {
      const { getByRole, getByText } = render(
        <LikeToggleWithLabel
          label="좋아요"
          appearance="transparent"
          color="neutralLight"
        />,
      );
      const btn = getByRole("button");
      expect(getByText("좋아요")).toHaveClass("text-typo-neutral-bright");
      expect(btn.querySelector("svg")).toHaveClass("text-icon-neutral-light");
    });

    it("checked=true 면 color 값과 무관하게 기존 checked 색상을 그대로 쓴다", () => {
      const { getByRole, getByText } = render(
        <LikeToggleWithLabel
          label="좋아요"
          count={1}
          color="neutralLight"
          defaultChecked
        />,
      );
      const btn = getByRole("button");
      expect(getByText("좋아요")).toHaveClass("text-typo-like-dark");
      expect(getByText("1")).toHaveClass("text-typo-like-dark");
      expect(btn).toHaveClass("bg-bg-like-bright", "border-border-like-normal");
    });
  });
});
