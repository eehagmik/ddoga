import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LineTextarea } from "./LineTextarea";

describe("LineTextarea", () => {
  describe("기본 렌더", () => {
    it("<textarea> 를 렌더하고 placeholder 를 표시한다", () => {
      render(<LineTextarea placeholder="메모를 입력하세요" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea.tagName).toBe("TEXTAREA");
      expect(textarea).toHaveAttribute("placeholder", "메모를 입력하세요");
    });

    it("label 을 렌더하고 htmlFor 로 textarea 와 연결한다", () => {
      render(<LineTextarea label="메모" />);
      const textarea = screen.getByLabelText("메모");
      expect(textarea).toBeInTheDocument();
    });

    it("label 이 없으면 라벨 행 자체를 렌더하지 않는다", () => {
      render(<LineTextarea placeholder="라벨 없음" />);
      expect(screen.queryByText("Label")).not.toBeInTheDocument();
    });

    it("required 이면 라벨 옆에 * 를 렌더한다", () => {
      const { container } = render(<LineTextarea label="메모" required />);
      expect(container.textContent).toContain("*");
    });

    it("required 가 아니면 * 를 렌더하지 않는다", () => {
      const { container } = render(<LineTextarea label="메모" />);
      expect(container.textContent).not.toContain("*");
    });

    it("onInfoClick 이 있으면 정보 버튼을 렌더하고 클릭 시 호출한다", async () => {
      const user = userEvent.setup();
      const onInfoClick = vi.fn();
      render(<LineTextarea label="메모" onInfoClick={onInfoClick} />);

      const infoBtn = screen.getByRole("button", { name: "정보 보기" });
      await user.click(infoBtn);
      expect(onInfoClick).toHaveBeenCalledTimes(1);
    });

    it("onInfoClick 이 없으면 정보 버튼을 렌더하지 않는다", () => {
      render(<LineTextarea label="메모" />);
      expect(
        screen.queryByRole("button", { name: "정보 보기" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("입력 동작", () => {
    it("value 변경 시 onChange 를 문자열로 호출한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<LineTextarea value="" onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "돈까스");
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith("스");
    });

    it("rows prop 을 Textarea 에 그대로 전달한다", () => {
      render(<LineTextarea rows={2} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "2");
    });

    it("scrollable=false 면 overflow-hidden 을 적용한다", () => {
      render(<LineTextarea scrollable={false} />);
      expect(screen.getByRole("textbox")).toHaveClass("overflow-hidden");
    });
  });

  describe("헬퍼텍스트 · 글자수 카운터", () => {
    it("helperText 가 없으면 헬퍼 행을 렌더하지 않는다", () => {
      render(<LineTextarea label="메모" />);
      expect(screen.queryByText(/Helper/)).not.toBeInTheDocument();
    });

    it("helperText 가 있으면 렌더한다", () => {
      render(<LineTextarea helperText="도움말" />);
      expect(screen.getByText("도움말")).toBeInTheDocument();
    });

    it("maxLength 가 없으면 글자수 카운터를 렌더하지 않는다", () => {
      render(<LineTextarea value="값" onChange={vi.fn()} />);
      expect(screen.queryByText(/\/.*자/)).not.toBeInTheDocument();
    });

    it("maxLength 가 있으면 현재값/최대값 형식으로 카운터를 렌더한다", () => {
      render(<LineTextarea value="값" onChange={vi.fn()} maxLength={500} />);
      expect(screen.getByText("1/500자")).toBeInTheDocument();
    });

    it("value 가 없으면 카운터가 0 부터 시작한다", () => {
      render(<LineTextarea maxLength={500} />);
      expect(screen.getByText("0/500자")).toBeInTheDocument();
    });

    it("danger 이면 helperText 를 경고 색으로 렌더하고 aria-invalid 를 설정한다", () => {
      render(<LineTextarea helperText="필수 항목입니다" danger />);
      expect(screen.getByText("필수 항목입니다")).toHaveClass(
        "text-typo-danger-normal",
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("danger 가 아니면 helperText 를 기본 색으로 렌더한다", () => {
      render(<LineTextarea helperText="도움말" />);
      expect(screen.getByText("도움말")).toHaveClass(
        "text-typo-neutral-subtle",
      );
    });
  });

  describe("state", () => {
    it("disabled 이면 textarea 가 비활성화된다", () => {
      render(<LineTextarea value="돈까스" onChange={vi.fn()} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<LineTextarea className="mt-4" />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸로만 지정하고 인라인 style/hex 가 없다", () => {
    const { container } = render(
      <LineTextarea
        label="메모"
        required
        helperText="도움말"
        danger
        value="값"
        onChange={vi.fn()}
        maxLength={500}
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
