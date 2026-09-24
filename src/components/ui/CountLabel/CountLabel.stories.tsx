import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { CountLabel } from "./CountLabel";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-67676";

const meta = {
  title: "Components/CountLabel",
  component: CountLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / CountLabel" (node 51405:67676) 와 1:1. `color`(black/gray/white) × `size`(sm/md) 6가지 조합의 "값 / 총량 단위" 숫자 표시. `color="white" & size="md"` 조합만 unit 텍스트가 한 단계 작아지는 예외가 있다.',
      },
    },
  },
  args: {
    color: "black",
    size: "md",
    currentCount: 1,
    totalCount: 3,
    unit: "Unit",
  },
  argTypes: {
    color: {
      control: "inline-radio",
      options: ["black", "gray", "white"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
    },
  },
} satisfies Meta<typeof CountLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** color="white" 는 밝은 배경에서 보이지 않아 어두운 배경으로 감싼다(Figma 원본 사용 맥락 = ChipIndicator 오버레이). */
const withDarkBackground = (Story: () => React.ReactElement) => (
  <div className="flex items-center justify-center rounded-2xl bg-bg-inverse-normal p-[var(--sz-16)]">
    <Story />
  </div>
);

export const BlackSm: Story = {
  args: { color: "black", size: "sm" },
};

export const BlackMd: Story = {
  args: { color: "black", size: "md" },
};

export const GraySm: Story = {
  args: { color: "gray", size: "sm" },
};

export const GrayMd: Story = {
  args: { color: "gray", size: "md" },
};

export const WhiteSm: Story = {
  args: { color: "white", size: "sm" },
  decorators: [withDarkBackground],
};

export const WhiteMd: Story = {
  args: { color: "white", size: "md" },
  decorators: [withDarkBackground],
};

/** 렌더된 텍스트가 "값/총량unit" 형태로 정확히 조합되는지 확인하는 play function. */
export const TextComposition: Story = {
  args: { currentCount: 2, totalCount: 5, unit: "개" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2")).toBeInTheDocument();
    await expect(canvas.getByText("/")).toBeInTheDocument();
    await expect(canvas.getByText("5")).toBeInTheDocument();
    await expect(canvas.getByText("개")).toBeInTheDocument();
  },
};

/** `unit` 을 넘기지 않으면(빈 문자열) 단위 텍스트 없이 값/총량만 렌더된다. */
export const NoUnit: Story = {
  args: { unit: "" },
};
