import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Searchbar } from "./Searchbar";

describe("Searchbar", () => {
  describe("입력 모드 (asButton 기본 false)", () => {
    it("기본값(variant=header)으로 <input> 을 렌더하고 data-* 속성을 부여한다", () => {
      const { container } = render(<Searchbar />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe("DIV");
      expect(root).toHaveAttribute("data-variant", "header");
      expect(root).toHaveAttribute("data-as-button", "false");

      const input = screen.getByRole("textbox", { name: "검색" });
      expect(input).toHaveAttribute("placeholder", "검색");
    });

    it("value 변경 시 onChange 를 호출한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Searchbar value="" onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "돈까스");
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith("스");
    });

    it("value 가 없으면 clear 버튼을 렌더하지 않는다", () => {
      render(<Searchbar value="" onChange={vi.fn()} />);
      expect(
        screen.queryByRole("button", { name: "지우기" }),
      ).not.toBeInTheDocument();
    });

    it("value 가 있으면 clear 버튼을 렌더하고 클릭 시 onClear 를 호출한다", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(<Searchbar value="돈까스" onChange={vi.fn()} onClear={onClear} />);

      const clearBtn = screen.getByRole("button", { name: "지우기" });
      await user.click(clearBtn);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("Enter 키 입력 시 onSubmit 을 현재 value 로 호출한다", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <Searchbar value="돈까스" onChange={vi.fn()} onSubmit={onSubmit} />,
      );

      await user.type(screen.getByRole("textbox"), "{Enter}");
      expect(onSubmit).toHaveBeenCalledWith("돈까스");
    });
  });

  describe("버튼 모드 (asButton=true)", () => {
    it("<button> 을 렌더하고 placeholder 를 라벨/aria-label 로 쓴다", () => {
      const { container } = render(<Searchbar asButton />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe("BUTTON");
      expect(root).toHaveAttribute("data-as-button", "true");

      const btn = screen.getByRole("button", { name: "검색" });
      expect(btn).toHaveTextContent("검색");
    });

    it("클릭하면 onClick 을 호출한다(실제 입력 없음)", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Searchbar asButton onClick={onClick} />);

      await user.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("커스텀 aria-label 을 우선한다", () => {
      render(<Searchbar asButton aria-label="검색 페이지로 이동" />);
      expect(
        screen.getByRole("button", { name: "검색 페이지로 이동" }),
      ).toBeInTheDocument();
    });
  });

  describe("variant", () => {
    it("header 는 --sz-38 높이 · body 는 --sz-46 높이 + border-xs 를 적용한다", () => {
      const { container, rerender } = render(<Searchbar variant="header" />);
      expect(container.firstElementChild).toHaveClass("h-[var(--sz-38)]");

      rerender(<Searchbar variant="body" />);
      expect(container.firstElementChild).toHaveClass(
        "h-[var(--sz-46)]",
        "border-xs",
      );
    });
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<Searchbar className="mt-4" />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { container } = render(<Searchbar />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
