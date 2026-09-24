import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";

import { Icon } from "../../../icons";
import type { InputVariant } from "./Input";
import { Input } from "./Input";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-104612";

const VARIANTS: InputVariant[] = [
  "line",
  "box",
  "transparentBody",
  "transparentTitle",
];

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Input" (컴포넌트 세트 node 51405:104612) 와 1:1. 순수 입력 필드 프리미티브 — 라벨·헬퍼텍스트가 필요하면 `TextField` 를 사용한다. `variant`(line/box) × `state`(enable/hover/focus/danger/disabled/readOnly) × `hasValue` 조합. hover/focus 는 CSS 의사클래스, danger/disabled/readOnly 는 props. line/box 는 Figma Input 세트(104612) 그대로다. `transparentBody`/`transparentTitle` 은 Input 세트 자체엔 없고 TextField 세트(node 51405:141075)에서 유래한 축을 이 컴포넌트가 흡수한 것이다(2026-09-17) — 크롬(테두리/배경)과 startIcon/endIcon/지우기 버튼이 없다. 지우기 버튼은 Figma(hover/focus 시에만 노출) 와 달리 모바일 터치 환경을 고려해 hasValue 이면 항상 노출한다(TextField/Searchbar 선례).',
      },
    },
  },
  args: {
    variant: "line",
    value: "",
    placeholder: "값을 입력하세요",
    onChange: fn(),
    onClear: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    value: { control: "text" },
    placeholder: { control: "text" },
    danger: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  render: (args) => (
    <div className="w-[320px]">
      <Input {...args} />
    </div>
  ),
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/** line / 빈 값 — 기본형. */
export const LineEmpty: Story = {
  args: { variant: "line" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toHaveAttribute("placeholder", "값을 입력하세요");
    await expect(
      canvas.queryByRole("button", { name: "지우기" }),
    ).not.toBeInTheDocument();
  },
};

/** line / 값 있음 — 밑줄이 브랜드색으로 바뀌고 지우기 버튼이 노출된다. */
export const LineFilled: Story = {
  args: { variant: "line", value: "홍길동" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "지우기" }),
    ).toBeInTheDocument();
  },
};

/** line / hover — CSS `:hover` 로만 처리(props 아님). 캔버스에서 마우스를 올려 확인한다. */
export const LineHover: Story = {
  args: { variant: "line", value: "홍길동" },
};

/** line / focus — CSS `:focus-within` 으로만 처리(props 아님). */
export const LineFocus: Story = {
  args: { variant: "line" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("textbox"));
    await expect(canvas.getByRole("textbox")).toHaveFocus();
  },
};

/** line / danger — 밑줄이 danger 색으로 바뀌고 aria-invalid 가 붙는다. */
export const LineDanger: Story = {
  args: { variant: "line", value: "1", danger: true },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};

/** line / disabled. */
export const LineDisabled: Story = {
  args: { variant: "line", value: "홍길동", disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox")).toBeDisabled();
  },
};

/** line / readOnly — 값 표시 전용, 지우기 버튼 없음, 값이 있으면 밑줄은 브랜드색을 유지한다. */
export const LineReadOnly: Story = {
  args: { variant: "line", value: "2026-01-01", readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveAttribute("readonly");
    await expect(
      canvas.queryByRole("button", { name: "지우기" }),
    ).not.toBeInTheDocument();
  },
};

/** box / 빈 값. */
export const BoxEmpty: Story = {
  args: { variant: "box", placeholder: "주소를 입력하세요" },
};

/** box / 값 있음 — enable 상태에서도 hasValue 만으로 테두리가 브랜드색이 된다(Figma 실측). */
export const BoxFilled: Story = {
  args: { variant: "box", value: "서울시 강남구" },
};

/** box / danger — 테두리와 배경이 danger 톤으로 바뀐다(line 과 달리 배경도 변함). */
export const BoxDanger: Story = {
  args: { variant: "box", value: "", danger: true },
};

/** box / disabled. */
export const BoxDisabled: Story = {
  args: { variant: "box", value: "서울시 강남구", disabled: true },
};

/** box / readOnly — 값이 있으면 enable 과 동일하게 테두리가 브랜드색이다. */
export const BoxReadOnly: Story = {
  args: { variant: "box", value: "서울시 강남구", readOnly: true },
};

/** box / startIcon·endIcon 슬롯 데모. */
export const BoxWithIcons: Story = {
  args: { variant: "box", value: "", placeholder: "비밀번호를 입력하세요" },
  render: (args) => (
    <div className="w-[320px]">
      <Input
        {...args}
        startIcon={
          <Icon
            name="lock_01_line"
            size={24}
            className="text-icon-neutral-bright"
          />
        }
        endIcon={
          <Icon
            name="eye_line"
            size={24}
            className="text-icon-neutral-bright"
          />
        }
      />
    </div>
  ),
};

/** transparentBody / 크롬 없는 중앙정렬 텍스트 — startIcon/endIcon/지우기 버튼이 없다. */
export const TransparentBody: Story = {
  args: { variant: "transparentBody", value: "12,000원" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole("button", { name: "지우기" }),
    ).not.toBeInTheDocument();
  },
};

/** transparentTitle / 26px 볼드 타이틀형, 값 색이 info(파랑). */
export const TransparentTitle: Story = {
  args: { variant: "transparentTitle", placeholder: "제목을 입력하세요" },
};

/** 실제 입력 동작을 보여주는 controlled 데모 — 타이핑 후 지우기까지. */
export const InteractiveInput: Story = {
  args: { variant: "line" },
  render: (args) => {
    function Demo() {
      const [value, setValue] = useState("");
      return (
        <div className="w-[320px]">
          <Input {...args} value={value} onChange={setValue} />
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
        <Input key={variant} variant={variant} placeholder="Placeholder" />
      ))}
    </div>
  ),
};
