import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import type { DateFieldVariant } from "./DateField";
import { DateField } from "./DateField";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-68159";

const VARIANTS: DateFieldVariant[] = ["line", "box"];

const meta = {
  title: "Components/DateField",
  component: DateField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / DateField" (컴포넌트 세트 node 51405:68159) 와 1:1. `variant`(line/box, Figma `type`) × `mode`(single/range, Figma `variant`) × `state`(enable/hover/focus/danger/disabled/readOnly) 조합. 실제 편집 가능한 `<input>` 은 없고 값을 텍스트로 표시만 하는 버튼 필드 — 클릭 시 `onClick` 으로 부모가 DatePicker(별도 컴포넌트, 이번 범위 밖)를 열도록 위임한다. 색 로직은 `Input` 의 line/box 로직을 그대로 이식했다.',
      },
    },
  },
  args: {
    variant: "line",
    mode: "single",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    mode: { control: "inline-radio", options: ["single", "range"] },
    label: { control: "text" },
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
      <DateField {...args} />
    </div>
  ),
} satisfies Meta<typeof DateField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** line / single / 빈 값 — 라벨·헬퍼까지 포함한 기본형. */
export const LineSingleEmpty: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "생년월일",
    helperText: "YY.MM.DD 형식으로 선택해주세요",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "날짜 선택" });
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
  },
};

/** line / single / 값 있음 — 밑줄이 브랜드색으로 바뀐다. */
export const LineSingleFilled: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "생년월일",
    value: "26.09.21",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "26.09.21" }),
    ).toBeInTheDocument();
  },
};

/** line / range / 빈 값. */
export const LineRangeEmpty: Story = {
  args: { variant: "line", mode: "range", label: "예약 기간" },
};

/** line / range / 값 있음 — 물결(~)만 별도 색으로 렌더한다. */
export const LineRangeFilled: Story = {
  args: {
    variant: "line",
    mode: "range",
    label: "예약 기간",
    startValue: "26.09.01",
    endValue: "26.09.30",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button.textContent).toContain("26.09.01");
    await expect(button.textContent).toContain("26.09.30");
    await expect(canvas.getByText("~")).toHaveClass("text-typo-neutral-light");
  },
};

/** line / danger — 헬퍼가 경고 아이콘 + 빨간색으로 전환되고 aria-invalid 가 붙는다. */
export const LineDanger: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "생년월일",
    danger: true,
    helperText: "날짜를 선택해주세요",
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
    label: "생년월일",
    value: "26.09.21",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};

/** line / readOnly — 값 표시 전용, 클릭해도 onClick 이 호출되지 않는다. */
export const LineReadOnly: Story = {
  args: {
    variant: "line",
    mode: "single",
    label: "가입일",
    value: "26.01.01",
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
  args: { variant: "box", mode: "single", label: "생년월일" },
};

/** box / single / 값 있음. */
export const BoxSingleFilled: Story = {
  args: {
    variant: "box",
    mode: "single",
    label: "생년월일",
    value: "26.09.21",
  },
};

/** box / range / 값 있음. */
export const BoxRangeFilled: Story = {
  args: {
    variant: "box",
    mode: "range",
    label: "예약 기간",
    startValue: "26.09.01",
    endValue: "26.09.30",
  },
};

/** box / danger — 테두리와 배경이 danger 톤으로 바뀐다. */
export const BoxDanger: Story = {
  args: {
    variant: "box",
    mode: "single",
    label: "생년월일",
    danger: true,
    helperText: "날짜를 선택해주세요",
  },
};

/** box / disabled. */
export const BoxDisabled: Story = {
  args: {
    variant: "box",
    mode: "single",
    label: "생년월일",
    value: "26.09.21",
    disabled: true,
  },
};

/** 클릭 시 onClick 이 호출되는지 확인하는 인터랙션 데모. */
export const ClickToOpenPicker: Story = {
  args: { variant: "line", mode: "single", label: "생년월일" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "날짜 선택" });
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
          <DateField
            variant={variant}
            mode="single"
            label={`${variant} / single`}
          />
          <DateField
            variant={variant}
            mode="range"
            label={`${variant} / range`}
            startValue="26.09.01"
            endValue="26.09.30"
          />
        </div>
      ))}
    </div>
  ),
};
