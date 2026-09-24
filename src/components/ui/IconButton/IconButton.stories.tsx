import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { IconButton } from "./IconButton";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%EB%98%90%EA%B0%803.0--Design-System?node-id=51405-85581";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / IconButton" (문서 node 51405:85581, 메인 컴포넌트 node 51405:94614) 와 1:1. Icon 을 중심으로 한 맨아이콘 버튼이다. 배경·테두리·radius 같은 버튼 크롬이 전혀 없고(ButtonWithIcon 과 다름), 우측 상단에 알림 배지(Dot 또는 BadgeNumber)를 선택적으로 얹는다. 기본 형태는 아이콘 단독이며 `badge` 를 생략하면 배지 노드를 렌더하지 않는다. 아이콘 전용이라 `aria-label` 이 필수. 색은 자유(`currentColor` 상속) — 루트 `className` 에 `text-icon-*` 를 준다. Figma 에 color·size·hover 축이 없어 hover 스타일은 없고 `focus-visible` opacity dip 만 있다(ClearButton 선례).',
      },
    },
  },
  args: {
    "aria-label": "알림",
    children: <Icon name="bell_01_line" />,
  },
  argTypes: {
    badge: {
      control: "inline-radio",
      options: [undefined, "dot", "number"],
    },
    count: { control: "number" },
    max: { control: "number" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)] text-icon-neutral-normal">
      <IconButton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: "알림" });
    await expect(btn).toBeInTheDocument();
    await expect(btn).toHaveAttribute("type", "button");
    await expect(btn).toHaveAttribute("data-badge", "none");
    await expect(canvasElement.querySelector("svg")).toBeInTheDocument();
  },
};

export const WithDotBadge: Story = {
  args: { badge: "dot" },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)] text-icon-neutral-normal">
      <IconButton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector(
      '[data-size="xs"][data-color="red"]',
    );
    await expect(dot).toBeInTheDocument();
    await expect(dot).toHaveClass("absolute", "-top-[var(--sz-2)]");
  },
};

export const WithNumberBadge: Story = {
  args: { badge: "number", count: 5 },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)] text-icon-neutral-normal">
      <IconButton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector('[data-size="xs"]');
    await expect(badge).toHaveTextContent("5");
  },
};

export const Disabled: Story = {
  args: { badge: "dot", disabled: true },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)] text-icon-neutral-normal">
      <IconButton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector("button")!;
    await expect(btn).toBeDisabled();
    await userEvent.click(btn);
    const iconWrap = btn.querySelector("span");
    await expect(iconWrap).toHaveClass("opacity-[var(--alpha-40)]");
  },
};

export const Playground: Story = {
  args: { badge: "number", count: 3, max: 99, disabled: false },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)] text-icon-neutral-normal">
      <IconButton {...args} />
    </div>
  ),
};
