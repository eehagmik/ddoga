import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateField } from "./DateField";

describe("DateField", () => {
  describe("기본 렌더(variant=line, mode=single 기본값)", () => {
    it("<input> 없이 버튼으로 렌더하고 값이 없으면 placeholder '날짜 선택' 을 표시한다", () => {
      render(<DateField />);
      const button = screen.getByRole("button", { name: "날짜 선택" });
      expect(button).toBeInTheDocument();
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("value 가 있으면 값을 표시한다", () => {
      render(<DateField value="2026.09.21" />);
      expect(
        screen.getByRole("button", { name: "2026.09.21" }),
      ).toBeInTheDocument();
    });

    it("label 이 있으면 라벨 텍스트를 렌더한다", () => {
      render(<DateField label="생년월일" />);
      expect(screen.getByText("생년월일")).toBeInTheDocument();
    });

    it("label 이 없으면 라벨을 렌더하지 않는다", () => {
      const { container } = render(<DateField />);
      expect(container.querySelector("label")).toBeNull();
    });

    it("helperText 가 있으면 렌더하고 없으면 렌더하지 않는다", () => {
      const { rerender } = render(<DateField helperText="예: 2026.09.21" />);
      expect(screen.getByText("예: 2026.09.21")).toBeInTheDocument();

      rerender(<DateField />);
      expect(screen.queryByText("예: 2026.09.21")).not.toBeInTheDocument();
    });
  });

  describe("mode=range", () => {
    it("startValue/endValue 가 모두 없으면 placeholder 를 표시한다", () => {
      render(<DateField mode="range" />);
      expect(
        screen.getByRole("button", { name: "날짜 선택" }),
      ).toBeInTheDocument();
    });

    it("startValue/endValue 가 있으면 '~' 로 이어 표시한다", () => {
      render(
        <DateField
          mode="range"
          startValue="2026.09.01"
          endValue="2026.09.30"
        />,
      );
      const button = screen.getByRole("button");
      expect(button.textContent).toContain("2026.09.01");
      expect(button.textContent).toContain("~");
      expect(button.textContent).toContain("2026.09.30");
    });

    it("물결(~)만 typo-neutral-light 색을 쓴다", () => {
      render(
        <DateField
          mode="range"
          startValue="2026.09.01"
          endValue="2026.09.30"
        />,
      );
      expect(screen.getByText("~")).toHaveClass("text-typo-neutral-light");
    });
  });

  describe("클릭 동작", () => {
    it("클릭 시 onClick 을 호출한다", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<DateField onClick={onClick} />);

      await user.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("disabled 이면 버튼이 비활성화되고 클릭해도 onClick 이 호출되지 않는다", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<DateField onClick={onClick} disabled />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("readOnly 이면 버튼은 활성 상태이지만 클릭해도 onClick 이 호출되지 않는다", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<DateField onClick={onClick} readOnly value="2026.09.21" />);

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("readOnly 이면 포커스는 가능하다", () => {
      render(<DateField readOnly value="2026.09.21" />);
      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe("state", () => {
    it("danger 이면 aria-invalid 를 설정하고 helperText 를 경고색으로 렌더한다", () => {
      render(<DateField danger helperText="날짜를 선택해주세요" />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(screen.getByText("날짜를 선택해주세요")).toHaveClass(
        "text-typo-danger-normal",
      );
    });

    it("disabled + 값 있음이면 typo-disabled-normal 색을 쓴다", () => {
      render(<DateField value="2026.09.21" disabled />);
      expect(screen.getByText("2026.09.21")).toHaveClass(
        "text-typo-disabled-normal",
      );
    });

    it("readOnly + 값 없음(line)이면 placeholder 가 disabled 톤이다", () => {
      render(<DateField variant="line" readOnly />);
      expect(screen.getByText("날짜 선택")).toHaveClass(
        "text-typo-disabled-subtle",
      );
    });

    it("readOnly + 값 없음(box)이면 placeholder 색이 불변이다(hint-subtle)", () => {
      render(<DateField variant="box" readOnly />);
      expect(screen.getByText("날짜 선택")).toHaveClass(
        "text-typo-hint-subtle",
      );
    });
  });

  describe("variant", () => {
    it("box 는 border-xs 를 적용하고 line 은 적용하지 않는다", () => {
      const { container, rerender } = render(<DateField variant="box" />);
      expect(
        container.querySelector('[class*="border-xs"]'),
      ).toBeInTheDocument();

      rerender(<DateField variant="line" />);
      expect(container.querySelector('[class*="border-xs"]')).toBeNull();
    });

    it("line 은 밑줄(rounded-circle) 을 렌더하고 box 는 렌더하지 않는다", () => {
      const { container, rerender } = render(<DateField variant="line" />);
      expect(
        container.querySelector('[class*="rounded-circle"]'),
      ).toBeInTheDocument();

      rerender(<DateField variant="box" />);
      expect(container.querySelector('[class*="rounded-circle"]')).toBeNull();
    });

    it("box 는 값이 있으면 hover/focus 없이도 테두리가 브랜드색이 된다(Figma 실측)", () => {
      const { container } = render(
        <DateField variant="box" value="2026.09.21" />,
      );
      expect(
        container.querySelector('[class*="border-border-brand-normal"]'),
      ).toBeInTheDocument();
    });
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<DateField className="mt-4" />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸로만 지정하고 인라인 style/hex 가 없다", () => {
    const { container } = render(
      <DateField
        label="기간"
        mode="range"
        startValue="2026.09.01"
        endValue="2026.09.30"
        helperText="도움말"
        danger
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
