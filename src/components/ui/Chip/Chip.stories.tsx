import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { BlankGraphic } from "../BlankGraphic";
import { BlankIcon } from "../BlankIcon";
import type { ChipColor, ChipSize, ChipVariant } from "./Chip";
import { Chip } from "./Chip";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-52642";

const COLORS: ChipColor[] = ["neutral", "danger", "info", "warning", "brand"];
const VARIANTS: ChipVariant[] = ["fill", "bright", "outline"];
const SIZES: ChipSize[] = ["xs", "sm"];

const meta = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Chip" (node 51405:52642) 와 1:1. 상태·카테고리·필터를 나타내는 pill 라벨. `color`(5) × `variant`(3) × `size`(2) 조합에 `bold` · `deletable` · leading 슬롯을 지원한다. hover/focus 는 `deletable=true` 조합에만 존재하며 CSS 로 처리한다. 색·간격·투명도는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    color: "neutral",
    variant: "fill",
    size: "xs",
    bold: false,
    deletable: false,
    children: "라벨",
    startSlot: false,
    onDelete: fn(),
  },
  argTypes: {
    color: { control: "inline-radio", options: COLORS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    bold: { control: "boolean" },
    deletable: { control: "boolean" },
    startType: { control: "inline-radio", options: ["icon", "graphic"] },
    children: { control: "text" },
    // ReactNode 슬롯은 Storybook 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 난다.
    // boolean 토글로 노출하고 켜면 디자인 시스템 `BlankIcon`(placeholder) 을 넣는다.
    startSlot: {
      control: "boolean",
      mapping: {
        true: <BlankIcon className="size-full" />,
        false: undefined,
      },
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/** 한 color(neutral)의 fill / bright / outline. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {VARIANTS.map((variant) => (
        <Chip key={variant} {...args} variant={variant}>
          {variant}
        </Chip>
      ))}
    </div>
  ),
};

/** 5색 × fill. */
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {COLORS.map((color) => (
        <Chip key={color} {...args} color={color}>
          {color}
        </Chip>
      ))}
    </div>
  ),
};

/** xs / sm. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {SIZES.map((size) => (
        <Chip key={size} {...args} size={size}>
          {size}
        </Chip>
      ))}
    </div>
  ),
};

/** bold=false / true 라벨 굵기. */
export const Bold: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      <Chip {...args} bold={false}>
        Medium
      </Chip>
      <Chip {...args} bold>
        Bold
      </Chip>
    </div>
  ),
};

/** leading 아이콘 슬롯(`src/icons` 의 `<Icon>`, `text-icon-*` 상속). */
export const WithLeadingIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {VARIANTS.map((variant) => (
        <Chip
          key={variant}
          {...args}
          variant={variant}
          startType="icon"
          startSlot={<Icon name="tag_01_line" className="size-full" />}
        >
          {variant}
        </Chip>
      ))}
    </div>
  ),
};

/** leading 그래픽 슬롯(`BlankGraphic`, 각진 사각형 `overflow-hidden` 클립). */
export const WithGraphic: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {SIZES.map((size) => (
        <Chip
          key={size}
          {...args}
          size={size}
          startType="graphic"
          startSlot={<BlankGraphic />}
        >
          {size}
        </Chip>
      ))}
    </div>
  ),
};

/**
 * deletable=true — 우측 삭제 버튼. 삭제 버튼 hover/focus 시 루트 배경이 한 단계 딥,
 * focus 시 삭제 버튼 opacity `--alpha-60`. play 에서 클릭 → onDelete 호출을 검증한다.
 */
export const Deletable: Story = {
  args: { deletable: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {VARIANTS.map((variant) => (
        <Chip key={variant} {...args} variant={variant}>
          {variant}
        </Chip>
      ))}
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const delButtons = within(canvasElement).getAllByRole("button", {
      name: "삭제",
    });
    await expect(delButtons).toHaveLength(3);
    await userEvent.click(delButtons[0]);
    await expect(args.onDelete).toHaveBeenCalledTimes(1);
  },
};

/** color(행) × variant(열) 전체 조합 (size 는 xs 고정). */
export const Matrix: Story = {
  render: (args) => (
    <table className="border-separate border-spacing-(--sz-8)">
      <thead>
        <tr>
          <th />
          {VARIANTS.map((variant) => (
            <th
              key={variant}
              className="text-body-6 text-typo-neutral-light capitalize"
            >
              {variant}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {COLORS.map((color) => (
          <tr key={color}>
            <th className="text-body-6 text-typo-neutral-light text-right capitalize">
              {color}
            </th>
            {VARIANTS.map((variant) => (
              <td key={variant}>
                <Chip {...args} color={color} variant={variant} size="xs">
                  라벨
                </Chip>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
