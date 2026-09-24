import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { SemanticColors } from "./SemanticColors";

const meta = {
  title: "Tokens/SemanticColors",
  component: SemanticColors,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'Figma "또하나3.0 Design System / Sementic Color List" 와 1:1. `{UIElement}_{Role}_{Brightness}` 규칙, 값은 Primitive 참조.',
      },
    },
  },
  argTypes: {
    element: {
      control: "inline-radio",
      options: ["bg", "typo", "border", "icon", "shadow"],
    },
  },
} satisfies Meta<typeof SemanticColors>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const el of ["bg", "typo", "border", "icon", "shadow"]) {
      await expect(
        canvas.getByRole("heading", { name: el, level: 2 }),
      ).toBeInTheDocument();
    }
    await expect(
      canvasElement.querySelectorAll("[data-token]").length,
    ).toBeGreaterThan(100);
  },
};

export const Background: Story = {
  args: { element: "bg" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("bg-neutral-normal")).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll("[data-element]")).toHaveLength(
      1,
    );
  },
};

export const Typo: Story = {
  args: { element: "typo" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("typo-gradient-highlight"),
    ).toBeInTheDocument();
  },
};

export const Border: Story = {
  args: { element: "border" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("border-neutral-deepDark"),
    ).toBeInTheDocument();
  },
};

export const Icon: Story = {
  args: { element: "icon" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("icon-inverse-normal")).toBeInTheDocument();
  },
};

export const Shadow: Story = {
  args: { element: "shadow" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("shadow-greenGray-normal"),
    ).toBeInTheDocument();
  },
};
