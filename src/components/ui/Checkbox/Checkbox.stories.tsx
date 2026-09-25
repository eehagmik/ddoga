import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { Checkbox } from "./Checkbox";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-45384";

const VARIANTS = ["circle", "square", "mark"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Checkbox" (node 51405:45384) 와 1:1. 라벨·히트영역 없이 "체크 상태 상자" 시각만 담당하는 ATOM 이다. 상위 몰리큘(CheckboxWithLabel · CheckboxCard)이 이 아톰을 조합해 실제 입력·라벨 연결을 처리한다. `Dot` 처럼 순수 시각 프리미티브라 `<span>` 하나만 렌더하며 native `<input>`·`onChange` 가 없다. `checked` / `disabled` 는 props, `hover` 는 `group-hover:` 유틸로만 표현한다(부모 hover 시 자연 전이). Figma 에 focus·pressed·indeterminate 상태는 없다. 체크마크(`Union`)는 파운데이션 아이콘셋에 없는 커스텀 벡터라 인라인 SVG 로 렌더하며 `fill="currentColor"` 로 `text-icon-*` 를 상속한다.',
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["circle", "square", "mark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: "circle", size: "md", checked: false, disabled: false },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-(--sz-32)">
      <Checkbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cb = canvasElement.querySelector("[data-variant]");
    await expect(cb).toBeInTheDocument();
    await expect(cb).toHaveAttribute("data-variant", "circle");
    await expect(cb).toHaveAttribute("data-checked", "false");
    await expect(cb).toHaveAttribute("data-state", "enable");
    await expect(cb).toHaveClass("rounded-circle", "bg-bg-neutral-normal");
    await expect(canvasElement.querySelector("svg")).toBeInTheDocument();
  },
};

/** unchecked / checked × enable / disabled — circle */
export const Circle: Story = {
  // 정적 데모(args 미반영) — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => <StateGrid variant="circle" />,
};

/** unchecked / checked × enable / disabled — square (radius/sm) */
export const Square: Story = {
  parameters: { controls: { disable: true } },
  render: () => <StateGrid variant="square" />,
};

/** 상자·테두리 없이 체크마크만. 40% 불투명도 미적용 — mark */
export const Mark: Story = {
  parameters: { controls: { disable: true } },
  render: () => <StateGrid variant="mark" />,
};

export const Sizes: Story = {
  // 여러 variant × size 를 동시에 비교하는 정적 데모라 단일 컨트롤로 대응 불가 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-end gap-(--sz-24)">
          {SIZES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-(--sz-8)">
              <code className="text-2xs text-typo-neutral-light">
                {variant}/{size}
              </code>
              <Checkbox variant={variant} size={size} checked />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * 조상 `.group` hover 로 전이하는 경로 시연 (`CheckboxWithLabel` 이 `<label class="group">` 로 쓰는 방식).
 * 아톰 단독으로도 `hover:` 로 배경이 전이되지만, 체크마크 틴트는 조상 `.group` 을 필요로 한다.
 */
export const Hover: Story = {
  // 정적 데모(args 미반영) — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      {VARIANTS.map((variant) => (
        <div
          key={variant}
          className="group flex w-fit cursor-pointer items-center gap-(--sz-8)"
        >
          <Checkbox variant={variant} />
          <span className="text-body-4 text-typo-neutral-normal">
            {variant} — 이 행에 hover 하세요
          </span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector(".group");
    await expect(row).toBeInTheDocument();
    const cb = row?.querySelector("[data-variant]");
    await expect(cb).toHaveClass("group-hover:bg-bg-brandGrayish-deep");
  },
};

/** enable / disabled 정지 표현. hover 는 `:hover` / `group-hover:` 라 정적 스냅샷에는 나타나지 않는다. */
export const States: Story = {
  // enable/disabled × checked 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
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
          className="flex items-center gap-(--sz-16)"
        >
          <code className="w-(--sz-128) text-2xs text-typo-neutral-light">
            {state} / {checked ? "checked" : "unchecked"}
          </code>
          {VARIANTS.map((variant) => (
            <Checkbox
              key={variant}
              variant={variant}
              checked={checked}
              disabled={state === "disabled"}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  // variant × size × checked × disabled 전 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-(--sz-8)">
          <code className="text-2xs text-typo-neutral-light">{variant}</code>
          <div className="flex flex-col gap-(--sz-8)">
            {([false, true] as const).map((disabled) => (
              <div
                key={String(disabled)}
                className="flex items-end gap-(--sz-16)"
              >
                {SIZES.map((size) =>
                  ([false, true] as const).map((checked) => (
                    <Checkbox
                      key={`${size}-${checked}`}
                      variant={variant}
                      size={size}
                      checked={checked}
                      disabled={disabled}
                    />
                  )),
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cells = canvasElement.querySelectorAll("[data-variant]");
    // 3 variant × 2 disabled × 3 size × 2 checked
    await expect(cells).toHaveLength(36);
    const disabled = canvasElement.querySelectorAll('[data-state="disabled"]');
    await expect(disabled).toHaveLength(18);
  },
};

function StateGrid({ variant }: { variant: "circle" | "square" | "mark" }) {
  return (
    <div className="flex flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      {(
        [
          ["enable", false],
          ["disabled", false],
        ] as const
      ).map(([state]) => (
        <div key={state} className="flex items-center gap-(--sz-24)">
          {([false, true] as const).map((checked) => (
            <div
              key={String(checked)}
              className="flex flex-col items-center gap-(--sz-8)"
            >
              <code className="text-2xs text-typo-neutral-light">
                {state} / {checked ? "checked" : "unchecked"}
              </code>
              <Checkbox
                variant={variant}
                checked={checked}
                disabled={state === "disabled"}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
