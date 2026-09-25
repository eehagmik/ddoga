import type { ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import type {
  HorizontalMenuButtonSize,
  HorizontalMenuButtonVariant,
} from "./HorizontalMenuButton";
import { HorizontalMenuButton } from "./HorizontalMenuButton";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-116292";

const VARIANTS: HorizontalMenuButtonVariant[] = ["text", "outline"];
const SIZES: HorizontalMenuButtonSize[] = ["sm", "md", "lg", "xl", "2xl"];

const SLOT_PLACEHOLDER_LABEL = "슬롯";

/**
 * sm(22px)/md(28px) 은 정사각 슬롯이 작아 px-4 패딩을 쓰면 "슬롯" 2글자가 두 줄로
 * 밀린다 — px-2 로 여유를 확보한다. lg 이상(32px~)은 박스가 커서 px-4 가 자연스럽다.
 */
function slotPaddingClass(size: HorizontalMenuButtonSize) {
  return size === "sm" || size === "md" ? "px-(--sz-2)" : "px-(--sz-4)";
}

/**
 * startSlot 은 컴포넌트가 size 별 정사각 wrapper(SIZE_START_SLOT)로 감싸므로 size-full 로 꽉 채운다.
 * sm(22px) 은 px-2 를 적용해도 기본 폰트(text-body-6, 2xs)로는 버튼 패딩 밖으로 삐져나오므로,
 * sm 에서만 폰트를 1~2px 더 작게(text-[10px], 토큰 예외) 낮춰 박스 안에 들어오게 한다.
 */
function renderStartSlotPlaceholder(size: HorizontalMenuButtonSize) {
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
 * endSlot 은 임의 콘텐츠라 컴포넌트가 크기를 강제하지 않으므로, 너비는 고정하지 않고
 * (글자 크기만큼 hug) sm 사이즈 startSlot 과 동일한 --sz-22 높이만 맞춘다. sm 은
 * startSlot 과 동일하게 text-[10px] 로 낮춰 두 슬롯의 인상을 통일한다.
 */
function renderEndSlotPlaceholder(size: HorizontalMenuButtonSize) {
  const isSm = size === "sm";
  return (
    <span
      className={[
        "inline-flex h-(--sz-22) shrink-0 items-center justify-center rounded-xs bg-bg-neutral-deepDark text-typo-neutral-light",
        slotPaddingClass(size),
        isSm ? "text-[10px]" : "text-body-6",
      ].join(" ")}
    >
      {SLOT_PLACEHOLDER_LABEL}
    </span>
  );
}

/**
 * boolean 컨트롤 값만 placeholder 로 치환하고, WithStartSlot/WithEndSlot 처럼 실제
 * ReactNode 가 args 로 들어온 경우는 그대로 통과시킨다.
 */
function resolveSlot(
  value: unknown,
  size: HorizontalMenuButtonSize,
  renderPlaceholder: (size: HorizontalMenuButtonSize) => ReactNode,
): ReactNode {
  if (typeof value !== "boolean") return value as ReactNode;
  return value ? renderPlaceholder(size) : undefined;
}

const meta = {
  title: "Components/HorizontalMenuButton",
  component: HorizontalMenuButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / HorizontalMenuButton" (node 51405:116292) 와 1:1. 메뉴/설정 리스트 행에 쓰는 가로형 버튼 — 좌측 아이콘/그래픽 슬롯(startSlot) + 라벨(children) + 우측 임의 콘텐츠(endSlot) + chevron 구조. Figma 프레임은 240px 고정폭이지만 이 컴포넌트는 리스트 행 용도이므로 부모 폭에 맞추는 `w-full` 로 구현했다. `variant`(text/outline) × `size`(sm/md/lg/xl/2xl) × `bold` 축이 있고, hover/focus 는 CSS 로 처리(Figma 에 disabled 없음).',
      },
    },
  },
  // 컴포넌트 자체는 w-full(부모 폭에 맞춤)이라, Storybook 프리뷰에서는
  // 실사용 크기감 확인을 위해 380px 고정 폭 컨테이너로 감싼다(데모 전용, 컴포넌트 스타일 아님).
  decorators: [
    (Story) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: "text",
    size: "sm",
    bold: false,
    chevron: true,
    startSlot: false,
    endSlot: false,
    children: "Label",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    bold: { control: "boolean" },
    chevron: { control: "boolean" },
    children: { control: "text" },
    // ReactNode 슬롯은 Storybook 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 난다.
    // boolean 토글로 노출하고, 아래 meta.render 에서 현재 size 를 참조해
    // radius-xs 회색 배경 박스 + "슬롯" 텍스트 placeholder 로 치환한다
    // (`ButtonWithLabel`/`Chip`/`Tooltip` 선례와 동일 패턴).
    startSlot: {
      control: "boolean",
      table: { type: { summary: "ReactNode" } },
    },
    endSlot: { control: "boolean", table: { type: { summary: "ReactNode" } } },
  },
  render: ({ startSlot, endSlot, size = "sm", ...args }) => (
    <HorizontalMenuButton
      {...args}
      size={size}
      startSlot={resolveSlot(startSlot, size, renderStartSlotPlaceholder)}
      endSlot={resolveSlot(endSlot, size, renderEndSlotPlaceholder)}
    />
  ),
} satisfies Meta<typeof HorizontalMenuButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** text/sm — Figma 기본 variant. play 에서 클릭 → onClick 호출을 검증한다. */
export const Default: Story = {
  args: { variant: "text", size: "sm" },
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn).toHaveAttribute("data-variant", "text");
    await expect(btn).toHaveAttribute("data-size", "sm");
    await expect(btn).toHaveClass("w-full", "cursor-pointer");

    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** outline — 배경 + 테두리가 있는 variant. */
