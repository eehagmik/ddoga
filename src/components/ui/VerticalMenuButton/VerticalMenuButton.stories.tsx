import type { ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { BlankGraphic } from "../BlankGraphic";
import type { VerticalMenuButtonSize } from "./VerticalMenuButton";
import { VerticalMenuButton } from "./VerticalMenuButton";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-116775";

const SIZES: VerticalMenuButtonSize[] = ["sm", "md", "lg", "xl", "2xl"];

const SLOT_PLACEHOLDER_LABEL = "슬롯";

/**
 * HorizontalMenuButton 스토리의 `slotPaddingClass`/`renderStartSlotPlaceholder`/
 * `renderEndSlotPlaceholder`/`resolveSlot` 과 완전히 동일한 시각 디자인(회색
 * rounded-xs 박스 + "슬롯" 텍스트, sm 사이즈에서만 text-[10px])을 이 컴포넌트의
 * `endSlot` 자리에 재현한다. 컴포넌트 구조가 달라(Vertical 의 endSlot 은 전 size
 * 공통 고정폭·고정높이 박스) 로직을 그대로 import 하지 않고 이 파일에 복제했다
 * (기존 HorizontalMenuButton.stories.tsx 는 건드리지 않는다).
 */
function slotPaddingClass(size: VerticalMenuButtonSize) {
  return size === "sm" || size === "md" ? "px-(--sz-2)" : "px-(--sz-4)";
}

/**
 * endSlot 은 컴포넌트가 이미 `h-(--sz-32) w-full` 로 감싸므로 `size-full` 로
 * 꽉 채운다. sm 은 HorizontalMenuButton 선례와 동일하게 `text-[10px]`(토큰 예외)로
 * 낮춰 박스 안에 들어오게 한다.
 */
function renderEndSlotPlaceholder(size: VerticalMenuButtonSize) {
  const isSm = size === "sm";
  return (
    <span
      className={[
        "inline-flex size-full shrink-0 items-center justify-center rounded-xs bg-bg-neutral-deepDark text-typo-neutral-light",
        slotPaddingClass(size),
        isSm ? "text-[10px]" : "text-body-6",
      ].join(" ")}
    >
      {SLOT_PLACEHOLDER_LABEL}
    </span>
  );
}

/**
 * boolean 컨트롤 값만 placeholder 로 치환하고, 실제 ReactNode 가 args 로 들어온
 * 경우(WithEndSlot 등)는 그대로 통과시킨다.
 */
function resolveSlot(
  value: unknown,
  size: VerticalMenuButtonSize,
  renderPlaceholder: (size: VerticalMenuButtonSize) => ReactNode,
): ReactNode {
  if (typeof value !== "boolean") return value as ReactNode;
  return value ? renderPlaceholder(size) : undefined;
}

const meta = {
  title: "Components/VerticalMenuButton",
  component: VerticalMenuButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / VerticalMenuButton" (node 51405:116775) 와 1:1. 그리드형 메뉴 타일 — 그래픽(이미지) 슬롯(children, 필수. 아이콘 아님) + 우상단 배지(badge) + 라벨(label, 필수) + 하단 임의 콘텐츠(endSlot) 구조. HorizontalMenuButton 과 달리 variant/bold 축이 없고, Figma 프레임이 size 와 무관하게 68px 고정폭이라 그대로 고정폭으로 구현했다. `size`(sm/md/lg/xl/2xl) 축이 있고, hover/focus 는 CSS 로 처리(Figma 에 disabled 없음).',
      },
    },
  },
  args: {
    size: "sm",
    badge: false,
    label: "Label",
    children: <BlankGraphic />,
    endSlot: false,
    onClick: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    badge: { control: "boolean" },
    label: { control: "text" },
    children: {
      control: false,
      table: { type: { summary: "ReactNode" } },
    },
    // endSlot 은 ReactNode 슬롯이라 Storybook 기본 "Set object" 컨트롤이 `{}` 를
    // 주입해 렌더 에러가 난다. boolean 토글로 노출하고, 아래 meta.render 에서
    // 현재 size 를 참조해 회색 배경 박스 + "슬롯" 텍스트 placeholder 로 치환한다
    // (HorizontalMenuButton 선례와 동일 패턴).
    endSlot: { control: "boolean", table: { type: { summary: "ReactNode" } } },
  },
  render: ({ endSlot, size = "sm", ...args }) => (
    <VerticalMenuButton
      {...args}
      size={size}
      endSlot={resolveSlot(endSlot, size, renderEndSlotPlaceholder)}
    />
  ),
} satisfies Meta<typeof VerticalMenuButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** sm — Figma 기본 size. play 에서 클릭 → onClick 호출을 검증한다. */
export const Default: Story = {
  args: { size: "sm" },
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn).toHaveAttribute("data-size", "sm");
    await expect(btn).toHaveAttribute("data-badge", "false");
    await expect(btn).toHaveClass("w-(--sz-68)", "cursor-pointer");

    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** size 5종 나란히 비교. */
export const AllSizes: Story = {
  render: ({ endSlot, ...args }) => (
    <div className="flex flex-wrap items-start gap-(--sz-16)">
      {SIZES.map((size) => (
        <VerticalMenuButton
          {...args}
          key={size}
          size={size}
          label={`Label ${size}`}
          endSlot={resolveSlot(endSlot, size, renderEndSlotPlaceholder)}
        />
      ))}
    </div>
  ),
};

/** badge — 그래픽 우상단 Dot 노출. */
export const Badge: Story = {
  args: { badge: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn).toHaveAttribute("data-badge", "true");
    await expect(btn.querySelector('[data-color="red"]')).not.toBeNull();
  },
};

/** endSlot(임의 콘텐츠, 여기서는 보조 텍스트)을 채운 예시. */
export const WithEndSlot: Story = {
  args: {
    endSlot: (
      <span className="text-body-6 text-typo-neutral-light">부가정보</span>
    ),
  },
};

/** hover — 루트 opacity --alpha-80 로 처리(props 아님, CSS 의사클래스). */
export const Hover: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn).toHaveClass("hover:opacity-(--alpha-80)");
  },
};

/** focus — 루트 opacity --alpha-60 로 처리(props 아님, CSS 의사클래스). */
export const Focus: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn).toHaveClass("focus-visible:opacity-(--alpha-60)");
    btn.focus();
    await expect(btn).toHaveFocus();
  },
};
