import { useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { BoardAccordion } from "./BoardAccordion";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-3210";

const SLOT_PLACEHOLDER_LABEL = "슬롯";

/**
 * `startSlot` 은 컴포넌트가 24x24 정사각 wrapper 로 감싸므로 size-full 로 꽉 채운다.
 * `HorizontalMenuButton` 의 sm(22px) 슬롯 placeholder 선례와 동일하게 글자가 두 줄로
 * 밀리지 않도록 padding/폰트 크기를 줄인다.
 */
function renderStartSlotPlaceholder(): ReactNode {
  return (
    <span className="inline-flex size-full shrink-0 items-center justify-center rounded-xs bg-bg-neutral-deepDark px-[var(--sz-2)] text-[10px] text-typo-neutral-light">
      {SLOT_PLACEHOLDER_LABEL}
    </span>
  );
}

/**
 * boolean 컨트롤 값만 placeholder 로 치환하고, 실제 ReactNode 가 args 로 들어온 경우는
 * 그대로 통과시킨다(`HorizontalMenuButton` 선례와 동일 패턴).
 */
function resolveSlot(
  value: unknown,
  renderPlaceholder: () => ReactNode,
): ReactNode {
  if (typeof value !== "boolean") return value as ReactNode;
  return value ? renderPlaceholder() : undefined;
}

const meta = {
  title: "Components/BoardAccordion",
  component: BoardAccordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / BoardAccordion" (node 51405:3210) 와 1:1. `Accordion` 을 기반으로 만든 후속 컴포넌트로, 헤더를 클릭하면 콘텐츠 영역을 펼치고 접는 단일 인터랙티브 컴포넌트다. `titleDirection`(horizontal/vertical) 축이 추가되고, 제목 앞(또는 위) 아이콘 슬롯(`startSlot`)과 날짜 텍스트(`date`)를 지원한다. 펼침 인디케이터는 `chevron_down_line` ↔ `chevron_up_line` 아이콘 교체, 펼침/접힘은 `Accordion` 과 동일한 높이 트랜지션(0↔px→auto)으로 처리한다. 배경은 버튼 자신의 hover(collapsed 에서만), 제목 볼드 전환은 `group-hover:` 로 구분해 처리하며 collapsed 시 제목은 최대 2줄로 클램프된다.',
      },
    },
  },
  // 컴포넌트 자체는 w-full(부모 폭에 맞춰 화면을 꽉 채우는 실사용 패턴)이라, Storybook
  // 프리뷰에서는 또가 앱의 최소 지원 폭(360px)을 기준으로 고정 폭 컨테이너로 감싼다
  // (데모 전용, 컴포넌트 스타일 아님 — `HorizontalMenuButton`/`Accordion` 선례와 동일 패턴).
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "게시글 제목입니다",
    titleDirection: "horizontal",
    date: "2026.09.13",
    startSlot: true,
    divider: true,
  },
  argTypes: {
    title: { control: "text" },
    date: { control: "text" },
    titleDirection: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    divider: { control: "boolean" },
    defaultExpanded: { control: "boolean" },
    // ReactNode 슬롯은 Storybook 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 난다.
    // boolean 토글로 노출하고, 아래 render 에서 "슬롯" 텍스트가 있는 회색 박스 placeholder 로
    // 치환한다(`HorizontalMenuButton`/`ButtonWithLabel`/`Chip`/`Tooltip` 선례와 동일 패턴).
    startSlot: {
      control: "boolean",
      table: { type: { summary: "ReactNode" } },
    },
  },
  render: ({ startSlot, ...args }) => (
    <div className="w-full bg-bg-neutral-normal">
      <BoardAccordion
        {...args}
        startSlot={resolveSlot(startSlot, renderStartSlotPlaceholder)}
      />
    </div>
  ),
} satisfies Meta<typeof BoardAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "아코디언 콘텐츠입니다.",
  },
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

/** startSlot 을 뺀 예시 — 기본은 슬롯이 보이는 형태이며, 값이 없으면 슬롯 자체를 렌더하지 않는다. */
export const WithoutStartSlot: Story = {
  args: {
    startSlot: false,
    children: "아코디언 콘텐츠입니다.",
  },
};

