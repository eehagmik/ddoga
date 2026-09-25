import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import type { ClearButtonSize } from "./ClearButton";
import { ClearButton } from "./ClearButton";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-67447";

const SIZES: ClearButtonSize[] = ["xs", "sm", "md"];

const meta = {
  title: "Components/ClearButton",
  component: ClearButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / ClearButton" (문서 node 51405:67427, 컴포넌트 세트 51405:67447) 와 1:1. 입력 필드·이미지 업로드 아이템 등 "삭제 가능한 UI 요소" 우측에 붙어 내용을 지우는 아이콘 버튼. 글리프는 `x_circle_solid`(채운 원 + x)로, Chip 삭제 버튼의 `x_close_solid` 와 구분된다. `size`(xs/sm/md)가 유일한 축이며 Figma 에 상태 축이 없어 focus 만 CSS 로 처리한다. 색·크기·투명도는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    size: "xs",
    label: "지우기",
    onClick: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    label: { control: "text" },
  },
} satisfies Meta<typeof ClearButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** xs — 14×14, Figma 기본 variant. play 에서 클릭 → onClick 호출을 검증한다. */
export const Xs: Story = {
  args: { size: "xs" },
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "지우기" });
    await expect(btn).toHaveAttribute("data-size", "xs");
    await expect(btn).toHaveClass("size-(--sz-14)");

    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** sm — 16×16. */
export const Sm: Story = {
  args: { size: "sm" },
};

/** md — 18×18. */
export const Md: Story = {
  args: { size: "md" },
};

/** 세 사이즈 나란히 비교. */
export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-(--sz-16)">
      {SIZES.map((size) => (
        <ClearButton {...args} key={size} size={size} />
      ))}
    </div>
  ),
};

/**
 * 어두운 배경(예: 이미지 썸네일) 위에서는 호출부가 `className` 으로 아이콘 색을
 * 덮어쓴다 — 전용 tone prop 은 없다.
 */
export const OnDarkSurface: Story = {
  args: { size: "md" },
  render: (args) => (
    <div className="flex items-center justify-center rounded-md bg-bg-neutral-dark p-(--sz-24)">
      <ClearButton {...args} className="text-icon-inverse-normal" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "지우기" });
    await expect(btn).toHaveClass("text-icon-inverse-normal");
  },
};

/** disabled — 네이티브 button 기본 동작으로 클릭이 차단된다(별도 스타일 없음). */
export const Disabled: Story = {
  args: { size: "md", disabled: true },
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "지우기" });
    await expect(btn).toBeDisabled();

    await userEvent.click(btn);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
