import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { TimePicker } from "./TimePicker";
import type { TimePickerRangeProps, TimePickerSingleProps } from "./TimePicker";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-도가3.0--Design-System?node-id=51405-150988";

/** 스토리/테스트 결정성을 위해 고정한 "현재 시각"(2026-09-23 오전 9:05). */
const FIXED_NOW = new Date(2026, 8, 23, 9, 5);

const meta = {
  title: "Components/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma 문서 캔버스 51405:150988(`TimePicker` Guide) 과 대응하는 최상위 시간 선택 컴포넌트. `TimeField`(트리거) 클릭 시 `BottomSheet` 안에서 `TimeSelect` 3열 휠이 열린다. 시트를 처음 열 때 값이 없으면 `now` 기준 현재 시각(range 종료는 시작+6시간)이 즉시 기본값으로 커밋되며, 스크롤/클릭 시 라이브 커밋된다. 하단 "확인" 버튼은 시트를 닫는 용도로만 쓰인다.',
      },
    },
  },
  args: {
    now: FIXED_NOW,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "box"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    danger: { control: "boolean" },
    confirmLabel: { control: "text" },
    now: { table: { disable: true } },
    formatTime: { table: { disable: true } },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 단일/범위 모드를 로컬 state 로 감싸 실제 controlled 사용법을 보여주는 데모 래퍼.
 * `meta` 의 `args` 타입은 discriminated union(`TimePickerProps`) 전체로 넓혀지므로
 * (Storybook 은 story 별 `args` 리터럴로 좁혀주지 않는다), 각 렌더 콜백에서 해당
 * variant 로 단언(`as`)한다 — `DatePicker` 등 이 프로젝트의 discriminated union
 * 컴포넌트 스토리에서도 동일한 제약이 있다.
 */
function SingleDemo(args: Omit<TimePickerSingleProps, "onChange">) {
  const [value, setValue] = useState(args.value);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-neutral-deep">
      <div className="w-[var(--sz-320)]">
        <TimePicker {...args} mode="single" value={value} onChange={setValue} />
      </div>
    </div>
  );
}

function RangeDemo(args: Omit<TimePickerRangeProps, "onChange">) {
  const [startValue, setStartValue] = useState(args.startValue);
  const [endValue, setEndValue] = useState(args.endValue);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-neutral-deep">
      <div className="w-[var(--sz-320)]">
        <TimePicker
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

/**
 * 시/분 열은 숫자 포맷이 겹칠 수 있어("10" 은 시·분 모두에 존재) `role="listbox"`
 * (`aria-label` "시") 스코프로 좁혀 조회한다.
 */
function hourOption(scope: ReturnType<typeof within>, name: string) {
  return within(scope.getByRole("listbox", { name: "시" })).getByRole(
    "option",
    { name },
  );
}

/** 기본형 — mode='single', line variant, 선택값 없음(시트를 열면 "오전 9:05" 기본값). */
export const Default: Story = {
  render: (args) => <SingleDemo {...(args as TimePickerSingleProps)} />,
};

/** box variant. */
export const BoxVariant: Story = {
  args: { variant: "box" },
  render: (args) => <SingleDemo {...(args as TimePickerSingleProps)} />,
};

/** mode='range' — 시작/종료 시간을 각각 독립 필드로 선택한다. */
export const RangeMode: Story = {
  render: (args) => <RangeDemo {...(args as TimePickerRangeProps)} />,
};

/** 라벨/헬퍼 텍스트 조합. */
export const WithLabelAndHelper: Story = {
  args: {
    label: "알림 시간",
    helperText: "매일 이 시간에 알림을 보내드려요",
  },
  render: (args) => <SingleDemo {...(args as TimePickerSingleProps)} />,
};

/** disabled — 트리거 필드 자체가 비활성화되어 클릭해도 시트가 열리지 않는다. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <SingleDemo {...(args as TimePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "시간 선택" });
    await expect(trigger).toBeDisabled();
  },
};

/** readOnly — 값 표시만 하고 클릭해도 시트가 열리지 않는다. */
export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => <SingleDemo {...(args as TimePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "시간 선택" });
    await userEvent.click(trigger);
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

/**
 * 전체 플로우 — 트리거 클릭 → `BottomSheet` 오픈(값이 없어 "오전 9:05" 기본값이
 * 즉시 표시·커밋됨) → 시/분 휠 셀 클릭으로 값 변경(라이브 커밋) → "확인" 클릭 → 시트가
 * 닫히고 트리거에 변경된 값이 표시된다.
 */
export const FullSelectionFlow: Story = {
  render: (args) => <SingleDemo {...(args as TimePickerSingleProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole("button", { name: "시간 선택" });
    await userEvent.click(trigger);

    const dialog = await canvas.findByRole("dialog", { name: "시간 선택" });
    const dialogScope = within(dialog);

    // 시트를 열자마자 기본값(오전 9:05)이 이미 커밋되어 확인 버튼이 항상 활성화된다.
    const confirmButton = dialogScope.getByRole("button", { name: "확인" });
    await expect(confirmButton).not.toBeDisabled();

    await userEvent.click(hourOption(dialogScope, "10"));

    await userEvent.click(confirmButton);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());

    await expect(
      canvas.getByRole("button", { name: "오전 10:05" }),
    ).toBeInTheDocument();
  },
};

/**
 * mode='range' 전체 플로우 — 시작 필드 클릭 → 기본값(오전 9:05) 자동 커밋 확인 →
 * 시 변경 → 종료 필드 클릭 → 기본값(시작+6시간 = 오후 3:05) 자동 커밋 확인 → 시 변경 →
 * 두 필드 모두 값이 반영된다.
 */
export const RangeSelectionFlow: Story = {
  render: (args) => <RangeDemo {...(args as TimePickerRangeProps)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 두 필드 모두 값이 없어 접근성 이름이 동일한 placeholder("시간 선택")다 —
    // TimeField 자체 테스트 관례(`TimeField.test.tsx`)와 동일하게 순서로 구분한다.
    const [startTrigger] = canvas.getAllByRole("button", { name: "시간 선택" });
    await userEvent.click(startTrigger);
    let dialog = await canvas.findByRole("dialog", { name: "시작시간 선택" });
    let dialogScope = within(dialog);
    await userEvent.click(hourOption(dialogScope, "8"));
    await userEvent.click(dialogScope.getByRole("button", { name: "확인" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(
      canvas.getByRole("button", { name: "오전 8:05" }),
    ).toBeInTheDocument();

    // 이제 종료 필드만 placeholder 상태로 남는다.
    await userEvent.click(canvas.getByRole("button", { name: "시간 선택" }));
    dialog = await canvas.findByRole("dialog", { name: "종료시간 선택" });
    dialogScope = within(dialog);
    // 시작(오전 8:05)+6시간 = 오후 2:05 기본값이 자동 커밋되어 있어야 한다.
    await expect(
      canvas.getByRole("button", { name: "오후 2:05" }),
    ).toBeInTheDocument();

    await userEvent.click(hourOption(dialogScope, "5"));
    await userEvent.click(dialogScope.getByRole("button", { name: "확인" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());

    await expect(
      canvas.getByRole("button", { name: "오전 8:05" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "오후 5:05" }),
    ).toBeInTheDocument();
  },
};