export const Outline: Story = {
  args: { variant: "outline", size: "sm" },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn).toHaveClass(
      "bg-bg-neutral-normal",
      "border-border-neutral-bright",
    );
  },
};

/** size 5종 나란히 비교(variant=text). */
export const AllSizes: Story = {
  render: ({ startSlot, endSlot, ...args }) => (
    <div className="flex flex-col gap-(--sz-8)">
      {SIZES.map((size) => (
        <HorizontalMenuButton
          {...args}
          key={size}
          size={size}
          startSlot={resolveSlot(startSlot, size, renderStartSlotPlaceholder)}
          endSlot={resolveSlot(endSlot, size, renderEndSlotPlaceholder)}
        >
          {`Label ${size}`}
        </HorizontalMenuButton>
      ))}
    </div>
  ),
};

/** size 5종 × outline. */
export const AllSizesOutline: Story = {
  args: { variant: "outline" },
  render: ({ startSlot, endSlot, ...args }) => (
    <div className="flex flex-col gap-(--sz-8)">
      {SIZES.map((size) => (
        <HorizontalMenuButton
          {...args}
          key={size}
          size={size}
          startSlot={resolveSlot(startSlot, size, renderStartSlotPlaceholder)}
          endSlot={resolveSlot(endSlot, size, renderEndSlotPlaceholder)}
        >
          {`Label ${size}`}
        </HorizontalMenuButton>
      ))}
    </div>
  ),
};

/** bold 라벨. */
export const Bold: Story = {
  args: { bold: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn).toHaveAttribute("data-bold", "true");
  },
};

/** startSlot(아이콘) 을 채운 예시 — 아이콘/그래픽은 호출부가 채운다. */
export const WithStartSlot: Story = {
  args: {
    startSlot: <Icon name="home_01_line" size={20} />,
  },
};

/** endSlot(임의 콘텐츠, 여기서는 보조 텍스트) 을 채운 예시. */
export const WithEndSlot: Story = {
  args: {
    endSlot: (
      <span className="text-body-6 text-typo-neutral-light">부가정보</span>
    ),
  },
};

/** chevron 을 끈 예시 — trailingContents(option) 자체가 미렌더된다. */
export const WithoutChevron: Story = {
  args: { chevron: false },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(btn.querySelector("svg")).toBeNull();
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
