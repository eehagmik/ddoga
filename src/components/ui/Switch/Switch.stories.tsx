import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { Switch, type SwitchSize } from "./Switch";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-133464";

const SIZES = ["sm", "md"] as const;

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Switch" (문서 노드 51405:133456 / 메인 컴포넌트 51405:133464) 와 1:1. on/off 를 즉시 토글하는 단일 인터랙티브 컨트롤. 루트는 `<label class="group">` 이며 시각적으로 숨긴 native `<input type="checkbox" role="switch">` 를 감싼다 — 트랙 어디를 눌러도 토글된다. controlled(`checked`+`onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원. hover 는 `.group` 으로 트랙에 전이, focus 는 `peer-focus-visible:opacity` dip(`Button` 선례), disabled 는 트랙·썸 고정색 + `cursor-not-allowed`. off 테두리는 레이아웃 시프트 방지를 위해 `border` 가 아니라 `outline` 으로 그리고, 썸 이동은 `translateX` + `transition-transform`(150ms) 로 처리한다.',
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { size: "md", disabled: false },
  render: (args) => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)]">
      <Switch {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvasElement.querySelector("label")!;
    const input = canvas.getByRole("switch") as HTMLInputElement;
    const thumb = canvasElement.querySelector("label > span > span")!;

    await expect(input.checked).toBe(false);
    await expect(label).toHaveAttribute("data-checked", "false");
    await expect(thumb).toHaveClass("translate-x-0");

    await userEvent.click(input);
    await expect(input.checked).toBe(true);
    await expect(label).toHaveAttribute("data-checked", "true");
    await expect(thumb).toHaveClass("translate-x-[var(--sz-22)]");
  },
};

/** on 상태 — 브랜드 트랙 + 썸 우측 정렬. */
export const On: Story = {
  render: () => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)]">
      <Switch defaultChecked />
    </div>
  ),
};

/** off 상태 — neutral 트랙 + outline 테두리 + 썸 좌측 정렬. */
export const Off: Story = {
  render: () => (
    <div className="bg-bg-neutral-normal p-[var(--sz-32)]">
      <Switch />
    </div>
  ),
};

/** sm(46×26) / md(56×34). */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-[var(--sz-16)]">
          <code className="w-[var(--sz-24)] text-2xs text-typo-neutral-light">
            {size}
          </code>
          <Switch size={size} onChange={() => {}} />
          <Switch size={size} checked onChange={() => {}} />
        </div>
      ))}
    </div>
  ),
};

/** disabled — off / on 모두 클릭해도 토글되지 않는다. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      <Switch disabled onChange={() => {}} />
      <Switch disabled checked onChange={() => {}} />
    </div>
  ),
};

/** enable / hover / disable × off / on 그리드. hover 는 실제 마우스 오버 시 확인. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--sz-24)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-[var(--sz-8)]">
          <code className="text-2xs text-typo-neutral-light">{size}</code>
          <StateGrid size={size} />
        </div>
      ))}
    </div>
  ),
};

/** size × checked 조합 그리드. play 에서 셀 개수(2×2=4)를 검증한다. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--sz-16)] bg-bg-neutral-normal p-[var(--sz-32)]">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-[var(--sz-16)]">
          {([false, true] as const).map((checked) => (
            <Switch
              key={`${size}-${checked}`}
              size={size}
              checked={checked}
              onChange={() => {}}
            />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cells = canvasElement.querySelectorAll("label[data-size]");
    await expect(cells).toHaveLength(4);
    await expect(
      canvasElement.querySelectorAll('label[data-checked="true"]'),
    ).toHaveLength(2);
  },
};

/** 클릭으로 토글하며 썸이 좌우로 슬라이드하는 모션을 시연. */
export const Motion: Story = {
  render: () => <MotionDemo />,
};

function MotionDemo() {
  const [on, setOn] = useState(false);
  return (
    <div className="flex flex-col items-start gap-[var(--sz-12)] bg-bg-neutral-normal p-[var(--sz-32)]">
      <Switch
        size="md"
        checked={on}
        onChange={(event) => setOn(event.target.checked)}
      />
      <code className="text-2xs text-typo-neutral-light">
        {on ? "on" : "off"}
      </code>
    </div>
  );
}

function StateGrid({ size }: { size: SwitchSize }) {
  const rows = [
    { label: "enable", props: {} },
    { label: "hover", props: {} },
    { label: "disable", props: { disabled: true } },
  ] as const;
  return (
    <div className="flex flex-col gap-[var(--sz-12)]">
      {rows.map(({ label, props }) => (
        <div key={label} className="flex items-center gap-[var(--sz-16)]">
          <code className="w-[var(--sz-56)] text-2xs text-typo-neutral-light">
            {label}
          </code>
          <Switch size={size} checked={false} onChange={() => {}} {...props} />
          <Switch size={size} checked onChange={() => {}} {...props} />
        </div>
      ))}
    </div>
  );
}
