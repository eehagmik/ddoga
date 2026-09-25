import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { RadioWithLabel } from "./RadioWithLabel";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-128280";

const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/RadioWithLabel",
  component: RadioWithLabel,
  tags: ["autodocs"],
  args: { children: "Label" },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / RadioWithLabel" (node 51405:128280) 와 1:1. `Radio` 아톰에 라벨과 넓은 히트영역을 더한 MOLECULE. 루트는 `<label class="group">` 이며 시각적으로 숨긴 native `<input type="radio">` 를 감싼다. controlled(`checked`+`onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원. 같은 그룹 내 단일 선택은 `name` 을 공유하는 네이티브 라디오 그룹으로 처리하며(별도 `RadioGroup` 없음), 그룹은 controlled 패턴을 권장한다. 라벨 색은 `checked` 와 무관(disabled 만 색 변경).',
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    bold: { control: "boolean" },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof RadioWithLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { size: "md", bold: false, disabled: false },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <RadioWithLabel {...args} />
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
    await expect(canvasElement.querySelector("[data-size]")).toHaveAttribute(
      "data-checked",
      "true",
    );
  },
};

export const Sizes: Story = {
  // 여러 size 를 동시에 비교하는 정적 데모라 단일 컨트롤로 대응 불가 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      {SIZES.map((size) => (
        <RadioWithLabel key={size} size={size} defaultChecked>
          {size} · 라벨 텍스트
        </RadioWithLabel>
      ))}
    </div>
  ),
};

export const Bold: Story = {
  // bold 두 값을 동시에 비교하는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      <RadioWithLabel defaultChecked>bold=false (Medium)</RadioWithLabel>
      <RadioWithLabel defaultChecked bold>
        bold=true (Bold)
      </RadioWithLabel>
    </div>
  ),
};

export const States: Story = {
  // enable/disabled × checked 4가지 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      <RadioWithLabel>enable / unchecked</RadioWithLabel>
      <RadioWithLabel defaultChecked>enable / checked</RadioWithLabel>
      <RadioWithLabel disabled>disabled / unchecked</RadioWithLabel>
      <RadioWithLabel disabled checked>
        disabled / checked
      </RadioWithLabel>
    </div>
  ),
};

/** 라벨이 여러 줄일 때 라디오가 첫 줄에 정렬되는지(`items-start`) 확인. */
export const MultilineLabel: Story = {
  // 정렬 확인용 고정 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-(--sz-256) bg-bg-neutral-normal p-(--sz-32)">
      <RadioWithLabel defaultChecked>
        여러 줄에 걸치는 긴 라벨 텍스트입니다. 라디오는 첫 번째 줄의 텍스트와
        나란히 정렬되어야 합니다.
      </RadioWithLabel>
    </div>
  ),
};

/** controlled 그룹 — 같은 `name` 을 공유하고 부모가 단일 선택 값을 관리하는 권장 패턴. */
export const Group: Story = {
  // 내부 state 로 그룹을 관리하는 고정 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => <RadioGroupDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labels = canvasElement.querySelectorAll("label");
    await expect(labels[0]).toHaveAttribute("data-checked", "true");

    await userEvent.click(canvas.getByText("Pro"));
    await expect(labels[0]).toHaveAttribute("data-checked", "false");
    await expect(labels[1]).toHaveAttribute("data-checked", "true");
  },
};

export const AllSizes: Story = {
  // size × checked × disabled 전 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-wrap gap-(--sz-16)">
          {([false, true] as const).map((checked) =>
            ([false, true] as const).map((disabled) => (
              <RadioWithLabel
                key={`${size}-${checked}-${disabled}`}
                size={size}
                checked={checked}
                disabled={disabled}
                onChange={() => {}}
              >
                {size}
              </RadioWithLabel>
            )),
          )}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll("label[data-size]");
    // 3 size × 2 checked × 2 disabled
    await expect(rows).toHaveLength(12);
    await expect(
      canvasElement.querySelectorAll('label[data-state="disabled"]'),
    ).toHaveLength(6);
  },
};

function RadioGroupDemo() {
  const [value, setValue] = useState<"basic" | "pro">("basic");
  return (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      <RadioWithLabel
        name="plan"
        checked={value === "basic"}
        onChange={() => setValue("basic")}
      >
        Basic
      </RadioWithLabel>
      <RadioWithLabel
        name="plan"
        checked={value === "pro"}
        onChange={() => setValue("pro")}
      >
        Pro
      </RadioWithLabel>
    </div>
  );
}
