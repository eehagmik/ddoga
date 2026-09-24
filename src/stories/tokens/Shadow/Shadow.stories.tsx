import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Shadow } from "./Shadow";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=106-181";

const meta = {
  title: "Tokens/Shadow",
  component: Shadow,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Shadow" (node 106:181) 와 1:1. `--shadow-<group>-<step>` 로 등록되어 Tailwind `shadow-*` 유틸이 자동 생성된다. `black` · `greenGray` 는 drop shadow(xs~xl), `bottomNav` 는 상단 방향 단일 그림자, `borderNeutral` · `borderBrand` 는 inset 외곽선(xs/sm/md). 각 그룹은 Figma 의 "Preview" 프레임과 같은 예시 패널로 표시된다.',
      },
    },
  },
  argTypes: {
    section: {
      control: "inline-radio",
      options: [
        "black",
        "greenGray",
        "bottomNav",
        "borderNeutral",
        "borderBrand",
      ],
    },
  },
} satisfies Meta<typeof Shadow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    for (const g of [
      "black",
      "greenGray",
      "bottomNav",
      "borderNeutral",
      "borderBrand",
    ]) {
      await expect(
        canvasElement.querySelector(`[data-section="${g}"]`),
      ).toBeInTheDocument();
    }
    await expect(canvasElement.querySelectorAll("[data-token]")).toHaveLength(
      17,
    );
  },
};

export const Black: Story = {
  args: { section: "black" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-section]")).toHaveLength(
      1,
    );
    await expect(
      canvasElement.querySelectorAll('[data-token^="--shadow-black-"]'),
    ).toHaveLength(5);
    await expect(canvas.getByText("--shadow-black-xl")).toBeInTheDocument();
  },
};

export const GreenGray: Story = {
  args: { section: "greenGray" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelectorAll('[data-token^="--shadow-greenGray-"]'),
    ).toHaveLength(5);
    await expect(canvas.getByText("--shadow-greenGray-md")).toBeInTheDocument();
  },
};

export const BottomNav: Story = {
  args: { section: "bottomNav" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-token]")).toHaveLength(
      1,
    );
    await expect(canvas.getByText("--shadow-bottomNav")).toBeInTheDocument();
  },
};

export const BorderNeutral: Story = {
  args: { section: "borderNeutral" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelectorAll('[data-token^="--shadow-borderNeutral-"]'),
    ).toHaveLength(3);
    await expect(
      canvas.getByText("--shadow-borderNeutral-md"),
    ).toBeInTheDocument();
  },
};

export const BorderBrand: Story = {
  args: { section: "borderBrand" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelectorAll('[data-token^="--shadow-borderBrand-"]'),
    ).toHaveLength(3);
    await expect(
      canvas.getByText("--shadow-borderBrand-xs"),
    ).toBeInTheDocument();
  },
};
