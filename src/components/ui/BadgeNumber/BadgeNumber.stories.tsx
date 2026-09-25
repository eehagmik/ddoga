import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { BadgeNumber } from "./BadgeNumber";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-6924";

const meta = {
  title: "Components/BadgeNumber",
  component: BadgeNumber,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / BadgeNumber" (node 51405:6924) 와 1:1. 알림 수·장바구니 개수 등 카운트를 host UI 요소 우측 상단에 겹쳐 표시하는 작은 빨간 원형 배지. `count` 가 `max`(기본 99) 를 초과하면 `99+` 로 축약한다. 배치는 호출부 책임이며 `className` 으로 제어한다.',
      },
    },
  },
  argTypes: {
    count: { control: { type: "number" } },
    max: { control: { type: "number" } },
    size: { control: "inline-radio", options: ["xs", "sm", "md"] },
  },
} satisfies Meta<typeof BadgeNumber>;

export default meta;

type Story = StoryObj<typeof meta>;

const SIZES = ["xs", "sm", "md"] as const;

export const Playground: Story = {
  args: { count: 3, max: 99, size: "xs" },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <BadgeNumber {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector("[data-size]");
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveAttribute("data-size", "xs");
    await expect(badge).toHaveTextContent("3");
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-(--sz-8)">
          <code className="text-2xs text-typo-neutral-light">{size}</code>
          <BadgeNumber count={8} size={size} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badges = canvasElement.querySelectorAll("[data-size]");
    await expect(badges).toHaveLength(3);
    const sizes = Array.from(badges).map((b) => b.getAttribute("data-size"));
    await expect(sizes).toEqual(["xs", "sm", "md"]);
  },
};

export const TwoDigits: Story = {
  args: { count: 12, max: 99, size: "md" },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <BadgeNumber {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-size]")).toHaveTextContent(
      "12",
    );
  },
};

export const Overflow: Story = {
  args: { count: 100, max: 99, size: "md" },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <BadgeNumber {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-size]")).toHaveTextContent(
      "99+",
    );
  },
};

export const OnIconButton: Story = {
  name: "배치 예시 (아이콘 버튼 위)",
  render: () => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <span className="relative inline-flex p-(--sz-8) text-icon-neutral-normal">
        <Icon name="bell_01_line" title="알림" />
        <BadgeNumber count={5} size="sm" className="absolute top-0 right-0" />
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("5")).toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-size]")).toHaveClass(
      "absolute",
    );
  },
};
