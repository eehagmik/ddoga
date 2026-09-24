import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { Radio } from "./Radio";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-128241";

const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Radio" (node 51405:128241) 와 1:1. 라벨·히트영역 없이 "선택 상태 원" 시각만 담당하는 ATOM 이다. 상위 몰리큘(RadioWithLabel · RadioCard)이 이 아톰을 조합해 실제 입력·라벨 연결을 처리한다. `Checkbox` 처럼 순수 시각 프리미티브라 `<span>` 하나만 렌더하며 native `<input>`·`onChange` 가 없다. `checked` / `disabled` 는 props, `hover` 는 `hover:`/`group-hover:` 유틸로만 표현한다. Figma 에 focus·pressed 상태와 variant(circle/square/mark) 축이 없다 — Radio 는 항상 원형이다. 내부 점은 단순 채워진 원이라 커스텀 SVG path 없이 배경색 span 으로 표현한다.',
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { size: "md", checked: false, disabled: false },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)]">
      <Radio {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const radio = canvasElement.querySelector("[data-size]");
    await expect(radio).toBeInTheDocument();
    await expect(radio).toHaveAttribute("data-checked", "false");
    await expect(radio).toHaveAttribute("data-state", "enable");
    await expect(radio).toHaveClass("rounded-circle", "bg-bg-neutral-normal");
  },
};

export const Sizes: Story = {
  // 여러 size 를 동시에 비교하는 정적 데모라 단일 컨트롤로 대응 불가 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-end gap-[var(--sz-24)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {SIZES.map((size) => (
        <div
          key={size}
          className="flex flex-col items-center gap-[var(--sz-8)]"
        >
          <code className="text-2xs text-typo-neutral-light">{size}</code>
          <Radio size={size} checked />
        </div>
      ))}
    </div>
  ),
};

/**
 * 조상 `.group` hover 로 전이하는 경로 시연 (`RadioWithLabel` 이 `<label class="group">` 로 쓰는 방식).
 * 아톰 단독으로도 `hover:` 로 배경이 전이되지만, 점 틴트는 조상 `.group` 을 필요로 한다.
 */
export const Hover: Story = {
  // 정적 데모(args 미반영)라 Controls 패널 비활성화 — 조작해도 반영되지 않는 컨트롤을 숨긴다.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-fit cursor-pointer items-center gap-[var(--sz-8)] bg-bg-neutral-normal p-[var(--sz-32)]">
      <div className="group flex items-center gap-[var(--sz-8)]">
        <Radio />
        <span className="text-body-4 text-typo-neutral-normal">
          이 행에 hover 하세요
        </span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector(".group");
    await expect(row).toBeInTheDocument();
    const radio = row?.querySelector("[data-size]");
    await expect(radio).toHaveClass("group-hover:bg-bg-brandGrayish-deep");
  },
};

/** enable / disabled 정지 표현. hover 는 `:hover`/`group-hover:` 라 정적 스냅샷에는 나타나지 않는다. */
export const States: Story = {
  // enable/disabled × checked 4가지 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {(
        [
          ["enable", false],
          ["enable", true],
          ["disabled", false],
          ["disabled", true],
        ] as const
      ).map(([state, checked]) => (
        <div
          key={`${state}-${checked}`}
          className="flex items-center gap-[var(--sz-16)]"
        >
          <code className="w-[var(--sz-128)] text-2xs text-typo-neutral-light">
            {state} / {checked ? "checked" : "unchecked"}
          </code>
          <Radio checked={checked} disabled={state === "disabled"} />
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  // size × checked × disabled 전 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[var(--sz-8)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {([false, true] as const).map((disabled) => (
        <div
          key={String(disabled)}
          className="flex items-end gap-[var(--sz-16)]"
        >
          {SIZES.map((size) =>
            ([false, true] as const).map((checked) => (
              <Radio
                key={`${size}-${checked}`}
                size={size}
                checked={checked}
                disabled={disabled}
              />
            )),
          )}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cells = canvasElement.querySelectorAll("[data-size]");
    // 2 disabled × 3 size × 2 checked
    await expect(cells).toHaveLength(12);
    const disabled = canvasElement.querySelectorAll('[data-state="disabled"]');
    await expect(disabled).toHaveLength(6);
  },
};
