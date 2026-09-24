import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Typography } from "./Typography";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=21-1978";

const meta = {
  title: "Tokens/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          '**원시**(Figma "Font", node 2111:2108): 서체 `--font-sans`(Pretendard), 두께 `--font-weight-normal`(Medium/500)·`--font-weight-bold`(Bold/700), 크기 `--text-<step>` 2xs~5xl 9단계(rem = px / 16, `text-<step>` 유틸 자동 생성 — 4xl 제거). **합성**(Figma "Typography", node 21:1978): `typo_*` 텍스트 스타일 25종을 `--text-<cat>-<n>[-bold]` + `--line-height`/`--letter-spacing`/`--font-weight` 컴패니언으로 등록해 `text-<cat>-<n>[-bold]` 유틸 하나에 네 속성을 묶는다(display / title / body / label / other). line-height 는 무단위 비율, letter-spacing 은 Figma % 값(normal -1% · bold -1.5%)을 em 으로 환산해 저장한다. 색상은 스타일에 포함하지 않고 `text-typo-*` 로 별도 지정한다(단, `other/*` 는 권장 색상 병기). **Pretendard 웹폰트 로딩은 후속 작업** — family 미리보기는 fallback 서체로 표시된다.',
      },
    },
  },
  argTypes: {
    section: {
      control: "inline-radio",
      options: [
        "family",
        "weight",
        "size",
        "display",
        "title",
        "body",
        "label",
        "other",
      ],
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

const SECTIONS = [
  "family",
  "weight",
  "size",
  "display",
  "title",
  "body",
  "label",
  "other",
];

export const All: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    for (const s of SECTIONS) {
      await expect(
        canvasElement.querySelector(`[data-section="${s}"]`),
      ).toBeInTheDocument();
    }
    await expect(canvasElement.querySelectorAll("[data-section]")).toHaveLength(
      8,
    );
    // family 1 + weight 2 + size 9 + display 1 + title 3 + body 12 + label 6 + other 3
    await expect(canvasElement.querySelectorAll("[data-token]")).toHaveLength(
      37,
    );
  },
};

export const Family: Story = {
  args: { section: "family" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-section]")).toHaveLength(
      1,
    );
    await expect(canvasElement.querySelectorAll("[data-token]")).toHaveLength(
      1,
    );
    await expect(canvas.getByText("--font-sans")).toBeInTheDocument();
  },
};

export const Weight: Story = {
  args: { section: "weight" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelectorAll('[data-token^="--font-weight-"]'),
    ).toHaveLength(2);
    await expect(canvas.getByText("--font-weight-bold")).toBeInTheDocument();
  },
};

export const Size: Story = {
  args: { section: "size" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvasElement.querySelector('[data-section="size"]');
    await expect(section?.querySelectorAll("[data-token]")).toHaveLength(9);
    await expect(canvas.getByText("--text-2xs")).toBeInTheDocument();
    await expect(canvas.getByText("--text-5xl")).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-token="--text-4xl"]'),
    ).toBeNull();
  },
};

export const Display: Story = {
  args: { section: "display" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvasElement.querySelector('[data-section="display"]');
    await expect(section?.querySelectorAll("[data-token]")).toHaveLength(1);
    await expect(canvas.getByText("typo_display_1")).toBeInTheDocument();
    await expect(canvas.getByText("--text-display-1")).toBeInTheDocument();
  },
};

export const Title: Story = {
  args: { section: "title" },
  play: async ({ canvasElement }) => {
    const section = canvasElement.querySelector('[data-section="title"]');
    await expect(section?.querySelectorAll("[data-token]")).toHaveLength(3);
    await expect(
      canvasElement.querySelector('[data-token="--text-title-2"]'),
    ).toBeInTheDocument();
  },
};

export const Body: Story = {
  args: { section: "body" },
  play: async ({ canvasElement }) => {
    const section = canvasElement.querySelector('[data-section="body"]');
    await expect(section?.querySelectorAll("[data-token]")).toHaveLength(12);
    const bold = canvasElement.querySelector(
      '[data-token="--text-body-1-bold"] span[style]',
    );
    await expect(bold?.getAttribute("style")).toContain(
      "var(--text-body-1-bold--font-weight)",
    );
  },
};

export const Label: Story = {
  args: { section: "label" },
  play: async ({ canvasElement }) => {
    const section = canvasElement.querySelector('[data-section="label"]');
    await expect(section?.querySelectorAll("[data-token]")).toHaveLength(6);
    await expect(
      canvasElement.querySelector('[data-token="--text-label-3-bold"]'),
    ).toBeInTheDocument();
  },
};

export const Other: Story = {
  args: { section: "other" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvasElement.querySelector('[data-section="other"]');
    await expect(section?.querySelectorAll("[data-token]")).toHaveLength(3);
    await expect(canvas.getByText("typo_other_storeCard")).toBeInTheDocument();
    const preview = canvasElement.querySelector(
      '[data-token="--text-other-store-card"] span[style]',
    );
    await expect(preview?.className).toContain("text-typo-neutral-subtle");
  },
};
