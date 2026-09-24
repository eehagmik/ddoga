import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Stepper } from "./Stepper";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-132387";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Stepper" (node 51405:132387, 내부 원자 `_parts/StepBar` node 51405:132361) 와 1:1. 완료/진행중/대기 상태를 스텝별로 보여주는 원형 스텝 UI가 아니라, 트랙 위를 브랜드색 인디케이터가 좌→우로 채워나가는 얇은(2px) 선형 progress bar 다. Figma 는 `percent`(0/25/50/75/100) variant 만 노출하지만, 실사용성을 위해 `currentStep`/`totalSteps` prop 으로 받아 내부에서 percent 를 계산한다. `currentStep` 은 "완료한 단계 수"(0 = 시작 전, `totalSteps` = 전부 완료).',
      },
    },
  },
  // 컴포넌트가 w-full 이므로 고정 너비 컨테이너로 감싼다(Header 아래 배치되는 실제 맥락과 유사).
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: {
    currentStep: 1,
    totalSteps: 4,
  },
  argTypes: {
    currentStep: { control: { type: "number", min: 0, step: 1 } },
    totalSteps: { control: { type: "number", min: 1, step: 1 } },
  },
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Figma percent variant 5종(0/25/50/75/100%)에 대응하는 스냅샷 — totalSteps=4 고정. */
export const Percent0: Story = {
  args: { currentStep: 0, totalSteps: 4 },
};

export const Percent25: Story = {
  args: { currentStep: 1, totalSteps: 4 },
};

export const Percent50: Story = {
  args: { currentStep: 2, totalSteps: 4 },
};

export const Percent75: Story = {
  args: { currentStep: 3, totalSteps: 4 },
};

export const Percent100: Story = {
  args: { currentStep: 4, totalSteps: 4 },
};

/** currentStep/totalSteps 로부터 aria-value* 와 인디케이터 width 가 올바르게 계산되는지 확인하는 play function. */
export const AriaAndWidth: Story = {
  args: { currentStep: 3, totalSteps: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "4");
    await expect(bar).toHaveAttribute("aria-valuenow", "3");
    const indicator = bar.firstElementChild as HTMLElement;
    await expect(indicator.style.width).toBe("75%");
  },
};
