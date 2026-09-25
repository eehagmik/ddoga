import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { HelperLabel } from "./HelperLabel";

const meta = {
  title: "UI / Forms / HelperLabel",
  component: HelperLabel,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-108524&t=uPlGwiJ4Kh7vuEoS-11",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "도움말 텍스트",
    },
    size: {
      control: "radio",
      options: ["sm", "md"],
      description: "크기",
    },
    variant: {
      control: "radio",
      options: ["default", "success", "danger", "warning"],
      description: "상태 (아이콘·색)",
    },
  },
} satisfies Meta<typeof HelperLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** default 상태, sm 크기 */
export const DefaultSm: Story = {
  args: {
    label: "Helper Label Message",
    size: "sm",
    variant: "default",
  },
};

/** default 상태, md 크기 */
export const DefaultMd: Story = {
  args: {
    label: "Helper Label Message",
    size: "md",
    variant: "default",
  },
};

/** success 상태(체크 아이콘), sm 크기 */
export const SuccessSm: Story = {
  args: {
    label: "Helper Label Message",
    size: "sm",
    variant: "success",
  },
};

/** success 상태(체크 아이콘), md 크기 */
export const SuccessMd: Story = {
  args: {
    label: "Helper Label Message",
    size: "md",
    variant: "success",
  },
};

/** danger 상태(경고 삼각형), sm 크기 */
export const DangerSm: Story = {
  args: {
    label: "Helper Label Message",
    size: "sm",
    variant: "danger",
  },
};

/** danger 상태(경고 삼각형), md 크기 */
export const DangerMd: Story = {
  args: {
    label: "Helper Label Message",
    size: "md",
    variant: "danger",
  },
};

/** warning 상태(경고 원), sm 크기 */
export const WarningSm: Story = {
  args: {
    label: "Helper Label Message",
    size: "sm",
    variant: "warning",
  },
};

/** warning 상태(경고 원), md 크기 */
export const WarningMd: Story = {
  args: {
    label: "Helper Label Message",
    size: "md",
    variant: "warning",
  },
};

/** 한글 2줄 이상 텍스트 — word-break: keep-all 테스트 */
export const LongKorean: Story = {
  args: {
    label:
      "비밀번호는 8자 이상 20자 이하이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.",
    size: "md",
    variant: "danger",
  },
};

/** play function — 렌더링 검증 */
export const RenderCheck: Story = {
  args: {
    label: "Test Message",
    size: "sm",
    variant: "success",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 루트 엘리먼트 존재 확인
    const root = canvas.getByText("Test Message").parentElement;
    expect(root).toBeInTheDocument();

    // 텍스트 존재 확인
    const textElement = canvas.getByText("Test Message");
    expect(textElement).toBeInTheDocument();

    // flex row 레이아웃 확인
    expect(root).toHaveClass("flex");
    expect(root).toHaveClass("items-start");

    // gap 스타일 확인
    expect(root).toHaveClass("gap-(--sz-5)");
  },
};

/** play function — 크기별 타이포 검증 */
export const TypographyCheck: Story = {
  args: {
    label: "Typography Test",
    size: "md",
    variant: "default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textElement = canvas.getByText("Typography Test");

    // md 사이즈 타이포 클래스 확인
    expect(textElement).toHaveClass("text-[length:var(--text-sm)]");
    expect(textElement).toHaveClass("tracking-[-0.16px]");
    expect(textElement).toHaveClass("leading-[1.47]");
  },
};

/** play function — 색상 검증 */
export const ColorCheck: Story = {
  args: {
    label: "Color Test",
    size: "sm",
    variant: "danger",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textElement = canvas.getByText("Color Test");

    // danger 색상 클래스 확인
    expect(textElement).toHaveClass("text-typo-danger-normal");
  },
};
