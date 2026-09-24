import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import type { ReactNode } from "react";

import { CheckboxCard } from "./CheckboxCard";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-45930";

const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/CheckboxCard",
  component: CheckboxCard,
  tags: ["autodocs"],
  args: { label: "Label", subTextValue: "sub text" },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / CheckboxCard" (node 51405:45930) 와 1:1. `Checkbox` 아톰에 카드 표면·라벨·서브텍스트·자유 콘텐츠 슬롯을 더한 MOLECULE. 루트는 `<label class="group">` 이며 시각적으로 숨긴 native `<input type="checkbox">` 를 감싼다 — 카드 전체가 클릭 히트영역이다. controlled(`checked`+`onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원. hover 는 checked 무관하게 카드 배경을 `bg/brandGrayish/deep` 로 바꾼다(node 51405:45940 검증) — 카드 표면은 루트 `<label>` 자신이라 `hover:`, 자손 `<Checkbox>` 아톰은 `group-hover:`. focus 는 `peer-focus-visible:opacity` dip(`Button` 선례), disabled 는 input·아톰·표면·텍스트·커서에 반영. selected(checked) 는 카드 배경 `bg/brand/bright` + brand 2px 외곽선 + 라벨 `typo/brand/dark` Bold.',
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    subTextValue: { control: "text" },
  },
} satisfies Meta<typeof CheckboxCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="w-[var(--sz-320)] bg-bg-neutral-deep p-[var(--sz-32)]">
    {children}
  </div>
);

export const Playground: Story = {
  args: { size: "md", disabled: false },
  render: (args) => (
    <Frame>
      <CheckboxCard {...args} />
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

/** enable / unchecked — size 별 */
export const Sizes: Story = {
  // 여러 size 를 동시에 비교하는 정적 데모라 단일 컨트롤로 대응 불가 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[var(--sz-320)] flex-col gap-[var(--sz-16)] bg-bg-neutral-deep p-[var(--sz-32)]">
      {SIZES.map((size) => (
        <CheckboxCard key={size} size={size} label={`size = ${size}`} />
      ))}
    </div>
  ),
};

/** unchecked / checked — 선택 시 카드 강조 */
export const Checked: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[var(--sz-320)] flex-col gap-[var(--sz-16)] bg-bg-neutral-deep p-[var(--sz-32)]">
      <CheckboxCard label="unchecked" subTextValue="기본 표면" />
      <CheckboxCard
        label="checked"
        subTextValue="brand 강조 표면"
        defaultChecked
      />
    </div>
  ),
};

/** disabled — unchecked / checked */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[var(--sz-320)] flex-col gap-[var(--sz-16)] bg-bg-neutral-deep p-[var(--sz-32)]">
      <CheckboxCard
        label="disabled / unchecked"
        subTextValue="비활성"
        disabled
      />
      <CheckboxCard
        label="disabled / checked"
        subTextValue="비활성"
        disabled
        checked
      />
    </div>
  ),
};

/** 서브텍스트 없이 라벨만 */
export const WithoutSubText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Frame>
      <CheckboxCard label="서브텍스트 없는 카드" subTextValue={undefined} />
    </Frame>
  ),
};

/** 하단 자유 콘텐츠 슬롯 */
export const WithContentSlot: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Frame>
      <CheckboxCard
        label="콘텐츠 슬롯"
        subTextValue="아래에 임의 콘텐츠"
        defaultChecked
      >
        <div className="rounded-sm bg-bg-neutral-normal p-[var(--sz-12)] text-body-5 text-typo-neutral-normal">
          [슬롯]
        </div>
      </CheckboxCard>
    </Frame>
  ),
};

/** size × checked × (enable/disabled) 전수 */
export const AllStates: Story = {
  // size × checked × disabled 전 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[var(--sz-24)] bg-bg-neutral-deep p-[var(--sz-32)]">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-[var(--sz-8)]">
          <code className="text-2xs text-typo-neutral-light">{size}</code>
          <div className="flex flex-wrap gap-[var(--sz-16)]">
            {([false, true] as const).map((checked) =>
              ([false, true] as const).map((disabled) => (
                <div
                  key={`${checked}-${disabled}`}
                  className="w-[var(--sz-256)]"
                >
                  <CheckboxCard
                    size={size}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => {}}
                    label={`${disabled ? "disabled" : "enable"} / ${
                      checked ? "checked" : "unchecked"
                    }`}
                    subTextValue="sub text"
                  />
                </div>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll("label[data-variant]");
    // 3 size × 2 checked × 2 disabled
    await expect(cards).toHaveLength(12);
    await expect(
      canvasElement.querySelectorAll('label[data-state="disabled"]'),
    ).toHaveLength(6);
    await expect(
      canvasElement.querySelectorAll('label[data-checked="true"]'),
    ).toHaveLength(6);
  },
};
