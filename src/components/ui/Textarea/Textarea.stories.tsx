import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";

import { Textarea } from "./Textarea";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-135814";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Textarea" (컴포넌트 세트 node 51405:135814, state enable/focus/disabled × hasValue 2 = 6 variant)와 1:1. 테두리·배경 크롬이 없는 순수 여러 줄 입력 프리미티브 — 라벨·헬퍼텍스트·글자수 카운터가 필요하면 이 컴포넌트를 조합한 몰리큘(형제 노드 LineTextarea, 이번 작업 범위 밖)을 사용한다. state=focus 는 Figma 실측상 enable 과 시각적으로 동일해 별도 CSS 를 추가하지 않았고, disabled 는 네이티브 disabled prop 이다. scrollable 은 Figma 의 Scroll 데코 바 대신 Scroll 컴포넌트와 동일한 토큰으로 네이티브 스크롤바를 스타일링한다.',
      },
    },
  },
  args: {
    value: "",
    placeholder: "Placeholder",
    onChange: fn(),
  },
  argTypes: {
    value: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    scrollable: { control: "boolean" },
    rows: { control: "number" },
  },
  render: (args) => (
    <div className="w-[320px]">
      <Textarea {...args} />
    </div>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** enable / 값 없음 — 기본형(placeholder 노출). */
export const Empty: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await expect(textarea).toHaveAttribute("placeholder", "Placeholder");
    await expect(textarea).toHaveClass("text-typo-hint-subtle");
  },
};

/** enable / 값 있음. */
export const Filled: Story = {
  args: { value: "Value" },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox");
    await expect(textarea).toHaveValue("Value");
    await expect(textarea).toHaveClass("text-typo-neutral-normal");
  },
};

/**
 * focus — CSS 네이티브 포커스만 사용(props 아님). Figma 실측상 enable 과 시각적으로
 * 동일하다(별도 밑줄/색 변경은 LineTextarea 쪽 책임).
 */
export const Focus: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.click(textarea);
    await expect(textarea).toHaveFocus();
  },
};

/** disabled / 값 없음. */
export const DisabledEmpty: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox");
    await expect(textarea).toBeDisabled();
    await expect(textarea).toHaveClass("text-typo-disabled-subtle");
  },
};

/** disabled / 값 있음 — placeholder 보다 진한 disabled-normal 색을 쓴다(Figma 실측). */
export const DisabledFilled: Story = {
  args: { disabled: true, value: "Value" },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox");
    await expect(textarea).toBeDisabled();
    await expect(textarea).toHaveClass("text-typo-disabled-normal");
  },
};

/** scrollable=true(기본) — 내용이 넘치면 Scroll 과 동일한 토큰으로 스타일링된 스크롤이 생긴다. */
export const ScrollableOverflow: Story = {
  args: {
    value: Array.from({ length: 20 }, (_, i) => `줄 ${i + 1}`).join("\n"),
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole(
      "textbox",
    ) as HTMLTextAreaElement;
    await expect(textarea).toHaveClass("overflow-y-auto");
  },
};

/** scrollable=false — 넘치는 내용을 스크롤 없이 자른다. */
export const NotScrollable: Story = {
  args: {
    value: Array.from({ length: 20 }, (_, i) => `줄 ${i + 1}`).join("\n"),
    rows: 4,
    scrollable: false,
  },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox");
    await expect(textarea).toHaveClass("overflow-hidden");
  },
};

/** 실제 입력 동작을 보여주는 controlled 데모 — 타이핑까지 확인한다. */
export const InteractiveTextarea: Story = {
  args: {},
  render: (args) => {
    function Demo() {
      const [value, setValue] = useState("");
      return (
        <div className="w-[320px]">
          <Textarea {...args} value={value} onChange={setValue} />
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
  },
};

/** 6개 variant(state × hasValue) 를 나란히 비교. */
export const AllStates: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-[var(--sz-16)]">
      <Textarea placeholder="enable, 값 없음" />
      <Textarea value="enable, 값 있음" onChange={() => {}} />
      <Textarea disabled placeholder="disabled, 값 없음" />
      <Textarea disabled value="disabled, 값 있음" onChange={() => {}} />
    </div>
  ),
};
