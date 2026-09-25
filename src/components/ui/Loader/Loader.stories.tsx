import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { Loader } from "./Loader";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-114633";

const COLORS = ["brand", "white"] as const;
const SIZES = ["sm", "md"] as const;

const meta = {
  title: "Components/Loader",
  component: Loader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Loader" (node 51405:114633) 를 근사 재현. 서버 응답 대기 · 당겨서 새로고침 · 무한 스크롤 등 로딩 상태를 알리는 순수 시각 인디케이터다. 트랙 링 위에 인디케이터 호를 겹친 2레이어 구조로, 1초에 한 바퀴 회전한다. SVG path 는 정밀 재현하지 않고 두께·색상·회전만 반영하며, 색·크기·두께·투명도는 전부 디자인 토큰으로만 지정한다. `color="white"` 는 어두운 배경 전용이다.',
      },
    },
  },
  argTypes: {
    color: { control: "inline-radio", options: ["brand", "white"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    label: { control: "text" },
  },
} satisfies Meta<typeof Loader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { color: "brand", size: "md" },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <Loader {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const loader = canvasElement.querySelector('[role="status"]');
    await expect(loader).toBeInTheDocument();
    await expect(loader).toHaveAttribute("data-color", "brand");
    await expect(loader).toHaveAttribute("data-size", "md");
    await expect(loader).toHaveClass("size-(--sz-50)");
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-(--sz-24)">
      <div className="flex flex-col items-center gap-(--sz-8) bg-bg-neutral-normal p-(--sz-32)">
        <code className="text-2xs text-typo-neutral-light">brand</code>
        <Loader color="brand" size="md" />
      </div>
      <div className="flex flex-col items-center gap-(--sz-8) bg-bg-inverse-normal p-(--sz-32)">
        <code className="text-2xs text-typo-inverse-normal">white</code>
        <Loader color="white" size="md" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const loaders = canvasElement.querySelectorAll('[role="status"]');
    await expect(loaders).toHaveLength(2);
    const colors = Array.from(loaders).map((l) => l.getAttribute("data-color"));
    await expect(colors).toEqual(["brand", "white"]);
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-(--sz-8)">
          <code className="text-2xs text-typo-neutral-light">{size}</code>
          <Loader size={size} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const loaders = canvasElement.querySelectorAll('[role="status"]');
    await expect(loaders).toHaveLength(2);
    const sizes = Array.from(loaders).map((l) => l.getAttribute("data-size"));
    await expect(sizes).toEqual(["sm", "md"]);
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-(--sz-16)">
      {COLORS.map((color) => (
        <div
          key={color}
          className={[
            "flex items-center gap-(--sz-24) p-(--sz-32)",
            color === "white" ? "bg-bg-inverse-normal" : "bg-bg-neutral-normal",
          ].join(" ")}
        >
          {SIZES.map((size) => (
            <div
              key={`${color}-${size}`}
              className="flex flex-col items-center gap-(--sz-8)"
            >
              <code
                className={[
                  "text-2xs",
                  color === "white"
                    ? "text-typo-inverse-normal"
                    : "text-typo-neutral-light",
                ].join(" ")}
              >
                {color}/{size}
              </code>
              <Loader color={color} size={size} />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const loaders = canvasElement.querySelectorAll('[role="status"]');
    await expect(loaders).toHaveLength(4);
  },
};
