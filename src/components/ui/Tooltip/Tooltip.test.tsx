import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tooltip } from "./Tooltip";

/** 본체(말풍선) = `rounded-xl` 을 가진 노드. placement 와 무관하게 잡힌다. */
const bubbleOf = (container: HTMLElement) =>
  container.querySelector(".rounded-xl") as HTMLElement;

/** 본문 텍스트 노드. */
const textOf = (container: HTMLElement) =>
  container.querySelector(".whitespace-pre-line") as HTMLElement;

/** 꼬리 삼각형 svg (aria-hidden 래퍼 안). 닫기 아이콘 svg 와 구분한다. */
const beakSvgClass = (container: HTMLElement) =>
  container.querySelector('[aria-hidden="true"] svg')?.getAttribute("class") ??
  "";

describe("Tooltip", () => {
  it("기본값(dark/top)으로 렌더하고 data-* 속성을 부여한다", () => {
    const { container } = render(<Tooltip>도움말</Tooltip>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-tone", "dark");
    expect(root).toHaveAttribute("data-placement", "top");
    expect(root).toHaveClass("inline-flex", "w-fit", "flex-col");
    expect(root).toHaveTextContent("도움말");
  });

  it("tone 별 본체 배경·본문 색 유틸 클래스를 적용한다", () => {
    const { container, rerender } = render(<Tooltip tone="dark">t</Tooltip>);
    expect(bubbleOf(container)).toHaveClass(
      "bg-bg-inverse-normal",
      "text-typo-inverse-normal",
    );

    rerender(<Tooltip tone="light">t</Tooltip>);
    expect(bubbleOf(container)).toHaveClass(
      "bg-bg-neutral-normal",
      "text-typo-neutral-normal",
    );
  });

  it("placement 의 side 로 루트 방향을, align 으로 꼬리 정렬 클래스를 정한다", () => {
    const { container, rerender } = render(
      <Tooltip placement="top-start">t</Tooltip>,
    );
    expect(container.firstElementChild).toHaveClass("flex-col");
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      "justify-start",
    );

    rerender(<Tooltip placement="right-end">t</Tooltip>);
    expect(container.firstElementChild).toHaveClass("flex-row");
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      "flex-col",
      "justify-end",
    );
  });

  it("placement 이 bottom/right 이면 꼬리를 본체 앞에 렌더한다", () => {
    const { container, rerender } = render(
      <Tooltip placement="top">본문</Tooltip>,
    );
    let root = container.firstElementChild as HTMLElement;
    expect(root.children[0].getAttribute("aria-hidden")).toBeNull(); // 본체 먼저

    rerender(<Tooltip placement="bottom">본문</Tooltip>);
    root = container.firstElementChild as HTMLElement;
    expect(root.children[0].getAttribute("aria-hidden")).toBe("true"); // 꼬리 먼저
  });

  it("side 별로 방향에 맞는 꼬리 SVG(viewBox)와 축 반전 클래스를 준다", () => {
    const beakSvg = (c: HTMLElement) =>
      c.querySelector('[aria-hidden="true"] svg') as SVGSVGElement;

    const { container, rerender } = render(
      <Tooltip placement="top">t</Tooltip>,
    );
    // top: 세로형 16×8, 반전 없음
    expect(beakSvg(container)).toHaveAttribute("viewBox", "0 0 16 8");
    expect(beakSvgClass(container)).not.toMatch(/-scale/);

    rerender(<Tooltip placement="bottom">t</Tooltip>);
    expect(beakSvg(container)).toHaveAttribute("viewBox", "0 0 16 8");
    expect(beakSvgClass(container)).toContain("-scale-y-100");

    rerender(<Tooltip placement="left">t</Tooltip>);
    // left/right: 가로형 8×16
    expect(beakSvg(container)).toHaveAttribute("viewBox", "0 0 8 16");
    expect(beakSvgClass(container)).not.toMatch(/-scale/); // 오른쪽 방향 path, 반전 없음

    rerender(<Tooltip placement="right">t</Tooltip>);
    expect(beakSvg(container)).toHaveAttribute("viewBox", "0 0 8 16");
    expect(beakSvgClass(container)).toContain("-scale-x-100");
  });

  it("icon 을 넘기면 본문 앞 슬롯에 렌더하고, 없으면 슬롯이 없다", () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <Tooltip icon={<span data-testid="ic">i</span>}>본문</Tooltip>,
    );
    const slot = getByTestId("ic").parentElement as HTMLElement;
    expect(slot).toHaveClass(
      "size-[var(--sz-16)]",
      "pt-[var(--sz-2)]",
      "text-icon-inverse-subtle",
    );

    rerender(<Tooltip>본문</Tooltip>);
    expect(queryByTestId("ic")).not.toBeInTheDocument();
  });

  it("closable=false 면 닫기 버튼이 없다", () => {
    const { queryByRole } = render(<Tooltip>본문</Tooltip>);
    expect(queryByRole("button")).not.toBeInTheDocument();
  });

  it("closable=true 면 닫기 버튼을 렌더하고 클릭 시 onClose 를 호출한다", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Tooltip closable onClose={onClose}>
        본문
      </Tooltip>,
    );
    const btn = getByRole("button", { name: "닫기" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveClass(
      "cursor-pointer",
      "focus-visible:opacity-[var(--alpha-60)]",
    );
    await user.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeLabel 을 넘기면 닫기 버튼 aria-label 로 반영한다", () => {
    const { getByRole } = render(
      <Tooltip closable closeLabel="툴팁 닫기">
        본문
      </Tooltip>,
    );
    expect(getByRole("button", { name: "툴팁 닫기" })).toBeInTheDocument();
  });

  it("tone='light' 면 닫기 아이콘·꼬리 색 유틸이 light 계열이다", () => {
    const { container, getByRole } = render(
      <Tooltip tone="light" closable>
        본문
      </Tooltip>,
    );
    expect(getByRole("button", { name: "닫기" })).toHaveClass(
      "text-icon-neutral-normal",
    );
    expect(beakSvgClass(container)).toContain("fill-bg-neutral-normal");
  });

  it("center 정렬 top/bottom 은 본문에 text-center 를 준다(좌우 center 는 제외)", () => {
    const { container, rerender } = render(
      <Tooltip placement="top">본문</Tooltip>,
    );
    expect(textOf(container)).toHaveClass("text-center");

    rerender(<Tooltip placement="top-start">본문</Tooltip>);
    expect(textOf(container)).not.toHaveClass("text-center");

    rerender(<Tooltip placement="right">본문</Tooltip>);
    expect(textOf(container)).not.toHaveClass("text-center");
  });

  it("maxWidth 를 넘기면 본체 인라인 style 로 적용한다(number 는 px)", () => {
    const { container, rerender } = render(
      <Tooltip maxWidth={200}>본문</Tooltip>,
    );
    expect(bubbleOf(container)).toHaveStyle({ maxWidth: "200px" });
    expect(bubbleOf(container)).toHaveClass("max-w-[calc(100vw-var(--sz-32))]");

    rerender(<Tooltip maxWidth="30ch">본문</Tooltip>);
    expect(bubbleOf(container)).toHaveStyle({ maxWidth: "30ch" });

    rerender(<Tooltip>본문</Tooltip>);
    expect(bubbleOf(container).style.maxWidth).toBe("");
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(<Tooltip className="absolute">본문</Tooltip>);
    expect(container.firstElementChild).toHaveClass(
      "absolute",
      "inline-flex",
      "w-fit",
    );
  });

  it("본문 개행은 whitespace-pre-line 으로 보존한다", () => {
    const { container } = render(<Tooltip>{"a\nb"}</Tooltip>);
    expect(textOf(container)).toHaveClass("whitespace-pre-line", "text-body-5");
    expect(textOf(container).textContent).toBe("a\nb");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Tooltip tone="light" closable icon={<span>i</span>}>
        본문
      </Tooltip>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("rest props(id 등)를 루트로 전달한다", () => {
    const { container } = render(
      <Tooltip id="tt-1" role="tooltip">
        본문
      </Tooltip>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "tt-1");
    expect(root).toHaveAttribute("role", "tooltip");
  });
});
