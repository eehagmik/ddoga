import { useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { Dim } from "../Dim";
import { Toggle } from "../Toggle";
import { ToggleTabs } from "./ToggleTabs";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-153913";

const SUBMENU_PLACEHOLDER_LABEL = "서브메뉴";

/**
 * `subMenuContent` 는 완전 자유 슬롯이라 실제 콘텐츠 크기를 가늠하기 위한 회색 박스
 * placeholder 로 대체한다(`BoardAccordion` 의 `renderStartSlotPlaceholder` 선례와 동일 패턴).
 */
function renderSubMenuPlaceholder(): ReactNode {
  return (
    <span className="inline-flex h-[var(--sz-32)] w-full items-center justify-center rounded-xs bg-bg-neutral-deepDark text-label-2 text-typo-neutral-light">
      {SUBMENU_PLACEHOLDER_LABEL}
    </span>
  );
}

/**
 * boolean 컨트롤 값만 placeholder 로 치환하고, 실제 ReactNode 가 args 로 들어온 경우는
 * 그대로 통과시킨다(`BoardAccordion`/`HorizontalMenuButton` 선례와 동일 패턴).
 */
function resolveSlot(
  value: unknown,
  renderPlaceholder: () => ReactNode,
): ReactNode {
  if (typeof value !== "boolean") return value as ReactNode;
  return value ? renderPlaceholder() : undefined;
}

const TAB_LABELS = [
  "전체",
  "맛집",
  "카페",
  "숙소",
  "액티비티",
  "쇼핑",
  "기타",
  "명소",
  "음식점",
  "숙박",
  "레포츠",
  "문화",
];

const meta = {
  title: "Components/ToggleTabs",
  component: ToggleTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / ToggleTabs" (node 51405:153913) 와 1:1. 가로 스크롤 가능한 `Toggle`(round) 목록을 감싸는 탭 바 컨테이너다. `size`(sm/md) × `subMenu`(false/true) 축을 지원하며, `subMenu=true` 면 우측에 chevron 인디케이터 버튼이 추가되어 클릭 시 `SubMenuList`(자유 슬롯 `subMenuContent`)를 BottomSheet처럼 펼치고 접는다. 펼침 시 배경에 Dim 레이어가 나타나고, 펼침/접힘은 `Accordion` 과 동일한 높이 트랜지션(0↔px→auto)으로 처리된다. "Expand Interaction" 스토리에서 실제 서브메뉴 펼침/접힘 동작을 확인할 수 있다.',
      },
      story: { height: "80px" },
    },
  },
  // 컴포넌트를 화면 상단에 고정하고, 배경은 연한 회색(`bg-bg-neutral-deep`)으로 깔아
  // 흰 배경인 ToggleTabs/SubMenuList가 대비되어 보이도록 한다(BottomSheet 패턴 유사).
  // SubMenuList가 펼쳐질 때 뒤에 Dim 레이어가 나타난다. 가로 스크롤바는 시각적으로
  // 숨긴다 — `Scroll` 컴포넌트 자체는 네이티브 스크롤을 유지하므로 스토리 전용 스타일만 적용.
  decorators: [
    (Story) => (
      <div className="toggletabs-story-wrapper bg-bg-neutral-deep h-[300px]">
        <style>{`
          .toggletabs-story-wrapper [data-axis="x"] { scrollbar-width: none; }
          .toggletabs-story-wrapper [data-axis="x"]::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="sticky top-0 z-10">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    size: "sm",
    subMenu: false,
    subMenuContent: true,
    children: undefined,
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
    },
    subMenu: { control: "boolean" },
    expanded: { control: "boolean" },
    defaultExpanded: { control: "boolean" },
    // ReactNode 슬롯은 Storybook 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 난다.
    // boolean 토글로 노출하고, 아래 render 에서 "서브메뉴" 텍스트가 있는 회색 박스
    // placeholder 로 치환한다(`BoardAccordion` 선례와 동일 패턴).
    subMenuContent: {
      control: "boolean",
      table: { type: { summary: "ReactNode" } },
    },
  },
  render: ({ size, subMenuContent, ...args }) => (
    <ToggleTabs
      {...args}
      size={size}
      subMenuContent={resolveSlot(subMenuContent, renderSubMenuPlaceholder)}
    >
      {TAB_LABELS.map((label) => (
        <Toggle key={label} variant="round" size={size}>
          {label}
        </Toggle>
      ))}
    </ToggleTabs>
  ),
} satisfies Meta<typeof ToggleTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: "sm",
    subMenu: false,
    subMenuContent: true,
    children: undefined,
  },
  render: ({ size, subMenu, subMenuContent, ...args }) => (
    <PlaygroundDemo
      {...args}
      size={size}
      subMenu={subMenu}
      subMenuContent={subMenuContent}
    />
  ),
};

function PlaygroundDemo(
  args: Partial<React.ComponentProps<typeof ToggleTabs>>,
) {
  const [expanded, setExpanded] = useState(false);
  const size = args.size ?? "sm";
  const subMenu = args.subMenu ?? false;

  return (
    <>
      {subMenu && expanded && <Dim className="fixed inset-0 z-0" />}
      <div className="relative z-10">
        <ToggleTabs
          {...args}
          size={size}
          subMenu={subMenu}
          expanded={subMenu ? expanded : undefined}
          onExpandedChange={subMenu ? setExpanded : undefined}
          subMenuContent={
            subMenu
              ? resolveSlot(args.subMenuContent, renderSubMenuPlaceholder)
              : undefined
          }
        >
          {TAB_LABELS.map((label) => (
            <Toggle key={label} variant="round" size={size}>
              {label}
            </Toggle>
          ))}
        </ToggleTabs>
      </div>
    </>
  );
}

/** 인디케이터 클릭 시 펼침/접힘이 토글되고 Dim이 나타나는지 확인하는 play function. */
export const ExpandInteraction: Story = {
  args: {
    size: "sm",
    subMenu: true,
    children: null,
  },
  parameters: { layout: "fullscreen" },
  render: (args) => <ExpandInteractionDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    const indicator = buttons[buttons.length - 1];

    await expect(indicator).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(indicator);
    await expect(indicator).toHaveAttribute("aria-expanded", "true");

    const contentId = indicator.getAttribute("aria-controls")!;
    const content = canvasElement.querySelector(`#${contentId}`)!;
    await expect(content).toHaveAttribute("aria-hidden", "false");

    await userEvent.click(indicator);
    await expect(indicator).toHaveAttribute("aria-expanded", "false");
  },
};

function ExpandInteractionDemo(args: React.ComponentProps<typeof ToggleTabs>) {
  const [expanded, setExpanded] = useState(false);
  const size = args.size ?? "sm";
  return (
    <div className="bg-bg-neutral-deep min-h-screen">
      <Dim className={`fixed inset-0 ${expanded ? "z-0" : "hidden"}`} />
      <div className="relative z-10 bg-white">
        <ToggleTabs
          {...args}
          expanded={expanded}
          onExpandedChange={setExpanded}
          subMenuContent={renderSubMenuPlaceholder()}
        >
          {TAB_LABELS.map((label) => (
            <Toggle key={label} variant="round" size={size}>
              {label}
            </Toggle>
          ))}
        </ToggleTabs>
      </div>
    </div>
  );
}
