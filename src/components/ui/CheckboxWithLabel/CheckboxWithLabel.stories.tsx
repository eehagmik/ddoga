import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { CheckboxWithLabel } from "./CheckboxWithLabel";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-45495";

const VARIANTS = ["circle", "square", "mark"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/CheckboxWithLabel",
  component: CheckboxWithLabel,
  tags: ["autodocs"],
  args: { children: "Label" },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / CheckboxWithLabel" (node 51405:45495) 와 1:1. `Checkbox` 아톰에 라벨과 넓은 히트영역을 더한 MOLECULE. 루트는 `<label class="group">` 이며 시각적으로 숨긴 native `<input type="checkbox">` 를 감싼다 — label·checkbox·텍스트 어디를 눌러도 토글된다. controlled(`checked`+`onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원. hover 는 `<label>` 의 `.group` 으로 아톰에 전이, focus 는 `peer-focus-visible:opacity` dip(`Button` 선례), disabled 는 input·아톰·라벨 색·커서에 반영. 라벨이 여러 줄이면 `items-start` 로 체크박스가 첫 줄에 정렬된다.',
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["circle", "square", "mark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    bold: { control: "boolean" },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof CheckboxWithLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: "circle", size: "md", bold: false, disabled: false },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)]">
      <CheckboxWithLabel {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvasElement.querySelector("label")!;
    const input = canvasElement.querySelector("input")!;

    await expect(input.checked).toBe(false);
    await expect(label).toHaveAttribute("data-checked", "false");

    await userEvent.click(canvas.getByText("Label"));
    await expect(input.checked).toBe(true);
    await expect(label).toHaveAttribute("data-checked", "true");
    await expect(canvasElement.querySelector("[data-variant]")).toHaveAttribute(
      "data-checked",
      "true",
    );
  },
};

/** unchecked / checked × enable / disabled — circle */
export const Circle: Story = {
  // 정적 데모(args 미반영) — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => <StateGrid variant="circle" />,
};

/** unchecked / checked × enable / disabled — square */
export const Square: Story = {
  parameters: { controls: { disable: true } },
  render: () => <StateGrid variant="square" />,
};

/** 상자 없이 체크마크만 — mark */
export const Mark: Story = {
  parameters: { controls: { disable: true } },
  render: () => <StateGrid variant="mark" />,
};

export const Sizes: Story = {
  // 여러 size 를 동시에 비교하는 정적 데모라 단일 컨트롤로 대응 불가 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {SIZES.map((size) => (
        <CheckboxWithLabel key={size} size={size} defaultChecked>
          {size} · 라벨 텍스트
        </CheckboxWithLabel>
      ))}
    </div>
  ),
};

export const Bold: Story = {
  // bold 두 값을 동시에 비교하는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      <CheckboxWithLabel defaultChecked>bold=false (Medium)</CheckboxWithLabel>
      <CheckboxWithLabel defaultChecked bold>
        bold=true (Bold)
      </CheckboxWithLabel>
    </div>
  ),
};

export const States: Story = {
  // enable/disabled × checked 4가지 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      <CheckboxWithLabel>enable / unchecked</CheckboxWithLabel>
      <CheckboxWithLabel defaultChecked>enable / checked</CheckboxWithLabel>
      <CheckboxWithLabel disabled>disabled / unchecked</CheckboxWithLabel>
      <CheckboxWithLabel disabled checked>
        disabled / checked
      </CheckboxWithLabel>
    </div>
  ),
};

/** 라벨이 여러 줄일 때 체크박스가 첫 줄에 정렬되는지(`items-start`) 확인. */
export const MultilineLabel: Story = {
  // 정렬 확인용 고정 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[var(--sz-256)] bg-bg-neutral-normal p-[var(--sz-32)]">
      <CheckboxWithLabel defaultChecked>
        여러 줄에 걸치는 긴 라벨 텍스트입니다. 체크박스는 첫 번째 줄의 텍스트와
        나란히 정렬되어야 합니다.
      </CheckboxWithLabel>
    </div>
  ),
};

export const AllVariants: Story = {
  // variant × size × checked × disabled 전 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[var(--sz-24)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-[var(--sz-8)]">
          <code className="text-2xs text-typo-neutral-light">{variant}</code>
          {SIZES.map((size) => (
            <div key={size} className="flex flex-wrap gap-[var(--sz-16)]">
              {([false, true] as const).map((checked) =>
                ([false, true] as const).map((disabled) => (
                  <CheckboxWithLabel
                    key={`${size}-${checked}-${disabled}`}
                    variant={variant}
                    size={size}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => {}}
                  >
                    {size}
                  </CheckboxWithLabel>
                )),
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll("label[data-variant]");
    // 3 variant × 3 size × 2 checked × 2 disabled
    await expect(rows).toHaveLength(36);
    await expect(
      canvasElement.querySelectorAll('label[data-state="disabled"]'),
    ).toHaveLength(18);
  },
};

function StateGrid({ variant }: { variant: "circle" | "square" | "mark" }) {
  return (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {([false, true] as const).map((disabled) =>
        ([false, true] as const).map((checked) => (
          <CheckboxWithLabel
            key={`${disabled}-${checked}`}
            variant={variant}
            checked={checked}
            disabled={disabled}
            onChange={() => {}}
          >
            {disabled ? "disabled" : "enable"} /{" "}
            {checked ? "checked" : "unchecked"}
          </CheckboxWithLabel>
        )),
      )}
    </div>
  );
}
