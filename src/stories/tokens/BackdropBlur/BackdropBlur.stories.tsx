import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { BackdropBlur } from "./BackdropBlur";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=106-564";

const meta = {
  title: "Tokens/BackdropBlur",
  component: BackdropBlur,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / BackdropBlur" (node 106:564) 와 1:1. 넓은 면적의 UI 배경에 쓰는 흐림 효과다. `--blur-<name>` 로 등록되어 Tailwind `backdrop-blur-<name>` · `blur-<name>` 유틸이 자동 생성된다. `dim` (sz 8) 은 약한 흐림, `header` (sz 16) 은 강한 흐림. Tailwind 기본 blur 스케일은 `--blur-*: initial` 로 제거했다. 각 토큰은 대비가 큰 배경 위 반투명 유리 패널로 표시된다.',
      },
    },
  },
  argTypes: {
    section: {
      control: "inline-radio",
      options: ["dim", "header"],
    },
  },
} satisfies Meta<typeof BackdropBlur>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    for (const id of ["dim", "header"]) {
      await expect(
        canvasElement.querySelector(`[data-section="${id}"]`),
      ).toBeInTheDocument();
    }
    await expect(canvasElement.querySelectorAll("[data-token]")).toHaveLength(
      2,
    );
  },
};

export const Dim: Story = {
  args: { section: "dim" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-section]")).toHaveLength(
      1,
    );
    await expect(
      canvasElement.querySelector('[data-token="--blur-dim"]'),
    ).toBeInTheDocument();
    await expect(canvas.getByText("backdropBlur/dim")).toBeInTheDocument();
  },
};

export const Header: Story = {
  args: { section: "header" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-section]")).toHaveLength(
      1,
    );
    await expect(
      canvasElement.querySelector('[data-token="--blur-header"]'),
    ).toBeInTheDocument();
    await expect(canvas.getByText("backdropBlur/header")).toBeInTheDocument();
  },
};
