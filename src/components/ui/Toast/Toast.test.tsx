import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Toast } from "./Toast";

/** 배너 텍스트 노드. */
const textOf = (container: HTMLElement) =>
  container.querySelector(".line-clamp-2") as HTMLElement;

describe("Toast", () => {
  it("기본값(normal)으로 렌더하고 data-status 속성을 부여한다", () => {
    const { container } = render(<Toast>완료되었어요</Toast>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-status", "normal");
    expect(root).toHaveTextContent("완료되었어요");
  });

  it("항상 부모(뷰포트) 전체 폭을 채운다(w-full)", () => {
    const { container } = render(<Toast>완료되었어요</Toast>);
    expect(container.firstElementChild).toHaveClass("w-full");
  });

  it("normal 은 아이콘 없이 텍스트를 중앙 정렬한다", () => {
    const { container, queryByRole } = render(
      <Toast status="normal">완료되었어요</Toast>,
    );
    expect(queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(0);
    expect(textOf(container)).toHaveClass("text-center");
  });

  it("danger/warning/info 는 고정 아이콘 + 좌측 정렬이다", () => {
    const { container, rerender } = render(<Toast status="danger">오류</Toast>);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(textOf(container)).toHaveClass("text-left");
    expect(container.querySelector("svg")).toHaveClass(
      "text-icon-danger-normal",
    );

    rerender(<Toast status="warning">주의</Toast>);
    expect(container.querySelector("svg")).toHaveClass(
      "text-icon-warning-subtle",
    );

    rerender(<Toast status="info">안내</Toast>);
    expect(container.querySelector("svg")).toHaveClass("text-icon-info-normal");
  });

  it("status='icon' 이면 넘긴 아이콘을 그대로 렌더한다(자유 슬롯)", () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <Toast status="icon" icon={<span data-testid="ic">i</span>}>
        본문
      </Toast>,
    );
    expect(getByTestId("ic")).toBeInTheDocument();

    rerender(<Toast status="icon">아이콘 없음</Toast>);
    expect(queryByTestId("ic")).not.toBeInTheDocument();
  });

  it("모든 variant 배경·텍스트 색·타이포는 공통 토큰 유틸을 쓴다", () => {
    const { container } = render(<Toast status="danger">오류</Toast>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("bg-bg-overlay-blackDark");
    expect(textOf(container)).toHaveClass(
      "text-typo-inverse-normal",
      "text-body-4-bold",
    );
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(<Toast className="fixed">본문</Toast>);
    expect(container.firstElementChild).toHaveClass("fixed", "w-full", "flex");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(<Toast status="danger">본문</Toast>);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("rest props(id 등)를 루트로 전달한다", () => {
    const { container } = render(
      <Toast id="toast-1" role="status">
        본문
      </Toast>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "toast-1");
    expect(root).toHaveAttribute("role", "status");
  });
});
