import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { BlankIcon } from "../BlankIcon";
import { ButtonWithLabel } from "../ButtonWithLabel";
import type { EmptyVariant } from "./Empty";
import { Empty } from "./Empty";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-83959";

const VARIANTS: EmptyVariant[] = ["default", "empty", "error"];

const meta = {
  title: "Components/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Empty" (node 51405:83959) 와 1:1. 목록·페이지에 표시할 내용이 없거나 오류가 발생했을 때 쓰는 빈 상태. `variant`(default/empty/error)에 따라 그래픽이 바뀌고, `default`는 `graphic` 슬롯으로 자유롭게 교체할 수 있다. 버튼은 `leftButton`/`rightButton` 슬롯이라 `ButtonWithLabel` 등 실제 버튼 컴포넌트를 그대로 꽂아 쓴다.',
      },
    },
  },
  args: {
    variant: "default",
    mainText: "Main Text",
    subText: "Sub Text",
    leftButton: false,
    rightButton: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    mainText: { control: "text" },
    subText: { control: "text" },
    graphic: { table: { disable: true } },
    // ReactNode 슬롯은 Storybook 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 난다.
    // boolean 토글로 노출하고 켜면 실제 사용 예시(`ButtonWithLabel`)를 넣는다(ButtonWithLabel.stories 선례).
    leftButton: {
      control: "boolean",
      mapping: {
        true: (
          <ButtonWithLabel
            variant="outline"
            color="neutral"
            startIcon={<BlankIcon className="size-full" />}
            endIcon={<BlankIcon className="size-full" />}
          >
            Label
          </ButtonWithLabel>
        ),
        false: undefined,
      },
      table: { type: { summary: "ReactNode" } },
    },
    rightButton: {
      control: "boolean",
      mapping: {
        true: (
          <ButtonWithLabel
            startIcon={<BlankIcon className="size-full" />}
            endIcon={<BlankIcon className="size-full" />}
          >
            Label
          </ButtonWithLabel>
        ),
        false: undefined,
      },
      table: { type: { summary: "ReactNode" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[var(--sz-320)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 텍스트·variant·버튼 노출 여부(leftButton/rightButton 토글)를 탐색. */
export const Playground: Story = {};

/** `variant="default"` — 그래픽 자유 교체(생략 시 `BlankGraphic`). */
export const Default: Story = {
  args: { variant: "default" },
};

/** `variant="empty"` — 조회 결과 없음 고정 일러스트. */
export const EmptyState: Story = {
  args: { variant: "empty", mainText: "검색 결과가 없어요", subText: "" },
};

/** `variant="error"` — 오류 발생 고정 일러스트. */
export const ErrorState: Story = {
  args: { variant: "error", mainText: "오류가 발생했어요", subText: "" },
};

/**
 * 버튼 슬롯 — `ButtonWithLabel`(outline neutral / fill brand)을 그대로 꽂아 쓴다.
 * play 에서 버튼 2개가 실제로 렌더되는지 검증한다.
 */
export const WithButtons: Story = {
  args: {
    variant: "error",
    mainText: "오류가 발생했어요",
    subText: "잠시 후 다시 시도해주세요",
    leftButton: (
      <ButtonWithLabel variant="outline" color="neutral">
        취소
      </ButtonWithLabel>
    ),
    rightButton: <ButtonWithLabel variant="fill">다시 시도</ButtonWithLabel>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "취소" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  },
};

/** default / empty / error 세 variant 를 한눈에 비교. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--sz-32)]">
      {VARIANTS.map((variant) => (
        <Empty key={variant} variant={variant} />
      ))}
    </div>
  ),
};
