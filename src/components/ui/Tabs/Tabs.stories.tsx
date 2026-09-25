import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";

import { Tab } from "../Tab";
import type { TabsLayout, TabsSize, TabsType, TabsVariant } from "./Tabs";
import { Tabs } from "./Tabs";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%EB%98%90%EA%B0%80-3.0--Design-System?node-id=51405-133946";

const TYPES: TabsType[] = ["link", "focus"];
const LAYOUTS: TabsLayout[] = ["fit", "full"];
const SIZES: TabsSize[] = ["sm", "md"];
const VARIANTS: TabsVariant[] = ["normal", "blur"];

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Tabs" (node 51405:133946) 와 1:1. 밑줄 인디케이터형 `Tab` 아이템을 나열하는 컨테이너다. `type`(link/focus — 시각 영향 0, 실제 태그 선택은 각 `Tab` 이 `href` 유무로 결정) × `layout`(fit/full) × `size`(sm/md, 나열하는 `Tab` 에도 동일하게 넘겨야 함) × `variant`(normal/blur, blur 는 `Header` 와 동일한 토큰 조합). 탭 아이템은 이 컴포넌트가 만들지 않고 호출부가 `<Tab>` 을 children 으로 나열한다.',
      },
    },
  },
  args: {
    type: "link",
    layout: "fit",
    size: "sm",
    variant: "normal",
    "aria-label": "탭",
    children: undefined,
  },
  argTypes: {
    type: { control: "inline-radio", options: TYPES },
    layout: { control: "inline-radio", options: LAYOUTS },
    size: { control: "inline-radio", options: SIZES },
    variant: { control: "inline-radio", options: VARIANTS },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {
  render: (args) => (
    <Tabs {...args}>
      <Tab size={args.size} selected>
        홈
      </Tab>
      <Tab size={args.size}>메뉴</Tab>
      <Tab size={args.size}>리뷰</Tab>
    </Tabs>
  ),
};

/** fit(콘텐츠 폭, 하단정렬) / full(균등 stretch, 중앙정렬). */
export const Layouts: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-16)">
      {LAYOUTS.map((layout) => (
        <Tabs key={layout} {...args} layout={layout}>
          <Tab size={args.size} selected>
            홈
          </Tab>
          <Tab size={args.size}>메뉴</Tab>
          <Tab size={args.size}>리뷰</Tab>
        </Tabs>
      ))}
    </div>
  ),
};

/** sm / md. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-16)">
      {SIZES.map((size) => (
        <Tabs key={size} {...args} size={size}>
          <Tab size={size} selected>
            홈
          </Tab>
          <Tab size={size}>메뉴</Tab>
          <Tab size={size}>리뷰</Tab>
        </Tabs>
      ))}
    </div>
  ),
};

/** normal / blur(`Header` `variant="blur"` 와 동일한 토큰 조합). */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-16)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="bg-bg-brand-bright p-(--sz-12)">
          <Tabs {...args} variant={variant}>
            <Tab size={args.size} selected>
              홈
            </Tab>
            <Tab size={args.size}>메뉴</Tab>
            <Tab size={args.size}>리뷰</Tab>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

/**
 * `type="link"` — 탭 클릭이 실제 링크 이동. 시각은 focus 타입과 완전히 동일하다.
 */
export const TypeLink: Story = {
  args: { type: "link" },
  render: (args) => (
    <Tabs {...args}>
      <Tab size={args.size} href="#home" selected>
        홈
      </Tab>
      <Tab size={args.size} href="#menu">
        메뉴
      </Tab>
      <Tab size={args.size} href="#review">
        리뷰
      </Tab>
    </Tabs>
  ),
};

/**
 * `type="focus"` — 스크롤 위치에 따라 상위 페이지가 `selected` 를 controlled 로 넘기는 용도.
 * 이 스토리는 클릭으로 선택 상태를 흉내낸다(실제 스크롤 스파이 로직은 이 컴포넌트 책임 밖).
 */
export const TypeFocus: Story = {
  args: { type: "focus" },
  render: (args) => {
    function FocusDemo() {
      const [selected, setSelected] = useState("home");
      const sections = [
        { id: "home", label: "홈" },
        { id: "menu", label: "메뉴" },
        { id: "review", label: "리뷰" },
      ];
      return (
        <Tabs {...args}>
          {sections.map((section) => (
            <Tab
              key={section.id}
              size={args.size}
              selected={selected === section.id}
              onClick={() => setSelected(section.id)}
            >
              {section.label}
            </Tab>
          ))}
        </Tabs>
      );
    }
    return <FocusDemo />;
  },
};

/** 클릭 시 선택 상태가 바뀌는지 검증(`type="focus"` 시나리오). */
export const FocusSelectionChangesOnClick: Story = {
  args: { type: "focus" },
  render: TypeFocus.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole("button", { name: "홈" });
    const menu = canvas.getByRole("button", { name: "메뉴" });

    await expect(home).toHaveAttribute("aria-current", "true");
    await expect(menu).not.toHaveAttribute("aria-current");

    await userEvent.click(menu);
    await expect(menu).toHaveAttribute("aria-current", "true");
    await expect(home).not.toHaveAttribute("aria-current");
  },
};
