import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { DatePicker } from "./DatePicker";
import type { DatePickerRangeProps, DatePickerSingleProps } from "./DatePicker";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-도가3.0--Design-System?node-id=51405-73725";

/** 스토리/테스트 결정성을 위해 고정한 "오늘"(2026-09-10). `Calendar` 스토리의 YEAR/MONTH 관례와 통일. */
const FIXED_TODAY = new Date(2026, 8, 10);

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma 캔버스 51405:73725 Guide 프레임(51405:73921) phone 목업(`_DatePicker`) 과 대응하는 최상위 날짜 선택 컴포넌트. `DateField`(트리거) 클릭 시 `BottomSheet` 안에서 `Calendar` 가 열리고, `YearMonthButton` 을 누르면 이전/다음 달 이동 버튼이 사라지고 `YearMonthSelect` 로 전환된다. 날짜 클릭 즉시 `onChange` 가 호출되는 라이브 커밋 방식이며, 하단 "확인" 버튼은 시트를 닫는 용도로만 쓰인다.',
      },
    },
  },
  args: {
    today: FIXED_TODAY,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "box"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    danger: { control: "boolean" },
    disablePastDates: { control: "boolean" },
    title: { control: "text" },
    confirmLabel: { control: "text" },
    today: { table: { disable: true } },
    formatDate: { table: { disable: true } },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 단일/범위 모드를 로컬 state 로 감싸 실제 controlled 사용법을 보여주는 데모 래퍼.
 * `meta` 의 `args` 타입은 discriminated union(`DatePickerProps`) 전체로 넓혀지므로
 * (Storybook 은 story 별 `args` 리터럴로 좁혀주지 않는다), 각 렌더 콜백에서 해당
 * variant 로 단언(`as`)한다 — `FixButton` 등 이 프로젝트의 discriminated union
 * 컴포넌트 스토리에서도 동일한 제약이 있다.
 */
function SingleDemo(args: Omit<DatePickerSingleProps, "onChange">) {
  const [value, setValue] = useState<Date | undefined>(args.value);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-neutral-deep">
      <div className="w-(--sz-320)">
        <DatePicker {...args} mode="single" value={value} onChange={setValue} />
      </div>
    </div>
  );
}

function RangeDemo(args: Omit<DatePickerRangeProps, "onChange">) {
  const [startValue, setStartValue] = useState<Date | undefined>(
    args.startValue,
  );
  const [endValue, setEndValue] = useState<Date | undefined>(args.endValue);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-neutral-deep">
      <div className="w-(--sz-320)">
        <DatePicker
          {...args}
          mode="range"
          startValue={startValue}
          endValue={endValue}
          onChange={(start, end) => {
            setStartValue(start);
            setEndValue(end);
          }}
        />
      </div>
    </div>
  );
}

/** 기본형 — mode='single', line variant, 선택값 없음. */
export const Default: Story = {
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
};

/** box variant. */
export const BoxVariant: Story = {
  args: { variant: "box" },
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
};

/** mode='range' — 시작/종료 날짜를 각각 순서대로 선택한다. */
export const RangeMode: Story = {
  render: (args) => <RangeDemo {...(args as DatePickerRangeProps)} />,
};

/**
 * `disablePastDates=false` — 오늘 이전 날짜도 선택할 수 있다(기본값 true 는 과거
 * 날짜를 비활성화한다).
 */
export const AllowPastDates: Story = {
  args: { disablePastDates: false },
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "날짜 선택" }));
    const dialog = await canvas.findByRole("dialog", { name: "날짜선택" });
    const dialogScope = within(dialog);
    const pastDate = dialogScope.getByRole("button", {
      name: "2026년 9월 5일",
    });
    await expect(pastDate).not.toBeDisabled();
  },
};

/** 라벨/헬퍼 텍스트 조합. */
export const WithLabelAndHelper: Story = {
  args: {
    label: "생년월일",
    helperText: "만 14세 이상만 가입할 수 있어요",
  },
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
};

/** disabled — 트리거 필드 자체가 비활성화되어 클릭해도 시트가 열리지 않는다. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "날짜 선택" });
    await expect(trigger).toBeDisabled();
  },
};

/** readOnly — 값 표시만 하고 클릭해도 시트가 열리지 않는다. */
export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "날짜 선택" });
    await userEvent.click(trigger);
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

/**
 * YearMonthButton 클릭 → 이전/다음 달 버튼이 사라지고 `YearMonthSelect` 로 전환 →
 * 연/월 셀 클릭으로 표시 월을 바꾼 뒤, 다시 눌러 그리드로 복귀하는 전체 흐름.
 */
