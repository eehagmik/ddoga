import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import type { ToggleSize, ToggleType, ToggleVariant } from "./Toggle";
import { Toggle } from "./Toggle";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%EB%98%90%EA%B0%80-3.0--Design-System?node-id=51405-152861";

const VARIANTS: ToggleVariant[] = ["square", "round", "text"];
const SIZES: ToggleSize[] = ["xs", "sm", "md", "lg"];
const TYPES: ToggleType[] = ["multi", "single"];

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Toggle" (node 51405:152870) 와 1:1. **on/off 스위치가 아니라** 라벨을 담는 선택형 토글 버튼이다. `variant`(square/round/text) × `size`(xs/sm/md/lg) 에 `type`(multi/single — 시각 영향 0, ARIA 만 가름) · `pressed`(선택) · `disabled` 를 지원한다. 아웃라인은 border 가 아닌 inset shadow 로, hover 는 unchecked 조합에만 존재한다. 색·간격·투명도·아웃라인은 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    children: "라벨",
    variant: "square",
    type: "multi",
    size: "md",
    defaultPressed: false,
    disabled: false,
    onPressedChange: fn(),
  },
  argTypes: {
    children: { control: "text" },
    variant: { control: "inline-radio", options: VARIANTS },
    type: { control: "inline-radio", options: TYPES },
    size: { control: "inline-radio", options: SIZES },
    pressed: { control: "boolean" },
    defaultPressed: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/** square / round / text (unchecked · checked 각각). */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-12)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-(--sz-12)">
          <Toggle {...args} variant={variant} defaultPressed={false}>
            {variant}
          </Toggle>
          <Toggle {...args} variant={variant} defaultPressed>
            {variant}
          </Toggle>
        </div>
      ))}
    </div>
  ),
};

/** xs / sm / md / lg. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-(--sz-12)">
      {SIZES.map((size) => (
        <Toggle key={size} {...args} size={size}>
          {size}
        </Toggle>
      ))}
    </div>
  ),
};

/** 선택되지 않음 / 선택됨. */
export const Pressed: Story = {
  render: (args) => (
    <div className="flex items-center gap-(--sz-12)">
      <Toggle {...args} defaultPressed={false}>
        Off
      </Toggle>
      <Toggle {...args} defaultPressed>
        On
      </Toggle>
    </div>
  ),
};

/**
 * type=multi → `aria-pressed`, type=single → `role="radio"` + `aria-checked`.
 * 디자인은 완전히 동일하다.
 */
export const Type: Story = {
  render: (args) => (
    <div className="flex items-center gap-(--sz-12)">
      {TYPES.map((type) => (
        <Toggle key={type} {...args} type={type} defaultPressed>
          {type}
        </Toggle>
      ))}
    </div>
  ),
};

/** disabled — unchecked / checked. 클릭해도 토글되지 않는다. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex items-center gap-(--sz-12)">
      <Toggle {...args} defaultPressed={false}>
        Off
      </Toggle>
      <Toggle {...args} defaultPressed>
        On
      </Toggle>
    </div>
  ),
};

/** variant(행) × [unchecked · checked · disabled unchecked · disabled checked] (열), size=md. */
export const Matrix: Story = {
  render: (args) => (
    <table className="border-separate border-spacing-(--sz-8)">
      <thead>
        <tr>
          <th />
          {["unchecked", "checked", "disabled", "disabled checked"].map((h) => (
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
              <Toggle {...args} variant={variant}>
                라벨
              </Toggle>
            </td>
            <td>
              <Toggle {...args} variant={variant} defaultPressed>
                라벨
              </Toggle>
            </td>
            <td>
              <Toggle {...args} variant={variant} disabled>
                라벨
              </Toggle>
            </td>
            <td>
              <Toggle {...args} variant={variant} disabled defaultPressed>
                라벨
              </Toggle>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** 클릭 시 aria-pressed 가 토글되고 onPressedChange 가 호출되는지 검증. */
export const TogglesOnClick: Story = {
  render: (args) => <Toggle {...args}>라벨</Toggle>,
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "라벨" });
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(false);
  },
};

/** disabled 는 클릭해도 토글되지 않는다. */
export const DisabledIgnoresClick: Story = {
  args: { disabled: true },
  render: (args) => <Toggle {...args}>라벨</Toggle>,
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "라벨" });
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};
