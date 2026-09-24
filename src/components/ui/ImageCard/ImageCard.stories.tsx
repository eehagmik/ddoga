import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { BlankGraphic } from "../BlankGraphic";
import type { ImageCardRatio } from "./ImageCard";
import { ImageCard } from "./ImageCard";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-14482";

const RATIOS: ImageCardRatio[] = ["16:9", "1:1"];

/**
 * 이미지 슬롯 데모 전용 — 실제 이미지는 호출부가 채운다(컴포넌트 자체는 슬롯만 제공,
 * Figma 원본도 슬롯이 완전히 비어 있음). 부모(Image area)가 이미 `aspect-ratio` 를
 * 갖고 있어 `BlankGraphic` 자체의 비율은 `h-full w-full` 로 덮어써 부모 비율에
 * 그대로 맞춘다(비율 이중 지정 충돌 방지).
 */
function renderBlank() {
  return <BlankGraphic className="h-full w-full" />;
}

const meta = {
  title: "Components/ImageCard",
  component: ImageCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Card" 문서 페이지(캔버스 51405:14293) 안의 ImageCard(node 51405:14482) 와 1:1. 이미지 위에 타이틀 오버레이 + 하단 날짜·좋아요 바를 붙이는 카드. `ratio`("16:9"/"1:1") × `bottom`(boolean) 축만 있고 카드 레벨 hover/focus 시각 상태는 없다(인터랙션은 내부 `LikeToggleWithLabel` 뿐). 카드 루트는 TextCard 와 동일하게 항상 `role="button" tabIndex={0}` 이라 전체가 클릭 가능하며, Enter/Space 로도 트리거된다(`onClick` 은 선택 — 넘기면 호출됨). 이미지 슬롯(`children`)은 기본값이 없으며, Figma 슬롯도 비어 있어 Storybook 데모에서만 기존 `BlankGraphic` 을 채워 넣는다(슬롯은 title/Dim 과 동일하게 absolute 레이어라 children 의 실제 크기가 카드의 `ratio` 를 밀어내지 않는다). 딤은 기존 `Dim`(variant="gradient"), 좋아요 버튼은 기존 `LikeToggleWithLabel`(2026-09-19 Figma 갱신 — appearance="transparent", color="neutralLight", label 생략 + aria-label="좋아요", count=likeCount) 을 재사용한다.',
      },
    },
  },
  args: {
    ratio: "16:9",
    bottom: true,
    title: true,
    titleValue: "Title Text",
    dim: true,
    postedTime: true,
    postedTimeValue: "3일",
    likeCount: 0,
    children: renderBlank(),
  },
  argTypes: {
    ratio: { control: "inline-radio", options: RATIOS },
    bottom: { control: "boolean" },
    title: { control: "boolean" },
    titleValue: { control: "text" },
    dim: { control: "boolean" },
    postedTime: { control: "boolean" },
    postedTimeValue: { control: "text" },
    likeCount: { control: "number" },
    liked: { control: "boolean" },
    defaultLiked: { control: "boolean" },
    children: { table: { disable: true } },
    onLikeChange: { table: { disable: true } },
  },
  // decorators(메타 레벨)가 아니라 render 로 폭을 감싼다 — decorators 는 story 가
  // 자체 render 를 정의해도(AllCombinations 처럼) 항상 바깥을 추가로 감싸 버려서,
  // 카드 2개를 나란히 놓는 grid 의 실제 가용 폭이 320px 로 짓눌려 grid-cols-2 트랙이
  // 150px 씩으로 계산되고 각 카드(고정 320px)가 서로 겹치는 버그가 있었다
  // (2026-09-19 발견·수정). render 는 story 가 자체 정의하면 완전히 대체되므로
  // AllCombinations 는 이 폭 래퍼 없이 자기 grid 폭을 그대로 쓴다.
  render: (args) => (
    <div style={{ width: 320 }}>
      <ImageCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ImageCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * ratio=16:9, bottom=true — Figma 기본값. 카드 전체가 항상 클릭 가능하다(TextCard
 * 와 동일 컨벤션 — onClick 유무와 무관하게 role=button). play 에서 레이아웃/타이틀/
 * 카운트를 검증한다.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-name="ImageCard"]');
    await expect(card).not.toBeNull();
    await expect(card).toHaveAttribute("role", "button");
    await expect(card).toHaveAttribute("tabIndex", "0");

    const imageArea = canvasElement.querySelector('[data-name="Image area"]');
    await expect(imageArea).toHaveClass("aspect-[16/9]");

    await expect(
      within(canvasElement).getByText("Title Text"),
    ).toBeInTheDocument();
    await expect(within(canvasElement).getByText("0")).toBeInTheDocument();
  },
};

