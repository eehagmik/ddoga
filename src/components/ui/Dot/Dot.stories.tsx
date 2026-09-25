import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { Dot } from "./Dot";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-83355";

const SIZES = ["xs", "sm", "md"] as const;
const COLORS = ["red", "brand"] as const;

const meta = {
  title: "Components/Dot",
  component: Dot,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Dot" (node 51405:83355) 와 1:1. 새로운 알림·업데이트·미확인 상태를 나타내는 순수 시각 인디케이터(작은 원형 점)다. 텍스트·아이콘·자식·인터랙션 상태가 없으며 `<span>` 하나만 렌더한다. 벨 아이콘 등 host UI 요소 우측 상단에 오버레이로 얹어 쓰며, 배치는 호출부 책임이라 `className` 으로 제어한다. `isBorder=true` 일 때만 1px 흰색 외곽선을 크기 변화 없이 덧그린다.',
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md"] },
    color: { control: "inline-radio", options: ["red", "brand"] },
    isBorder: { control: "boolean" },
  },
} satisfies Meta<typeof Dot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { size: "xs", color: "red", isBorder: false },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <Dot {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector("[data-size]");
    await expect(dot).toBeInTheDocument();
    await expect(dot).toHaveAttribute("data-size", "xs");
    await expect(dot).toHaveAttribute("data-color", "red");
    await expect(dot).toHaveClass("size-(--sz-6)", "bg-bg-danger-normal");
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-(--sz-8)">
          <code className="text-2xs text-typo-neutral-light">{size}</code>
          <Dot size={size} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dots = canvasElement.querySelectorAll("[data-size]");
    await expect(dots).toHaveLength(3);
    const sizes = Array.from(dots).map((d) => d.getAttribute("data-size"));
    await expect(sizes).toEqual(["xs", "sm", "md"]);
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {COLORS.map((color) => (
        <div key={color} className="flex flex-col items-center gap-(--sz-8)">
          <code className="text-2xs text-typo-neutral-light">{color}</code>
          <Dot size="md" color={color} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dots = canvasElement.querySelectorAll("[data-color]");
    const colors = Array.from(dots).map((d) => d.getAttribute("data-color"));
    await expect(colors).toEqual(["red", "brand"]);
  },
};

export const Borders: Story = {
  name: "Borders (유사색 배경 위)",
  render: () => (
    <div className="flex items-center gap-(--sz-24) bg-bg-danger-normal p-(--sz-32)">
      <div className="flex flex-col items-center gap-(--sz-8)">
        <code className="text-2xs text-typo-inverse-normal">isBorder off</code>
        <Dot size="md" color="red" />
      </div>
      <div className="flex flex-col items-center gap-(--sz-8)">
        <code className="text-2xs text-typo-inverse-normal">isBorder on</code>
        <Dot size="md" color="red" isBorder />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dots = canvasElement.querySelectorAll("[data-border]");
    await expect(dots[0]).toHaveAttribute("data-border", "false");
    await expect(dots[1]).toHaveAttribute("data-border", "true");
    await expect(dots[1]).toHaveClass(
      "border-xs",
      "border-border-inverse-dark",
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <div className="flex flex-col gap-(--sz-16)">
        {COLORS.map((color) => (
          <div key={color} className="flex items-end gap-(--sz-24)">
            {SIZES.map((size) => (
              <div
                key={`${color}-${size}`}
                className="flex flex-col items-center gap-(--sz-8)"
              >
                <code className="text-2xs text-typo-neutral-light">
                  {color}/{size}
                </code>
                <div className="flex items-end gap-(--sz-8)">
                  <Dot size={size} color={color} />
                  <Dot size={size} color={color} isBorder />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dots = canvasElement.querySelectorAll("[data-size]");
    await expect(dots).toHaveLength(12);
    const bordered = canvasElement.querySelectorAll('[data-border="true"]');
    await expect(bordered).toHaveLength(6);
  },
};
