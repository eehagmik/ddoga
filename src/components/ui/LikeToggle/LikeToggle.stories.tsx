import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import type { LikeToggleColor, LikeToggleVariant } from "./LikeToggle";
import { LikeToggle } from "./LikeToggle";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%EB%98%90%EA%B0%80-3.0--Design-System?node-id=51405-112826";

const VARIANTS: LikeToggleVariant[] = ["heart", "bookmark"];
const COLORS: LikeToggleColor[] = ["neutralNormal", "neutralLight", "inverse"];

const meta = {
  title: "Components/LikeToggle",
  component: LikeToggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / LikeToggle" (node 51405:112826) 와 1:1. 아이콘 단독으로 클릭 시 찜/좋아요 상태를 뒤집는 토글 버튼이다. `variant`(heart/bookmark) × `color`(neutralNormal/neutralLight/inverse — unchecked 라인 색만) 에 `checked`(controlled/uncontrolled)를 지원한다. Figma 에 state(hover/disabled/readOnly) 축이 없다. checked 아이콘 색은 고정 — heart 는 pink→red 그라데이션(`like` 세만틱 토큰), bookmark 는 단색 `icon-info-normal`.',
      },
    },
  },
  args: {
    variant: "heart",
    color: "neutralNormal",
    defaultChecked: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    color: { control: "inline-radio", options: COLORS },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
} satisfies Meta<typeof LikeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/** heart / bookmark — unchecked · checked. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-(--sz-16)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-(--sz-8)">
          <LikeToggle {...args} variant={variant} defaultChecked={false} />
          <LikeToggle {...args} variant={variant} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

/** neutralNormal / neutralLight / inverse — unchecked 라인 색만 바뀐다(checked 는 고정색). */
export const Colors: Story = {
  render: (args) => (
    <div className="flex items-center gap-(--sz-16) rounded-md bg-bg-inverse-normal p-(--sz-12)">
      {COLORS.map((color) => (
        <div key={color} className="flex items-center gap-(--sz-8)">
          <LikeToggle {...args} color={color} defaultChecked={false} />
          <LikeToggle {...args} color={color} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

/** unchecked / checked. */
export const Checked: Story = {
  render: (args) => (
    <div className="flex items-center gap-(--sz-12)">
      <LikeToggle {...args} defaultChecked={false} />
      <LikeToggle {...args} defaultChecked />
    </div>
  ),
};

/** variant(행) × [unchecked · checked], color=neutralNormal. */
export const Matrix: Story = {
  render: (args) => (
    <table className="border-separate border-spacing-(--sz-8)">
      <thead>
        <tr>
          <th />
          {["unchecked", "checked"].map((h) => (
            <th
              key={h}
              className="text-body-6 text-typo-neutral-light capitalize"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {VARIANTS.map((variant) => (
          <tr key={variant}>
            <th className="text-body-6 text-typo-neutral-light text-right capitalize">
              {variant}
            </th>
            <td>
              <LikeToggle {...args} variant={variant} defaultChecked={false} />
            </td>
            <td>
              <LikeToggle {...args} variant={variant} defaultChecked />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/**
 * off→on 전환 순간에만 `animate-like-bounce` 가 붙고, 애니메이션이 끝나면(`animationend`)
 * 스스로 제거되며, on→off 로 끌 때는 붙지 않는지 검증(jsdom 은 실제 CSS 애니메이션을
 * 재생하지 않으므로 `animationend` 이벤트를 직접 발생시켜 종료를 시뮬레이션한다).
 */
export const BounceOnCheck: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "좋아요",
    });
    const icon = () => button.querySelector("svg");

    await expect(icon()).not.toHaveClass("animate-like-bounce");

    await userEvent.click(button);
    await expect(icon()).toHaveClass("animate-like-bounce");

    icon()?.dispatchEvent(new Event("animationend", { bubbles: true }));
    await waitFor(() => expect(icon()).not.toHaveClass("animate-like-bounce"));

    await userEvent.click(button);
    await expect(icon()).not.toHaveClass("animate-like-bounce");
  },
};

/** 클릭 시 aria-pressed 가 토글되고 onCheckedChange 가 호출되는지 검증. */
export const TogglesOnClick: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "좋아요",
    });
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
