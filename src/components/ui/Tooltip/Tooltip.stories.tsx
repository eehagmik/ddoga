import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { BlankIcon } from "../BlankIcon";
import type { TooltipPlacement, TooltipTone } from "./Tooltip";
import { Tooltip } from "./Tooltip";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-154745";

const TONES: TooltipTone[] = ["dark", "light"];

const PLACEMENTS: TooltipPlacement[] = [
  "top-start",
  "top",
  "top-end",
  "right-start",
  "right",
  "right-end",
  "bottom-start",
  "bottom",
  "bottom-end",
  "left-start",
  "left",
  "left-end",
];

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Tooltip" (node 51405:154754) 와 1:1. 기준 요소 옆에 뜨는 말풍선. `tone`(dark/light) × `placement`(side 4 × align 3 = 12) 에 좌측 `icon` 슬롯과 우측 닫기 버튼(`closable`)을 지원한다. **말풍선 UI 만** 책임지며 hover 트리거·위치 계산·portal·GROW 애니메이션은 범위 밖이다. 색·간격·그림자는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    tone: "dark",
    placement: "top",
    closable: false,
    icon: false,
    children: "툴팁 텍스트",
    onClose: fn(),
  },
  argTypes: {
    tone: { control: "inline-radio", options: TONES },
    placement: { control: "select", options: PLACEMENTS },
    closable: { control: "boolean" },
    closeLabel: { control: "text" },
    maxWidth: { control: "text" },
    children: { control: "text" },
    // ReactNode 슬롯은 Storybook 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 난다.
    // boolean 토글로 노출하고 켜면 디자인 시스템 `BlankIcon`(placeholder) 을 넣는다.
    icon: {
      control: "boolean",
      mapping: {
        true: <BlankIcon className="size-full" />,
        false: undefined,
      },
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/** dark / light 표면. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex items-start gap-(--sz-24)">
      {TONES.map((tone) => (
        <Tooltip key={tone} {...args} tone={tone}>
          {tone}
        </Tooltip>
      ))}
    </div>
  ),
};

/** 12개 placement 전부 (side 4 × align 3). */
export const AllPlacements: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="grid grid-cols-3 gap-(--sz-48) p-(--sz-48)">
      {PLACEMENTS.map((placement) => (
        <div
          key={placement}
          className="flex flex-col items-center gap-(--sz-8)"
        >
          <span className="text-body-6 text-typo-neutral-light">
            {placement}
          </span>
          <Tooltip {...args} placement={placement}>
            {placement}
          </Tooltip>
        </div>
      ))}
    </div>
  ),
};

/** 좌측 아이콘 슬롯(`src/icons` 의 `<Icon>`, tone 별 `text-icon-*` 상속). */
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex items-start gap-(--sz-24)">
      {TONES.map((tone) => (
        <Tooltip
          key={tone}
          {...args}
          tone={tone}
          icon={<Icon name="annotation_info_line" className="size-full" />}
        >
          도움말 텍스트
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * closable=true — 우측 닫기 버튼. play 에서 클릭 → onClose 호출을 검증한다.
 */
export const Closable: Story = {
  args: { closable: true },
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "닫기" });
    await userEvent.click(btn);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/** 아이콘 + 닫기 버튼 동시. */
export const WithIconAndClose: Story = {
  args: {
    closable: true,
    icon: <Icon name="annotation_info_line" className="size-full" />,
    children: "저장하기 전에 필수 항목을 모두 채워 주세요.",
  },
};

/** 개행(`\n`)은 `whitespace-pre-line` 으로 보존된다. */
export const MultilineText: Story = {
  args: { children: "첫 번째 줄\n두 번째 줄\n세 번째 줄" },
};

/** 긴 본문 + `maxWidth` override (number → px). 기본은 `calc(100vw - var(--sz-32))`. */
export const LongText: Story = {
  args: {
    maxWidth: 220,
    closable: true,
    children:
      "툴팁 본문이 길어지면 지정한 최대 폭에서 줄바꿈됩니다. maxWidth 를 생략하면 화면 좌우 최소 여백 16px 을 확보한 범위에서 확장됩니다.",
  },
};
