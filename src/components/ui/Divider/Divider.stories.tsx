import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { expect } from "@storybook/test";

import { Divider } from "./Divider";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-75932";

const meta = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Divider" (node 51405:75932) 와 1:1. 콘텐츠 블록·섹션을 구분하는 선이다. `orientation`(horizontal·vertical) × `thickness`(thin 1px · thick 8px) 조합만 있으며 라벨·상태 variant 는 없다. 색은 `--color-bg-overlay-blackSubtle`, 두께는 `--sz-1`/`--sz-8` 토큰만 사용한다. 길이는 부모에 맞춰 `w-full`/`h-full` 로 늘어난다.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    thickness: { control: "inline-radio", options: ["thin", "thick"] },
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Figma 320px 프레임을 재현하는 데모 래퍼 (컴포넌트 자체는 w-full). */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-(--sz-320) bg-bg-neutral-normal p-(--sz-32)">
      {children}
    </div>
  );
}

export const Playground: Story = {
  args: {
    orientation: "horizontal",
    thickness: "thin",
  },
  render: (args) => (
    <Frame>
      <Divider {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[role="separator"]');
    await expect(root).toBeInTheDocument();
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-thickness", "thin");
    await expect(root).toHaveAttribute("aria-orientation", "horizontal");
  },
};

export const Horizontal: Story = {
  name: "가로선 (세로 스택 구분)",
  render: () => (
    <Frame>
      <div className="flex flex-col gap-(--sz-16)">
        <div className="text-body-6 text-typo-neutral-subtle">
          첫 번째 콘텐츠 블록
        </div>
        <Divider orientation="horizontal" thickness="thin" />
        <div className="text-body-6 text-typo-neutral-subtle">
          두 번째 콘텐츠 블록
        </div>
        <Divider orientation="horizontal" thickness="thick" />
        <div className="text-body-6 text-typo-neutral-subtle">
          세 번째 콘텐츠 블록
        </div>
      </div>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll('[role="separator"]');
    await expect(roots).toHaveLength(2);
    await expect(
      Array.from(roots).map((r) => r.getAttribute("data-thickness")),
    ).toEqual(["thin", "thick"]);
    await expect(roots[0]).toHaveClass("h-(--sz-1)", "w-full");
    await expect(roots[1]).toHaveClass("h-(--sz-8)", "w-full");
  },
};

export const Vertical: Story = {
  name: "세로선 (가로 배치 구분)",
  render: () => (
    <Frame>
      <div className="flex h-(--sz-32) items-stretch gap-(--sz-16)">
        <div className="text-body-6 text-typo-neutral-subtle">왼쪽</div>
        <Divider orientation="vertical" thickness="thin" />
        <div className="text-body-6 text-typo-neutral-subtle">가운데</div>
        <Divider orientation="vertical" thickness="thick" />
        <div className="text-body-6 text-typo-neutral-subtle">오른쪽</div>
      </div>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll('[role="separator"]');
    await expect(roots).toHaveLength(2);
    await expect(
      Array.from(roots).map((r) => r.getAttribute("aria-orientation")),
    ).toEqual(["vertical", "vertical"]);
    await expect(roots[0]).toHaveClass("w-(--sz-1)", "h-full");
    await expect(roots[1]).toHaveClass("w-(--sz-8)", "h-full");
  },
};
