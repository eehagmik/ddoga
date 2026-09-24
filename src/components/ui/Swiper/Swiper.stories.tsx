import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { Swiper } from "./Swiper";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-132693";

/** 슬라이드 콘텐츠는 실제 그래픽 대신 색상 박스 placeholder 로 대체한다(순번 표시). */
const SLIDE_TONE_CLASS = [
  "bg-bg-brand-light",
  "bg-bg-info-light",
  "bg-bg-warning-light",
] as const;

function renderSlides(count: number): ReactNode[] {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`flex size-full items-center justify-center ${SLIDE_TONE_CLASS[index % SLIDE_TONE_CLASS.length]}`}
    >
      <span className="text-[length:var(--text-2xl)] font-bold text-typo-neutral-normal">
        {index + 1}
      </span>
    </div>
  ));
}

const meta = {
  title: "Components/Swiper",
  component: Swiper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Swiper" (node 51405:132693) 와 1:1. `variant`(round/sharp) × `indicator`(none/direction/chip) × `ratio`(16:9/1:1) 12가지 조합을 지원하는 슬라이드 캐러셀이다. 스와이프 엔진은 `swiper` 패키지(`Autoplay` 모듈만 사용)를 쓰며, 슬라이드가 2개 이상이면 5초 간격 자동 재생 + 무한 루프가 켜진다. `DirectionIndicator`/`ChipIndicator`/`CountLabel` 은 Figma 상 별도 컴포넌트지만 이번 구현 범위에서는 `Swiper` 내부에 인라인했다.',
      },
    },
  },
  // 컴포넌트 루트는 w-full(부모 폭 기준)이라, Storybook 프리뷰에서는 또가 앱의 최소
  // 지원 폭(360px)을 기준으로 고정 폭 컨테이너로 감싼다(데모 전용 — `BoardAccordion`/
  // `HorizontalMenuButton` 선례와 동일 패턴). 단, variant="round" 의 이미지 밴드는
  // full-bleed(`w-screen`)라 이 320px wrapper 폭과 무관하게 실제 Storybook 프리뷰
  // iframe 뷰포트 전체 폭을 그대로 쓴다 — 의도된 동작이다(round 스펙 자체가 화면
  // 전체 너비 사용).
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: "round",
    indicator: "none",
    ratio: "16:9",
    children: renderSlides(3),
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["round", "sharp"],
    },
    indicator: {
      control: "inline-radio",
      options: ["none", "direction", "chip"],
    },
    ratio: {
      control: "inline-radio",
      options: ["16:9", "1:1"],
    },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof Swiper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * 이전/다음 버튼 클릭 시 `CountLabel` 이 실제로 갱신되는지 확인하는 play function.
 * 자동재생과 겹치지 않도록 클릭 직후 값을 바로 검증한다.
 */
export const DirectionInteraction: Story = {
  args: { variant: "round", indicator: "direction", ratio: "16:9" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByRole("button", { name: "다음 슬라이드" });
    const prevButton = canvas.getByRole("button", { name: "이전 슬라이드" });
    const countRegion = canvasElement.querySelector('[aria-live="polite"]')!;

    await expect(countRegion).toHaveTextContent("1/3Unit");

    await userEvent.click(nextButton);
    await waitFor(() => expect(countRegion).toHaveTextContent("2/3Unit"));

    await userEvent.click(prevButton);
    await waitFor(() => expect(countRegion).toHaveTextContent("1/3Unit"));
  },
};

/** 단일 슬라이드일 때 인디케이터/자동재생 없이 정적으로 렌더되는지 보여주는 스토리. */
export const SingleSlide: Story = {
  args: {
    variant: "round",
    indicator: "direction",
    ratio: "16:9",
    children: renderSlides(1),
  },
};
