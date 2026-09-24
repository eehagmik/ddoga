import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Calendar } from "./Calendar";

const YEAR = 2026;
const MONTH = 9; // 2026년 9월

function dateLabel(year: number, month: number, day: number) {
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * range 배경은 버튼 자신이 아니라 형제 `[aria-hidden]` div 에 렌더된다(버튼 폭 기준으로만
 * 캡을 씌우기 위해 2026-09-23 분리). 없으면 배경이 아예 렌더되지 않은 것.
 */
function rangeBackgroundOf(button: HTMLElement) {
  return button.parentElement?.querySelector('[aria-hidden="true"]') ?? null;
}

describe("Calendar", () => {
  it("요일 헤더 일~토 를 렌더한다", () => {
    render(<Calendar year={YEAR} month={MONTH} />);
    ["일", "월", "화", "수", "목", "금", "토"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("날짜 그리드는 7의 배수이고 이번 달 실제 일수만큼 활성 셀을 렌더한다", () => {
    const { container } = render(<Calendar year={YEAR} month={MONTH} />);
    const daysInMonth = new Date(YEAR, MONTH, 0).getDate();

    const allDateButtons = container.querySelectorAll(
      '[aria-label$="일"][type="button"]',
    );
    expect(allDateButtons.length % 7).toBe(0);

    const enabledButtons = Array.from(allDateButtons).filter(
      (btn) => !(btn as HTMLButtonElement).disabled,
    );
    expect(enabledButtons).toHaveLength(daysInMonth);
  });

  it("다른 달 패딩 셀은 disabled 로 렌더되고 disabled 텍스트 색을 쓴다", () => {
    const { container } = render(<Calendar year={YEAR} month={MONTH} />);
    const disabledButton = container.querySelector(
      'button[disabled][aria-label$="일"]',
    );
    expect(disabledButton).not.toBeNull();
    expect(disabledButton).toHaveClass("text-typo-disabled-normal");
  });

  it("이전/다음 달 이동 버튼 클릭 시 각각의 콜백을 호출한다", async () => {
    const user = userEvent.setup();
    const onPrevMonth = vi.fn();
    const onNextMonth = vi.fn();
    render(
      <Calendar
        year={YEAR}
        month={MONTH}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />,
    );

    await user.click(screen.getByRole("button", { name: "이전 달" }));
    expect(onPrevMonth).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "다음 달" }));
    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  describe("YearMonthButton", () => {
    it("'{year}년 {month}월' 텍스트를 렌더하고 클릭 시 onYearMonthClick 을 호출한다", async () => {
      const user = userEvent.setup();
      const onYearMonthClick = vi.fn();
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          onYearMonthClick={onYearMonthClick}
        />,
      );

      const button = screen.getByRole("button", {
        name: `${YEAR}년 ${MONTH}월`,
      });
      await user.click(button);
      expect(onYearMonthClick).toHaveBeenCalledTimes(1);
    });

    it("isYearMonthOpen=false 면 배경이 없고 닫힘 아이콘, true 면 배경과 열림 아이콘이 다르다", () => {
      const { rerender } = render(
        <Calendar year={YEAR} month={MONTH} isYearMonthOpen={false} />,
      );
      const button = screen.getByRole("button", {
        name: `${YEAR}년 ${MONTH}월`,
      });
      expect(button).not.toHaveClass("bg-bg-overlay-greenGraySubtle");
      const closedIconHtml = button.querySelector("svg")!.outerHTML;

      rerender(<Calendar year={YEAR} month={MONTH} isYearMonthOpen={true} />);
      expect(button).toHaveClass("bg-bg-overlay-greenGraySubtle");
      const openIconHtml = button.querySelector("svg")!.outerHTML;
      expect(openIconHtml).not.toBe(closedIconHtml);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("mode='single'(기본값)", () => {
    it("날짜 클릭 시 onSelectDate 를 클릭한 날짜로 호출한다", async () => {
      const user = userEvent.setup();
      const onSelectDate = vi.fn();
      render(
        <Calendar year={YEAR} month={MONTH} onSelectDate={onSelectDate} />,
      );

      await user.click(
        screen.getByRole("button", { name: dateLabel(YEAR, MONTH, 12) }),
      );
      expect(onSelectDate).toHaveBeenCalledTimes(1);
      const called = onSelectDate.mock.calls[0][0] as Date;
      expect(called.getFullYear()).toBe(YEAR);
      expect(called.getMonth()).toBe(MONTH - 1);
      expect(called.getDate()).toBe(12);
    });

    it("selectedDate 와 일치하는 셀은 채움 원(bg-bg-info-deep) + inverse 텍스트를 적용한다", () => {
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          selectedDate={new Date(YEAR, MONTH - 1, 12)}
        />,
      );
      const button = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 12),
      });
      expect(button).toHaveClass("bg-bg-info-deep", "text-typo-inverse-normal");
    });
  });

  describe("today", () => {
    it("check 가 아닌 오늘 날짜에는 테두리 링을 추가한다", () => {
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          today={new Date(YEAR, MONTH - 1, 10)}
        />,
      );
      const button = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 10),
      });
      expect(button).toHaveClass("border-sm", "border-border-info-deep");
    });

    it("오늘이면서 선택(check)된 날짜는 링 대신 채움 원이 우선한다", () => {
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          today={new Date(YEAR, MONTH - 1, 10)}
          selectedDate={new Date(YEAR, MONTH - 1, 10)}
        />,
      );
      const button = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 10),
      });
      expect(button).toHaveClass("bg-bg-info-deep");
      expect(button).not.toHaveClass("border-sm");
    });
  });

  describe("mode='range'", () => {
    it("시작일이 없으면 클릭한 날짜를 새 시작일로 onSelectRange(date, undefined) 호출", async () => {
      const user = userEvent.setup();
      const onSelectRange = vi.fn();
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          onSelectRange={onSelectRange}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: dateLabel(YEAR, MONTH, 5) }),
      );
      expect(onSelectRange).toHaveBeenCalledTimes(1);
      const [start, end] = onSelectRange.mock.calls[0];
      expect((start as Date).getDate()).toBe(5);
      expect(end).toBeUndefined();
    });

    it("시작일만 있고 이후 날짜를 클릭하면 onSelectRange(start, end) 호출", async () => {
      const user = userEvent.setup();
      const onSelectRange = vi.fn();
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 5)}
          onSelectRange={onSelectRange}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: dateLabel(YEAR, MONTH, 20) }),
      );
      expect(onSelectRange).toHaveBeenCalledTimes(1);
      const [start, end] = onSelectRange.mock.calls[0];
      expect((start as Date).getDate()).toBe(5);
      expect((end as Date).getDate()).toBe(20);
    });

    it("시작일보다 이전 날짜를 클릭하면 새 시작일로 초기화한다", async () => {
      const user = userEvent.setup();
      const onSelectRange = vi.fn();
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 20)}
          onSelectRange={onSelectRange}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: dateLabel(YEAR, MONTH, 5) }),
      );
      const [start, end] = onSelectRange.mock.calls[0];
      expect((start as Date).getDate()).toBe(5);
      expect(end).toBeUndefined();
    });

    it("시작/종료가 모두 있으면 클릭 시 새 시작일로 초기화한다", async () => {
      const user = userEvent.setup();
      const onSelectRange = vi.fn();
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 5)}
          endDate={new Date(YEAR, MONTH - 1, 20)}
          onSelectRange={onSelectRange}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: dateLabel(YEAR, MONTH, 15) }),
      );
      const [start, end] = onSelectRange.mock.calls[0];
      expect((start as Date).getDate()).toBe(15);
      expect(end).toBeUndefined();
    });

    it("startDate/endDate 사이 날짜는 range 배경(bg-blue-60)을 적용하고 양끝은 채움 원이 덮는다", () => {
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 5)}
          endDate={new Date(YEAR, MONTH - 1, 8)}
        />,
      );

      const midButton = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 6),
      });
      expect(rangeBackgroundOf(midButton)).toHaveClass("bg-blue-60");
      expect(midButton).not.toHaveClass("bg-bg-info-deep");

      const startButton = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 5),
      });
      expect(startButton).toHaveClass("bg-bg-info-deep");

      const outsideButton = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 1),
      });
      expect(rangeBackgroundOf(outsideButton)).toBeNull();
    });

    it("startDate 만 있고 endDate 가 없을 때, 이후 날짜에 마우스를 올리면 구간 배경을 미리보기 렌더링한다", async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 5)}
        />,
      );

      const hoverTarget = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 8),
      });
      const midCell = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 6),
      });

      expect(rangeBackgroundOf(midCell)).toBeNull();
      await user.hover(hoverTarget);
      expect(rangeBackgroundOf(midCell)).toHaveClass("bg-blue-60");
    });

    it("마우스가 그리드를 벗어나면 미리보기 배경이 초기화된다", async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 5)}
        />,
      );

      const hoverTarget = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 8),
      });
      const midCell = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 6),
      });

      await user.hover(hoverTarget);
      expect(rangeBackgroundOf(midCell)).toHaveClass("bg-blue-60");

      // 그리드 밖(마우스 아웃)으로 이동 — React 는 onMouseLeave 를 네이티브
      // mouseout/mouseover 버블링으로 시뮬레이션하므로 `unhover` 로 실제 사용자
      // 동작과 동일하게 트리거한다(raw "mouseleave" 이벤트 직접 dispatch 는
      // React 의 합성 이벤트 시스템에 감지되지 않는다).
      await user.unhover(hoverTarget);

      expect(rangeBackgroundOf(midCell)).toBeNull();
    });

    it("endDate 가 이미 있으면 hover 해도 미리보기가 적용되지 않는다", async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 5)}
          endDate={new Date(YEAR, MONTH - 1, 8)}
        />,
      );

      const hoverTarget = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 20),
      });
      const farCell = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 15),
      });

      await user.hover(hoverTarget);
      expect(rangeBackgroundOf(farCell)).toBeNull();
    });
  });

  describe("색 로직", () => {
    it("일요일 텍스트는 danger-normal(헤더)/danger-deep(날짜) 색을 쓴다", () => {
      // 2026-09 의 첫 일요일 헤더 셀은 항상 '일' 텍스트 하나로 공유되므로
      // 날짜 셀의 일요일(sunday) 색만 직접 검증한다.
      render(<Calendar year={YEAR} month={MONTH} />);
      const firstOfMonth = new Date(YEAR, MONTH - 1, 1);
      const firstSundayDay =
        firstOfMonth.getDay() === 0 ? 1 : 8 - firstOfMonth.getDay();
      const button = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, firstSundayDay),
      });
      expect(button).toHaveClass("text-typo-danger-deep");
    });

    it("className 을 루트에 병합한다", () => {
      const { container } = render(
        <Calendar year={YEAR} month={MONTH} className="mt-4" />,
      );
      expect(container.firstElementChild).toHaveClass("mt-4");
    });

    it("data-mode 를 루트에 노출한다", () => {
      const { container, rerender } = render(
        <Calendar year={YEAR} month={MONTH} mode="single" />,
      );
      expect(container.firstElementChild).toHaveAttribute(
        "data-mode",
        "single",
      );

      rerender(<Calendar year={YEAR} month={MONTH} mode="range" />);
      expect(container.firstElementChild).toHaveAttribute("data-mode", "range");
    });

    it("마크업에 hex 코드가 없다", () => {
      const { container } = render(
        <Calendar
          mode="range"
          year={YEAR}
          month={MONTH}
          startDate={new Date(YEAR, MONTH - 1, 5)}
          endDate={new Date(YEAR, MONTH - 1, 8)}
          today={new Date(YEAR, MONTH - 1, 10)}
          isYearMonthOpen
        />,
      );
      expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    });
  });

  describe("yearMonthSlot", () => {
    it("yearMonthSlot 이 없으면 isYearMonthOpen=true 여도 이전/다음 달 버튼과 그리드를 그대로 렌더한다", () => {
      render(<Calendar year={YEAR} month={MONTH} isYearMonthOpen />);
      expect(
        screen.getByRole("button", { name: "이전 달" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "다음 달" }),
      ).toBeInTheDocument();
      expect(screen.getByText("일")).toBeInTheDocument();
    });

    it("yearMonthSlot 이 있어도 isYearMonthOpen=false 면 기존처럼 화살표+그리드를 렌더한다", () => {
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          isYearMonthOpen={false}
          yearMonthSlot={<div data-testid="year-month-slot" />}
        />,
      );
      expect(
        screen.getByRole("button", { name: "이전 달" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "다음 달" }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("year-month-slot")).not.toBeInTheDocument();
    });

    it("yearMonthSlot + isYearMonthOpen=true 면 이전/다음 달 버튼을 렌더하지 않고 슬롯을 그 자리에 렌더한다", () => {
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          isYearMonthOpen
          yearMonthSlot={<div data-testid="year-month-slot" />}
        />,
      );
      expect(
        screen.queryByRole("button", { name: "이전 달" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "다음 달" }),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("year-month-slot")).toBeInTheDocument();
      // 요일 헤더/날짜 그리드는 슬롯으로 완전히 대체된다.
      expect(screen.queryByText("일")).not.toBeInTheDocument();
      // YearMonthButton 자체는 그대로 남아있다.
      expect(
        screen.getByRole("button", { name: `${YEAR}년 ${MONTH}월` }),
      ).toBeInTheDocument();
    });
  });

  describe("minDate", () => {
    it("minDate 보다 이전 날짜 셀은 disabled + typo-disabled-normal 룩을 적용하고 클릭이 무시된다", async () => {
      const user = userEvent.setup();
      const onSelectDate = vi.fn();
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          minDate={new Date(YEAR, MONTH - 1, 10)}
          onSelectDate={onSelectDate}
        />,
      );

      const pastButton = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 5),
      });
      expect(pastButton).toBeDisabled();
      expect(pastButton).toHaveClass("text-typo-disabled-normal");

      await user.click(pastButton);
      expect(onSelectDate).not.toHaveBeenCalled();
    });

    it("minDate 와 같은 날짜는 비활성화되지 않는다", () => {
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          minDate={new Date(YEAR, MONTH - 1, 10)}
        />,
      );
      const sameDayButton = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 10),
      });
      expect(sameDayButton).not.toBeDisabled();
    });

    it("minDate 이후 날짜는 정상적으로 클릭 가능하다", async () => {
      const user = userEvent.setup();
      const onSelectDate = vi.fn();
      render(
        <Calendar
          year={YEAR}
          month={MONTH}
          minDate={new Date(YEAR, MONTH - 1, 10)}
          onSelectDate={onSelectDate}
        />,
      );

      const futureButton = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 15),
      });
      expect(futureButton).not.toBeDisabled();
      await user.click(futureButton);
      expect(onSelectDate).toHaveBeenCalledTimes(1);
    });

    it("minDate 가 없으면 기존처럼 이번 달 모든 날짜가 활성화된다", () => {
      render(<Calendar year={YEAR} month={MONTH} />);
      const button = screen.getByRole("button", {
        name: dateLabel(YEAR, MONTH, 1),
      });
      expect(button).not.toBeDisabled();
    });
  });
});
