import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { BlankGraphic } from "../BlankGraphic";
import { VerticalMenuButton } from "../VerticalMenuButton";
import type { ShortcutListColumn } from "./ShortcutList";
import { ShortcutList } from "./ShortcutList";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-131245";

const COLUMNS: ShortcutListColumn[] = ["3", "4", "5"];

function renderItems(count: number) {
  return Array.from({ length: count }, (_, i) => (
    <VerticalMenuButton key={i} size="lg" label={`메뉴 ${i + 1}`}>
      <BlankGraphic />
    </VerticalMenuButton>
  ));
}

const meta = {
  title: "Components/ShortcutList",
  component: ShortcutList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / ShortcutList" (node 51405:131245)와 1:1. VerticalMenuButton(size="lg") 등을 grid 로 배치하는 레이아웃 컨테이너 — variant 축은 `column`(3/4/5) 하나뿐이며, gap 은 16px(--sz-16) 고정이다. Figma 문서 심볼은 3×3/4×3/5×3(행 3 고정) 예시로 구성되어 있지만 문서화용 샘플일 뿐이라, 행 개수는 하드코딩하지 않고 children 개수에 따라 grid 가 자동으로 늘어나도록 구현했다.',
      },
    },
  },
  args: {
    column: "3",
    children: renderItems(9),
  },
  argTypes: {
    column: { control: "inline-radio", options: COLUMNS },
    children: { control: false, table: { type: { summary: "ReactNode" } } },
  },
} satisfies Meta<typeof ShortcutList>;

export default meta;

type Story = StoryObj<typeof meta>;

/** column="3" — Figma 기본 예시(9개 아이템, 3×3). */
export const Default: Story = {
  args: { column: "3", children: renderItems(9) },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[data-column]");
    await expect(root).toHaveAttribute("data-column", "3");
    await expect(root).toHaveClass("grid-cols-[repeat(3,minmax(0,1fr))]");

    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons).toHaveLength(9);
  },
};

/** column="4" — 12개 아이템(4×3) 예시. */
export const Column4: Story = {
  args: { column: "4", children: renderItems(12) },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[data-column]");
    await expect(root).toHaveAttribute("data-column", "4");
    await expect(root).toHaveClass("grid-cols-[repeat(4,minmax(0,1fr))]");
  },
};

/** column="5" — 15개 아이템(5×3) 예시. */
export const Column5: Story = {
  args: { column: "5", children: renderItems(15) },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[data-column]");
    await expect(root).toHaveAttribute("data-column", "5");
    await expect(root).toHaveClass("grid-cols-[repeat(5,minmax(0,1fr))]");
  },
};

/** 행 개수는 하드코딩되지 않으므로, 3열에 아이템 20개를 넣으면 자동으로 7행까지 늘어난다. */
export const ManyItems: Story = {
  args: { column: "3", children: renderItems(20) },
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons).toHaveLength(20);
  },
};
