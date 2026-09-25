import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { Icon } from "./Icon";
import { ICON_NAMES } from "./iconNames";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=34-823";

const meta = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Icon" (node 34:823) 아이콘 세트 전량. line/solid 는 Figma 심볼명 그대로 별도 아이콘으로 등록된다. 색은 `currentColor` 를 상속하므로 부모에 `text-icon-*` 를 준다. `<Icon name=… />` 래퍼 또는 `src/icons/components/<name>` 개별 컴포넌트로 사용.',
      },
    },
  },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    size: { control: { type: "number", min: 12, max: 96, step: 2 } },
    title: { control: "text" },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 단일 아이콘 미리보기 (Controls 로 name/size/색 조합 확인). */
export const Playground: Story = {
  args: { name: "align_bottom_01_line", size: 32 },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector("svg");
    await expect(svg).toBeInTheDocument();
    await expect(svg?.querySelector("path")).toBeInTheDocument();
  },
};

/** 전체 갤러리 — 등록된 모든 아이콘을 이름과 함께 나열. */
export const Gallery: Story = {
  args: { name: "align_bottom_01_line" }, // render 에서 쓰지 않지만 타입상 필요
  render: () => (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(var(--sz-72),1fr))] gap-(--sz-8) bg-bg-neutral-normal p-(--sz-16) text-icon-neutral-normal">
      {ICON_NAMES.map((n) => (
        <li
          key={n}
          data-icon={n}
          className="flex flex-col items-center gap-(--sz-4) rounded-md border border-border-neutral-light p-(--sz-8)"
        >
          <Icon name={n} />
          <span className="w-full truncate text-center text-2xs text-typo-neutral-light">
            {n}
          </span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const items = canvasElement.querySelectorAll("[data-icon]");
    await expect(items).toHaveLength(ICON_NAMES.length);
    await expect(
      canvasElement.querySelector("[data-icon] svg path"),
    ).toBeInTheDocument();
  },
};
