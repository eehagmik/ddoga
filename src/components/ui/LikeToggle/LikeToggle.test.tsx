import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LikeToggle } from "./LikeToggle";

describe("LikeToggle", () => {
  it("기본값(heart/neutralNormal/unchecked)으로 <button type=button> 을 렌더하고 data-* 를 부여한다", () => {
    const { getByRole } = render(<LikeToggle />);
    const btn = getByRole("button", { name: "좋아요" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-variant", "heart");
    expect(btn).toHaveAttribute("data-color", "neutralNormal");
    expect(btn).toHaveAttribute("data-checked", "false");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).not.toBeDisabled();
  });

  it("variant='bookmark' 는 기본 접근성 라벨이 '북마크' 다", () => {
    const { getByRole } = render(<LikeToggle variant="bookmark" />);
    expect(getByRole("button", { name: "북마크" })).toBeInTheDocument();
  });

  it("aria-label 을 명시하면 기본 라벨을 덮어쓴다", () => {
    const { getByRole } = render(<LikeToggle aria-label="찜하기" />);
    expect(getByRole("button", { name: "찜하기" })).toBeInTheDocument();
  });

  it("클릭하면 checked 가 토글되고 onCheckedChange 가 호출된다(uncontrolled)", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <LikeToggle onCheckedChange={onCheckedChange} />,
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

  it("defaultChecked=true 면 처음부터 checked 상태다", () => {
    const { getByRole } = render(<LikeToggle defaultChecked />);
    expect(getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("controlled(checked) 는 내부 상태로 바뀌지 않고 콜백만 호출한다", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <LikeToggle checked={false} onCheckedChange={onCheckedChange} />,
    );
    const btn = getByRole("button");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("checked=true + variant='heart' 는 그라데이션 SVG 글리프를 렌더한다", () => {
    const { container } = render(<LikeToggle checked variant="heart" />);
    const svg = container.querySelector("svg");
    const path = container.querySelector("path");
    const stops = container.querySelectorAll("stop");
    expect(svg).not.toBeNull();
    expect(path).toHaveAttribute("fill", expect.stringMatching(/^url\(#/));
    expect(stops).toHaveLength(2);
    expect(stops[0]).toHaveAttribute(
      "stop-color",
      "var(--color-icon-like-gradientStart)",
    );
    expect(stops[1]).toHaveAttribute(
      "stop-color",
      "var(--color-icon-like-gradientEnd)",
    );
  });

  it("checked=true + variant='bookmark' 는 icon-info-normal 단색 아이콘을 렌더한다", () => {
    const { container } = render(<LikeToggle checked variant="bookmark" />);
    expect(container.querySelector("svg")).toHaveClass("text-icon-info-normal");
    expect(container.querySelectorAll("stop")).toHaveLength(0);
  });

  it("unchecked 는 color prop 에 따라 라인 아이콘 색이 바뀐다", () => {
    const colors = {
      neutralNormal: "text-icon-neutral-normal",
      neutralLight: "text-icon-neutral-light",
      inverse: "text-icon-inverse-normal",
    } as const;
    for (const [color, cls] of Object.entries(colors)) {
      const { container } = render(
        <LikeToggle color={color as keyof typeof colors} />,
      );
      expect(container.querySelector("svg")).toHaveClass(cls);
    }
  });

  it("className 을 루트에 병합한다", () => {
    const { getByRole } = render(<LikeToggle className="absolute top-0" />);
    expect(getByRole("button")).toHaveClass(
      "absolute",
      "top-0",
      "size-[var(--sz-24)]",
    );
  });

  it("색은 토큰 유틸/var(--*) 로만 지정하고 마크업에 hex 가 없다", () => {
    const { container } = render(<LikeToggle checked variant="heart" />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  it("최초 마운트 시 checked=true 라도 바운스 클래스가 붙지 않는다", () => {
    const { container } = render(<LikeToggle defaultChecked />);
    expect(container.querySelector("svg")).not.toHaveClass(
      "animate-like-bounce",
    );
  });

  it("off→on 전환 시에만 바운스 클래스가 붙고, 애니메이션이 끝나면 스스로 제거된다", async () => {
    const user = userEvent.setup();
    const { getByRole, container } = render(<LikeToggle />);
    const btn = getByRole("button");

    await user.click(btn);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("animate-like-bounce");

    act(() => {
      svg?.dispatchEvent(new Event("animationend", { bubbles: true }));
    });
    await waitFor(() =>
      expect(container.querySelector("svg")).not.toHaveClass(
        "animate-like-bounce",
      ),
    );
  });

  it("on→off 로 끌 때는 바운스 클래스가 붙지 않는다", async () => {
    const user = userEvent.setup();
    const { getByRole, container } = render(<LikeToggle defaultChecked />);
    const btn = getByRole("button");

    await user.click(btn);
    expect(container.querySelector("svg")).not.toHaveClass(
      "animate-like-bounce",
    );
  });
});
