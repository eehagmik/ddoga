import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import type {
  ButtonWithIconColor,
  ButtonWithIconSize,
  ButtonWithIconVariant,
} from "./ButtonWithIcon";
import { ButtonWithIcon } from "./ButtonWithIcon";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-17772";

const COLORS: ButtonWithIconColor[] = [
  "brand",
  "neutral",
  "danger",
  "warning",
  "info",
];
const VARIANTS: ButtonWithIconVariant[] = ["fill", "bright", "outline"];
const SIZES: ButtonWithIconSize[] = ["2xl", "xl", "lg", "md", "sm", "xs"];

const meta = {
  title: "Components/ButtonWithIcon",
  component: ButtonWithIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / ButtonWithIcon" (node 51405:17772) 와 1:1. `ButtonWithLabel` 의 축소판으로 정사각 컨테이너에 아이콘 1개만 둔다. `aria-label` 이 필수이며 `color`(5) × `variant`(3, `text` 없음) × `size`(6) 조합을 지원한다. 색·크기·투명도는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    color: "brand",
    variant: "fill",
    size: "md",
    "aria-label": "추가",
    disabled: false,
    onClick: fn(),
    children: <Icon name="plus_line" className="size-full" />,
  },
  argTypes: {
    color: { control: "inline-radio", options: COLORS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    "aria-label": { control: "text" },
    disabled: { control: "boolean" },
    // 아이콘 슬롯 — 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 나므로 컨트롤 비활성.
    children: { control: false, table: { type: { summary: "ReactNode" } } },
  },
} satisfies Meta<typeof ButtonWithIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. 클릭 시 onClick 호출(비활성 시 미호출)을 검증한다. */
export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button");
    await userEvent.click(btn);
    if (args.disabled) {
      await expect(args.onClick).not.toHaveBeenCalled();
    } else {
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    }
  },
};

/** 한 color(brand)의 fill / bright / outline. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
      {VARIANTS.map((variant) => (
        <ButtonWithIcon
          key={variant}
          {...args}
          variant={variant}
          aria-label={`brand ${variant}`}
        >
          <Icon name="plus_line" className="size-full" />
        </ButtonWithIcon>
      ))}
    </div>
  ),
};

/** 2xl ~ xs. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
      {SIZES.map((size) => (
        <ButtonWithIcon
          key={size}
          {...args}
          size={size}
          aria-label={`검색 ${size}`}
        >
          <Icon name="search_md_line" className="size-full" />
        </ButtonWithIcon>
      ))}
    </div>
  ),
};

/** 5색 × fill. */
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
      {COLORS.map((color) => (
        <ButtonWithIcon
          key={color}
          {...args}
          color={color}
          variant="fill"
          aria-label={`${color} 알림`}
        >
          <Icon name="bell_01_line" className="size-full" />
        </ButtonWithIcon>
      ))}
    </div>
  ),
};

/** 상호작용 상태 데모용 한 줄(enable / disabled). */
function IconStateRow({
  label,
  args,
  disabled,
}: {
  label: string;
  args: Partial<React.ComponentProps<typeof ButtonWithIcon>>;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-[var(--sz-12)]">
      <span className="w-[var(--sz-64)] text-body-6 text-typo-neutral-light">
        {label}
      </span>
      {(["fill", "outline"] as ButtonWithIconVariant[]).map((variant) => (
        <ButtonWithIcon
          key={variant}
          {...args}
          color="brand"
          variant={variant}
          disabled={disabled}
          aria-label={`추가 ${variant}${disabled ? " (disabled)" : ""}`}
        >
          <Icon name="plus_line" className="size-full" />
        </ButtonWithIcon>
      ))}
    </div>
  );
}

/**
 * 상호작용 상태 데모 — enable(hover/focus/pressed) 와 disabled 를 나란히.
 * - hover = 마우스 올림(컨테이너 배경만 교체).
 * - focus = 키보드 Tab / pressed = 마우스 꾹 누름 : 배경 교체 + 루트 opacity `--alpha-80`.
 * - disabled : enable 디자인 유지 + opacity 저하(fill `--alpha-60` / bright `--alpha-40`), 클릭 불가.
 */
export const InteractiveStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "enable(hover=마우스 올림 / focus=키보드 Tab / pressed=마우스 꾹 누름) 와 disabled 를 나란히 보여준다. hover 는 배경만, focus·pressed 는 배경 + opacity `--alpha-80`, disabled 는 opacity 저하 + 클릭 불가.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-[var(--sz-8)]">
      <IconStateRow label="enable" args={args} />
      <IconStateRow label="disabled" args={args} disabled />
      <p className="text-body-6 text-typo-neutral-light">
        마우스 올림(hover) / Tab 포커스(focus) / 꾹 누름(pressed) 시 배경이
        hover 토큰으로 바뀌고, focus·pressed 는 추가로 opacity 80%.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const btns = within(canvasElement).getAllByRole("button");
    const [fillBtn, outlineBtn] = btns;

    await userEvent.tab();
    await expect(fillBtn).toHaveFocus();
    await expect(fillBtn).toHaveClass(
      "hover:bg-bg-brand-deep",
      "focus-visible:bg-bg-brand-deep",
      "active:bg-bg-brand-deep",
      "focus-visible:opacity-[var(--alpha-80)]",
      "active:opacity-[var(--alpha-80)]",
    );
    await expect(outlineBtn).toHaveClass(
      "hover:bg-bg-brand-bright",
      "active:bg-bg-brand-bright",
    );
    await userEvent.hover(fillBtn);
    await userEvent.pointer({ target: fillBtn, keys: "[MouseLeft>]" });
    await userEvent.pointer({ keys: "[/MouseLeft]" });

    const disabledFill = btns[2];
    await expect(disabledFill).toBeDisabled();
    await expect(disabledFill).toHaveClass(
      "disabled:opacity-[var(--alpha-60)]",
    );
  },
};

/** color(행) × variant(열) 전체 조합 (size 는 md 고정). */
export const Matrix: Story = {
  render: (args) => (
    <table className="border-separate border-spacing-[var(--sz-8)]">
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
                <ButtonWithIcon
                  {...args}
                  color={color}
                  variant={variant}
                  size="md"
                  aria-label={`${color} ${variant}`}
                >
                  <Icon name="plus_line" className="size-full" />
                </ButtonWithIcon>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
