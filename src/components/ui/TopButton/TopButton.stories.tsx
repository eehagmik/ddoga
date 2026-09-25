import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { TopButton } from "./TopButton";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-156837";

const meta = {
  title: "Components/TopButton",
  component: TopButton,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / TopButton" (node 51405:156837) 와 1:1. 무한 스크롤 페이지에서 화면 우하단에 떠 있는 54×54 원형 버튼으로, 누르면 대상(기본 window)을 최상단으로 스크롤한다. 아래로 `showAfter`(기본 20)px 초과 스크롤 시 0.8초 fade-in 으로 나타나고 최상단 도달 시 fade-out 으로 사라진다. `prefers-reduced-motion` 사용자에게는 즉시 이동한다. 색·크기·그림자는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  argTypes: {
    showAfter: { control: { type: "number" } },
    visible: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof TopButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 스크롤을 유발하기 위한 세로로 긴 더미 콘텐츠. */
function TallContent() {
  return (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-20)">
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i} className="text-body-4 text-typo-neutral-normal">
          {i + 1}. 아래로 스크롤하면 우하단에 버튼이 나타납니다. 버튼을 누르면
          최상단으로 이동합니다.
        </p>
      ))}
    </div>
  );
}

/** 페이지(window) 스크롤에 반응하는 기본 사용례. */
export const Default: Story = {
  args: { showAfter: 20 },
  render: (args) => (
    <>
      <TallContent />
      <TopButton {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const btn = canvasElement.ownerDocument.querySelector(
      "button[data-visible]",
    ) as HTMLButtonElement;
    await expect(btn).toBeInTheDocument();
    await expect(btn).toHaveAttribute("data-visible", "false");

    window.scrollTo(0, 200);
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(btn).toHaveAttribute("data-visible", "true"));

    await userEvent.click(btn);
    await waitFor(() => expect(window.scrollY).toBe(0));
  },
};

/** 임의의 스크롤 컨테이너를 대상으로 지정하는 사용례(`scrollTargetRef`). */
export const InScrollContainer: Story = {
  args: { showAfter: 20 },
  render: (args) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div className="relative h-(--sz-320) w-(--sz-320) overflow-hidden">
        <div ref={ref} data-scroll-container className="h-full overflow-y-auto">
          <TallContent />
        </div>
        <TopButton {...args} scrollTargetRef={ref} className="absolute" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector(
      "[data-scroll-container]",
    ) as HTMLElement;
    const btn = canvas.getByRole("button", { name: "맨 위로", hidden: true });

    await expect(btn).toHaveAttribute("data-visible", "false");

    container.scrollTop = 120;
    container.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(btn).toHaveAttribute("data-visible", "true"));

    await userEvent.click(btn);
    await waitFor(() => expect(container.scrollTop).toBe(0));
    await waitFor(() => expect(btn).toHaveAttribute("data-visible", "false"));
  },
};

/** 노출 상태 고정 (controlled). */
export const Visible: Story = {
  args: { visible: true },
  render: (args) => (
    <div className="h-(--sz-320) bg-bg-neutral-normal">
      <TopButton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "맨 위로" });
    await expect(btn).toHaveAttribute("data-visible", "true");
    await expect(btn).toHaveClass("opacity-100");
  },
};

/** 숨김 상태 고정 (controlled) — 접근 트리에서 제외되고 클릭 불가. */
export const Hidden: Story = {
  args: { visible: false },
  render: (args) => (
    <div className="h-(--sz-320) bg-bg-neutral-normal">
      <TopButton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector(
      "button[data-visible]",
    ) as HTMLButtonElement;
    await expect(btn).toHaveAttribute("data-visible", "false");
    await expect(btn).toHaveClass("opacity-0", "pointer-events-none");
    await expect(btn).toHaveAttribute("aria-hidden", "true");
  },
};
