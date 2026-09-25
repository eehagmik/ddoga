import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { BlankIcon } from "./BlankIcon";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=2547-238";

const meta = {
  title: "UI/BlankIcon",
  component: BlankIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또하나 3.0 Design System / Assets / Blank" (node 2547:238) 의 `_blank용 아이콘`. "아이콘이 들어올 자리"를 표시하는 프리미티브다. 형태가 일치하는 기존 아이콘이 없어 인라인 SVG 로 렌더하며, `fill` 은 `currentColor` — 부모의 `color`(`text-icon-*` 토큰 유틸)를 상속한다.',
      },
    },
  },
  argTypes: {
    size: { control: { type: "number", min: 12, max: 96, step: 2 } },
  },
} satisfies Meta<typeof BlankIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { size: 24 },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32) text-icon-neutral-normal">
      <BlankIcon {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-blank="icon"]');
    await expect(svg).toBeInTheDocument();
    await expect(svg).toHaveAttribute("data-blank", "icon");
    await expect(svg).toHaveAttribute("width", "24");
    await expect(svg).toHaveAttribute("height", "24");
  },
};

/** `fill=currentColor` — 부모 `text-icon-*` 색을 그대로 상속한다. */
export const InheritsColor: Story = {
  args: { size: 32 },
  render: (args) => (
    <div className="flex items-center gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      <span className="text-icon-neutral-normal">
        <BlankIcon {...args} />
      </span>
      <span className="text-icon-brand-normal">
        <BlankIcon {...args} />
      </span>
      <span className="text-icon-danger-normal">
        <BlankIcon {...args} />
      </span>
      <span className="text-icon-info-normal">
        <BlankIcon {...args} />
      </span>
    </div>
  ),
};
