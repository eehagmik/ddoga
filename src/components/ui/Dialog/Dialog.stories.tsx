import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { ButtonWithLabel } from "../ButtonWithLabel";
import { Dialog } from "./Dialog";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-디고3.0--Design-System?node-id=51405-74632";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Dialog"(node 51405:74643) + "DialogText"(node 51405:74651) 대응. DialogText 는 Figma 상 "디자인에서만 사용" 되는 타이포그래피 레퍼런스라 별도 컴포넌트로 만들지 않고, MainText/SubText 를 이 컴포넌트에 기본 내장했다. `open`/`onClose` 로 Dim 오버레이 + 카드 opacity·scale 트랜지션 + mount/unmount 라이프사이클을 오케스트레이션한다(`BottomSheet` 와 동일한 오케스트레이션 패턴). 헤더(`pageName`)·본문 텍스트(`mainText`/`subText`)·자유 콘텐츠(`children`)·버튼영역(`primaryLabel`/`secondaryLabel`)을 각각 선택적으로 조합한다. Dim 클릭/ESC 로 닫기와 포커스 트랩은 범위 밖 — 헤더의 닫기(X) 버튼만 유일한 닫기 트리거다.',
      },
    },
  },
  args: {
    open: true,
    pageName: "Title",
    isCloseButton: true,
    onClose: fn(),
    mainText: "Main Text",
    subText: "Sub Text",
    primaryLabel: "확인",
    onPrimaryClick: fn(),
    secondaryLabel: "취소",
    onSecondaryClick: fn(),
  },
  argTypes: {
    open: { control: "boolean" },
    pageName: { control: "text" },
    isCloseButton: { control: "boolean" },
    mainText: { control: "text" },
    subText: { control: "text" },
    primaryLabel: { control: "text" },
    secondaryLabel: { control: "text" },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/** 헤더 없이(`pageName` 생략) 본문·버튼만 구성. */
export const NoHeader: Story = {
  args: { pageName: undefined },
};

/** 헤더에 닫기 버튼을 숨긴 경우(`isCloseButton=false`). */
export const NoCloseButton: Story = {
  args: { isCloseButton: false },
};

/** 버튼영역 없이 텍스트만(둘 다 미지정 시 버튼영역 자체가 렌더되지 않는다). */
export const TextOnly: Story = {
  args: { primaryLabel: undefined, secondaryLabel: undefined },
};

/** 주 버튼 1개만(보조 버튼 없음 — `FixButton` `single` 변형과 동일한 조합). */
export const SinglePrimaryButton: Story = {
  args: { secondaryLabel: undefined },
};

/** MainText/SubText 를 `''` 로 명시해 숨기고, `children` 자유 슬롯만 렌더. */
export const CustomContentOnly: Story = {
  args: { mainText: "", subText: "" },
  render: (args) => (
    <Dialog {...args}>
      <div className="w-full rounded-md bg-bg-neutral-deep p-[var(--sz-12)] text-center text-body-4 text-typo-neutral-normal">
        커스텀 콘텐츠 슬롯
      </div>
    </Dialog>
  ),
};

/** 긴 SubText 가 줄바꿈되는지 확인. */
export const LongText: Story = {
  args: {
    subText:
      "본문이 길어지면 카드 폭 안에서 자동으로 줄바꿈되며, 버튼 영역과의 최소 간격은 토큰(--sz-26)으로 유지됩니다.",
  },
};

/**
 * 닫기 버튼 클릭 → `onClose` 호출을 검증하는 play function.
 */
export const CloseInteraction: Story = {
  play: async ({ args, canvasElement }) => {
    const closeBtn = within(canvasElement).getByRole("button", {
      name: "닫기",
    });
    await userEvent.click(closeBtn);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/**
 * 주/보조 버튼 클릭 → 각각의 콜백 호출을 검증하는 play function.
 */
export const ButtonInteraction: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "취소" }));
    await expect(args.onSecondaryClick).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole("button", { name: "확인" }));
    await expect(args.onPrimaryClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * 트리거 버튼으로 `open` state 를 직접 토글해 실제 열기/닫기 흐름(Dim 페이드 인/아웃,
 * 카드 opacity+scale 트랜지션, mount/unmount)을 시연한다. controls 의 `open` 은 이
 * 스토리에서는 내부 state 가 대신하므로 무시된다(`false` 로 시작).
 */
export const Interactive: Story = {
  args: { open: false },
  render: (args) => {
    function InteractiveDialog() {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex min-h-dvh items-center justify-center">
          <ButtonWithLabel onClick={() => setOpen(true)}>
            다이얼로그 열기
          </ButtonWithLabel>
          <Dialog
            {...args}
            open={open}
            onClose={() => {
              args.onClose?.();
              setOpen(false);
            }}
          />
        </div>
      );
    }
    return <InteractiveDialog />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "다이얼로그 열기" }),
    );
    await expect(await canvas.findByRole("dialog")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "닫기" }));
    await waitFor(() => {
      expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    });
  },
};
