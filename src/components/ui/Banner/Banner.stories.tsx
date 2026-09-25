import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import type { BannerRatio, BannerVariant } from "./Banner";
import { Banner } from "./Banner";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-7725";

const VARIANTS: BannerVariant[] = ["round", "sharp"];
const RATIOS: BannerRatio[] = ["16:9", "4:1"];

const meta = {
  title: "Components/Banner",
  component: Banner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System" 문서 페이지(캔버스 51405:7223) 안의 Banner 컴포넌트(메인 컴포넌트 프레임 51405:7725) 와 1:1. 카드 리스트 사이에 끼워 넣는 광고/공지 콘텐츠 슬롯 컨테이너. `variant`("round"|"sharp") × `ratio`("16:9"|"4:1") 4 심볼뿐이며 state(hover/focus) 축은 없다(정적 컨테이너). `ratio` 값이 곧 CSS aspect-ratio 로 쓰여(320:180=16/9, 320:80=4/1) 폭 고정 없이 `w-full` + `aspect-*` 로 구현했다(Figma 캔버스 실측 폭 320px 은 문서화용 고정 프레임이라 하드코딩하지 않음). `children` 슬롯을 생략하면 Figma 기본 플레이스홀더에 대응하는 기존 `BlankGraphic` 을 기본 콘텐츠로 렌더한다.',
      },
    },
  },
  args: {
    variant: "round",
    ratio: "16:9",
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    ratio: { control: "inline-radio", options: RATIOS },
    children: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Banner {...args} />
    </div>
  ),
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

/** variant=round, ratio=16:9 — Figma 기본값. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const banner = canvasElement.querySelector('[data-name="Banner"]');
    await expect(banner).not.toBeNull();
    await expect(banner).toHaveClass("aspect-[16/9]");
    await expect(banner).toHaveClass("rounded-2xl");
  },
};

/** variant=sharp, ratio=16:9 — 모서리 없음. */
export const SharpWide: Story = {
  args: { variant: "sharp", ratio: "16:9" },
  play: async ({ canvasElement }) => {
    const banner = canvasElement.querySelector('[data-name="Banner"]');
    await expect(banner).not.toHaveClass("rounded-2xl");
    await expect(banner).toHaveClass("aspect-[16/9]");
  },
};

/** variant=round, ratio=4:1 — 가로로 얇은 배너. */
export const RoundWide41: Story = {
  args: { variant: "round", ratio: "4:1" },
  play: async ({ canvasElement }) => {
    const banner = canvasElement.querySelector('[data-name="Banner"]');
    await expect(banner).toHaveClass("aspect-[4/1]");
    await expect(banner).toHaveClass("rounded-2xl");
  },
};

/** variant=sharp, ratio=4:1 — 모서리 없는 얇은 배너. */
export const SharpWide41: Story = {
  args: { variant: "sharp", ratio: "4:1" },
  play: async ({ canvasElement }) => {
    const banner = canvasElement.querySelector('[data-name="Banner"]');
    await expect(banner).not.toHaveClass("rounded-2xl");
    await expect(banner).toHaveClass("aspect-[4/1]");
  },
};

/** children 을 직접 채우면 기본 BlankGraphic 대신 그대로 렌더된다. */
export const CustomContent: Story = {
  args: {
    children: (
      <img
        alt="banner"
        className="h-full w-full object-cover"
        src="https://placehold.co/320x180"
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector("img");
    await expect(image).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-blank="graphic"]'),
    ).toBeNull();
  },
};

/** variant × ratio 4가지 조합을 나란히 비교(Figma 문서 프리뷰와 동일 구성). */
export const AllCombinations: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-(--sz-20)">
      {VARIANTS.map((variant) =>
        RATIOS.map((ratio) => (
          <div key={`${variant}-${ratio}`} style={{ width: 320 }}>
            <Banner variant={variant} ratio={ratio} />
          </div>
        )),
      )}
    </div>
  ),
};