/** date 를 뺀 예시 — 값이 없으면 날짜 줄 자체를 렌더하지 않는다. */
export const WithoutDate: Story = {
  args: {
    date: undefined,
    children: "아코디언 콘텐츠입니다.",
  },
};

/** titleDirection='vertical' — 아이콘이 제목 위, gap 6(horizontal 은 gap 8). */
export const Vertical: Story = {
  args: {
    titleDirection: "vertical",
    startSlot: true,
    children: "아코디언 콘텐츠입니다.",
  },
};

/** divider=false — 하단 구분선 미노출(리스트 마지막 아이템). */
export const WithoutDivider: Story = {
  args: {
    divider: false,
    children: "아코디언 콘텐츠입니다.",
  },
};

/**
 * 긴 제목 — collapsed 시 최대 2줄로 클램프되고, expanded=true 가 되면 클램프가 풀려
 * 전체 문구가 노출된다(Figma 디자이너 주석 규칙).
 */
export const LongTitleClamp: Story = {
  args: {
    title:
      "아주 길고 긴 게시글 제목입니다. 이 텍스트는 접혀있을 때 두 줄까지만 보이고 세 번째 줄부터는 말줄임 처리되어야 합니다.",
    children: "아코디언 콘텐츠입니다.",
  },
  play: async ({ canvasElement }) => {
    const header = within(canvasElement).getByRole("button");
    const title = header.querySelector("span.line-clamp-2");
    await expect(title).not.toBeNull();

    await userEvent.click(header);
    // expanded 로 전환되면 클램프 클래스가 제거된다.
    await expect(header.querySelector("span.line-clamp-2")).toBeNull();
  },
};

/**
 * Figma 에 실존하는 3개 조합(collapsed/enable, collapsed/hover, expanded/enable) x
 * titleDirection 2종. hover 는 실제 마우스 오버 시 배경(`bg-bg-neutral-deep`) + 제목 볼드
 * 전환으로 확인 — expanded 는 hover 해도 배경이 바뀌지 않는다(Figma 에 expanded+hover 없음).
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-[var(--sz-24)] bg-bg-neutral-normal">
      {(["horizontal", "vertical"] as const).map((direction) => (
        <div key={direction} className="flex flex-col gap-[var(--sz-8)]">
          <code className="text-2xs text-typo-neutral-light">
            titleDirection={direction}
          </code>
          <div className="flex flex-col gap-[var(--sz-8)]">
            <code className="text-2xs text-typo-neutral-light">
              collapsed / enable
            </code>
            <BoardAccordion
              title="게시글 제목입니다"
              date="2026.09.13"
              titleDirection={direction}
              startSlot={<Icon name="home_01_line" size={24} />}
            >
              아코디언 콘텐츠입니다.
            </BoardAccordion>
            <code className="text-2xs text-typo-neutral-light">
              collapsed / hover (마우스를 올려보세요)
            </code>
            <BoardAccordion
              title="게시글 제목입니다"
              date="2026.09.13"
              titleDirection={direction}
              startSlot={<Icon name="home_01_line" size={24} />}
            >
              아코디언 콘텐츠입니다.
            </BoardAccordion>
            <code className="text-2xs text-typo-neutral-light">
              expanded / enable
            </code>
            <BoardAccordion
              title="게시글 제목입니다"
              date="2026.09.13"
              titleDirection={direction}
              startSlot={<Icon name="home_01_line" size={24} />}
              defaultExpanded
            >
              아코디언 콘텐츠입니다.
            </BoardAccordion>
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const headers = canvasElement.querySelectorAll("button[aria-expanded]");
    await expect(headers).toHaveLength(6);
    await expect(
      canvasElement.querySelectorAll('button[aria-expanded="true"]'),
    ).toHaveLength(2);
  },
};

/** controlled — 외부 상태로 펼침 여부를 관리하는 사용 예시. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

function ControlledDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex w-full flex-col gap-[var(--sz-12)] bg-bg-neutral-normal">
      <BoardAccordion
        title="게시글 제목입니다"
        date="2026.09.13"
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        아코디언 콘텐츠입니다.
      </BoardAccordion>
      <code className="text-2xs text-typo-neutral-light">
        {expanded ? "expanded" : "collapsed"}
      </code>
    </div>
  );
}
