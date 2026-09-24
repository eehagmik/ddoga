import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  describe("기본 렌더(variant=line 기본값)", () => {
    it("<input> 을 렌더하고 placeholder 를 표시한다", () => {
      render(<Input placeholder="검색어를 입력하세요" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", "검색어를 입력하세요");
    });

    it("startIcon/endIcon 슬롯을 렌더한다", () => {
      render(
        <Input
          startIcon={<span data-testid="start">S</span>}
          endIcon={<span data-testid="end">E</span>}
        />,
      );
      expect(screen.getByTestId("start")).toBeInTheDocument();
      expect(screen.getByTestId("end")).toBeInTheDocument();
    });

    it("startIcon/endIcon 이 없으면 슬롯을 렌더하지 않는다", () => {
      const { container } = render(<Input />);
      expect(container.querySelectorAll("span").length).toBe(0);
    });
  });

  describe("입력 동작", () => {
    it("value 변경 시 onChange 를 문자열로 호출한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Input value="" onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "돈까스");
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith("스");
    });

    it("value 가 없으면 지우기 버튼을 렌더하지 않는다", () => {
      render(<Input value="" onChange={vi.fn()} />);
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("value 가 있으면 지우기 버튼을 렌더하고 클릭 시 onChange('') 와 onClear 를 모두 호출한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClear = vi.fn();
      render(<Input value="돈까스" onChange={onChange} onClear={onClear} />);

      await user.click(screen.getByRole("button", { name: "지우기" }));
      expect(onChange).toHaveBeenCalledWith("");
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("onClear 가 없어도 지우기 버튼 클릭 시 onChange('') 는 항상 호출된다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Input value="돈까스" onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "지우기" }));
      expect(onChange).toHaveBeenCalledWith("");
    });
  });

  describe("state", () => {
    it("disabled 이면 input 이 비활성화되고 지우기 버튼을 렌더하지 않는다", () => {
      render(<Input value="돈까스" onChange={vi.fn()} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("readOnly 이면 input 이 readOnly 이고 지우기 버튼을 렌더하지 않는다", () => {
      render(<Input value="돈까스" onChange={vi.fn()} readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("line 은 readOnly 에서 placeholder 가 disabled 톤으로 흐려지지만 box 는 불변이다(Figma 실측 비대칭)", () => {
      const { rerender } = render(
        <Input variant="line" placeholder="값 없음" readOnly />,
      );
      expect(screen.getByRole("textbox")).toHaveClass(
        "text-typo-disabled-subtle",
      );

      rerender(<Input variant="box" placeholder="값 없음" readOnly />);
      expect(screen.getByRole("textbox")).toHaveClass("text-typo-hint-subtle");
    });

    it("disabled 이고 값이 있으면 placeholder 보다 진한 disabled-normal 색을 쓴다", () => {
      render(<Input value="돈까스" onChange={vi.fn()} disabled />);
      expect(screen.getByRole("textbox")).toHaveClass(
        "text-typo-disabled-normal",
      );
    });

    it("danger 이면 aria-invalid 를 설정한다", () => {
      render(<Input danger />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  describe("variant", () => {
    it("box 는 border-xs 를 적용하고 line 은 적용하지 않는다", () => {
      const { container, rerender } = render(<Input variant="box" />);
      const fieldRow = container.querySelector('[class*="border-xs"]');
      expect(fieldRow).toBeInTheDocument();

      rerender(<Input variant="line" />);
      expect(container.querySelector('[class*="border-xs"]')).toBeNull();
    });

    it("box 는 값이 있으면 hover/focus 없이도 테두리가 브랜드색이 된다(Figma 실측)", () => {
      render(<Input variant="box" value="서울시 강남구" onChange={vi.fn()} />);
      const fieldRow = document.querySelector(
        '[class*="border-border-brand-normal"]',
      );
      expect(fieldRow).toBeInTheDocument();
    });

    it("line 은 값이 없고 disabled 도 아니면 밑줄이 neutral 색이다", () => {
      const { container } = render(<Input variant="line" />);
      const underline = container.querySelector('[class*="rounded-circle"]');
      expect(underline).toHaveClass("bg-bg-neutral-deepDark");
    });
  });

  describe("transparentBody/transparentTitle(TextField 세트 141075 에서 흡수한 축)", () => {
    it("transparentBody 는 값 텍스트가 중앙정렬(text-center)된다", () => {
      render(<Input variant="transparentBody" value="12,000원" />);
      expect(screen.getByRole("textbox")).toHaveClass("text-center");
    });

    it("transparentTitle 은 text-center 가 없고 큰 볼드 타이포(text-title-1) 를 적용한다", () => {
      render(<Input variant="transparentTitle" placeholder="제목" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("text-title-1");
      expect(input).not.toHaveClass("text-center");
    });

    it("transparentTitle 값 색은 브랜드가 아닌 info(파랑) 다", () => {
      render(<Input variant="transparentTitle" value="제목" />);
      expect(screen.getByRole("textbox")).toHaveClass("text-typo-info-normal");
    });

    it("transparentBody/transparentTitle 은 startIcon/endIcon 을 넘겨도 렌더하지 않는다", () => {
      render(
        <Input
          variant="transparentBody"
          startIcon={<span data-testid="start">S</span>}
          endIcon={<span data-testid="end">E</span>}
        />,
      );
      expect(screen.queryByTestId("start")).not.toBeInTheDocument();
      expect(screen.queryByTestId("end")).not.toBeInTheDocument();
    });

    it("transparentBody/transparentTitle 은 값이 있어도 지우기 버튼을 렌더하지 않는다", () => {
      render(
        <Input variant="transparentBody" value="12,000원" onChange={vi.fn()} />,
      );
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("transparentBody/transparentTitle 은 line/box 의 border-xs/밑줄(rounded-circle) 을 렌더하지 않는다", () => {
      const { container, rerender } = render(
        <Input variant="transparentBody" />,
      );
      expect(container.querySelector('[class*="border-xs"]')).toBeNull();
      expect(container.querySelector('[class*="rounded-circle"]')).toBeNull();

      rerender(<Input variant="transparentTitle" />);
      expect(container.querySelector('[class*="border-xs"]')).toBeNull();
      expect(container.querySelector('[class*="rounded-circle"]')).toBeNull();
    });

    it("transparentTitle 은 disabled 면 텍스트 색이 흐려지고 추가 opacity 를 적용한다", () => {
      render(<Input variant="transparentTitle" value="제목" disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("text-typo-disabled-subtle");
      expect(input).toHaveClass("opacity-[var(--alpha-60)]");
    });
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<Input className="mt-4" />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸로만 지정하고 인라인 style/hex 가 없다", () => {
    const { container } = render(
      <Input danger value="값" onChange={vi.fn()} />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
