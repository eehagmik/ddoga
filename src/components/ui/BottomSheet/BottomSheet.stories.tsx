import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { BottomSheet } from "./BottomSheet";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-8551";

const meta = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / BottomSheet" (문서 node 51405:8199, 메인 컴포넌트 node 51405:8551/8552) 와 1:1. 화면 하단에서 올라오는 오버레이 패널로, `Dim` 을 내부에 소유해 여닫을 때 Dim 은 fade in/out, 패널은 슬라이드업/다운 된다. 하단에 `FixButton` 을 합성할 수 있다(`fixButton` prop). `open`(controlled)/`onClose` 로 라이프사이클을 제어한다.',
      },
    },
  },
  argTypes: {
    open: { control: "boolean" },
    header: { control: "boolean" },
    closable: { control: "boolean" },
    closeOnDimClick: { control: "boolean" },
    closeOnEsc: { control: "boolean" },
    title: { control: "text" },
    headerActionLabel: { control: "text" },
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 트리거 버튼으로 여닫는 기본 데모. 모든 args 를 컨트롤에 노출한다. */
export const Playground: Story = {
  args: {
    open: false,
    title: "Title",
    header: true,
    closable: true,
    closeOnDimClick: true,
    closeOnEsc: true,
  },
  render: (args) => {
    function Demo() {
      const [open, setOpen] = useState(args.open);
      return (
        <div className="flex min-h-dvh items-center justify-center bg-bg-neutral-deep">
          <button
            type="button"
            className="rounded-md bg-bg-brand-normal px-(--sz-16) py-(--sz-8) text-body-4 text-typo-inverse-normal"
            onClick={() => setOpen(true)}
          >
            바텀시트 열기
          </button>
          <BottomSheet {...args} open={open} onClose={() => setOpen(false)}>
            <p className="text-body-4 text-typo-neutral-normal">
              바디 콘텐츠 영역입니다.
            </p>
          </BottomSheet>
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "바텀시트 열기" }),
    );
    const dialog = await waitFor(() =>
      canvas.getByRole("dialog", { name: "Title" }),
    );
    await expect(dialog).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "닫기" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};

/** 헤더 우측 보조 텍스트 버튼 조합(Figma `button` prop). */
export const WithHeaderAction: Story = {
  args: {
    open: true,
    title: "정산 내역",
    headerActionLabel: "편집",
  },
  render: (args) => (
    <div className="h-dvh bg-bg-neutral-deep">
      <BottomSheet {...args}>
        <p className="text-body-4 text-typo-neutral-normal">
          바디 콘텐츠 영역입니다.
        </p>
      </BottomSheet>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "편집" }),
    ).toBeInTheDocument();
  },
};

/** 닫기 아이콘버튼 없이 사용하는 케이스(Figma `closable=false`). */
export const WithoutCloseButton: Story = {
  args: {
    open: true,
    title: "약관 동의",
    closable: false,
  },
  render: (args) => (
    <div className="h-dvh bg-bg-neutral-deep">
      <BottomSheet {...args}>
        <p className="text-body-4 text-typo-neutral-normal">
          바디 콘텐츠 영역입니다.
        </p>
      </BottomSheet>
    </div>
  ),
};

/** 헤더 섹션 자체가 없는 케이스(Figma `header=false`). */
export const WithoutHeader: Story = {
  args: {
    open: true,
    header: false,
  },
  render: (args) => (
    <div className="h-dvh bg-bg-neutral-deep">
      <BottomSheet {...args}>
        <p className="text-body-4 text-typo-neutral-normal">
          헤더 없이 본문만 노출됩니다.
        </p>
      </BottomSheet>
    </div>
  ),
};

/**
 * 하단 `FixButton` 합성 데모(Figma `fixButton` prop). FixButton 루트의
 * `position: fixed` 가 `!static !z-auto` 로 오버라이드되어 패널 내부 flex 흐름에
 * 정상 편입되는지(body 콘텐츠와 겹치지 않는지) 육안으로 확인한다.
 */
export const WithFixButton: Story = {
  args: {
    open: true,
    title: "상품 선택",
    fixButton: {
      variant: "single",
      primaryLabel: "선택 완료",
    },
  },
  render: (args) => (
    <div className="h-dvh bg-bg-neutral-deep">
      <BottomSheet {...args}>
        <p className="text-body-4 text-typo-neutral-normal">
          바디 콘텐츠 영역입니다.
        </p>
      </BottomSheet>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primaryButton = canvas.getByRole("button", { name: "선택 완료" });
    await expect(primaryButton).toBeInTheDocument();
    const fixButtonRoot = primaryButton.closest(
      '[data-variant="single"]',
    ) as HTMLElement;
    await expect(fixButtonRoot).toHaveClass("!static", "!z-auto");
  },
};

/** 긴 본문 콘텐츠로 바디 스크롤/패널 높이 가변을 확인하는 케이스. */
export const LongContent: Story = {
  args: {
    open: true,
    title: "이용약관",
    fixButton: {
      variant: "single",
      primaryLabel: "동의",
    },
  },
  render: (args) => (
    <div className="h-dvh bg-bg-neutral-deep">
      <BottomSheet {...args}>
        <div className="flex flex-col gap-(--sz-12)">
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="text-body-4 text-typo-neutral-normal">
              {i + 1}. 약관 조항 내용이 이어지는 문단입니다.
            </p>
          ))}
        </div>
      </BottomSheet>
    </div>
  ),
};
