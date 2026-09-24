import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Icon } from "../../../icons";
import type { ToastStatus } from "./Toast";
import { Toast } from "./Toast";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-152394";

const STATUSES: ToastStatus[] = ["normal", "danger", "warning", "info", "icon"];

const meta = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Toast" (node 51405:152394) 와 1:1. 페이지 최상단(Header 아래)에 노출되는 알림 배너. `status`(normal/danger/warning/info/icon) 단일 축이며, danger/warning/info 는 고정 아이콘 + 좌측 정렬, normal 은 아이콘 없이 중앙 정렬, icon 은 자유 아이콘 슬롯이다. **항상 부모 폭(뷰포트 전체 폭 컨테이너)을 꽉 채운다(`w-full`)**. 상단 고정 위치·슬라이드 애니메이션·5초 자동 소멸 타이머는 이 컴포넌트 범위 밖이다(호스트 담당).',
      },
    },
  },
  args: {
    status: "normal",
    children: "완료되었어요",
  },
  argTypes: {
    status: { control: "inline-radio", options: STATUSES },
    children: { control: "text" },
    icon: {
      control: "boolean",
      mapping: {
        true: (
          <Icon
            name="heart_solid"
            className="size-full text-icon-warning-normal"
          />
        ),
        false: undefined,
      },
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 status 축을 탐색. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("완료되었어요")).toBeInTheDocument();
  },
};

/** 5개 status 전부 — 항상 뷰포트(부모) 전체 폭을 채운다. */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--sz-8)]">
      <Toast status="normal">기본 안내 메시지예요</Toast>
      <Toast status="danger">오류가 발생했어요. 다시 시도해 주세요</Toast>
      <Toast status="warning">
        선택한 옵션이 구매 불가하여 구매 가능한 옵션으로 변경되었어요
      </Toast>
      <Toast status="info">일반적인 정보 안내 메시지예요</Toast>
      <Toast
        status="icon"
        icon={
          <Icon
            name="heart_solid"
            className="size-full text-icon-warning-normal"
          />
        }
      >
        자유 아이콘 슬롯 메시지예요
      </Toast>
    </div>
  ),
};

export const Normal: Story = {
  args: { status: "normal", children: "완료되었어요" },
};

export const Danger: Story = {
  args: { status: "danger", children: "오류가 발생했어요. 다시 시도해 주세요" },
};

export const Warning: Story = {
  args: {
    status: "warning",
    children: "선택한 옵션이 구매 불가하여 구매 가능한 옵션으로 변경되었어요",
  },
};

export const Info: Story = {
  args: { status: "info", children: "일반적인 정보 안내 메시지예요" },
};

export const WithFreeIcon: Story = {
  args: {
    status: "icon",
    icon: (
      <Icon name="heart_solid" className="size-full text-icon-warning-normal" />
    ),
    children: "상황에 맞는 아이콘을 자유롭게 지정할 수 있어요",
  },
};

/** 긴 텍스트는 최대 2줄로 잘린다(`line-clamp-2`). */
export const LongText: Story = {
  args: {
    status: "warning",
    children:
      "선택한 옵션이 구매 불가하여 구매 가능한 옵션으로 자동 변경되었어요. 안내 문구가 길어지는 경우에도 최대 2줄까지만 표시되고 그 이상은 잘립니다.",
  },
};
