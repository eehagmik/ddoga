import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { DirectionIndicator } from "./DirectionIndicator";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-102224";

const meta = {
  title: "Components/DirectionIndicator",
  component: DirectionIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / DirectionIndicator" (node 51405:102224) 와 1:1. 이전/다음 원형 버튼 사이에 `CountLabel color="black" size="md"` 을 두는 캐러셀용 인디케이터. `countable`(기본 true) 을 false 로 주면 버튼 2개만 남는다. `Swiper`(indicator="direction") 가 이 컴포넌트를 합성해서 쓴다.',
      },
    },
  },
  args: {
    currentCount: 1,
    totalCount: 3,
    unit: "Unit",
    countable: true,
    onPrev: fn(),
    onNext: fn(),
  },
  argTypes: {
    countable: { control: "boolean" },
    onPrev: { table: { disable: true } },
    onNext: { table: { disable: true } },
  },
} satisfies Meta<typeof DirectionIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 가운데 CountLabel 을 표시하는 기본형(Figma `countable=true`). */
export const Countable: Story = {
  args: { countable: true },
};

/** 가운데 CountLabel 없이 버튼 2개만 표시(Figma `countable=false`). */
export const NotCountable: Story = {
  args: { countable: false },
};

/** unit 없이 "값/총량" 만 표시. */
export const NoUnit: Story = {
  args: { unit: "" },
};

/** 이전/다음 버튼 클릭 시 각각 onPrev/onNext 가 호출되는지 확인하는 play function. */
export const ClickInteraction: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByRole("button", { name: "다음 슬라이드" });
    const prevButton = canvas.getByRole("button", { name: "이전 슬라이드" });

    await userEvent.click(nextButton);
    await expect(args.onNext).toHaveBeenCalledTimes(1);

    await userEvent.click(prevButton);
    await expect(args.onPrev).toHaveBeenCalledTimes(1);
  },
};
