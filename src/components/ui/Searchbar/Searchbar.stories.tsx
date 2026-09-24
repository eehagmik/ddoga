import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";

import type { SearchbarVariant } from "./Searchbar";
import { Searchbar } from "./Searchbar";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-130482";

const VARIANTS: SearchbarVariant[] = ["header", "body"];

const meta = {
  title: "Components/Searchbar",
  component: Searchbar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Searchbar" (문서 node 51405:130482, 컴포넌트 세트 51405:130536) 와 1:1. `variant`(header/body) × `state`(button/enable/focus/hover) 조합 중 `button`/`enable`은 시각적으로 동일해 `asButton` prop 하나로 엘리먼트(`<button>`/`<input>`)만 스왑한다. `asButton=true`는 실제 입력 기능이 없는 트리거로, Header 등에서 검색 페이지 이동을 유도할 때 쓴다. `hover`/`focus`는 CSS 의사클래스로 처리한다. 색·간격·타이포는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    variant: "header",
    asButton: false,
    value: "",
    placeholder: "검색",
    onChange: fn(),
    onClear: fn(),
    onSubmit: fn(),
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    asButton: { control: "boolean" },
    value: { control: "text" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof Searchbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** header / 입력 모드, 값 없음 — Figma 기본 variant(state=enable 상당). */
export const HeaderEmpty: Story = {
  args: { variant: "header" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", {
      name: "검색",
    });
    await expect(input).toHaveAttribute("placeholder", "검색");
    await expect(
      within(canvasElement).queryByRole("button", { name: "지우기" }),
    ).not.toBeInTheDocument();
  },
};

/** header / 입력 모드, 값 있음 — clear 버튼 노출(Figma `_parts` hasValue=true). */
export const HeaderFilled: Story = {
  args: { variant: "header", value: "돈까스" },
  play: async ({ canvasElement }) => {
    const clearBtn = within(canvasElement).getByRole("button", {
      name: "지우기",
    });
    await expect(clearBtn).toBeInTheDocument();
  },
};

/** header / 버튼 모드(Figma state=button) — 실제 입력 없이 클릭만 가능한 트리거. Header 등에서 검색 페이지 이동용. */
export const HeaderAsButton: Story = {
  args: { variant: "header", asButton: true },
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button", { name: "검색" });
    await expect(
      within(canvasElement).queryByRole("textbox"),
    ).not.toBeInTheDocument();

    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** body / 입력 모드, 값 없음 — 테두리 있는 본문 배치용. */
export const BodyEmpty: Story = {
  args: { variant: "body" },
};

/** body / 입력 모드, 값 있음. */
export const BodyFilled: Story = {
  args: { variant: "body", value: "돈까스" },
};

/** body / 버튼 모드 — 리스트가 있는 화면에서 검색 패널을 여는 트리거로 쓰이는 조합. */
export const BodyAsButton: Story = {
  args: { variant: "body", asButton: true },
};

/** 실제 입력 동작을 보여주는 controlled 데모 — value/onChange/onClear/onSubmit 연동. */
export const InteractiveInput: Story = {
  args: { variant: "header" },
  render: (args) => {
    function Demo() {
      const [value, setValue] = useState("");
      return (
        <Searchbar
          {...args}
          value={value}
          onChange={setValue}
          onClear={() => setValue("")}
          onSubmit={(submitted) => args.onSubmit?.(submitted)}
        />
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await userEvent.type(input, "돈까스");
    await expect(input).toHaveValue("돈까스");

    const clearBtn = await canvas.findByRole("button", { name: "지우기" });
    await userEvent.click(clearBtn);
    await expect(input).toHaveValue("");
  },
};

/** header/body 를 나란히 비교. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-[var(--sz-16)]">
      {VARIANTS.map((variant) => (
        <Searchbar {...args} key={variant} variant={variant} />
      ))}
    </div>
  ),
};
