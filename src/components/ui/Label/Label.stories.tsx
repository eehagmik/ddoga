import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, within } from "@storybook/test";

import { Input } from "../Input";
import { Label } from "./Label";

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "padded",
    design: {
      url: "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-108505",
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Label",
    size: "sm",
    isBold: false,
    principal: true,
    info: true,
    onInfoClick: fn(),
  },
  argTypes: {
    label: {
      control: "text",
      description: "라벨 텍스트 내용",
    },
    size: {
      control: "radio",
      options: ["sm", "md"],
      description: "크기 축",
    },
    isBold: {
      control: "boolean",
      description: "굵게 여부",
    },
    principal: {
      control: "boolean",
      description: "필수 표시(*) 렌더 여부",
    },
    info: {
      control: "boolean",
      description: "정보 아이콘 렌더 여부",
    },
    onInfoClick: {
      action: "onInfoClick",
      description: "정보 아이콘 클릭 핸들러",
    },
    infoLabel: {
      control: "text",
      description: "정보 아이콘 버튼 접근성 라벨(aria-label). 기본 '정보 보기'",
    },
    htmlFor: {
      control: "text",
      description:
        "지정하면 라벨 텍스트를 <label htmlFor> 로 렌더해 폼 요소와 접근성을 연결한다",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * sm 크기, 굵기 아님, 필수 표시 + 정보 아이콘 함께 표시 (기본값)
 */
export const Default: Story = {};

/**
 * sm 크기, 굵음
 */
export const SmBold: Story = {
  args: {
    isBold: true,
  },
};

/**
 * md 크기, 굵기 아님
 */
export const Md: Story = {
  args: {
    size: "md",
  },
};

/**
 * md 크기, 굵음
 */
export const MdBold: Story = {
  args: {
    size: "md",
    isBold: true,
  },
};

/**
 * 필수 표시 없음
 */
export const NoPrincipal: Story = {
  args: {
    principal: false,
  },
};

/**
 * 정보 아이콘 없음
 */
export const NoInfo: Story = {
  args: {
    info: false,
  },
};

/**
 * 필수 표시 + 정보 아이콘 모두 없음
 */
export const TextOnly: Story = {
  args: {
    principal: false,
    info: false,
  },
};

/**
 * md 크기, 굵음, 필수 표시만 (정보 아이콘 없음)
 */
export const MdBoldPrincipalOnly: Story = {
  args: {
    size: "md",
    isBold: true,
    principal: true,
    info: false,
  },
};

/**
 * md 크기, 굵지 않음, 정보 아이콘만 (필수 표시 없음)
 */
export const MdInfoOnly: Story = {
  args: {
    size: "md",
    isBold: false,
    principal: false,
    info: true,
  },
};

/**
 * htmlFor 로 <input> 과 접근성 연결 — `TextField` 가 라벨 행을 조합할 때 쓰는 패턴.
 * `label[for]` ↔ `input[id]` 매칭으로 스크린리더가 라벨 텍스트를 읽어준다.
 */
export const WithHtmlFor: Story = {
  args: {
    label: "이름",
    htmlFor: "label-story-name-input",
  },
  render: (args) => (
    <div className="flex w-[280px] flex-col gap-(--sz-8)">
      <Label {...args} />
      <Input id="label-story-name-input" placeholder="이름을 입력하세요" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("이름");
    await expect(input).toBeInTheDocument();
    await expect(input.tagName).toBe("INPUT");
  },
};

/**
 * infoLabel 로 정보 아이콘 접근성 라벨(aria-label) 커스터마이즈 — 기본값 '정보 보기'
 * 대신 '자세히 보기' 로 덮어쓴 예시(`TextField` 의 기본 infoLabel 과 동일).
 */
export const CustomInfoLabel: Story = {
  args: {
    label: "이름",
    infoLabel: "자세히 보기",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "자세히 보기" }),
    ).toBeInTheDocument();
  },
};
