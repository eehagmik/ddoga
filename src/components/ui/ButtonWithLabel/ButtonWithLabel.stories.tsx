import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { BlankIcon } from "../BlankIcon";
import type { ButtonColor, ButtonSize, ButtonVariant } from "./ButtonWithLabel";
import { ButtonWithLabel } from "./ButtonWithLabel";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-18495";

const COLORS: ButtonColor[] = ["brand", "neutral", "danger", "warning", "info"];
const VARIANTS: ButtonVariant[] = ["fill", "bright", "outline", "text"];
const SIZES: ButtonSize[] = ["2xl", "xl", "lg", "md", "sm", "xs"];

const meta = {
  title: "Components/ButtonWithLabel",
  component: ButtonWithLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / ButtonWithLabel" (node 51405:18495) 와 1:1. 디자인 시스템 기본 액션 버튼. `color`(5) × `variant`(4) × `size`(6) 조합을 지원하고 hover/focus/disabled 상태가 토큰 기반으로 동작한다. 색·간격·투명도는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    color: "brand",
    variant: "fill",
    size: "md",
    children: "라벨",
    disabled: false,
    startIcon: false,
    endIcon: false,
    onClick: fn(),
  },
  argTypes: {
    color: { control: "inline-radio", options: COLORS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    children: { control: "text" },
    disabled: { control: "boolean" },
    // ReactNode 슬롯은 Storybook 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 난다.
    // boolean 토글로 노출하고 켜면 디자인 시스템 `BlankIcon`(placeholder) 을 넣는다.
    startIcon: {
      control: "boolean",
      mapping: {
        true: <BlankIcon className="size-full" />,
        false: undefined,
      },
      table: { type: { summary: "ReactNode" } },
    },
    endIcon: {
      control: "boolean",
      mapping: {
        true: <BlankIcon className="size-full" />,
        false: undefined,
      },
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof ButtonWithLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. 클릭 시 onClick 이 호출되는지 검증한다. */
export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button");
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** 한 color(brand)의 fill / bright / outline / text. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
      {VARIANTS.map((variant) => (
        <ButtonWithLabel key={variant} {...args} variant={variant}>
          {variant}
        </ButtonWithLabel>
      ))}
    </div>
  ),
};

/** 2xl ~ xs. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
      {SIZES.map((size) => (
        <ButtonWithLabel key={size} {...args} size={size}>
          {size}
        </ButtonWithLabel>
      ))}
    </div>
  ),
};

/** 5색 × fill. */
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
      {COLORS.map((color) => (
        <ButtonWithLabel key={color} {...args} color={color}>
          {color}
        </ButtonWithLabel>
      ))}
    </div>
  ),
};

/** startIcon / endIcon / 양쪽 (`src/icons` 의 `<Icon>` 사용, currentColor 상속). */
export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
      <ButtonWithLabel
        {...args}
        startIcon={<Icon name="download_01_line" className="size-full" />}
      >
        다운로드
      </ButtonWithLabel>
      <ButtonWithLabel
        {...args}
        endIcon={<Icon name="arrow_right_line" className="size-full" />}
      >
        다음
      </ButtonWithLabel>
      <ButtonWithLabel
        {...args}
        startIcon={<Icon name="search_md_line" className="size-full" />}
        endIcon={<Icon name="chevron_right_line" className="size-full" />}
      >
        검색
      </ButtonWithLabel>
    </div>
  ),
};

/**
 * enable / hover / focus / pressed / disabled 상태.
 * - hover = 마우스 올림 : 배경만 hover 토큰으로 교체.
 * - focus = 키보드 Tab / pressed = 마우스 꾹 누름 : 배경 교체 + 루트 opacity `--alpha-80`(Figma 엔 pressed 없음, 피드백용 추가).
 * - disabled = enable 디자인 유지 + 루트 opacity 저하, 클릭해도 onClick 미호출.
 * - 정적으로 상태를 강제할 수 없어 버튼 나열 + 설명, play 에서 실제 트리거·검증한다.
 */
export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "enable · hover(마우스 올림) · focus(키보드 Tab) · pressed(마우스 꾹 누름) · disabled 를 함께 보여준다. hover 는 배경만, focus·pressed 는 배경 + opacity `--alpha-80`, disabled 는 opacity 저하 + 클릭해도 onClick 미호출.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-[var(--sz-8)]">
      <div className="flex flex-wrap items-center gap-[var(--sz-12)]">
        <ButtonWithLabel {...args}>enable</ButtonWithLabel>
        <ButtonWithLabel {...args} disabled>
          disabled
        </ButtonWithLabel>
      </div>
      <p className="text-body-6 text-typo-neutral-light">
        마우스 올림(hover) 시 배경만, Tab 포커스(focus) / 꾹 누름(pressed) 시
        배경 + opacity 80%. disabled 는 opacity 저하 + 클릭 불가.
      </p>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // 키보드 포커스 진입 + hover/focus/pressed 배경·opacity 클래스 검증
    const enableBtn = canvas.getByRole("button", { name: "enable" });
    await userEvent.tab();
    await expect(enableBtn).toHaveFocus();
    await expect(enableBtn).toHaveClass(
      "hover:bg-bg-brand-deep",
      "focus-visible:bg-bg-brand-deep",
      "active:bg-bg-brand-deep",
      "focus-visible:opacity-[var(--alpha-80)]",
      "active:opacity-[var(--alpha-80)]",
    );
    await userEvent.hover(enableBtn);

    // 기존: disabled 클릭 시 onClick 미호출, enable 클릭 시 호출
    const disabledBtn = canvas.getByRole("button", { name: "disabled" });
    await expect(disabledBtn).toBeDisabled();
    await userEvent.click(disabledBtn);
    await expect(args.onClick).not.toHaveBeenCalled();

    await userEvent.click(enableBtn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
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
                <ButtonWithLabel
                  {...args}
                  color={color}
                  variant={variant}
                  size="md"
                >
                  라벨
                </ButtonWithLabel>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
