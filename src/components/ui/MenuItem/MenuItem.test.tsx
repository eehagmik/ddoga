import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MenuItem } from "./MenuItem";

describe("MenuItem", () => {
  it('기본값(variant="text"/size="md")은 <button> 루트로 렌더하고 data-* 속성을 부여한다', () => {
    const { container } = render(<MenuItem />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("BUTTON");
    expect(root).toHaveAttribute("type", "button");
    expect(root).toHaveAttribute("data-variant", "text");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveClass("h-(--sz-46)", "px-(--sz-16)");
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("label prop 으로 라벨 텍스트를 바꿀 수 있다", () => {
    render(<MenuItem label="공지사항" />);
    expect(screen.getByText("공지사항")).toBeInTheDocument();
  });

  it("size 별 높이·padding·타이포 유틸 클래스를 적용한다", () => {
    const { container, rerender } = render(<MenuItem size="xs" />);
    let root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("h-(--sz-44)", "px-(--sz-12)");
    expect(screen.getByText("Label")).toHaveClass("text-body-4");

    rerender(<MenuItem size="lg" />);
    root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("h-(--sz-50)", "px-(--sz-16)");
    expect(screen.getByText("Label")).toHaveClass("text-body-3");
  });

  it('variant="icon"/"graphic" 은 children 을 우측 슬롯에 렌더한다', () => {
    const { rerender } = render(
      <MenuItem variant="icon">
        <span data-testid="slot">아이콘</span>
      </MenuItem>,
    );
    expect(screen.getByTestId("slot")).toBeInTheDocument();

    rerender(
      <MenuItem variant="graphic">
        <span data-testid="slot">그래픽</span>
      </MenuItem>,
    );
    expect(screen.getByTestId("slot")).toBeInTheDocument();
  });

  it('variant="text" 는 children 슬롯을 렌더하지 않는다', () => {
    render(
      <MenuItem variant="text">
        <span data-testid="slot">무시됨</span>
      </MenuItem>,
    );
    expect(screen.queryByTestId("slot")).not.toBeInTheDocument();
  });

  it('variant="chip" 은 루트가 여전히 <button>(Chip 은 deletable 미사용이라 내부에 <button> 이 없음)이고 chipLabel 을 렌더한다', () => {
    const { container } = render(<MenuItem variant="chip" chipLabel="확인" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("BUTTON");
    expect(root).toHaveAttribute("data-variant", "chip");

    expect(screen.getByText("확인")).toBeInTheDocument();
    // Chip 은 deletable 을 쓰지 않으므로 <button> 이 루트 하나뿐이어야 한다(버튼-in-버튼 없음).
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("disabled 는 라벨 텍스트 색상만 바꾸고 루트 <button> 에 네이티브 disabled 를 부여한다", () => {
    render(<MenuItem disabled />);
    const button = screen.getByRole("button", { name: "Label" });
    expect(button).toBeDisabled();
    expect(screen.getByText("Label")).toHaveClass("text-typo-disabled-normal");
  });

  it('disabled + variant="chip" 은 중첩 Chip 의 라벨 색·모양에 아무 영향을 주지 않는다(Figma 실측상 enable 과 동일)', () => {
    render(<MenuItem variant="chip" disabled chipLabel="확인" />);
    expect(screen.getByText("Label")).toHaveClass("text-typo-disabled-normal");
    const chipLabel = screen.getByText("확인");
    expect(chipLabel).not.toHaveClass("text-typo-disabled-normal");
  });

  it("클릭 시 onClick 이 호출된다", async () => {
    const onClick = vi.fn();
    render(<MenuItem onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Label" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("hover/focus-visible 배경 유틸 클래스를 루트에 직접 부여한다(group- 접두사 없음)", () => {
    const { container } = render(<MenuItem />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("hover:bg-bg-neutral-deep");
    expect(root).toHaveClass("focus-visible:bg-bg-neutral-deep");
  });
});
