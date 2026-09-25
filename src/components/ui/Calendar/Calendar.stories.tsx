import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { YearMonthSelect } from "../YearMonthSelect";
import type { YearMonthSelectValue } from "../YearMonthSelect";
import { Calendar } from "./Calendar";
import type { CalendarProps } from "./Calendar";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-도가3.0--Design-System?node-id=51405-11899";

const YEAR = 2026;
const MONTH = 9;

function dateLabel(day: number, year = YEAR, month = MONTH) {
  return `${year}년 ${month}월 ${day}일`;
}

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Calendar" (문서 캔버스 51405:11635, 메인 프레임 51405:11899) 와 1:1 대응하는 실제 캘린더 팝업 콘텐츠(Figma 원본 컴포넌트명 그대로 사용). `DateField` 가 클릭 시 열게 될 오버레이 본체이며, 이 `Calendar` 를 내부에서 조합할 상위 `DatePicker` 컴포넌트는 별도로 추후 구현 예정이다. `mode`(single/range) 를 지원하고, 년/월 이동 및 `YearMonthButton` 클릭은 모두 콜백으로 위임한다(년/월 선택 UI 자체는 이 컴포넌트 범위 밖).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-(--sz-320)">
        <Story />
      </div>
    ),
  ],
  args: {
    mode: "single",
    year: YEAR,
    month: MONTH,
    isYearMonthOpen: false,
    onPrevMonth: fn(),
    onNextMonth: fn(),
    onYearMonthClick: fn(),
    onSelectDate: fn(),
    onSelectRange: fn(),
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range"] },
    year: { control: "number" },
    month: { control: { type: "number", min: 1, max: 12 } },
    isYearMonthOpen: { control: "boolean" },
    selectedDate: { table: { disable: true } },
    startDate: { table: { disable: true } },
    endDate: { table: { disable: true } },
    today: { table: { disable: true } },
    minDate: { table: { disable: true } },
    yearMonthSlot: { table: { disable: true } },
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** mode='single', 선택된 날짜 없음(기본값). */
export const Single: Story = {};

/** mode='single', 특정 날짜가 선택된 상태(채움 원 + inverse 텍스트). */
export const SingleSelected: Story = {
  args: {
    selectedDate: new Date(YEAR, MONTH - 1, 15),
  },
};

/** mode='range', 선택된 구간 없음. */
export const Range: Story = {
  args: { mode: "range" },
};

/** mode='range', 시작~종료가 모두 확정된 구간(중간 날짜는 blue-60 배경). */
export const RangeSelected: Story = {
  args: {
    mode: "range",
    startDate: new Date(YEAR, MONTH - 1, 5),
    endDate: new Date(YEAR, MONTH - 1, 20),
  },
};

/** 표시 중인 달 안에 오늘이 있고 선택되지 않은 경우 — 테두리 링으로 강조된다. */
export const TodayHighlight: Story = {
  args: {
    today: new Date(YEAR, MONTH - 1, 10),
  },
};

/** YearMonthButton "열림" 상태 — 배경(bg-overlay-greenGraySubtle) + chevron_up_line. */
export const YearMonthOpen: Story = {
  args: { isYearMonthOpen: true },
};

/** 헤더의 이전/다음달 버튼과 YearMonthButton 클릭이 각각 콜백을 호출하는지 확인한다. */
export const HeaderInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "이전 달" }));
    await expect(args.onPrevMonth).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole("button", { name: "다음 달" }));
    await expect(args.onNextMonth).toHaveBeenCalledTimes(1);

    await userEvent.click(
      canvas.getByRole("button", { name: `${YEAR}년 ${MONTH}월` }),
    );
    await expect(args.onYearMonthClick).toHaveBeenCalledTimes(1);
  },
};

/** mode='single': 날짜 클릭 시 onSelectDate 가 클릭한 날짜로 호출되는지 확인한다. */
export const DateSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: dateLabel(12) }));

    await expect(args.onSelectDate).toHaveBeenCalledTimes(1);
    const called = (args.onSelectDate as ReturnType<typeof fn>).mock
      .calls[0][0] as Date;
    await expect(called.getDate()).toBe(12);
  },
};

function RangeInteractionDemo(args: CalendarProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  return (
    <Calendar
      {...args}
      mode="range"
      startDate={startDate}
      endDate={endDate}
      onSelectRange={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }}
    />
  );
}

