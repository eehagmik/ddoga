import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TimeField } from "./TimeField";

describe("TimeField", () => {
  describe("기본 렌더(variant=line, mode=single 기본값)", () => {
    it("<input> 없이 버튼으로 렌더하고 값이 없으면 placeholder '시간 선택' 을 표시한다", () => {
      render(<TimeField />);
      const button = screen.getByRole("button", { name: "시간 선택" });
      expect(button).toBeInTheDocument();
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("value 가 있으면 값을 표시한다", () => {
      render(<TimeField value="오후 3:30" />);
      expect(
        screen.getByRole("button", { name: "오후 3:30" }),
      ).toBeInTheDocument();
    });

    it("label 이 있으면 라벨 텍스트를 렌더한다", () => {
      render(<TimeField label="알림 시간" />);
      expect(screen.getByText("알림 시간")).toBeInTheDocument();
    });

    it("label 이 없으면 라벨을 렌더하지 않는다", () => {
      const { container } = render(<TimeField />);
      expect(container.querySelector("label")).toBeNull();
    });

    it("helperText 가 있으면 렌더하고 없으면 렌더하지 않는다", () => {
      const { rerender } = render(<TimeField helperText="예: 오후 3:30" />);
      expect(screen.getByText("예: 오후 3:30")).toBeInTheDocument();

      rerender(<TimeField />);
      expect(screen.queryByText("예: 오후 3:30")).not.toBeInTheDocument();
    });
  });

  describe("mode=range", () => {
    it("기본 라벨 '시작시간'/'종료시간' 을 각각 렌더한다", () => {
      render(<TimeField mode="range" />);
      expect(screen.getByText("시작시간")).toBeInTheDocument();
      expect(screen.getByText("종료시간")).toBeInTheDocument();
    });

    it("startLabel/endLabel 로 라벨을 덮어쓸 수 있다", () => {
      render(
        <TimeField mode="range" startLabel="출근 시간" endLabel="퇴근 시간" />,
      );
      expect(screen.getByText("출근 시간")).toBeInTheDocument();
      expect(screen.getByText("퇴근 시간")).toBeInTheDocument();
    });

    it("startValue/endValue 가 모두 없으면 두 필드 모두 placeholder 를 표시한다", () => {
      render(<TimeField mode="range" />);
      expect(screen.getAllByRole("button", { name: "시간 선택" })).toHaveLength(
        2,
      );
    });

    it("시작·종료 값은 서로 독립적으로 표시된다(하나만 채워도 됨)", () => {
      render(<TimeField mode="range" startValue="오전 9:00" />);
      expect(
        screen.getByRole("button", { name: "오전 9:00" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "시간 선택" }),
      ).toBeInTheDocument();
    });

    it("DateField 와 달리 '~' 물결 구분자를 렌더하지 않는다(독립 필드 2개 구조)", () => {
      render(
        <TimeField mode="range" startValue="오전 9:00" endValue="오후 6:00" />,
      );
      expect(screen.queryByText("~")).not.toBeInTheDocument();
    });
  });

  describe("클릭 동작", () => {
    it("single 모드에서 클릭 시 onClick 을 호출한다", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<TimeField onClick={onClick} />);

      await user.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("range 모드에서 시작·종료 필드가 각자 독립된 콜백을 호출한다", async () => {
      const user = userEvent.setup();
      const onStartClick = vi.fn();
      const onEndClick = vi.fn();
      render(
        <TimeField
          mode="range"
          onStartClick={onStartClick}
          onEndClick={onEndClick}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[0]);
      expect(onStartClick).toHaveBeenCalledTimes(1);
      expect(onEndClick).not.toHaveBeenCalled();

      await user.click(buttons[1]);
      expect(onEndClick).toHaveBeenCalledTimes(1);
    });

    it("disabled 이면 버튼이 비활성화되고 클릭해도 onClick 이 호출되지 않는다", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<TimeField onClick={onClick} disabled />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("readOnly 이면 버튼은 활성 상태이지만 클릭해도 onClick 이 호출되지 않는다", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<TimeField onClick={onClick} readOnly value="오후 3:30" />);

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("readOnly 이면 포커스는 가능하다", () => {
      render(<TimeField readOnly value="오후 3:30" />);
      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe("state", () => {
    it("danger 이면 aria-invalid 를 설정하고 helperText 를 경고색으로 렌더한다", () => {
      render(<TimeField danger helperText="시간을 선택해주세요" />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(screen.getByText("시간을 선택해주세요")).toHaveClass(
        "text-typo-danger-normal",
      );
    });

    it("disabled + 값 있음이면 typo-disabled-normal 색을 쓴다", () => {
      render(<TimeField value="오후 3:30" disabled />);
      expect(screen.getByText("오후 3:30")).toHaveClass(
        "text-typo-disabled-normal",
      );
    });

    it("readOnly + 값 없음(line)이면 placeholder 가 disabled 톤이다", () => {
      render(<TimeField variant="line" readOnly />);
      expect(screen.getByText("시간 선택")).toHaveClass(
        "text-typo-disabled-subtle",
      );
    });

    it("readOnly + 값 없음(box)이면 placeholder 색이 불변이다(hint-subtle)", () => {
      render(<TimeField variant="box" readOnly />);
      expect(screen.getByText("시간 선택")).toHaveClass(
        "text-typo-hint-subtle",
      );
    });
  });

  describe("variant", () => {
    it("box 는 border-xs 를 적용하고 line 은 적용하지 않는다", () => {
      const { container, rerender } = render(<TimeField variant="box" />);
      expect(
        container.querySelector('[class*="border-xs"]'),
      ).toBeInTheDocument();

      rerender(<TimeField variant="line" />);
      expect(container.querySelector('[class*="border-xs"]')).toBeNull();
    });

    it("line 은 밑줄(rounded-circle) 을 렌더하고 box 는 렌더하지 않는다", () => {
      const { container, rerender } = render(<TimeField variant="line" />);
      expect(
        container.querySelector('[class*="rounded-circle"]'),
      ).toBeInTheDocument();

      rerender(<TimeField variant="box" />);
      expect(container.querySelector('[class*="rounded-circle"]')).toBeNull();
    });

    it("box 는 값이 있으면 hover/focus 없이도 테두리가 브랜드색이 된다(Figma 실측)", () => {
      const { container } = render(
        <TimeField variant="box" value="오후 3:30" />,
      );
      expect(
        container.querySelector('[class*="border-border-brand-normal"]'),
      ).toBeInTheDocument();
    });
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<TimeField className="mt-4" />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸로만 지정하고 인라인 style/hex 가 없다", () => {
    const { container } = render(
      <TimeField
        mode="range"
        startValue="오전 9:00"
        endValue="오후 6:00"
        helperText="도움말"
        danger
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
