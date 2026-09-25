import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { Accordion } from "./Accordion";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-3189";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Accordion" (node 51405:3189) 와 1:1. 헤더를 클릭하면 콘텐츠 영역을 펼치고 접는 단일 인터랙티브 컴포넌트. controlled(`expanded`+`onExpandedChange`) / uncontrolled(`defaultExpanded`) 둘 다 지원. 펼침 인디케이터는 회전이 아니라 `chevron_down_line` ↔ `chevron_up_line` 아이콘 교체로 처리하며, hover 배경 전환은 collapsed 상태에서만 적용된다(Figma 에 expanded+hover 조합이 정의되어 있지 않음). 펼침/접힘은 MUI `Accordion` 의 기본 `Collapse` 트랜지션과 동일한 방식(높이 측정 → 0↔px 애니메이션 → auto)으로 부드럽게 처리한다. 하단 구분선은 `divider` prop 으로 노출을 제어한다.',
      },
    },
  },
  // 컴포넌트 자체는 w-full(부모 폭에 맞춰 화면을 꽉 채우는 실사용 패턴)이라, Storybook
  // 프리뷰에서는 또가 앱의 최소 지원 폭(360px)을 기준으로 고정 폭 컨테이너로 감싼다
  // (데모 전용, 컴포넌트 스타일 아님 — `HorizontalMenuButton` 선례와 동일 패턴).
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "아코디언 제목",
  },
  argTypes: {
    title: { control: "text" },
    divider: { control: "boolean" },
    defaultExpanded: { control: "boolean" },
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "아코디언 제목",
    children: "아코디언 콘텐츠입니다.",
    divider: true,
  },
  render: (args) => (
    <div className="w-full bg-bg-neutral-normal">
      <Accordion {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole("button");
    const contentId = header.getAttribute("aria-controls")!;
    const content = canvasElement.querySelector(`#${contentId}`)!;

    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect(content).toHaveAttribute("aria-hidden", "true");

    await userEvent.click(header);
    await expect(header).toHaveAttribute("aria-expanded", "true");
    await expect(content).toHaveAttribute("aria-hidden", "false");
  },
};

/** divider=false — 하단 구분선 미노출(리스트 마지막 아이템). */
export const WithoutDivider: Story = {
  render: () => (
    <div className="w-full bg-bg-neutral-normal">
      <Accordion title="아코디언 제목" divider={false}>
        아코디언 콘텐츠입니다.
      </Accordion>
    </div>
  ),
};

/**
 * Figma 에 실존하는 3개 조합(collapsed/enable, collapsed/hover, expanded/enable).
 * hover 는 실제 마우스 오버 시 배경(`bg-bg-neutral-deep`)으로 확인 — expanded 는 hover 해도 배경이
 * 바뀌지 않는다(Figma 에 expanded+hover 조합 없음).
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-(--sz-24) bg-bg-neutral-normal">
      <div className="flex flex-col gap-(--sz-8)">
        <code className="text-2xs text-typo-neutral-light">
          collapsed / enable
        </code>
        <Accordion title="아코디언 제목">아코디언 콘텐츠입니다.</Accordion>
      </div>
      <div className="flex flex-col gap-(--sz-8)">
        <code className="text-2xs text-typo-neutral-light">
          collapsed / hover (마우스를 올려보세요)
        </code>
        <Accordion title="아코디언 제목">아코디언 콘텐츠입니다.</Accordion>
      </div>
      <div className="flex flex-col gap-(--sz-8)">
        <code className="text-2xs text-typo-neutral-light">
          expanded / enable
        </code>
        <Accordion title="아코디언 제목" defaultExpanded>
          아코디언 콘텐츠입니다.
        </Accordion>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const headers = canvasElement.querySelectorAll("button[aria-expanded]");
    await expect(headers).toHaveLength(3);
    await expect(
      canvasElement.querySelectorAll('button[aria-expanded="true"]'),
    ).toHaveLength(1);
  },
};

/** controlled — 외부 상태로 펼침 여부를 관리하는 사용 예시. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

function ControlledDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex w-full flex-col gap-(--sz-12) bg-bg-neutral-normal">
      <Accordion
        title="아코디언 제목"
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        아코디언 콘텐츠입니다.
      </Accordion>
      <code className="text-2xs text-typo-neutral-light">
        {expanded ? "expanded" : "collapsed"}
      </code>
    </div>
  );
}
