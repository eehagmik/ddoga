import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { BlankGraphic } from "../BlankGraphic";
import type { MenuItemSize, MenuItemVariant } from "./MenuItem";
import { MenuItem } from "./MenuItem";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-126122";

const VARIANTS: MenuItemVariant[] = ["text", "icon", "graphic", "chip"];
const SIZES: MenuItemSize[] = ["xs", "sm", "md", "lg"];

/** icon/graphic 슬롯 데모 — 실제 콘텐츠는 호출부가 채운다(컴포넌트는 슬롯만 제공). */
function renderSlot(variant: MenuItemVariant, size: MenuItemSize) {
  if (variant === "icon") {
    return (
      <Icon
        name="home_01_line"
        size={size === "xs" || size === "sm" ? 20 : 24}
      />
    );
  }
  if (variant === "graphic") {
    return <BlankGraphic />;
  }
  return undefined;
}

const meta = {
  title: "Components/MenuItem",
  component: MenuItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / MenuItem" (node 51405:126122) 와 1:1. 세로로 쌓이는 메뉴/리스트 항목 행 — 좌측 라벨(`label`) + 우측 보조 콘텐츠(`variant` 에 따라 icon/graphic 슬롯(`children`) 또는 중첩 `Chip`(`chipLabel`)). `variant`(text/icon/graphic/chip) × `size`(xs/sm/md/lg) 축이 있고, hover/focus 는 CSS 로, disabled 는 boolean prop 으로 처리한다. 중첩 `Chip` 은 `deletable` 을 쓰지 않아 내부에 실제 버튼이 없으므로, 4개 variant 모두 루트가 `<button>` 이다(버튼-in-버튼 충돌 없음). disabled 시 중첩 `Chip` 은 Figma 실측상 아무 변화가 없다(색·불투명도 전부 enable 과 동일) — 라벨 텍스트 색만 바뀐다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: "text",
    size: "md",
    disabled: false,
    label: "Label",
    chipLabel: "Label",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    disabled: { control: "boolean" },
    label: { control: "text" },
    chipLabel: { control: "text" },
    children: { table: { disable: true } },
  },
  render: ({ variant = "text", size = "md", ...args }) => (
    <MenuItem {...args} variant={variant} size={size}>
      {renderSlot(variant, size)}
    </MenuItem>
  ),
} satisfies Meta<typeof MenuItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/** text/md — Figma 기본값. 우측 슬롯 없음. play 에서 클릭 → onClick 호출을 검증한다. */
export const Default: Story = {
  args: { variant: "text", size: "md" },
  play: async ({ args, canvasElement }) => {
    const item = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(item).toHaveAttribute("data-variant", "text");
    await expect(item).toHaveAttribute("data-size", "md");
    await expect(item.tagName).toBe("BUTTON");

    await userEvent.click(item);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** icon — 우측에 아이콘 슬롯(children). */
export const IconSlot: Story = {
  args: { variant: "icon" },
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(item.querySelector("svg")).not.toBeNull();
  },
};

/** graphic — 우측에 그래픽 슬롯(children, BlankGraphic 데모). */
export const Graphic: Story = {
  args: { variant: "graphic" },
};

/** chip — 우측에 Chip 중첩(color=brand, variant=fill, size 고정 xs). 루트는 4개 variant 모두 <button>. */
export const ChipSlot: Story = {
  args: { variant: "chip", chipLabel: "확인" },
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(item).toHaveAttribute("data-variant", "chip");
    await expect(item.tagName).toBe("BUTTON");

    // Chip 자체는 <button> 을 포함하지 않는다(deletable 미사용) — 버튼-in-버튼 없음.
    const nestedButtons = within(canvasElement).queryAllByRole("button");
    await expect(nestedButtons).toHaveLength(1);
    await expect(within(canvasElement).getByText("확인")).toBeInTheDocument();
  },
};

/** size 4종 나란히 비교(variant=text). */
export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-8)">
      {SIZES.map((size) => (
        <MenuItem
          {...args}
          key={size}
          variant="text"
          size={size}
          label={`Label ${size}`}
        />
      ))}
    </div>
  ),
};

/** size 4종 × variant=icon. */
export const AllSizesIcon: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-8)">
      {SIZES.map((size) => (
        <MenuItem
          {...args}
          key={size}
          variant="icon"
          size={size}
          label={`Label ${size}`}
        >
          {renderSlot("icon", size)}
        </MenuItem>
      ))}
    </div>
  ),
};

/** size 4종 × variant=chip. */
export const AllSizesChip: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-8)">
      {SIZES.map((size) => (
        <MenuItem
          {...args}
          key={size}
          variant="chip"
          size={size}
          label={`Label ${size}`}
        />
      ))}
    </div>
  ),
};

/** disabled — 라벨 텍스트만 disabled 톤으로 바뀐다. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(item).toBeDisabled();
    await expect(within(canvasElement).getByText("Label")).toHaveClass(
      "text-typo-disabled-normal",
    );
  },
};

/** disabled + chip — 중첩 Chip 은 Figma 실측상 enable 과 완전히 동일(색·불투명도 무변화), 좌측 라벨만 disabled 톤. */
export const DisabledChip: Story = {
  args: { variant: "chip", disabled: true, chipLabel: "확인" },
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(item).toBeDisabled();
    await expect(within(canvasElement).getByText("Label")).toHaveClass(
      "text-typo-disabled-normal",
    );
    const chipLabel = within(canvasElement).getByText("확인");
    await expect(chipLabel).not.toHaveClass("text-typo-disabled-normal");
  },
};

/** hover — 루트 배경 neutral/deep 로 처리(props 아님, CSS 의사클래스). */
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(item).toHaveClass("hover:bg-bg-neutral-deep");
  },
};

/** focus — 루트 배경 neutral/deep + inner 60% 투명도(CSS 의사클래스). */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(item).toHaveClass("focus-visible:bg-bg-neutral-deep");
    item.focus();
    await expect(item).toHaveFocus();
  },
};
