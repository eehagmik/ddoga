import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { RadioCard } from "./RadioCard";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-128427";

const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/RadioCard",
  component: RadioCard,
  tags: ["autodocs"],
  args: { label: "Label", subTextValue: "sub text" },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / RadioCard" (node 51405:128427) 와 1:1. `Radio` 아톰에 카드 표면·라벨·서브텍스트·자유 콘텐츠 슬롯을 더한 MOLECULE. 루트는 `<label class="group">` 이며 카드 전체가 히트영역이다. hover 는 checked 여부와 무관하게 카드 배경을 brandGrayish/deep 로 바꾼다(checked 라도 brand/bright 유지 아님). checked 는 배경 brand/bright + 외곽선 brand 2px + 라벨 typo/brand/dark Bold. `CheckboxCard` 와 거의 동일하나 sm 라디오 래퍼 pt 값만 다르다(Figma 실측).',
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
} satisfies Meta<typeof RadioCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { size: "md", disabled: false },
  render: (args) => (
    <div className="w-(--sz-320) bg-bg-neutral-normal p-(--sz-32)">
      <RadioCard {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cardLabel = canvasElement.querySelector("label")!;
    const input = canvasElement.querySelector("input")!;

    await expect(input.checked).toBe(false);
    await expect(cardLabel).toHaveAttribute("data-checked", "false");

    await userEvent.click(canvas.getByText("Label"));
    await expect(input.checked).toBe(true);
    await expect(cardLabel).toHaveAttribute("data-checked", "true");
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
    <div className="flex w-(--sz-320) flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      {SIZES.map((size) => (
        <RadioCard
          key={size}
          size={size}
          label={`${size} · Label`}
          subTextValue="sub text"
          defaultChecked
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  // enable/disabled × checked 4가지 조합을 동시에 보여주는 정적 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-(--sz-320) flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      <RadioCard label="enable / unchecked" subTextValue="sub text" />
      <RadioCard
        label="enable / checked"
        subTextValue="sub text"
        defaultChecked
      />
      <RadioCard
        label="disabled / unchecked"
        subTextValue="sub text"
        disabled
      />
      <RadioCard
        label="disabled / checked"
        subTextValue="sub text"
        disabled
        checked
      />
    </div>
  ),
};

/** subTextValue 없이 라벨만. Figma 의 subText boolean 토글을 presence 기반으로 대체. */
export const WithoutSubText: Story = {
  // subTextValue 부재 시나리오 고정 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-(--sz-320) bg-bg-neutral-normal p-(--sz-32)">
      <RadioCard label="서브텍스트 없음" />
    </div>
  ),
};

/** 하단 자유 콘텐츠 슬롯(Figma 레이어 `contentsSlot`) 사용 예시. */
export const WithSlotContent: Story = {
  // 슬롯 콘텐츠 예시 고정 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-(--sz-320) bg-bg-neutral-normal p-(--sz-32)">
      <RadioCard label="슬롯 포함" subTextValue="sub text" defaultChecked>
        <div className="rounded-sm bg-bg-brandGrayish-normal p-(--sz-8) text-body-5 text-typo-neutral-light">
          자유 콘텐츠 슬롯
        </div>
      </RadioCard>
    </div>
  ),
};

/** controlled 그룹 — 같은 `name` 을 공유하고 부모가 단일 선택 값을 관리하는 권장 패턴. */
export const Group: Story = {
  // 내부 state 로 그룹을 관리하는 고정 데모 — Controls 패널 비활성화.
  parameters: { controls: { disable: true } },
  render: () => <RadioCardGroupDemo />,
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
    <div className="flex w-(--sz-320) flex-col gap-(--sz-24) bg-bg-neutral-normal p-(--sz-32)">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-(--sz-8)">
          {([false, true] as const).map((checked) =>
            ([false, true] as const).map((disabled) => (
              <RadioCard
                key={`${size}-${checked}-${disabled}`}
                size={size}
                label={`${size}`}
                subTextValue="sub text"
                checked={checked}
                disabled={disabled}
                onChange={() => {}}
              />
            )),
          )}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll("label[data-size]");
    // 3 size × 2 checked × 2 disabled
    await expect(cards).toHaveLength(12);
    await expect(
      canvasElement.querySelectorAll('label[data-state="disabled"]'),
    ).toHaveLength(6);
  },
};

function RadioCardGroupDemo() {
  const [value, setValue] = useState<"basic" | "pro">("basic");
  return (
    <div className="flex w-(--sz-320) flex-col gap-(--sz-16) bg-bg-neutral-normal p-(--sz-32)">
      <RadioCard
        name="plan"
        label="Basic"
        subTextValue="무료 플랜"
        checked={value === "basic"}
        onChange={() => setValue("basic")}
      />
      <RadioCard
        name="plan"
        label="Pro"
        subTextValue="월 9,900원"
        checked={value === "pro"}
        onChange={() => setValue("pro")}
      />
    </div>
  );
}
