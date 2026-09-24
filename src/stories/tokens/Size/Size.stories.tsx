import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Size } from "./Size";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=8-2887";

const meta = {
  title: "Tokens/Size",
  component: Size,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Size" (node 8:2887) 와 1:1. 티셔츠 단계 없이 `--sz-<N>`(N = px) 숫자 값을 자유롭게 적용한다. `radius` · `borderWidth` 는 `sz` 를 참조하는 Semantic 별칭.',
      },
    },
  },
  argTypes: {
    section: {
      control: "inline-radio",
      options: ["sz", "radius", "borderWidth"],
    },
  },
} satisfies Meta<typeof Size>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    for (const s of ["sz", "radius", "borderWidth"]) {
      await expect(
        canvasElement.querySelector(`[data-section="${s}"]`),
      ).toBeInTheDocument();
    }
    await expect(
      canvasElement.querySelectorAll('[data-token^="--sz-"]'),
    ).toHaveLength(53);
  },
};

export const Sz: Story = {
  args: { section: "sz" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-section]")).toHaveLength(
      1,
    );
    await expect(canvas.getByText("--sz-16")).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-token="--sz-9999"]'),
    ).toBeInTheDocument();
  },
};

export const Radius: Story = {
  args: { section: "radius" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelectorAll('[data-token^="--radius-"]'),
    ).toHaveLength(8);
    await expect(canvas.getByText("--radius-circle")).toBeInTheDocument();
  },
};

export const BorderWidth: Story = {
  args: { section: "borderWidth" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelectorAll('[data-token^="--border-width-"]'),
    ).toHaveLength(6);
    await expect(canvas.getByText("--border-width-2xs")).toBeInTheDocument();
  },
};
