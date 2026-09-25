import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { BlankGraphic } from "../BlankGraphic";
import { Dim, type DimVariant } from "./Dim";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-도가3.0--Design-System?node-id=51405-75506";

const VARIANTS = ["normal", "dark", "gradient", "white"] as const;

const meta = {
  title: "Components/Dim",
  component: Dim,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Dim" (문서 노드 51405:75457 / 스펙 스와치 51405:75506) 와 1:1. 다이얼로그·모달 등 위에 화면을 덮는 단순 배경 오버레이 아톰. 텍스트/아이콘 슬롯 없이 `<div>` 하나만 렌더하며, 기본으로 `absolute inset-0` 을 포함해 `relative`/`fixed` 부모 컨테이너를 가득 채운다. variant(`normal`/`dark`/`gradient`/`white`) 1개 축만 있고 hover/disabled 등 인터랙션 상태는 없다.',
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: VARIANTS,
    },
  },
} satisfies Meta<typeof Dim>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 부모가 relative + 고정 크기 컨테이너 역할을 하는 데모 래퍼.
 * Dim 은 배경이 없는 투명/반투명 오버레이라 단독으로는 효과가 잘 보이지 않으므로,
 * `BlankGraphic`(이미지 슬롯 프리미티브)을 뒤에 깔고 그 위에 Dim 을 겹쳐 실제 사용 맥락을 재현한다.
 */
function DimDemo({ variant }: { variant?: DimVariant }) {
  return (
    <div className="relative size-(--sz-160) overflow-hidden rounded-md">
      <BlankGraphic ratio="1/1" />
      <Dim variant={variant} />
    </div>
  );
}

export const Playground: Story = {
  args: { variant: "normal" },
  render: (args) => <DimDemo variant={args.variant} />,
  play: async ({ canvasElement }) => {
    const dim = canvasElement.querySelector("[data-variant]")!;

    await expect(dim).toHaveAttribute("data-variant", "normal");
    await expect(dim).toHaveClass("absolute", "inset-0");
    await expect(dim).toHaveClass("bg-bg-overlay-blackNormal");
  },
};
