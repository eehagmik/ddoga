import type { ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { TextCard } from "./TextCard";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-14446";

const SLOT_PLACEHOLDER_LABEL = "슬롯";

/**
 * HorizontalMenuButton/VerticalMenuButton 스토리의 slot placeholder(회색
 * rounded-xs 박스 + "슬롯" 텍스트, bg-bg-neutral-deepDark/text-typo-neutral-light)
 * 와 동일한 시각 디자인을 TextCard 의 24x24 고정 start/endSlot 자리에 재현한다.
 * 로직을 import 하지 않고 이 파일에 복제하는 건 기존 두 파일과 동일한 컨벤션이다
 * (TextCard 는 size 축이 없어 24px 고정 박스 기준 text-[10px] 하나로 고정).
 */
function renderSlotPlaceholder() {
  return (
    <span className="inline-flex size-full shrink-0 items-center justify-center rounded-xs bg-bg-neutral-deepDark text-[10px] text-typo-neutral-light">
      {SLOT_PLACEHOLDER_LABEL}
    </span>
  );
}

/**
 * startSlot/endSlot(boolean)이 true 인데 실제 contents 가 args 로 채워지지
 * 않은 경우에만 placeholder 로 치환한다. contents 가 명시적으로 들어온 경우는
 * (실제 ReactNode) 그대로 통과시킨다.
 */
function resolveSlotContents(
  contents: ReactNode,
  show: boolean | undefined,
): ReactNode {
  if (!show) return undefined;
  return contents ?? renderSlotPlaceholder();
}

const meta = {
  title: "Components/TextCard",
  component: TextCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Card" 문서 페이지(캔버스 51405:14293) 안의 TextCard(node 51405:14446) 와 1:1. 제목 + 날짜로 구성된 리스트형 카드 행이다. Figma state=enable/hover/focus 는 props 가 아니라 CSS 의사클래스(`hover:`, `group-focus-visible:`)로 처리한다. 루트는 `<button>` 이 아니라 `role="button" tabIndex={0}` 을 가진 `<div>` 다(슬롯 콘텐츠에 버튼이 들어올 수 있어 버튼-in-버튼 충돌을 피하기 위함) — Enter/Space 키 입력도 클릭과 동일하게 동작한다. Figma 원본의 `deletable` prop 은 실제로 날짜 렌더 여부를 제어해 `showDate` 로 이름을 정정했다. 배지는 기존 `Dot`, 하단 구분선은 기존 `Divider` 를 재사용한다.',
      },
    },
  },
  args: {
    title: "제목",
    titleLines: 1,
    showDate: true,
    dateValue: "YYYY.MM.DD",
    badge: false,
    startSlot: false,
    endSlot: false,
    divider: true,
    onClick: fn(),
  },
  argTypes: {
    title: { control: "text" },
    titleLines: { control: "inline-radio", options: [1, 2] },
    showDate: { control: "boolean" },
    dateValue: { control: "text" },
    badge: { control: "boolean" },
    startSlot: { control: "boolean" },
    endSlot: { control: "boolean" },
    divider: { control: "boolean" },
    startSlotContents: { table: { disable: true } },
    endSlotContents: { table: { disable: true } },
  },
  render: ({
    startSlot,
    startSlotContents,
    endSlot,
    endSlotContents,
    ...args
  }) => (
    <TextCard
      {...args}
      startSlot={startSlot}
      startSlotContents={resolveSlotContents(startSlotContents, startSlot)}
      endSlot={endSlot}
      endSlotContents={resolveSlotContents(endSlotContents, endSlot)}
    />
  ),
} satisfies Meta<typeof TextCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** enable — Figma 기본값. play 에서 role/속성/클릭 동작을 검증한다. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    // 접근성 이름이 제목+날짜 텍스트를 모두 포함해 name 필터 없이 단일 버튼으로 조회한다.
    const card = within(canvasElement).getByRole("button");
    await expect(card.tagName).toBe("DIV");
    await expect(card).toHaveAttribute("tabIndex", "0");

    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** hover — 루트 배경이 bg-bg-neutral-deep 유틸로 처리된다(props 아님). */
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("button");
    await expect(card).toHaveClass("hover:bg-bg-neutral-deep");
  },
};

/**
 * focus — 루트 배경 + inner 80% 투명도(CSS 의사클래스, ImageCard/GalleryCard 와
 * 통일된 --alpha-80 — 2026-09-19 사용자 확정, Figma 실측값 60% 에서 변경).
 * 키보드 Enter 로도 onClick 이 트리거된다.
 */
export const Focus: Story = {
  play: async ({ args, canvasElement }) => {
    const card = within(canvasElement).getByRole("button");
    await expect(card).toHaveClass("focus-visible:bg-bg-neutral-deep");

    const inner = within(canvasElement)
      .getByText("제목")
      .closest('[data-name="inner"]');
    await expect(inner).toHaveClass("group-focus-visible:opacity-(--alpha-80)");

    card.focus();
    await expect(card).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** badge — 제목 옆에 신규 표시 Dot(size=xs, color=red)을 렌더한다. */
export const WithBadge: Story = {
  args: { badge: true },
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("button");
    await expect(card.querySelector('[data-color="red"]')).not.toBeNull();
  },
};

/** showDate=false — 날짜 줄을 렌더하지 않는다(Figma 원본 `deletable` prop을 정정한 이름). */
export const NoDate: Story = {
  args: { showDate: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText("YYYY.MM.DD"),
    ).not.toBeInTheDocument();
  },
};

/** titleLines=2 — 제목이 2줄까지 노출된다(Figma dev 주석: 1/2줄 중 기획에 맞춰 선택). */
export const TitleTwoLines: Story = {
  args: {
    title:
      "제목이 두 줄까지 길게 노출되는 경우를 확인하기 위한 예시 텍스트입니다",
    titleLines: 2,
  },
  play: async ({ canvasElement }) => {
    const title = within(canvasElement).getByText(/제목이 두 줄까지/);
    await expect(title).toHaveClass("line-clamp-2");
  },
};

/**
 * startSlot/endSlot — 좌우 24x24 슬롯에 회색 placeholder("슬롯")를 채운 예시
 * (HorizontalMenuButton/VerticalMenuButton 슬롯 placeholder와 동일 시각 디자인).
 * 실제 콘텐츠는 startSlotContents/endSlotContents 로 직접 넘기면 된다.
 */
export const WithSlots: Story = {
  args: {
    startSlot: true,
    endSlot: true,
  },
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("button");
    await expect(
      within(card).getAllByText(SLOT_PLACEHOLDER_LABEL),
    ).toHaveLength(2);
  },
};

/** divider=false — 하단 구분선을 감춘다(리스트 마지막 아이템 등에서 사용). */
export const NoDivider: Story = {
  args: { divider: false },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[role="separator"]'),
    ).not.toBeInTheDocument();
  },
};

/** 여러 상태를 리스트로 이어붙인 예시(Figma 문서 프리뷰와 동일 구성). */
export const List: Story = {
  render: (args) => (
    <div className="w-(--sz-320)">
      <TextCard {...args} title="첫 번째 카드" badge />
      <TextCard {...args} title="두 번째 카드" />
      <TextCard {...args} title="세 번째 카드" divider={false} />
    </div>
  ),
};
