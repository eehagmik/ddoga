import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { LikeToggle } from "../LikeToggle";
import type {
  FixButtonAsymmetryProps,
  FixButtonIconButtonProps,
  FixButtonLikeToggleProps,
  FixButtonSingleProps,
  FixButtonSymmetryProps,
  FixButtonVerticalProps,
} from "./FixButton";
import { FixButton } from "./FixButton";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-84574";

const meta = {
  title: "Components/FixButton",
  component: FixButton,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / FixButton" (node 51405:84574) 와 1:1. 화면 하단에 항상 고정되는 CTA 버튼 영역이다. `variant`(single/symmetry/asymmetry/iconButton/likeToggle/vertical) 6종과 `gradientVisible`(상단 스크림 페이드) 축을 지원한다. 보더·그림자 없음 — 콘텐츠와의 분리는 그라데이션으로만 표현한다.',
      },
      story: { height: "500px" },
    },
  },
} satisfies Meta<typeof FixButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 스크롤을 유발하는 더미 콘텐츠 — FixButton이 그 아래(뒤) 고정되는 맥락을 보여준다. */
function TallContent() {
  return (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-dark p-[var(--sz-20)] pb-[var(--sz-160)]">
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i} className="text-body-4 text-typo-neutral-normal">
          {i + 1}. 스크롤되는 콘텐츠. 화면 하단에는 FixButton이 항상 고정되어
          있습니다.
        </p>
      ))}
    </div>
  );
}

const singlePrimaryClick = fn();

export const Single: Story = {
  args: {
    variant: "single",
    gradientVisible: true,
    primaryLabel: "확인",
    onPrimaryClick: singlePrimaryClick,
  } as FixButtonSingleProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonSingleProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      "[data-variant='single']",
    ) as HTMLElement;
    await expect(root).toHaveAttribute("data-gradient", "true");
    const btn = within(canvasElement).getByRole("button", { name: "확인" });
    await userEvent.click(btn);
    await expect(singlePrimaryClick).toHaveBeenCalledTimes(1);
  },
};

export const Symmetry: Story = {
  args: {
    variant: "symmetry",
    secondaryLabel: "취소",
    primaryLabel: "확인",
  } as FixButtonSymmetryProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonSymmetryProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const secondary = canvas.getByRole("button", { name: "취소" });
    const primary = canvas.getByRole("button", { name: "확인" });
    await expect(secondary).toHaveClass("flex-1");
    await expect(primary).toHaveClass("flex-1");
  },
};

export const Asymmetry: Story = {
  args: {
    variant: "asymmetry",
    secondaryLabel: "이전",
    primaryLabel: "다음 단계로 진행",
  } as FixButtonAsymmetryProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonAsymmetryProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const secondary = canvas.getByRole("button", { name: "이전" });
    const primary = canvas.getByRole("button", { name: "다음 단계로 진행" });
    await expect(secondary).toHaveClass("min-w-[var(--sz-100)]");
    await expect(primary).toHaveClass("flex-1");
  },
};

const iconButtonClick = fn();

export const IconButtonVariant: Story = {
  name: "IconButton",
  args: {
    variant: "iconButton",
    icon: <Icon name="share_01_line" className="size-full" />,
    iconAriaLabel: "공유",
    primaryLabel: "구매하기",
    onIconClick: iconButtonClick,
  } as FixButtonIconButtonProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonIconButtonProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iconBtn = canvas.getByRole("button", { name: "공유" });
    await expect(iconBtn).toHaveClass("size-[var(--sz-54)]");
    await userEvent.click(iconBtn);
    await expect(iconButtonClick).toHaveBeenCalledTimes(1);
    await expect(
      canvas.getByRole("button", { name: "구매하기" }),
    ).toBeInTheDocument();
  },
};

export const LikeToggleVariant: Story = {
  name: "LikeToggle",
  args: {
    variant: "likeToggle",
    toggleSlot: <LikeToggle variant="heart" />,
    primaryLabel: "장바구니 담기",
  } as FixButtonLikeToggleProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonLikeToggleProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const likeBtn = canvas.getByRole("button", { name: "좋아요" });
    await expect(likeBtn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(likeBtn);
    await expect(likeBtn).toHaveAttribute("aria-pressed", "true");
    // FixButton이 toggleSlot을 <button>으로 이중 래핑하지 않는지 확인.
    await expect(
      canvas.getAllByRole("button", { name: "장바구니 담기" }),
    ).toHaveLength(1);
  },
};

export const Vertical: Story = {
  args: {
    variant: "vertical",
    gradientVisible: true,
    primaryLabel: "로그인",
    secondaryTextLabel: "회원가입",
  } as FixButtonVerticalProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonVerticalProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "로그인" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "회원가입" }),
    ).toBeInTheDocument();
  },
};

export const WithoutGradient: Story = {
  args: {
    variant: "single",
    gradientVisible: false,
    primaryLabel: "확인",
  } as FixButtonSingleProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonSingleProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      "[data-variant='single']",
    ) as HTMLElement;
    await expect(root).toHaveAttribute("data-gradient", "false");
    await expect(root.querySelector("[aria-hidden]")).not.toBeInTheDocument();
  },
};

const disabledPrimaryClick = fn();

export const DisabledPrimary: Story = {
  args: {
    variant: "symmetry",
    secondaryLabel: "취소",
    primaryLabel: "확인",
    primaryDisabled: true,
    onPrimaryClick: disabledPrimaryClick,
  } as FixButtonSymmetryProps,
  render: (args) => (
    <>
      <TallContent />
      <FixButton {...(args as FixButtonSymmetryProps)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primary = canvas.getByRole("button", { name: "확인" });
    await expect(primary).toBeDisabled();
    await userEvent.click(primary);
    await expect(disabledPrimaryClick).not.toHaveBeenCalled();
  },
};