export const YearMonthSwitch: Story = {
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "날짜 선택" }));
    const dialog = await canvas.findByRole("dialog", { name: "날짜선택" });
    const dialogScope = within(dialog);

    await userEvent.click(
      dialogScope.getByRole("button", { name: "2026년 9월" }),
    );
    await expect(
      dialogScope.queryByRole("button", { name: "이전 달" }),
    ).not.toBeInTheDocument();
    await expect(
      dialogScope.getByRole("listbox", { name: "연도" }),
    ).toBeInTheDocument();

    await userEvent.click(dialogScope.getByRole("option", { name: "11월" }));
    await expect(
      dialogScope.getByRole("button", { name: "2026년 11월" }),
    ).toBeInTheDocument();

    await userEvent.click(
      dialogScope.getByRole("button", { name: "2026년 11월" }),
    );
    await expect(
      dialogScope.getByRole("button", { name: "이전 달" }),
    ).toBeInTheDocument();
  },
};

/**
 * YearMonthSelect 가 열린 상태에서 "확인"을 누르면 시트 전체가 닫히지 않고, 고른
 * 연/월이 반영된 `Calendar` 그리드로만 복귀해야 한다(시트를 닫는 것은 별개 동작).
 */
export const YearMonthConfirmReturnsToCalendar: Story = {
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "날짜 선택" }));
    const dialog = await canvas.findByRole("dialog", { name: "날짜선택" });
    const dialogScope = within(dialog);

    await userEvent.click(
      dialogScope.getByRole("button", { name: "2026년 9월" }),
    );
    await userEvent.click(dialogScope.getByRole("option", { name: "11월" }));

    const confirmButton = dialogScope.getByRole("button", { name: "확인" });
    await expect(confirmButton).not.toBeDisabled();
    await userEvent.click(confirmButton);

    // 시트는 열린 채로 유지되고, Calendar 그리드(이전 달 버튼)로 복귀하며
    // 선택한 11월이 반영돼 있어야 한다.
    await expect(canvas.getByRole("dialog")).toBeInTheDocument();
    await expect(
      dialogScope.getByRole("button", { name: "이전 달" }),
    ).toBeInTheDocument();
    await expect(
      dialogScope.getByRole("button", { name: "2026년 11월" }),
    ).toBeInTheDocument();
  },
};

/**
 * 전체 플로우 — 트리거 클릭 → `BottomSheet` 오픈 → 날짜 클릭(라이브 커밋) → "확인"
 * 클릭 → 시트가 닫히고 트리거에 선택한 날짜가 표시된다.
 */
export const FullSelectionFlow: Story = {
  render: (args) => <SingleDemo {...(args as DatePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole("button", { name: "날짜 선택" });
    await userEvent.click(trigger);

    const dialog = await canvas.findByRole("dialog", { name: "날짜선택" });
    const dialogScope = within(dialog);

    const confirmButton = dialogScope.getByRole("button", { name: "확인" });
    await expect(confirmButton).toBeDisabled();

    await userEvent.click(
      dialogScope.getByRole("button", { name: "2026년 9월 15일" }),
    );
    await expect(confirmButton).not.toBeDisabled();

    await userEvent.click(confirmButton);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());

    await expect(
      canvas.getByRole("button", { name: "26.09.15" }),
    ).toBeInTheDocument();
  },
};

/**
 * mode='range' 전체 플로우 — 시작일만 선택해도 "확인"이 활성화되고, 시작~종료를
 * 모두 선택하면 트리거에 "시작 ~ 종료" 형태로 표시된다.
 */
export const RangeSelectionFlow: Story = {
  render: (args) => <RangeDemo {...(args as DatePickerRangeProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "날짜 선택" }));
    const dialog = await canvas.findByRole("dialog", { name: "날짜선택" });
    const dialogScope = within(dialog);

    const confirmButton = dialogScope.getByRole("button", { name: "확인" });
    await expect(confirmButton).toBeDisabled();

    await userEvent.click(
      dialogScope.getByRole("button", { name: "2026년 9월 12일" }),
    );
    await expect(confirmButton).not.toBeDisabled();

    await userEvent.click(
      dialogScope.getByRole("button", { name: "2026년 9월 20일" }),
    );
    await userEvent.click(confirmButton);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());

    await expect(
      canvas.getByRole("button", { name: "26.09.12 ~ 26.09.20" }),
    ).toBeInTheDocument();
  },
};