/** ratio=1:1, bottom=true — 정사각 이미지 + 하단 바. */
export const SquareWithBottom: Story = {
  args: { ratio: "1:1" },
  play: async ({ canvasElement }) => {
    const imageArea = canvasElement.querySelector('[data-name="Image area"]');
    await expect(imageArea).toHaveClass("aspect-square");
  },
};

/** ratio=16:9, bottom=false — 하단 바 없음 → 테두리도 없다(Figma 실측). */
export const WideNoBottom: Story = {
  args: { bottom: false },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-name="ImageCard"]');
    await expect(card).not.toHaveClass("border");
    await expect(
      canvasElement.querySelector('[data-name="like & period"]'),
    ).toBeNull();
  },
};

/** ratio=1:1, bottom=false — 정사각 이미지 단독, 테두리 없음. */
export const SquareNoBottom: Story = {
  args: { ratio: "1:1", bottom: false },
};

/** title=false — 오버레이 타이틀을 렌더하지 않는다. */
export const NoTitle: Story = {
  args: { title: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText("Title Text"),
    ).not.toBeInTheDocument();
  },
};

/** dim=false — 검정 그라데이션 오버레이(Dim)를 렌더하지 않는다. */
export const NoDim: Story = {
  args: { dim: false },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-variant="gradient"]'),
    ).toBeNull();
  },
};

/** postedTime=false — 하단 바 좌측 날짜를 렌더하지 않는다(좋아요 영역은 유지). */
export const NoPostedTime: Story = {
  args: { postedTime: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText("3일"),
    ).not.toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-name="like area"]'),
    ).not.toBeNull();
  },
};

/** liked=true(controlled) — 좋아요 하트가 채워진 상태로 시작한다. */
export const Liked: Story = {
  args: { liked: true },
  play: async ({ canvasElement }) => {
    const likeButton = within(canvasElement).getByRole("button", {
      name: "좋아요",
    });
    await expect(likeButton).toHaveAttribute("data-checked", "true");
  },
};

/**
 * focus — 루트 80% 투명도(CSS 의사클래스, Figma 근거 없음 — 카드 클릭 가능 확장에
 * 맞춰 TextCard/GalleryCard 와 동일한 --alpha-80 으로 통일, 포커스 링 대신 dip).
 */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector(
      '[data-name="ImageCard"]',
    ) as HTMLElement;
    await expect(card).toHaveClass("focus-visible:opacity-[var(--alpha-80)]");

    card.focus();
    await expect(card).toHaveFocus();
  },
};

/**
 * onClick 지정 — 카드는 기본적으로 항상 클릭 가능하지만(role=button), onClick 을
 * 넘겨야 실제로 클릭/Enter/Space 시 핸들러가 호출된다. Figma 에 없는 확장 축이라
 * 별도 스토리로 동작을 검증한다.
 */
export const Clickable: Story = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const card = canvasElement.querySelector(
      '[data-name="ImageCard"]',
    ) as HTMLElement;

    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    card.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

/** ratio × bottom 4가지 조합을 나란히 비교(Figma 문서 프리뷰와 동일 구성). */
export const AllCombinations: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-[var(--sz-20)]">
      {RATIOS.map((ratio) =>
        [true, false].map((bottomValue) => (
          <div key={`${ratio}-${bottomValue}`} style={{ width: 320 }}>
            <ImageCard
              {...args}
              ratio={ratio}
              bottom={bottomValue}
              titleValue={`${ratio} / bottom=${bottomValue}`}
            >
              {renderBlank()}
            </ImageCard>
          </div>
        )),
      )}
    </div>
  ),
};
