import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { ImagePreview } from "./ImagePreview";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-디도카3.0--Design-System?node-id=51405-99214";

/** 슬라이드 콘텐츠는 실제 이미지 대신 색상 박스 placeholder 로 대체한다(순번 표시). */
const SLIDE_TONE_CLASS = [
  "bg-bg-brand-light",
  "bg-bg-info-light",
  "bg-bg-warning-light",
] as const;

function renderSlides(count: number) {
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
  title: "Components/ImagePreview",
  component: ImagePreview,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / ImagePreview" (node 51405:99214, 360×800 단일 프레임, variant 없음) 와 1:1. 이미지를 풀스크린으로 넘겨보는 뷰어로, `Swiper` 와 동일한 스와이프 엔진(`swiper/react`)을 직접 사용하되 `Swiper.tsx` 는 건드리지 않는다(고정 비율 제약 때문에 그대로 합성할 수 없었음 — 컴포넌트 상단 주석 참고). 하단 중앙에 `ChipIndicator`(`type="onlyCount"`)로 "1 / N" 카운트를 보여주고, 우측 상단 `IconButton` 으로 닫는다. OS 상태바/내비게이션 바는 Figma 데모용이라 구현 범위에서 제외했다.',
      },
    },
  },
  args: {
    onClose: fn(),
    children: renderSlides(3),
  },
  argTypes: {
    onClose: { action: "close" },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof ImagePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 슬라이드 3장 — 기본 형태. */
export const Playground: Story = {};

/** 슬라이드 1장 — 인디케이터는 렌더되지만 스와이프는 의미가 없다(loop 도 꺼짐). */
export const SingleImage: Story = {
  args: { children: renderSlides(1) },
  play: async ({ canvasElement }) => {
    const chip = canvasElement.querySelector('[data-type="onlyCount"]');
    await expect(chip).toHaveTextContent("1/1");
  },
};

/**
 * 닫기 버튼 클릭 시 `onClose` 가 호출되는지, 카운트 인디케이터가 "1 / 3" 형태로
 * 렌더되는지 확인하는 play function.
 */
export const CloseInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvasElement.querySelector('[data-type="onlyCount"]');
    await expect(chip).toHaveTextContent("1/3");

    const closeButton = canvas.getByRole("button", { name: "닫기" });
    await userEvent.click(closeButton);
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
  },
};

/** `role="dialog"` + `aria-label` 이 정상적으로 노출되는지 확인. */
export const AccessibleName: Story = {
  args: { "aria-label": "상품 이미지 미리보기" },
  play: async ({ canvasElement }) => {
    const dialog = canvasElement.querySelector('[role="dialog"]');
    await expect(dialog).toHaveAttribute("aria-label", "상품 이미지 미리보기");
  },
};
