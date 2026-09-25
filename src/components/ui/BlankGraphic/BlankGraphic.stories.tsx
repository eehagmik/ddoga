import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { BlankGraphic } from "./BlankGraphic";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=3250-193";

const meta = {
  title: "UI/BlankGraphic",
  component: BlankGraphic,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또하나 3.0 Design System / Assets / Blank" (node 3250:193) 의 이미지 슬롯 표식. 중립 배경 면 + 중앙 이미지 아이콘(`image_01_line`)으로 렌더한다. `ratio`(CSS aspect-ratio) + `width: 100%` 로 부모 폭을 채운다. 색은 `--color-bg-neutral-deep` / `--color-icon-neutral-bright` 토큰만 사용한다.',
      },
    },
  },
  argTypes: {
    ratio: { control: "text" },
  },
} satisfies Meta<typeof BlankGraphic>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { ratio: "1/1" },
  render: (args) => (
    <div className="w-(--sz-320) bg-bg-neutral-normal p-(--sz-32)">
      <BlankGraphic {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-blank="graphic"]');
    await expect(root).toBeInTheDocument();
    await expect(root).toHaveAttribute("data-ratio", "1/1");
    await expect(root?.querySelector("svg")).toBeInTheDocument();
  },
};
