import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { Logo } from "./Logo";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51482-15127";

const meta = {
  title: "Brand/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / LOGO" (node 51482:15127) 와 1:1. `lockup`(symbol·wordmark·horizontal·vertical) × `tone`(color·white·transparentColor·transparentWhite) 매트릭스를 하나의 인라인 SVG 로 렌더한다. fill 은 `--color-logo-*` 토큰만 사용하고, `viewBox` + `width`/`height:auto` 로 종횡비를 고정한다.',
      },
    },
  },
  argTypes: {
    lockup: {
      control: "inline-radio",
      options: ["symbol", "wordmark", "horizontal", "vertical"],
    },
    tone: {
      control: "inline-radio",
      options: ["color", "white", "transparentColor", "transparentWhite"],
    },
    expand: { control: "boolean" },
    width: { control: "text" },
  },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

const LOCKUPS = ["symbol", "wordmark", "horizontal", "vertical"] as const;

export const Playground: Story = {
  args: { lockup: "horizontal", tone: "color", expand: false, width: 280 },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <Logo {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg[role="img"]');
    await expect(svg).toBeInTheDocument();
    await expect(svg).toHaveAttribute("data-lockup", "horizontal");
    await expect(svg).toHaveAttribute("data-tone", "color");
  },
};

export const AllLockups: Story = {
  render: () => (
    <div className="flex flex-col gap-(--sz-32) bg-bg-neutral-normal p-(--sz-32)">
      {LOCKUPS.map((lockup) => (
        <div key={lockup} className="flex flex-col gap-(--sz-8)">
          <code className="text-2xs text-typo-neutral-light">{lockup}</code>
          <Logo
            lockup={lockup}
            tone="color"
            width={lockup === "symbol" ? 72 : 260}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll('svg[role="img"]');
    await expect(svgs).toHaveLength(4);
    const lockups = Array.from(svgs).map((s) => s.getAttribute("data-lockup"));
    await expect(lockups).toEqual([
      "symbol",
      "wordmark",
      "horizontal",
      "vertical",
    ]);
  },
};
