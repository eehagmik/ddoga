import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { InfoCard } from "./InfoCard";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-102841";

const COLORS = ["neutral", "danger", "info", "warning"] as const;
const VARIANTS = ["horizontal", "vertical"] as const;

const meta = {
  title: "Components/InfoCard",
  component: InfoCard,
  tags: ["autodocs"],
  args: {
    titleValue: "Title",
    textValue: "안내 메시지를 여기에 표시합니다.",
  },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / InfoCard" (node 51405:102841) 와 1:1. 배경색이 있는 카드로 안내 메시지를 보여주는 정적 컴포넌트(hover/focus/disabled 없음). `color`(neutral/danger/info/warning) × `variant`(horizontal: 아이콘+제목 가로 배치 / vertical: 아이콘 위·제목 아래) 2축. `titleValue`·`textValue`·`children` 은 모두 presence 기반 — 값이 있을 때만 해당 영역을 렌더한다. 아이콘은 고정 글리프 `info_circle_solid`. 카드 폭은 `w-full` 로 구현해 호출부가 결정한다(Figma 원본은 320px 고정 캔버스).',
      },
    },
  },
  argTypes: {
    color: {
      control: "inline-radio",
      options: COLORS,
    },
    variant: {
      control: "inline-radio",
      options: VARIANTS,
    },
    titleValue: { control: "text" },
    textValue: { control: "text" },
  },
} satisfies Meta<typeof InfoCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="w-(--sz-320)">{children}</div>
);

export const Playground: Story = {
  args: { color: "info", variant: "horizontal" },
  render: (args) => (
    <Frame>
      <InfoCard {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector("[data-color]");

    await expect(root).toHaveAttribute("data-color", "info");
    await expect(root).toHaveAttribute("data-variant", "horizontal");
    await expect(canvas.getByText("Title")).toBeInTheDocument();
    await expect(
      canvas.getByText("안내 메시지를 여기에 표시합니다."),
    ).toBeInTheDocument();
  },
};

/** color = neutral / variant = horizontal */
export const NeutralHorizontal: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="neutral" variant="horizontal" />
    </Frame>
  ),
};

/** color = neutral / variant = vertical */
export const NeutralVertical: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="neutral" variant="vertical" />
    </Frame>
  ),
};

/** color = danger / variant = horizontal */
export const DangerHorizontal: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="danger" variant="horizontal" />
    </Frame>
  ),
};

/** color = danger / variant = vertical */
export const DangerVertical: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="danger" variant="vertical" />
    </Frame>
  ),
};

/** color = info / variant = horizontal */
export const InfoHorizontal: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="info" variant="horizontal" />
    </Frame>
  ),
};

/** color = info / variant = vertical */
export const InfoVertical: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="info" variant="vertical" />
    </Frame>
  ),
};

/** color = warning / variant = horizontal */
export const WarningHorizontal: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="warning" variant="horizontal" />
    </Frame>
  ),
};

/** color = warning / variant = vertical */
export const WarningVertical: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame>
      <InfoCard {...args} color="warning" variant="vertical" />
    </Frame>
  ),
};

/** titleValue 없이 본문만 — header(아이콘+제목) 영역이 렌더되지 않는다 */
export const WithoutTitle: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Frame>
      <InfoCard
        color="info"
        titleValue={undefined}
        textValue="제목 없이 본문만 표시됩니다."
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[data-color]")!;
    await expect(root.querySelector("p.text-body-3-bold")).toBeNull();
  },
};

/** textValue 없이 제목만 */
export const WithoutText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Frame>
      <InfoCard
        color="warning"
        titleValue="제목만 있는 카드"
        textValue={undefined}
      />
    </Frame>
  ),
};

/** 하단 자유 콘텐츠 슬롯 */
export const WithContentSlot: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Frame>
      <InfoCard
        color="danger"
        titleValue="주의"
        textValue="아래 슬롯을 확인하세요."
      >
        <div className="rounded-sm bg-bg-neutral-normal p-(--sz-12) text-body-5 text-typo-neutral-normal">
          [슬롯]
        </div>
      </InfoCard>
    </Frame>
  ),
};

/** color × variant 전수 */
export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-(--sz-24)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-(--sz-8)">
          <code className="text-2xs text-typo-neutral-light">{variant}</code>
          <div className="flex flex-wrap gap-(--sz-16)">
            {COLORS.map((color) => (
              <div key={color} className="w-(--sz-320)">
                <InfoCard
                  color={color}
                  variant={variant}
                  titleValue="Title"
                  textValue="Text"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll("[data-color]");
    // 4 color × 2 variant
    await expect(cards).toHaveLength(8);
  },
};
