import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";

import { CheckSelectRadio } from "./CheckSelectRadio";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-48796";

const meta = {
  title: "Components/CheckSelectRadio",
  component: CheckSelectRadio,
  tags: ["autodocs"],
  args: { children: "Label" },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / CheckSelectRadio" (node 51405:48796) 와 1:1. 목록에서 항목을 선택하는 전체 폭 행(row) MOLECULE. 왼쪽 라벨 + 오른쪽 체크 표시(선택 시만 표시). 루트는 `<label class="group">` 이며 시각적으로 숨긴 native `<input>` 을 감싼다 — 행 전체가 클릭 히트영역. `type` 은 radio(기본)/checkbox. controlled(`checked`+`onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원. hover 는 `group-hover:` 로 라벨을 `typo/brand/dark` 로, focus 는 `group-focus-within:` 로 동일하게 전이. checked 는 라벨을 `typo/brand/deep` Bold 로 + 우측 체크마크(`Checkbox` 아톰 `variant="mark"` 재사용) 표시. Figma 는 시각 3종만 정의(disabled·indeterminate 없음).',
      },
    },
  },
  argTypes: {
    type: { control: "inline-radio", options: ["radio", "checkbox"] },
    checked: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof CheckSelectRadio>;

export default meta;

type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="w-(--sz-320) bg-bg-neutral-normal px-(--sz-16)">
    {children}
  </div>
);

export const Playground: Story = {
  args: { type: "radio" },
  render: (args) => (
    <Frame>
      <CheckSelectRadio {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvasElement.querySelector("label")!;
    const input = canvasElement.querySelector<HTMLInputElement>("input")!;

    await expect(input.checked).toBe(false);
    await expect(label).toHaveAttribute("data-checked", "false");
    await expect(label).toHaveAttribute("data-state", "enable");

    await userEvent.click(canvas.getByText("Label"));
    await expect(input.checked).toBe(true);
    await expect(label).toHaveAttribute("data-checked", "true");
    await expect(canvasElement.querySelector("[data-variant]")).toHaveAttribute(
      "data-checked",
      "true",
    );
  },
};

/** enable / unchecked — 기본 상태 */
export const Enable: Story = {
  render: () => (
    <Frame>
      <CheckSelectRadio>기본 항목</CheckSelectRadio>
    </Frame>
  ),
};

/**
 * hover — 라벨이 `group-hover:` / `group-focus-within:` 로 `typo/brand/dark` 로 전이한다.
 * `:hover` / focus 는 정적 스냅샷에 나타나지 않으니 행에 마우스를 올려 확인한다.
 */
export const Hover: Story = {
  render: () => (
    <Frame>
      <CheckSelectRadio>이 행에 hover 하세요</CheckSelectRadio>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const labelSpan = canvasElement.querySelector("label > span")!;
    await expect(labelSpan).toHaveClass(
      "group-hover:text-typo-brand-dark",
      "group-focus-within:text-typo-brand-dark",
    );
  },
};

/** checked — 라벨 typo/brand/deep Bold + 우측 체크마크 */
export const Checked: Story = {
  render: () => (
    <Frame>
      <CheckSelectRadio defaultChecked>선택된 항목</CheckSelectRadio>
    </Frame>
  ),
};

/** startSlot — 라벨 앞 리딩 슬롯(34px) */
export const WithStartSlot: Story = {
  render: () => (
    <Frame>
      <CheckSelectRadio
        defaultChecked
        startSlot={
          <span className="flex size-(--sz-24) items-center justify-center rounded-circle bg-bg-brand-normal text-body-5-bold text-typo-inverse-normal">
            A
          </span>
        }
      >
        리딩 슬롯이 있는 항목
      </CheckSelectRadio>
    </Frame>
  ),
};

/** radio — name 으로 그룹핑한 단일 선택 목록(기본 type) */
export const RadioGroup: Story = {
  render: function RadioGroupStory() {
    const [value, setValue] = useState("a");
    return (
      <div className="flex w-(--sz-320) flex-col bg-bg-neutral-normal px-(--sz-16)">
        {[
          ["a", "첫 번째 옵션"],
          ["b", "두 번째 옵션"],
          ["c", "세 번째 옵션"],
        ].map(([v, label]) => (
          <CheckSelectRadio
            key={v}
            name="example"
            value={v}
            checked={value === v}
            onChange={() => setValue(v)}
          >
            {label}
          </CheckSelectRadio>
        ))}
      </div>
    );
  },
};

/** checkbox — 다중 선택 목록 (type='checkbox') */
export const CheckboxGroup: Story = {
  render: () => (
    <div className="flex w-(--sz-320) flex-col bg-bg-neutral-normal px-(--sz-16)">
      <CheckSelectRadio type="checkbox" defaultChecked>
        선택된 항목
      </CheckSelectRadio>
      <CheckSelectRadio type="checkbox">선택 안 된 항목</CheckSelectRadio>
    </div>
  ),
};

/** checked 전수 (unchecked / checked) */
export const AllStates: Story = {
  render: () => (
    <div className="flex w-(--sz-320) flex-col bg-bg-neutral-normal px-(--sz-16)">
      {([false, true] as const).map((checked) => (
        <CheckSelectRadio
          key={String(checked)}
          checked={checked}
          onChange={() => {}}
        >
          {checked ? "checked" : "unchecked"}
        </CheckSelectRadio>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll("label[data-type]");
    await expect(rows).toHaveLength(2);
    await expect(
      canvasElement.querySelectorAll('label[data-checked="true"]'),
    ).toHaveLength(1);
  },
};
