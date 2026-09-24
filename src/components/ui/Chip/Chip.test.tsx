import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chip } from "./Chip";

describe("Chip", () => {
  it("기본값(neutral/fill/xs)으로 렌더하고 data-* 속성을 부여한다", () => {
    const { container } = render(<Chip>라벨</Chip>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveAttribute("data-color", "neutral");
    expect(root).toHaveAttribute("data-variant", "fill");
    expect(root).toHaveAttribute("data-size", "xs");
    expect(root).toHaveAttribute("data-bold", "false");
    expect(root).toHaveAttribute("data-deletable", "false");
    expect(root).toHaveTextContent("라벨");
  });

  it("variant/color 별 배경·라벨 색 유틸 클래스를 적용한다", () => {
    const { container, rerender } = render(
      <Chip color="brand" variant="fill">
        라벨
      </Chip>,
    );
    expect(container.firstElementChild).toHaveClass(
      "bg-bg-brand-normal",
      "text-typo-inverse-normal",
    );

    rerender(
      <Chip color="danger" variant="bright">
        라벨
      </Chip>,
    );
    expect(container.firstElementChild).toHaveClass(
      "bg-bg-danger-bright",
      "text-typo-danger-deep",
    );

    rerender(
      <Chip color="warning" variant="outline">
        라벨
      </Chip>,
    );
    expect(container.firstElementChild).toHaveClass(
      "bg-bg-neutral-normal",
      "border-xs",
      "border-border-warning-normal",
      "text-typo-warning-deep",
    );
  });

  it("size 별 높이·padding·타이포 유틸 클래스를 적용한다", () => {
    const { container, rerender } = render(<Chip size="xs">라벨</Chip>);
    expect(container.firstElementChild).toHaveClass(
      "h-[var(--sz-26)]",
      "px-[var(--sz-8)]",
      "text-label-2",
    );

    rerender(<Chip size="sm">라벨</Chip>);
    expect(container.firstElementChild).toHaveClass(
      "h-[var(--sz-32)]",
      "px-[var(--sz-10)]",
      "text-label-1",
    );
  });

  it("bold=true 면 라벨 타이포를 -bold 유틸로 전환한다", () => {
    const { container } = render(
      <Chip size="xs" bold>
        라벨
      </Chip>,
    );
    expect(container.firstElementChild).toHaveClass("text-label-2-bold");
    expect(container.firstElementChild).not.toHaveClass("text-label-2");
    expect(container.firstElementChild).toHaveAttribute("data-bold", "true");
  });

  it("startSlot 을 넘기면 라벨 앞에 렌더하고, 없으면 슬롯을 렌더하지 않는다", () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <Chip startSlot={<span data-testid="slot">s</span>}>라벨</Chip>,
    );
    expect(getByTestId("slot")).toBeInTheDocument();

    rerender(<Chip>라벨</Chip>);
    expect(queryByTestId("slot")).not.toBeInTheDocument();
  });

  it('startType="graphic" 슬롯 래퍼에 각진 overflow-hidden 클립 클래스를 준다(radius 없음)', () => {
    const { getByTestId } = render(
      <Chip startType="graphic" startSlot={<span data-testid="g">g</span>}>
        라벨
      </Chip>,
    );
    const wrap = getByTestId("g").parentElement as HTMLElement;
    expect(wrap).toHaveClass("overflow-hidden");
    expect(wrap.className).not.toMatch(/rounded/);
  });

  it("deletable=false 면 삭제 버튼이 없다", () => {
    const { queryByRole } = render(<Chip>라벨</Chip>);
    expect(queryByRole("button")).not.toBeInTheDocument();
  });

  it("deletable=true 면 aria-label 삭제 버튼을 렌더하고 클릭 시 onDelete 를 호출한다", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Chip deletable onDelete={onDelete}>
        라벨
      </Chip>,
    );
    const btn = getByRole("button", { name: "삭제" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveClass("cursor-pointer");
    await user.click(btn);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("deleteLabel 을 넘기면 삭제 버튼 aria-label 로 반영한다", () => {
    const { getByRole } = render(
      <Chip deletable deleteLabel="태그 제거">
        라벨
      </Chip>,
    );
    expect(getByRole("button", { name: "태그 제거" })).toBeInTheDocument();
  });

  it("deletable=true 루트에만 hover/focus 배경 딥 클래스와 비대칭 padding 을 적용한다", () => {
    const { container, rerender } = render(
      <Chip color="brand" variant="fill" deletable>
        라벨
      </Chip>,
    );
    expect(container.firstElementChild).toHaveClass(
      "group-hover:bg-bg-brand-deep",
      "group-focus-within:bg-bg-brand-deep",
      "pl-[var(--sz-10)]",
      "pr-[var(--sz-6)]",
      "gap-[var(--sz-3)]",
    );

    rerender(
      <Chip color="brand" variant="fill">
        라벨
      </Chip>,
    );
    expect(container.firstElementChild?.className ?? "").not.toMatch(
      /group-(hover|focus-within):bg-/,
    );
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(<Chip className="w-full">라벨</Chip>);
    expect(container.firstElementChild).toHaveClass(
      "w-full",
      "group",
      "inline-flex",
      "rounded-circle",
    );
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Chip
        color="danger"
        variant="bright"
        deletable
        startSlot={<span>i</span>}
      >
        라벨
      </Chip>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("rest props(id 등)를 루트 span 으로 전달한다", () => {
    const { container } = render(
      <Chip id="tag-1" title="설명">
        라벨
      </Chip>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "tag-1");
    expect(root).toHaveAttribute("title", "설명");
  });
});
