import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { expect, within } from "@storybook/test";

import { BulletItem } from "./BulletItem";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-10523";

const meta = {
  title: "Components/BulletItem",
  component: BulletItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / BulletItem" (node 51405:10523) 와 1:1. 가운뎃점(·) 마커 + 제목/본문으로 한 항목을 표시한다. `color`(neutral·brand·danger·warning·info) × `direction`(vertical·horizontal) × `size`(sm·md·lg) × `bold` 조합. Figma 원본 variant 철자 `horizonal` 은 코드에서 `horizontal` 로 정정했다. 마커는 항상 렌더되는 장식 요소이며, 색·타이포·간격은 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  argTypes: {
    titleValue: { control: "text" },
    contentsText: { control: "text" },
    color: {
      control: "inline-radio",
      options: ["neutral", "brand", "danger", "warning", "info"],
    },
    direction: { control: "inline-radio", options: ["vertical", "horizontal"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    bold: { control: "boolean" },
    title: { control: "boolean" },
    contents: { control: "boolean" },
  },
} satisfies Meta<typeof BulletItem>;

export default meta;

type Story = StoryObj<typeof meta>;

const COLORS = ["neutral", "brand", "danger", "warning", "info"] as const;
const SIZES = ["sm", "md", "lg"] as const;

/** Figma 320px 프레임을 재현하는 데모 래퍼 (컴포넌트 자체는 w-full). */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[var(--sz-320)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {children}
    </div>
  );
}

export const Playground: Story = {
  args: {
    titleValue: "Title",
    contentsText: "Contents Text",
    color: "neutral",
    direction: "vertical",
    size: "sm",
    bold: true,
    title: true,
    contents: true,
  },
  render: (args) => (
    <Frame>
      <BulletItem {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[data-color]");
    await expect(root).toBeInTheDocument();
    await expect(root).toHaveAttribute("data-direction", "vertical");
    await expect(root).toHaveAttribute("data-size", "sm");

    const canvas = within(canvasElement);
    await expect(canvas.getByText("Title")).toBeInTheDocument();
    await expect(canvas.getByText("Contents Text")).toBeInTheDocument();

    const marker = canvasElement.querySelector('[data-part="marker"]');
    await expect(marker).toHaveTextContent("·");
    await expect(marker).toHaveAttribute("aria-hidden", "true");
  },
};

export const Colors: Story = {
  render: () => (
    <Frame>
      <div className="flex flex-col gap-[var(--sz-16)]">
        {COLORS.map((color) => (
          <BulletItem
            key={color}
            color={color}
            titleValue={color}
            contentsText={`${color} 계열 본문 텍스트입니다.`}
          />
        ))}
      </div>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll("[data-color]");
    await expect(roots).toHaveLength(5);
    await expect(
      Array.from(roots).map((r) => r.getAttribute("data-color")),
    ).toEqual([...COLORS]);
  },
};

export const Sizes: Story = {
  render: () => (
    <Frame>
      <div className="flex flex-col gap-[var(--sz-20)]">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col gap-[var(--sz-6)]">
            <code className="text-body-6 text-typo-neutral-light">{size}</code>
            <BulletItem
              size={size}
              titleValue={`size = ${size}`}
              contentsText="제목과 본문의 타이포 스케일이 함께 바뀝니다."
            />
          </div>
        ))}
      </div>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll("[data-size]");
    await expect(
      Array.from(roots).map((r) => r.getAttribute("data-size")),
    ).toEqual([...SIZES]);

    const titles = canvasElement.querySelectorAll('[data-part="title"]');
    await expect(titles[0]).toHaveClass("text-body-5-bold");
    await expect(titles[1]).toHaveClass("text-body-4-bold");
    await expect(titles[2]).toHaveClass("text-body-3-bold");
  },
};

export const Directions: Story = {
  render: () => (
    <Frame>
      <div className="flex flex-col gap-[var(--sz-24)]">
        <BulletItem
          direction="vertical"
          titleValue="세로 배치"
          contentsText="제목 아래에 본문이 쌓입니다."
        />
        <BulletItem
          direction="horizontal"
          titleValue="가로 배치"
          contentsText="제목과 본문이 나란히 놓이며, 제목 열은 고정 폭입니다."
        />
      </div>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll("[data-direction]");
    await expect(
      Array.from(roots).map((r) => r.getAttribute("data-direction")),
    ).toEqual(["vertical", "horizontal"]);

    const horizontalTitle = canvasElement.querySelector(
      '[data-direction="horizontal"] [data-part="title"]',
    );
    await expect(horizontalTitle).toHaveClass("w-[var(--sz-128)]", "shrink-0");
  },
};

export const BoldToggle: Story = {
  render: () => (
    <Frame>
      <div className="flex flex-col gap-[var(--sz-16)]">
        <BulletItem
          bold
          titleValue="bold: true — 제목 Bold"
          contentsText="본문은 항상 Medium 입니다."
        />
        <BulletItem
          bold={false}
          titleValue="bold: false — 제목 Medium"
          contentsText="본문은 항상 Medium 입니다."
        />
      </div>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const titles = canvasElement.querySelectorAll('[data-part="title"]');
    await expect(titles[0]).toHaveClass("text-body-5-bold");
    await expect(titles[1]).toHaveClass("text-body-5");
    await expect(titles[1]).not.toHaveClass("text-body-5-bold");
  },
};

export const TitleOrContentsOnly: Story = {
  name: "제목만 / 본문만",
  render: () => (
    <Frame>
      <div className="flex flex-col gap-[var(--sz-16)]">
        <BulletItem titleValue="제목만 표시" contents={false} />
        <BulletItem contentsText="본문만 표시" title={false} />
      </div>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("제목만 표시")).toBeInTheDocument();
    await expect(canvas.getByText("본문만 표시")).toBeInTheDocument();
    await expect(canvas.queryByText("Title")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Contents Text")).not.toBeInTheDocument();

    // 마커는 title/contents 와 무관하게 항상 렌더
    await expect(
      canvasElement.querySelectorAll('[data-part="marker"]'),
    ).toHaveLength(2);
  },
};
