import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";

import { LineTextarea } from "./LineTextarea";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-135837";

const meta = {
  title: "Components/LineTextarea",
  component: LineTextarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / LineTextarea" (컴포넌트 세트 node 51405:135837) 와 1:1. 형제 아톰 `Textarea`(node 51405:135814)를 조합해 라벨/필수표시/정보아이콘/헬퍼텍스트/글자수 카운터/밑줄을 얹은 몰리큘 — `Input`→`TextField` 관계와 동일 구조다. state=enable/hover/focus 는 CSS 의사클래스, danger/disabled 는 props. 밑줄은 hasValue 와 무관하게 state 로만 색이 바뀐다(Figma 실측).',
      },
    },
  },
  args: {
    value: "",
    placeholder: "Placeholder",
    onChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    value: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    danger: { control: "boolean" },
    disabled: { control: "boolean" },
    scrollable: { control: "boolean" },
    rows: { control: "number" },
    maxLength: { control: "number" },
  },
  render: (args) => (
    <div className="w-[320px]">
      <LineTextarea {...args} />
    </div>
  ),
} satisfies Meta<typeof LineTextarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** enable / 값 없음 — 라벨·필수표시·정보아이콘·헬퍼·카운터까지 모두 포함한 기본형. */
export const Empty: Story = {
  args: {
    label: "메모",
    required: true,
    onInfoClick: fn(),
    helperText: "자유롭게 작성해주세요",
    maxLength: 500,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "메모" });
    await expect(textarea).toHaveAttribute("placeholder", "Placeholder");
    await expect(canvas.getByText("0/500자")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "정보 보기" }),
    ).toBeInTheDocument();
  },
};

/** enable / 값 있음. */
export const Filled: Story = {
  args: { label: "메모", value: "오늘은 컨디션이 좋아요", maxLength: 500 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveValue(
      "오늘은 컨디션이 좋아요",
    );
    await expect(canvas.getByText("12/500자")).toBeInTheDocument();
  },
};

/** hover — CSS 의사클래스만 사용(props 아님), 필드 배경에 틴트만 추가된다. */
export const Hover: Story = {
  args: { label: "메모", value: "값" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.hover(textarea);
  },
};

/** focus — 밑줄이 브랜드색으로 바뀐다(공통 부모 group + group-focus-within:). */
export const Focus: Story = {
  args: { label: "메모" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.click(textarea);
    await expect(textarea).toHaveFocus();
  },
};

/** danger — 헬퍼가 경고 아이콘 + 빨간색으로 전환되고 aria-invalid 가 붙는다. */
export const Danger: Story = {
  args: {
    label: "메모",
    value: "짧음",
    danger: true,
    helperText: "10자 이상 입력해주세요",
    maxLength: 500,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(canvas.getByText("10자 이상 입력해주세요")).toHaveClass(
      "text-typo-danger-normal",
    );
  },
};

/** disabled. */
export const Disabled: Story = {
  args: {
    label: "메모",
    value: "수정할 수 없어요",
    disabled: true,
    helperText: "수정할 수 없습니다",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox")).toBeDisabled();
  },
};

/** 라벨 없이 텍스트영역만 사용하는 최소형(Figma isLabel=false). */
export const WithoutLabel: Story = {
  args: { placeholder: "라벨 없이 사용" },
};

/** 실제 입력 동작을 보여주는 controlled 데모 — 타이핑에 따라 글자수 카운터가 갱신된다. */
export const InteractiveTextarea: Story = {
  args: { label: "메모", maxLength: 20 },
  render: (args) => {
    function Demo() {
      const [value, setValue] = useState("");
      return (
        <div className="w-[320px]">
          <LineTextarea {...args} value={value} onChange={setValue} />
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");

    await userEvent.type(textarea, "또가");
    await expect(textarea).toHaveValue("또가");
    await expect(canvas.getByText("2/20자")).toBeInTheDocument();
  },
};

/** state 조합(enable/danger/disabled) × hasValue 를 나란히 비교. */
export const AllStates: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-[var(--sz-32)]">
      <LineTextarea label="라벨" placeholder="Placeholder" maxLength={500} />
      <LineTextarea label="라벨" value="Value" maxLength={500} />
      <LineTextarea
        label="라벨"
        value="Value"
        danger
        helperText="Helper Label Message"
        maxLength={500}
      />
      <LineTextarea label="라벨" value="Value" disabled />
    </div>
  ),
};
