import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import type { TimeFieldVariant } from "./TimeField";
import { TimeField } from "./TimeField";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-146949";

const VARIANTS: TimeFieldVariant[] = ["line", "box"];

const meta = {
  title: "Components/TimeField",
  component: TimeField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / TimeField" (컴포넌트 세트 node 51405:146949) 와 1:1. `DateField` 와 동일한 디자인을 공유하는 자매 컴포넌트다. `variant`(line/box, Figma `type`) × `mode`(single/range, Figma `variant`) × `state`(enable/hover/focus/danger/disabled, readOnly 는 Figma 세트엔 없지만 DateField 와 동일 원칙으로 확장) 조합. 실제 편집 가능한 `<input>` 은 없고 값을 텍스트로 표시만 하는 버튼 필드 — 클릭 시 `onClick`/`onStartClick`/`onEndClick` 으로 부모가 상위 조합 컴포넌트 TimePicker(`src/components/ui/TimePicker`)를 열도록 위임한다. range 모드는 DateField 와 달리 "시작시간"/"종료시간" 라벨을 각자 가진 독립 필드 2개가 나란히 배치된다.',
      },
    },
  },
  args: {
    variant: "line",
    mode: "single",
    onClick: fn(),
    onStartClick: fn(),
    onEndClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    mode: { control: "inline-radio", options: ["single", "range"] },
    label: { control: "text" },
    startLabel: { control: "text" },
    endLabel: { control: "text" },
    helperText: { control: "text" },
    value: { control: "text" },
    startValue: { control: "text" },
    endValue: { control: "text" },
    danger: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  render: (args) => (
    <div className="w-[320px]">
      <TimeField {...args} />
    </div>
  ),
} satisfies Meta<typeof TimeField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** line / single / 빈 값 — 라벨·헬퍼까지 포함한 기본형. */
export const LineSingleEmpty: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "알림 시간",
    helperText: "24시간 형식으로 선택해주세요",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "시간 선택" });
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
  },
};

/** line / single / 값 있음 — 밑줄이 브랜드색으로 바뀐다. */
export const LineSingleFilled: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "알림 시간",
    value: "오후 3:30",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "오후 3:30" }),
    ).toBeInTheDocument();
  },
};

/** line / range / 빈 값 — 시작·종료 필드가 각자 독립 렌더된다. */
export const LineRangeEmpty: Story = {
  args: { variant: "line", mode: "range" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("시작시간")).toBeInTheDocument();
    await expect(canvas.getByText("종료시간")).toBeInTheDocument();
    const buttons = canvas.getAllByRole("button", { name: "시간 선택" });
    await expect(buttons).toHaveLength(2);
  },
};

/** line / range / 값 있음 — 시작만 채워지고 종료는 placeholder 인 비대칭 상태도 가능하다. */
export const LineRangePartiallyFilled: Story = {
  args: {
    variant: "line",
    mode: "range",
    startValue: "오전 9:00",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "오전 9:00" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "시간 선택" }),
    ).toBeInTheDocument();
  },
};

/** line / range / 시작·종료 모두 값 있음. */
export const LineRangeFilled: Story = {
  args: {
    variant: "line",
    mode: "range",
    startValue: "오전 9:00",
    endValue: "오후 6:00",
  },
};

/** line / danger — 헬퍼가 경고색으로 전환되고 aria-invalid 가 붙는다. */
export const LineDanger: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "알림 시간",
    danger: true,
    helperText: "시간을 선택해주세요",
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toHaveAttribute("aria-invalid", "true");
  },
};

/** line / disabled. */
export const LineDisabled: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "알림 시간",
    value: "오후 3:30",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};

/** line / readOnly — 값 표시 전용, 클릭해도 onClick 이 호출되지 않는다(Figma 세트엔 없는 확장). */
export const LineReadOnly: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "예약 시간",
    value: "오후 1:00",
    readOnly: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).not.toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** box / single / 빈 값. */
export const BoxSingleEmpty: Story = {
  args: { variant: "box", mode: "single", label: "알림 시간" },
};

/** box / single / 값 있음. */
export const BoxSingleFilled: Story = {
  args: {
    variant: "box",
    mode: "single",
    label: "알림 시간",
    value: "오후 3:30",
  },
};

/** box / range / 값 있음. */
export const BoxRangeFilled: Story = {
  args: {
    variant: "box",
    mode: "range",
    startValue: "오전 9:00",
    endValue: "오후 6:00",
  },
};

/** box / danger. */
export const BoxDanger: Story = {
  args: {
    variant: "box",
    mode: "single",
    label: "알림 시간",
    danger: true,
    helperText: "시간을 선택해주세요",
  },
};

/** box / disabled. */
export const BoxDisabled: Story = {
  args: {
    variant: "box",
    mode: "single",
    label: "알림 시간",
    value: "오후 3:30",
    disabled: true,
  },
};

/** range 모드: 시작·종료 필드가 각각 독립적인 onClick 콜백을 호출하는지 검증. */
export const RangeClickDelegation: Story = {
  args: {
    variant: "line",
    mode: "range",
    startValue: "오전 9:00",
    endValue: "오후 6:00",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[0]);
    await expect(args.onStartClick).toHaveBeenCalledTimes(1);
    await expect(args.onEndClick).not.toHaveBeenCalled();

    await userEvent.click(buttons[1]);
    await expect(args.onEndClick).toHaveBeenCalledTimes(1);
  },
};

/** 클릭 시 onClick 이 호출되는지 확인하는 single 모드 인터랙션 데모. */
export const ClickToOpenPicker: Story = {
  args: { variant: "line", mode: "single", label: "알림 시간" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "시간 선택" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** variant × mode 4가지 조합을 나란히 비교. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-(--sz-32)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-(--sz-16)">
          <TimeField
            variant={variant}
            mode="single"
            label={`${variant} / single`}
          />
          <TimeField
            variant={variant}
            mode="range"
            startValue="오전 9:00"
            endValue="오후 6:00"
          />
        </div>
      ))}
    </div>
  ),
};
