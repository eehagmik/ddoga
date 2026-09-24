import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import type { MapPinColor, MapPinVariant } from "./MapPin";
import { MapPin } from "./MapPin";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-115940";

const COLORS: MapPinColor[] = ["normal", "brand"];
const VARIANTS: MapPinVariant[] = ["circle", "marker"];

const meta = {
  title: "Components/MapPin",
  component: MapPin,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / MapPin" (문서 캔버스 51405:115932, 메인 컴포넌트 프레임 51405:115940) 와 1:1. 지도 위에 위치를 표시하는 정적 프레젠테이션 컴포넌트 — 지도 SDK 통합·좌표 배치·클릭 이벤트는 범위 밖이며 호출부가 `className` 으로 절대 위치시켜 사용한다. `variant`(circle/marker) × `color`(normal/brand) 4 심볼뿐이고 hover/focus/disabled 축이 없다. `label` 은 Figma label+labelValue 를 presence 기반 문자열로 통합했고, 지도 배경 위 가독성을 위해 `border/inverse/dark`(흰색) + `borderWidth/sm` 토큰 기반 8방향 text-shadow 아웃라인을 항상 적용한다(`get_variable_defs` 재조회로 확인). Figma 실측 밖 확장인 `maxWidth` 로 줄바꿈 폭을 호출부가 지정할 수 있다(생략 시 폭 제한 없음).',
      },
    },
  },
  args: {
    color: "normal",
    variant: "circle",
    label: "Label",
  },
  argTypes: {
    color: { control: "inline-radio", options: COLORS },
    variant: { control: "inline-radio", options: VARIANTS },
    label: { control: "text" },
    maxWidth: { control: "text" },
  },
  render: (args) => (
    <div className="flex items-center justify-center bg-bg-neutral-normal p-[var(--sz-32)]">
      <MapPin {...args} />
    </div>
  ),
} satisfies Meta<typeof MapPin>;

export default meta;

type Story = StoryObj<typeof meta>;

/** variant=circle, color=normal — Figma 기본값. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const pin = canvasElement.querySelector('[data-name="MapPin"]');
    await expect(pin).not.toBeNull();
    await expect(pin).toHaveAttribute("data-color", "normal");
    await expect(pin).toHaveAttribute("data-variant", "circle");

    const circle = canvasElement.querySelector('[data-name="Circle"]');
    await expect(circle).not.toBeNull();
    await expect(circle).toHaveClass("bg-bg-danger-normal");

    const label = canvasElement.querySelector("span");
    await expect(label).toHaveTextContent("Label");
    // 흰색 텍스트 아웃라인(8방향 text-shadow, border/inverse/dark + borderWidth/xs)
    const textShadow = (label as HTMLElement)?.style.textShadow ?? "";
    await expect(textShadow.split(",")).toHaveLength(8);
    await expect(textShadow).toContain("var(--color-border-inverse-dark)");
  },
};

/** variant=circle, color=brand. */
export const CircleBrand: Story = {
  args: { color: "brand", variant: "circle" },
  play: async ({ canvasElement }) => {
    const circle = canvasElement.querySelector('[data-name="Circle"]');
    await expect(circle).toHaveClass("bg-bg-brand-normal");
  },
};

/** variant=marker, color=normal — 말풍선형 핀. */
export const MarkerNormal: Story = {
  args: { color: "normal", variant: "marker" },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-name="Pin"]');
    await expect(svg).not.toBeNull();
    await expect(svg).toHaveClass("text-icon-danger-normal");
  },
};

/** variant=marker, color=brand. */
export const MarkerBrand: Story = {
  args: { color: "brand", variant: "marker" },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-name="Pin"]');
    await expect(svg).toHaveClass("text-icon-brand-normal");
  },
};

/** label 을 생략하면 그래픽만 렌더된다. */
export const WithoutLabel: Story = {
  args: { label: undefined },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector("span");
    await expect(label).toBeNull();
  },
};

/** maxWidth 를 지정하면 라벨이 해당 폭에서 줄바꿈된다(break-words). 생략 시 폭 제한 없음. */
export const LongLabelWithMaxWidth: Story = {
  args: {
    label: "매우 긴 장소명 라벨 예시 텍스트",
    maxWidth: 110,
  },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector("span");
    await expect(label).toHaveClass("break-words");
    await expect(label).toHaveStyle({ maxWidth: "110px" });
  },
};

/** color × variant 4 조합을 나란히 비교(Figma 문서 프리뷰와 동일 구성). */
export const AllCombinations: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-[var(--sz-32)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {COLORS.map((color) =>
        VARIANTS.map((variant) => (
          <div
            key={`${color}-${variant}`}
            className="flex flex-col items-center gap-[var(--sz-8)]"
          >
            <code className="text-2xs text-typo-neutral-light">
              {color}/{variant}
            </code>
            <MapPin color={color} variant={variant} label="Label" />
          </div>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pins = canvasElement.querySelectorAll('[data-name="MapPin"]');
    await expect(pins).toHaveLength(4);
  },
};
