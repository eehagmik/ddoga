import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";

import { Icon } from "../../../icons";
import { IconButton } from "../IconButton";
import type { TextFieldVariant } from "./TextField";
import { TextField } from "./TextField";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-141075";

const VARIANTS: TextFieldVariant[] = [
  "line",
  "box",
  "transparentBody",
  "transparentTitle",
];

const meta = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / TextField" (컴포넌트 세트 node 51405:141075) 와 1:1. `variant`(line/box/transparentBody/transparentTitle) × `state`(enable/hover/focus/danger/disabled/readOnly) × `hasValue` 조합. hover/focus 는 CSS 의사클래스, danger/disabled/readOnly 는 props. line/box 만 라벨 행과 좌우 아이콘 슬롯을 가지며, transparentBody/transparentTitle 은 크롬 없는 중앙/타이틀형 텍스트다. 지우기 버튼은 Figma(hover/focus 시에만 노출) 와 달리 모바일 터치 환경을 고려해 hasValue 이면 항상 노출한다(Searchbar 선례).',
      },
    },
  },
  args: {
    variant: "line",
    value: "",
    placeholder: "값을 입력하세요",
    onChange: fn(),
    onClear: fn(),
    onInfoClick: undefined,
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    value: { control: "text" },
    placeholder: { control: "text" },
    label: { control: "text" },
    required: { control: "boolean" },
    danger: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    helperText: { control: "text" },
  },
  render: (args) => (
    <div className="w-[320px]">
      <TextField {...args} />
    </div>
  ),
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** line / 빈 값 — 라벨·필수 표시·정보 아이콘·헬퍼까지 모두 포함한 기본형. */
export const LineEmpty: Story = {
  args: {
    variant: "line",
    label: "이름",
    required: true,
    onInfoClick: fn(),
    helperText: "실명을 입력해주세요",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "이름" });
    await expect(input).toHaveAttribute("placeholder", "값을 입력하세요");
    await expect(
      canvas.queryByRole("button", { name: "지우기" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "자세히 보기" }),
    ).toBeInTheDocument();
  },
};

/** line / 값 있음 — 밑줄이 브랜드색으로 바뀌고 지우기 버튼이 노출된다. */
export const LineFilled: Story = {
  args: { variant: "line", label: "이름", value: "홍길동" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clearBtn = canvas.getByRole("button", { name: "지우기" });
    await expect(clearBtn).toBeInTheDocument();
  },
};

/** line / danger — 헬퍼가 경고 아이콘 + 빨간색으로 전환되고 aria-invalid 가 붙는다. */
export const LineDanger: Story = {
  args: {
    variant: "line",
    label: "이름",
    value: "1",
    danger: true,
    helperText: "2자 이상 입력해주세요",
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};

/** line / disabled. */
export const LineDisabled: Story = {
  args: {
    variant: "line",
    label: "이름",
    value: "홍길동",
    disabled: true,
    helperText: "수정할 수 없습니다",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox")).toBeDisabled();
  },
};

/** line / readOnly — 값 표시 전용, 지우기 버튼 없음. */
export const LineReadOnly: Story = {
  args: {
    variant: "line",
    label: "가입일",
    value: "2026-01-01",
    readOnly: true,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox")).toHaveAttribute(
      "readonly",
    );
  },
};

/** box / 빈 값. */
export const BoxEmpty: Story = {
  args: { variant: "box", label: "주소", placeholder: "주소를 입력하세요" },
};

/** box / 값 있음. */
export const BoxFilled: Story = {
  args: { variant: "box", label: "주소", value: "서울시 강남구" },
};

/** box / danger — 테두리와 배경이 danger 톤으로 바뀐다(line 과 달리 배경도 변함). */
export const BoxDanger: Story = {
  args: {
    variant: "box",
    label: "주소",
    value: "",
    danger: true,
    helperText: "주소를 입력해주세요",
  },
};

/** box / disabled. */
export const BoxDisabled: Story = {
  args: {
    variant: "box",
    label: "주소",
    value: "서울시 강남구",
    disabled: true,
  },
};

/** box / startIcon·endIcon 슬롯 데모 — endIcon 은 실제 `IconButton` 을 그대로 꽂는다(비밀번호 표시 토글 예시). */
export const BoxWithIcons: Story = {
  args: {
    variant: "box",
    label: "비밀번호",
    value: "",
    placeholder: "비밀번호를 입력하세요",
  },
  render: (args) => (
    <div className="w-[320px]">
      <TextField
        {...args}
        startIcon={
          <Icon
            name="lock_01_line"
            size={24}
            className="text-icon-neutral-bright"
          />
        }
        endIcon={
          <IconButton aria-label="비밀번호 표시">
            <Icon name="eye_line" />
          </IconButton>
        }
      />
    </div>
  ),
};

/** transparentBody / 크롬 없는 중앙정렬 텍스트 — 라벨·아이콘 슬롯이 구조상 없다. */
export const TransparentBody: Story = {
  args: { variant: "transparentBody", value: "12,000원" },
};

/** transparentTitle / 26px 볼드 타이틀형, 값 색이 info(파랑). */
export const TransparentTitle: Story = {
  args: {
    variant: "transparentTitle",
    placeholder: "제목을 입력하세요",
    helperText: "0/40",
  },
};

/** 실제 입력 동작을 보여주는 controlled 데모 — 타이핑 후 지우기까지. */
export const InteractiveInput: Story = {
  args: { variant: "line", label: "닉네임" },
  render: (args) => {
    function Demo() {
      const [value, setValue] = useState("");
      return (
        <div className="w-[320px]">
          <TextField {...args} value={value} onChange={setValue} />
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await userEvent.type(input, "또가");
    await expect(input).toHaveValue("또가");

    const clearBtn = await canvas.findByRole("button", { name: "지우기" });
    await userEvent.click(clearBtn);
    await expect(input).toHaveValue("");
  },
};

/** 4개 variant 를 나란히 비교. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-[var(--sz-32)]">
      {VARIANTS.map((variant) => (
        <TextField
          key={variant}
          variant={variant}
          label={variant === "line" || variant === "box" ? "라벨" : undefined}
          placeholder="Placeholder"
          helperText="Helper Label"
        />
      ))}
    </div>
  ),
};
