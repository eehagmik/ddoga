import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TextField } from "./TextField";

describe("TextField", () => {
  describe("기본 렌더(variant=line 기본값)", () => {
    it("<input> 을 렌더하고 placeholder 를 표시한다", () => {
      render(<TextField placeholder="검색어를 입력하세요" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", "검색어를 입력하세요");
    });

    it("label 을 렌더하고 htmlFor 로 input 과 연결한다", () => {
      render(<TextField label="이름" />);
      const input = screen.getByLabelText("이름");
      expect(input).toBeInTheDocument();
    });

    it("required 이면 라벨 옆에 * 를 렌더한다", () => {
      const { container } = render(<TextField label="이름" required />);
      expect(container.textContent).toContain("*");
    });

    it("onInfoClick 이 있으면 정보 버튼을 렌더하고 클릭 시 호출한다", async () => {
      const user = userEvent.setup();
      const onInfoClick = vi.fn();
      render(<TextField label="이름" onInfoClick={onInfoClick} />);

      const infoBtn = screen.getByRole("button", { name: "자세히 보기" });
      await user.click(infoBtn);
      expect(onInfoClick).toHaveBeenCalledTimes(1);
    });

    it("onInfoClick 이 없으면 정보 버튼을 렌더하지 않는다", () => {
      render(<TextField label="이름" />);
      expect(
        screen.queryByRole("button", { name: "자세히 보기" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("입력 동작", () => {
    it("value 변경 시 onChange 를 문자열로 호출한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TextField value="" onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "돈까스");
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith("스");
    });

    it("value 가 없으면 지우기 버튼을 렌더하지 않는다", () => {
      render(<TextField value="" onChange={vi.fn()} />);
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("value 가 있으면 지우기 버튼을 렌더하고 클릭 시 onChange('') 와 onClear 를 모두 호출한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClear = vi.fn();
      render(
        <TextField value="돈까스" onChange={onChange} onClear={onClear} />,
      );

      await user.click(screen.getByRole("button", { name: "지우기" }));
      expect(onChange).toHaveBeenCalledWith("");
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("onClear 가 없어도 지우기 버튼 클릭 시 onChange('') 는 항상 호출된다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TextField value="돈까스" onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "지우기" }));
      expect(onChange).toHaveBeenCalledWith("");
    });
  });

  describe("state", () => {
    it("disabled 이면 input 이 비활성화되고 지우기 버튼을 렌더하지 않는다", () => {
      render(<TextField value="돈까스" onChange={vi.fn()} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("readOnly 이면 input 이 readOnly 이고 지우기 버튼을 렌더하지 않는다", () => {
      render(<TextField value="돈까스" onChange={vi.fn()} readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("line 은 readOnly 에서 placeholder 가 disabled 톤으로 흐려지지만 box 는 불변이다(Figma 실측 비대칭)", () => {
      const { rerender } = render(
        <TextField variant="line" placeholder="값 없음" readOnly />,
      );
      expect(screen.getByRole("textbox")).toHaveClass(
        "text-typo-disabled-subtle",
      );

      rerender(<TextField variant="box" placeholder="값 없음" readOnly />);
      expect(screen.getByRole("textbox")).toHaveClass("text-typo-hint-subtle");
    });

    it("danger 이면 helperText 를 경고 색으로 렌더하고 aria-invalid 를 설정한다", () => {
      render(<TextField helperText="필수 항목입니다" danger />);
      expect(screen.getByText("필수 항목입니다")).toHaveClass(
        "text-typo-danger-normal",
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("danger 가 아니면 helperText 를 기본 색으로 렌더한다", () => {
      render(<TextField helperText="도움말" />);
      expect(screen.getByText("도움말")).toHaveClass(
        "text-typo-neutral-subtle",
      );
    });
  });

  describe("Input 조합 리팩토링 이후 known 오차 수정 확인(2026-09-17)", () => {
    it("disabled + 값 있음이면 텍스트색이 typo-disabled-normal 이다(placeholder 의 subtle 보다 진함)", () => {
      render(<TextField value="돈까스" onChange={vi.fn()} disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("text-typo-disabled-normal");
      expect(input).not.toHaveClass("text-typo-disabled-subtle");
    });

    it("box + enable + 값 있음이면 focus 없이도 테두리가 브랜드색으로 전환된다(hasValue 만으로 전환)", () => {
      const { container } = render(
        <TextField variant="box" value="서울시 강남구" onChange={vi.fn()} />,
      );
      expect(
        container.querySelector('[class*="border-border-brand-normal"]'),
      ).toBeInTheDocument();
    });

    it("box + readOnly + 값 있음이면 focus 없이도 테두리가 브랜드색으로 전환된다", () => {
      const { container } = render(
        <TextField
          variant="box"
          value="서울시 강남구"
          onChange={vi.fn()}
          readOnly
        />,
      );
      expect(
        container.querySelector('[class*="border-border-brand-normal"]'),
      ).toBeInTheDocument();
    });
  });

  describe("variant", () => {
    it("transparentBody/transparentTitle 은 label 을 전달해도 렌더하지 않는다", () => {
      render(<TextField variant="transparentBody" label="숨겨질 라벨" />);
      expect(screen.queryByText("숨겨질 라벨")).not.toBeInTheDocument();
    });

    it("transparentTitle 은 큰 볼드 타이포(text-title-1) 를 적용한다", () => {
      render(<TextField variant="transparentTitle" placeholder="제목" />);
      expect(screen.getByRole("textbox")).toHaveClass("text-title-1");
    });

    it("box 는 border-xs 를 적용하고 line 은 적용하지 않는다", () => {
      const { container, rerender } = render(<TextField variant="box" />);
      const fieldRow = container.querySelector('[class*="border-xs"]');
      expect(fieldRow).toBeInTheDocument();

      rerender(<TextField variant="line" />);
      expect(container.querySelector('[class*="border-xs"]')).toBeNull();
    });
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<TextField className="mt-4" />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸로만 지정하고 인라인 style/hex 가 없다", () => {
    const { container } = render(
      <TextField
        label="이름"
        required
        helperText="도움말"
        danger
        value="값"
        onChange={vi.fn()}
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
