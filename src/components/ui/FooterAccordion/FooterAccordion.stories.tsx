import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { FooterAccordion } from "./FooterAccordion";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-3273";

const meta = {
  title: "Components/FooterAccordion",
  component: FooterAccordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / FooterAccordion" (node 51405:3273) 와 1:1. `Accordion`/`BoardAccordion`과 형제 컴포넌트지만 독립 카드형 컨테이너(둥근 모서리, 하단 구분선 없음)로 배경색 방향이 반대다 — enable=`bg-bg-neutral-deepDark`(어두움) / hover=`bg-bg-neutral-dark`(밝음). 제목은 `text-label-1-bold`(항상 Bold, 볼드 전환 축 없음). controlled(`expanded`+`onExpandedChange`) / uncontrolled(`defaultExpanded`) 둘 다 지원하며, 펼침/접힘은 `Accordion` 과 동일한 높이 트랜지션(0↔px→auto)으로 처리한다.',
      },
    },
  },
  // 컴포넌트 자체는 w-full(부모 폭에 맞춰 화면을 꽉 채우는 실사용 패턴)이라, Storybook
  // 프리뷰에서는 또가 앱의 최소 지원 폭(360px)을 기준으로 고정 폭 컨테이너로 감싼다
  // (데모 전용, 컴포넌트 스타일 아님 — `Accordion`/`BoardAccordion` 선례와 동일 패턴).
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "푸터 아코디언 제목",
  },
  argTypes: {
    title: { control: "text" },
    defaultExpanded: { control: "boolean" },
  },
} satisfies Meta<typeof FooterAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "푸터 아코디언 제목",
    children: "아코디언 콘텐츠입니다.",
  },
  render: (args) => (
    <div className="w-full bg-bg-neutral-normal p-[var(--sz-8)]">
      <FooterAccordion {...args} />
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

/** children 이 없으면 콘텐츠 영역 자체를 렌더하지 않는다(단일 collapsed 행). */
export const WithoutContent: Story = {
  args: {
    title: "푸터 아코디언 제목",
  },
};

/** expanded — 펼쳐진 상태의 기본 예시. */
export const Expanded: Story = {
  args: {
    title: "푸터 아코디언 제목",
    children: "아코디언 콘텐츠입니다.",
    defaultExpanded: true,
  },
};

/**
 * Figma 에 실존하는 3개 조합(collapsed/enable, collapsed/hover, expanded/enable).
 * hover 는 실제 마우스 오버 시 배경(`bg-bg-neutral-dark`, 더 밝은 색)으로 확인 — Accordion 계열과
 * 달리 hover 가 더 밝아진다. expanded 는 hover 해도 배경이 바뀌지 않는다(Figma 에 없는 조합).
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-[var(--sz-24)] bg-bg-neutral-normal p-[var(--sz-8)]">
      <div className="flex flex-col gap-[var(--sz-8)]">
        <code className="text-2xs text-typo-neutral-light">
          collapsed / enable
        </code>
        <FooterAccordion title="푸터 아코디언 제목">
          아코디언 콘텐츠입니다.
        </FooterAccordion>
      </div>
      <div className="flex flex-col gap-[var(--sz-8)]">
        <code className="text-2xs text-typo-neutral-light">
          collapsed / hover (마우스를 올려보세요)
        </code>
        <FooterAccordion title="푸터 아코디언 제목">
          아코디언 콘텐츠입니다.
        </FooterAccordion>
      </div>
      <div className="flex flex-col gap-[var(--sz-8)]">
        <code className="text-2xs text-typo-neutral-light">
          expanded / enable
        </code>
        <FooterAccordion title="푸터 아코디언 제목" defaultExpanded>
          아코디언 콘텐츠입니다.
        </FooterAccordion>
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
    <div className="flex w-full flex-col gap-[var(--sz-12)] bg-bg-neutral-normal p-[var(--sz-8)]">
      <FooterAccordion
        title="푸터 아코디언 제목"
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        아코디언 콘텐츠입니다.
      </FooterAccordion>
      <code className="text-2xs text-typo-neutral-light">
        {expanded ? "expanded" : "collapsed"}
      </code>
    </div>
  );
}
