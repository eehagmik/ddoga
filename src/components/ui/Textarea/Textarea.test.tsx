import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  describe("기본 렌더", () => {
    it("<textarea> 를 렌더하고 placeholder 를 표시한다", () => {
      render(<Textarea placeholder="메모를 입력하세요" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea.tagName).toBe("TEXTAREA");
      expect(textarea).toHaveAttribute("placeholder", "메모를 입력하세요");
    });

    it("기본 rows 는 4다", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "4");
    });

    it("rows prop 으로 행 수를 오버라이드할 수 있다", () => {
      render(<Textarea rows={8} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
    });
  });

  describe("입력 동작", () => {
    it("value 변경 시 onChange 를 문자열로 호출한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Textarea value="" onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "돈까스");
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith("스");
    });

    it("value 없이도 제어되지 않은 입력을 그대로 렌더한다(빈 문자열 기본값)", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toHaveValue("");
    });
  });

  describe("state", () => {
    it("값이 없으면 hint-subtle 색을 쓴다", () => {
      render(<Textarea placeholder="값 없음" />);
      expect(screen.getByRole("textbox")).toHaveClass("text-typo-hint-subtle");
    });

    it("값이 있으면 neutral-normal 색을 쓴다", () => {
      render(<Textarea value="값 있음" onChange={vi.fn()} />);
      expect(screen.getByRole("textbox")).toHaveClass(
        "text-typo-neutral-normal",
      );
    });

    it("disabled 이면 textarea 가 비활성화되고 disabled-subtle 색을 쓴다(값 없음)", () => {
      render(<Textarea disabled placeholder="값 없음" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass("text-typo-disabled-subtle");
    });

    it("disabled 이고 값이 있으면 placeholder 보다 진한 disabled-normal 색을 쓴다", () => {
      render(<Textarea disabled value="돈까스" onChange={vi.fn()} />);
      expect(screen.getByRole("textbox")).toHaveClass(
        "text-typo-disabled-normal",
      );
    });
  });

  describe("scrollable", () => {
    it("기본값(true) 이면 overflow-y-auto 와 스크롤바 토큰 클래스를 적용한다", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("overflow-y-auto");
      expect(textarea).toHaveClass("[scrollbar-width:thin]");
    });

    it("false 면 overflow-hidden 을 적용하고 스크롤바 토큰 클래스는 없다", () => {
      render(<Textarea scrollable={false} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("overflow-hidden");
      expect(textarea).not.toHaveClass("overflow-y-auto");
    });
  });

  it("className 을 루트에 병합한다", () => {
    render(<Textarea className="mt-4" />);
    expect(screen.getByRole("textbox")).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸로만 지정하고 인라인 style/hex 가 없다", () => {
    const { container } = render(<Textarea value="값" onChange={vi.fn()} />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
