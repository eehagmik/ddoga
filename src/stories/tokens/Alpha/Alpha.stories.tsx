import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { Alpha } from "./Alpha";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=2327-4758";

const meta = {
  title: "Tokens/Alpha",
  component: Alpha,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Alpha" (node 2327:4758) 와 1:1. 요소의 `opacity` 에 적용하는 불투명도 배수 스케일이다. Figma `alpha/<NN>` ↔ 코드 `--alpha-<NN>` (00·05·10·20·40·60·80, 값은 소수 = 퍼센트 / 100). 오버레이·비활성 상태·구분선 등에 일관된 투명도를 줄 때 쓴다. `--color-*-a<NN>` 알파 컬러 램프(색상 자체의 알파 채널)와는 별개다. Tailwind 유틸은 생기지 않으므로 `style={{ opacity: "var(--alpha-40)" }}` 또는 `opacity-(--alpha-40)` 로 참조한다. 각 스텝은 대비가 큰 배경 위 표면으로 시연하며, 토큰명 라벨은 opacity 가 걸리지 않는 별도 레이어라 항상 선명하다.',
      },
    },
  },
  argTypes: {
    // section 을 지정하면 해당 스텝 하나만 렌더한다 (Controls 패널에서 확인용).
    section: {
      control: "inline-radio",
      options: ["00", "05", "10", "20", "40", "60", "80"],
    },
  },
} satisfies Meta<typeof Alpha>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 00 → 80 전체 스케일. 스텝별 그룹은 두지 않는다 — 토큰명은 숫자 하나뿐이다. */
export const All: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    for (const id of ["00", "05", "10", "20", "40", "60", "80"]) {
      await expect(
        canvasElement.querySelector(`[data-section="${id}"]`),
      ).toBeInTheDocument();
    }
    await expect(
      canvasElement.querySelectorAll('[data-token^="--alpha-"]'),
    ).toHaveLength(7);
  },
};
