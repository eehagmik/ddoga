import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import type { TabSize } from "./Tab";
import { Tab } from "./Tab";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%EB%98%90%EA%B0%80-3.0--Design-System?node-id=51405-133812";

const SIZES: TabSize[] = ["sm", "md"];

const meta = {
  title: "Components/Tab",
  component: Tab,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Tabs" 내부 `_parts/Tab` (node 51405:133812) 와 1:1. `Tabs` 컨테이너 안에 나열하는 밑줄 인디케이터형 탭 아이템이다. `size`(sm/md) × `selected`(false/true). `href` 를 넘기면 `<a>`, 넘기지 않으면 `<button>` 으로 렌더된다.',
      },
    },
  },
  args: {
    children: "라벨",
    size: "md",
    selected: false,
    onClick: fn(),
  },
  argTypes: {
    children: { control: "text" },
    size: { control: "inline-radio", options: SIZES },
    selected: { control: "boolean" },
    href: { control: "text" },
  },
} satisfies Meta<typeof Tab>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/** sm / md, 각각 unselected · selected. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-(--sz-16)">
      {SIZES.map((size) => (
        <div key={size} className="flex items-end gap-(--sz-4)">
          <Tab {...args} size={size} selected={false}>
            {size}
          </Tab>
          <Tab {...args} size={size} selected>
            {size}
          </Tab>
        </div>
      ))}
    </div>
  ),
};

/** 선택되지 않음 / 선택됨. */
export const Selected: Story = {
  render: (args) => (
    <div className="flex items-end gap-(--sz-16)">
      <Tab {...args} selected={false}>
        Off
      </Tab>
      <Tab {...args} selected>
        On
      </Tab>
    </div>
  ),
};

/** href 를 넘기면 `<a>` 로 렌더된다(`Tabs type="link"` 용). */
export const AsLink: Story = {
  args: { href: "#" },
};

/** href 없이 렌더하면 `<button>` 이다(`Tabs type="focus"` 용). */
export const AsButton: Story = {};

/** 클릭 시 onClick 이 호출되는지 검증(href 없는 button 케이스). */
export const ClicksCallOnClick: Story = {
  render: (args) => <Tab {...args}>라벨</Tab>,
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "라벨",
    });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
