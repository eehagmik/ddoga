import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import type { AvatarSize, AvatarType, AvatarVariant } from "./Avatar";
import { Avatar } from "./Avatar";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-6120";

const SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const PERSON_VARIANTS: AvatarVariant[] = ["readOnly", "edit", "checkable"];
const TYPES: AvatarType[] = ["person", "ltch", "add"];

const SAMPLE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23a6b3ad'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23f5f8f7'/%3E%3Cellipse cx='50' cy='95' rx='32' ry='25' fill='%23f5f8f7'/%3E%3C/svg%3E";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Avatar" (문서 노드 51405:6022 / 메인 컴포넌트 51405:6120) 와 1:1. `size`(xs/sm/md/lg/xl/2xl) × `type`(person/ltch/add) × `variant`(readOnly/edit/checkable, person 전용)를 지원한다. `readOnly`(기본)는 비인터랙티브 `<div>`(클릭 불가), `edit`도 이미지 영역은 `<div>`이고 편집 배지만 클릭 가능(`onEditClick`), `checkable`만 루트가 실제 `<button>`이다. `ltch` 는 또가에서 요양시설(장기요양기관)을 가리키는 내부 약어로 항상 readOnly. `src` 없으면 type 별 기본 placeholder 이미지(`person` → `personPlaceholder.png`, `ltch` → `placeholder/ltch.png`)를 `object-cover`로 비율 유지 중앙 크롭해 렌더한다. `checkable` 은 controlled(`checked`+`onCheckedChange`)/uncontrolled(`defaultChecked`) 토글과 150ms 페이드 링을 지원한다.',
      },
    },
  },
  args: {
    size: "md",
    type: "person",
    variant: "readOnly",
    defaultChecked: false,
    onCheckedChange: fn(),
    onEditClick: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    type: { control: "inline-radio", options: TYPES },
    variant: { control: "inline-radio", options: PERSON_VARIANTS },
    src: { control: "text" },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/**
 * person, readOnly — 비인터랙티브 `<div>`(버튼 없음, 클릭 불가). `onClick` 을 넘겨도
 * 호출되지 않는다.
 */
export const ReadOnly: Story = {
  args: { type: "person", variant: "readOnly" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

/**
 * person, edit — 우하단 편집 배지. 아바타 이미지 영역은 비인터랙티브 `<div>`이고,
 * 편집 배지만 실제 `<button>`으로 클릭 가능하다(`onEditClick`).
 */
export const Edit: Story = {
  args: { type: "person", variant: "edit" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole("button", { name: "아바타 편집" });

    // 아바타 루트는 버튼이 아니어야 한다 — 클릭 가능한 건 배지뿐.
    await expect(canvas.queryByRole("button", { name: "아바타" })).toBeNull();

    await userEvent.click(badge);
    await expect(args.onEditClick).toHaveBeenCalledTimes(1);
  },
};

/** person, checkable — unchecked / checked(브랜드 링 페이드 인). */
export const Checkable: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-16)]">
      <Avatar {...args} variant="checkable" defaultChecked={false} />
      <Avatar {...args} variant="checkable" defaultChecked />
    </div>
  ),
};

/** src 가 있으면 이미지를, 없으면 `personPlaceholder.png` 기본 이미지를 렌더한다. */
export const WithImage: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-16)]">
      <Avatar {...args} src={undefined} />
      <Avatar {...args} src={SAMPLE_SRC} />
    </div>
  ),
};

/** type='ltch' — 요양시설 아바타, 항상 readOnly(variant 무시), 비인터랙티브 div. */
export const Ltch: Story = {
  args: { type: "ltch" },
};

/** type='add' — "새 아바타 추가" 슬롯. variant 와 무관하게 독립 렌더. */
export const Add: Story = {
  args: { type: "add" },
};

/** size 6종. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-[var(--sz-12)]">
      {SIZES.map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** type(person/ltch/add) × size 매트릭스. */
export const TypeMatrix: Story = {
  render: () => (
    <table className="border-separate border-spacing-[var(--sz-12)]">
      <thead>
        <tr>
          <th />
          {SIZES.map((size) => (
            <th
              key={size}
              className="text-body-6 text-typo-neutral-light capitalize"
            >
              {size}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TYPES.map((type) => (
          <tr key={type}>
            <th className="text-body-6 text-typo-neutral-light text-right capitalize">
              {type}
            </th>
            {SIZES.map((size) => (
              <td key={`${type}-${size}`}>
                <Avatar type={type} size={size} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** person variant(readOnly/edit/checkable) × size 매트릭스. */
export const VariantMatrix: Story = {
  render: () => (
    <table className="border-separate border-spacing-[var(--sz-12)]">
      <thead>
        <tr>
          <th />
          {SIZES.map((size) => (
            <th
              key={size}
              className="text-body-6 text-typo-neutral-light capitalize"
            >
              {size}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {PERSON_VARIANTS.map((variant) => (
          <tr key={variant}>
            <th className="text-body-6 text-typo-neutral-light text-right capitalize">
              {variant}
            </th>
            {SIZES.map((size) => (
              <td key={`${variant}-${size}`}>
                <Avatar
                  type="person"
                  variant={variant}
                  size={size}
                  defaultChecked={variant === "checkable"}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** checkable 클릭 시 aria-pressed 와 링 opacity 가 토글되고 onCheckedChange 가 호출되는지 검증. */
export const TogglesOnClick: Story = {
  args: { type: "person", variant: "checkable" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "아바타 선택",
    });
    const ring = button.querySelector("span[aria-hidden='true']")!;

    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(ring).toHaveClass("opacity-0");

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(ring).toHaveClass("opacity-100");
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(ring).toHaveClass("opacity-0");
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
