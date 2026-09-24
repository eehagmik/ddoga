import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import type { TimerType } from "./Timer";
import { Timer } from "./Timer";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-152055";

const TYPES: TimerType[] = ["countdown", "countup"];

const meta = {
  title: "Components/Timer",
  component: Timer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Timer" (컴포넌트 세트 51405:152055) 와 1:1. 순수 표시 컴포넌트로 `seconds` 를 `minutes` 여부에 따라 `MM:SS` 또는 `SS` 로 포맷팅만 한다. `type`(countdown/countup) 은 시맨틱 구분용 prop 이며 현재 시각적 차이는 없다. 카운트다운/카운트업 타이머 로직은 호출부 책임이다.',
      },
    },
  },
  args: {
    seconds: 179,
    minutes: true,
    type: "countdown",
  },
  argTypes: {
    seconds: { control: "number" },
    minutes: { control: "boolean" },
    type: { control: "inline-radio", options: TYPES },
  },
} satisfies Meta<typeof Timer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** minutes=true, type=countdown — 기본 variant. "MM:SS" 로 표시. */
export const MinutesCountdown: Story = {
  args: { seconds: 179, minutes: true, type: "countdown" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("02:59")).toBeInTheDocument();
  },
};

/** minutes=true, type=countup — "MM:SS" 로 표시(시각 동일). */
export const MinutesCountup: Story = {
  args: { seconds: 65, minutes: true, type: "countup" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("01:05")).toBeInTheDocument();
  },
};

/** minutes=false, type=countdown — "SS" 만 표시. */
export const SecondsOnlyCountdown: Story = {
  args: { seconds: 59, minutes: false, type: "countdown" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("59")).toBeInTheDocument();
  },
};

/** minutes=false, type=countup — "SS" 만 표시(시각 동일). */
export const SecondsOnlyCountup: Story = {
  args: { seconds: 0, minutes: false, type: "countup" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("00")).toBeInTheDocument();
  },
};
