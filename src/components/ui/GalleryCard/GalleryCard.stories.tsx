import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { BlankGraphic } from "../BlankGraphic";
import type { GalleryCardRatio } from "./GalleryCard";
import { GalleryCard } from "./GalleryCard";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-14521";

const RATIOS: GalleryCardRatio[] = ["16:9", "1:1"];

/**
 * 썸네일 슬롯 데모 전용 — 실제 이미지는 호출부가 채운다(컴포넌트 자체는
 * 슬롯만 제공, Figma 원본도 슬롯이 완전히 비어 있음). 부모(Thumbnail area)가
 * 이미 aspect-ratio 를 갖고 슬롯은 absolute inset-0 라 `BlankGraphic` 은
 * `h-full w-full` 로 덮어써 부모 비율에 그대로 맞춘다.
 */
function renderBlank() {
  return <BlankGraphic className="h-full w-full" />;
}

const meta = {
  title: "Components/GalleryCard",
  component: GalleryCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Card" 문서 페이지(캔버스 51405:14293) 안의 GalleryCard 컴포넌트 셋(node 51405:14521) 과 1:1. 게시글 사진 썸네일 카드. `ratio`("16:9"/"1:1")가 유일한 variant 축이고 `badge`/`multipleIcon`/`title` 은 boolean 토글이다. 카드 루트는 ImageCard/TextCard 와 동일하게 항상 `role="button" tabIndex={0}` 이라 전체가 클릭 가능하며, Enter/Space 로도 트리거된다(`onClick` 은 선택 — 넘기면 호출됨). 썸네일 슬롯(`children`)은 기본값이 없으며, Figma 슬롯도 비어 있어 Storybook 데모에서만 기존 `BlankGraphic` 을 채워 넣는다. 배지는 기존 `Dot`(size="md" color="red" isBorder), 복수 사진 아이콘은 기존 `Icon`(name="copy_03_solid")을 재사용한다. 루트는 `w-full` 이며 실제 폭은 호출부(그리드/컨테이너)가 결정한다(Figma 150px 고정폭은 캔버스 레이아웃 아티팩트라 하드코딩하지 않음).',
      },
    },
  },
  args: {
    ratio: "16:9",
    badge: true,
    multipleIcon: true,
    title: true,
    titleValue: "Title Text",
    children: renderBlank(),
  },
  argTypes: {
    ratio: { control: "inline-radio", options: RATIOS },
    badge: { control: "boolean" },
    multipleIcon: { control: "boolean" },
    title: { control: "boolean" },
    titleValue: { control: "text" },
    children: { table: { disable: true } },
    onClick: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 160 }}>
      <GalleryCard {...args} />
    </div>
  ),
} satisfies Meta<typeof GalleryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * ratio=16:9 — Figma 기본값. 카드 전체가 항상 클릭 가능하다(ImageCard/TextCard
 * 와 동일 컨벤션 — onClick 유무와 무관하게 role=button). play 에서 레이아웃/
 * 타이틀/배지/아이콘을 검증한다.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-name="GalleryCard"]');
    await expect(card).not.toBeNull();
    await expect(card).toHaveAttribute("role", "button");
    await expect(card).toHaveAttribute("tabIndex", "0");

    const thumbnail = canvasElement.querySelector(
      '[data-name="Thumbnail area"]',
    );
    await expect(thumbnail).toHaveClass("aspect-video");

    await expect(
      within(canvasElement).getByText("Title Text"),
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-name="multiple icon"]'),
    ).not.toBeNull();
  },
};

/** ratio=1:1 — 정사각 썸네일. */
export const Square: Story = {
  args: { ratio: "1:1" },
  play: async ({ canvasElement }) => {
    const thumbnail = canvasElement.querySelector(
      '[data-name="Thumbnail area"]',
    );
    await expect(thumbnail).toHaveClass("aspect-square");
  },
};

/** badge=false — 우상단 신규 표시 배지(Dot)를 렌더하지 않는다. */
export const NoBadge: Story = {
  args: { badge: false },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-size][data-color]"),
    ).toBeNull();
  },
};

/** multipleIcon=false — 우하단 복수 사진 아이콘을 렌더하지 않는다. */
export const NoMultipleIcon: Story = {
  args: { multipleIcon: false },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-name="multiple icon"]'),
    ).toBeNull();
  },
};

/** title=false — 타이틀 텍스트를 렌더하지 않는다. */
export const NoTitle: Story = {
  args: { title: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText("Title Text"),
    ).not.toBeInTheDocument();
  },
};

/**
 * focus — 루트 80% 투명도(CSS 의사클래스, Figma 근거 없음 — 카드 클릭 가능 확장에
 * 맞춰 TextCard/ImageCard 와 동일한 --alpha-80 으로 통일, 포커스 링 대신 dip).
 */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector(
      '[data-name="GalleryCard"]',
    ) as HTMLElement;
    await expect(card).toHaveClass("focus-visible:opacity-[var(--alpha-80)]");

    card.focus();
    await expect(card).toHaveFocus();
  },
};

/**
 * onClick 지정 — 카드는 기본적으로 항상 클릭 가능하지만(role=button), onClick
 * 을 넘겨야 실제로 클릭/Enter/Space 시 핸들러가 호출된다.
 */
export const Clickable: Story = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const card = canvasElement.querySelector(
      '[data-name="GalleryCard"]',
    ) as HTMLElement;

    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    card.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

/** ratio × badge × multipleIcon 조합을 나란히 비교(Figma 문서 프리뷰와 동일 구성). */
export const AllCombinations: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-[var(--sz-20)]">
      {RATIOS.map((ratio) =>
        [true, false].map((badgeValue) => (
          <div key={`${ratio}-${badgeValue}`} style={{ width: 160 }}>
            <GalleryCard
              {...args}
              ratio={ratio}
              badge={badgeValue}
              titleValue={`${ratio} / badge=${badgeValue}`}
            >
              {renderBlank()}
            </GalleryCard>
          </div>
        )),
      )}
    </div>
  ),
};