/** mode='range': 시작일 클릭 → 이후 날짜 클릭 시 구간이 확정되는 실제 상호작용 데모. */
export const RangeInteraction: Story = {
  args: { mode: "range" },
  render: (args) => <RangeInteractionDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: dateLabel(5) }));
    await userEvent.click(canvas.getByRole("button", { name: dateLabel(20) }));

    const startButton = canvas.getByRole("button", { name: dateLabel(5) });
    const endButton = canvas.getByRole("button", { name: dateLabel(20) });
    await expect(startButton).toHaveClass("bg-bg-info-deep");
    await expect(endButton).toHaveClass("bg-bg-info-deep");

    const midButton = canvas.getByRole("button", { name: dateLabel(10) });
    await expect(midButton.parentElement).toHaveClass("bg-blue-60");
  },
};

/**
 * mode='range', startDate 만 있는 상태에서 다른 날짜에 마우스를 올리면
 * startDate~hover날짜 구간이 blue-60 배경으로 미리보기 렌더링된다.
 */
export const HoverPreview: Story = {
  args: {
    mode: "range",
    startDate: new Date(YEAR, MONTH - 1, 5),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hoverTarget = canvas.getByRole("button", { name: dateLabel(15) });
    const midCell = canvas.getByRole("button", { name: dateLabel(10) });

    await expect(midCell.parentElement).not.toHaveClass("bg-blue-60");

    await userEvent.hover(hoverTarget);
    await expect(midCell.parentElement).toHaveClass("bg-blue-60");

    await userEvent.unhover(hoverTarget);
  },
};

function PlaygroundDemo(args: CalendarProps) {
  const [year, setYear] = useState(args.year);
  const [month, setMonth] = useState(args.month);
  const [isOpen, setIsOpen] = useState(args.isYearMonthOpen ?? false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    args.selectedDate,
  );
  const [startDate, setStartDate] = useState<Date | undefined>(args.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(args.endDate);

  function goPrevMonth() {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }
  function goNextMonth() {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  return (
    <Calendar
      {...args}
      year={year}
      month={month}
      isYearMonthOpen={isOpen}
      onYearMonthClick={() => setIsOpen((prev) => !prev)}
      onPrevMonth={goPrevMonth}
      onNextMonth={goNextMonth}
      selectedDate={args.mode === "range" ? undefined : selectedDate}
      startDate={args.mode === "range" ? startDate : undefined}
      endDate={args.mode === "range" ? endDate : undefined}
      onSelectDate={setSelectedDate}
      onSelectRange={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }}
    />
  );
}

/** 월 이동/YearMonthButton 열림/날짜(range) 선택이 모두 실제로 동작하는 자유 조작 데모. */
export const Playground: Story = {
  render: (args) => <PlaygroundDemo {...args} />,
};

function YearMonthSlotDemo(args: CalendarProps) {
  const [year, setYear] = useState(args.year);
  const [month, setMonth] = useState(args.month);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Calendar
      {...args}
      year={year}
      month={month}
      isYearMonthOpen={isOpen}
      onYearMonthClick={() => setIsOpen((prev) => !prev)}
      yearMonthSlot={
        <div className="h-[320px] w-full">
          <YearMonthSelect
            value={{ year, month }}
            onChange={(next: YearMonthSelectValue) => {
              setYear(next.year);
              setMonth(next.month);
            }}
          />
        </div>
      }
    />
  );
}

/**
 * `yearMonthSlot` + `isYearMonthOpen=true` — 이전/다음 달 이동 버튼이 사라지고
 * YearMonthButton 만 중앙에 남으며, 요일 헤더+날짜 그리드 대신 `YearMonthSelect` 가
 * 렌더된다(`DatePicker` 조합용 확장, `Calendar` 단독 스모크 테스트).
 */
export const YearMonthSlotOpen: Story = {
  render: (args) => <YearMonthSlotDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole("button", { name: "이전 달" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "다음 달" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: `${YEAR}년 ${MONTH}월` }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("listbox", { name: "연도" }),
    ).toBeInTheDocument();
  },
};

/** `minDate` — 오늘(=minDate) 이전 날짜 셀은 "다른 달" 패딩 셀과 동일한 룩으로 비활성화된다. */
export const MinDateDisablesPast: Story = {
  args: {
    today: new Date(YEAR, MONTH - 1, 10),
    minDate: new Date(YEAR, MONTH - 1, 10),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const pastButton = canvas.getByRole("button", { name: dateLabel(5) });
    await expect(pastButton).toBeDisabled();
    await expect(pastButton).toHaveClass("text-typo-disabled-normal");
    await userEvent.click(pastButton);
    await expect(args.onSelectDate).not.toHaveBeenCalled();

    const todayButton = canvas.getByRole("button", { name: dateLabel(10) });
    await expect(todayButton).not.toBeDisabled();

    const futureButton = canvas.getByRole("button", { name: dateLabel(15) });
    await expect(futureButton).not.toBeDisabled();
  },
};
