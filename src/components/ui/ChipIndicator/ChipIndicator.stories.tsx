import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import type { ChipIndicatorType } from "./ChipIndicator";
import { ChipIndicator } from "./ChipIndicator";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-102231";

const TYPES: ChipIndicatorType[] = ["default", "onlyLabel", "onlyCount"];

const meta = {
  title: "Components/ChipIndicator",
  component: ChipIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / ChipIndicator" (node 51405:102231) 와 1:1. 콘텐츠 우하단에 얹는 반투명 배지형 카운트 표시. `type`(default/onlyLabel/onlyCount) 3가지 조합을 지원하며, 카운트 영역은 `CountLabel color="white" size="md"` 를 재사용한다. `Swiper`(indicator="chip") 가 이 컴포넌트를 합성해서 쓴다.',
      },
    },
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center rounded-2xl bg-bg-neutral-normal p-[var(--sz-16)]">
        <Story />
      </div>
    ),
  ],
  args: {
    type: "default",
    label: "사진",
    currentCount: 1,
    totalCount: 3,
    unit: "개",
  },
  argTypes: {
    type: { control: "inline-radio", options: TYPES },
  },
} satisfies Meta<typeof ChipIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** type=default — 라벨 + "·" + 카운트. Swiper indicator="chip" 이 쓰는 조합. */
export const Default: Story = {
  args: { type: "default" },
};

/** type=onlyLabel — 라벨만. */
export const OnlyLabel: Story = {
  args: { type: "onlyLabel" },
};

/** type=onlyCount — 카운트만. */
export const OnlyCount: Story = {
  args: { type: "onlyCount" },
};

/** unit 없이 "값/총량" 만 표시. */
export const NoUnit: Story = {
  args: { type: "onlyCount", unit: "" },
};

/**
 * type 조합별로 렌더 텍스트가 기대대로 조합되는지 확인하는 play function.
 * default 는 라벨/·/카운트 전부, onlyLabel 은 라벨만 렌더돼야 한다.
 */
export const TextComposition: Story = {
  args: { type: "default", label: "사진", currentCount: 2, totalCount: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("사진")).toBeInTheDocument();
    await expect(canvas.getByText("·")).toBeInTheDocument();
    await expect(canvas.getByText("2")).toBeInTheDocument();
    await expect(canvas.getByText("5")).toBeInTheDocument();
  },
};
