import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Scroll } from "./Scroll";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-130405";

const meta = {
  title: "Components/Scroll",
  component: Scroll,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          "Figma \"또가3.0 Design System / Scroll\" (문서 페이지 51405:130393 / 메인 컴포넌트 51405:130405) 참고. Figma 노드 주석은 \"커스텀 스타일 없이 OS 기본 스크롤 사용\"을 명시하므로, 네이티브 overflow 스크롤 동작은 그대로 두고 `scrollbar-width`/`scrollbar-color` + `::-webkit-scrollbar*` 로 트랙/썸 색상만 토큰(`bg-bg-overlay-greenGraySubtle`/`greenGrayDeep`, `rounded-circle`)으로 오버라이드한다. `axis`('y'|'x')로 Figma 의 vertical/horizontal 예시를 대체한다.",
      },
    },
  },
  argTypes: {
    axis: { control: "inline-radio", options: ["y", "x"] },
  },
} satisfies Meta<typeof Scroll>;

export default meta;

type Story = StoryObj<typeof meta>;

const LONG_ITEMS = Array.from({ length: 20 }, (_, i) => `항목 ${i + 1}`);

/** 세로 스크롤(기본). 고정 높이 컨테이너에 긴 리스트를 채워 스크롤을 유발한다. */
export const Vertical: Story = {
  args: { axis: "y" },
  render: (args) => (
    <Scroll
      {...args}
      className="h-[var(--sz-160)] w-[var(--sz-224)] rounded-xs border border-border-neutral-light p-[var(--sz-8)]"
    >
      <ul className="flex flex-col gap-[var(--sz-8)]">
        {LONG_ITEMS.map((item) => (
          <li key={item} className="text-body-3 text-typo-neutral-normal">
            {item}
          </li>
        ))}
      </ul>
    </Scroll>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-axis="y"]')!;
    await expect(root).toHaveClass("overflow-y-auto");
    await expect(canvas.getByText("항목 1")).toBeInTheDocument();
  },
};

/** 가로 스크롤. 고정 너비 컨테이너에 줄바꿈 없는 넓은 콘텐츠를 채운다. */
export const Horizontal: Story = {
  args: { axis: "x" },
  render: (args) => (
    <Scroll
      {...args}
      className="w-[var(--sz-224)] rounded-xs border border-border-neutral-light p-[var(--sz-8)]"
    >
      <div className="flex w-max gap-[var(--sz-8)]">
        {LONG_ITEMS.map((item) => (
          <span
            key={item}
            className="whitespace-nowrap text-body-3 text-typo-neutral-normal"
          >
            {item}
          </span>
        ))}
      </div>
    </Scroll>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-axis="x"]')!;
    await expect(root).toHaveClass("overflow-x-auto");
    await expect(root).not.toHaveClass("overflow-y-auto");
  },
};

/** 카드 표면 안에 중첩한 실사용 문맥 재현(BottomSheet 바디 등). */
export const InCard: Story = {
  render: () => (
    <div className="flex w-[var(--sz-320)] flex-col overflow-clip rounded-2xl bg-bg-neutral-normal shadow-black-lg">
      <div className="shrink-0 border-b border-border-neutral-light px-[var(--sz-16)] py-[var(--sz-14)] text-body-3-bold text-typo-neutral-normal">
        타이틀
      </div>
      <Scroll
        axis="y"
        className="h-[var(--sz-160)] px-[var(--sz-16)] py-[var(--sz-12)]"
      >
        <ul className="flex flex-col gap-[var(--sz-8)]">
          {LONG_ITEMS.map((item) => (
            <li key={item} className="text-body-3 text-typo-neutral-normal">
              {item}
            </li>
          ))}
        </ul>
      </Scroll>
    </div>
  ),
};
