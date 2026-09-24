import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import type {
  LikeToggleWithLabelAppearance,
  LikeToggleWithLabelColor,
  LikeToggleVariant,
} from "./LikeToggleWithLabel";
import { LikeToggleWithLabel } from "./LikeToggleWithLabel";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%EB%98%90%EA%B0%80-3.0--Design-System?node-id=51405-112853";

const VARIANTS: LikeToggleVariant[] = ["heart", "bookmark"];
const APPEARANCES: LikeToggleWithLabelAppearance[] = ["outline", "transparent"];
const COLORS: LikeToggleWithLabelColor[] = ["neutralNormal", "neutralLight"];

const DEFAULT_LABEL: Record<LikeToggleVariant, string> = {
  heart: "좋아요",
  bookmark: "관심있어요",
};

const meta = {
  title: "Components/LikeToggleWithLabel",
  component: LikeToggleWithLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / LikeToggleWithLabel" (node 51405:112853) 와 1:1. 아이콘 + (옵션) 라벨 + (옵션) 카운트가 하나의 알약(pill) 버튼으로 묶인 몰리큘이다. `LikeToggle` 아톰의 아이콘 렌더 로직을 재사용한다. `variant`(heart/bookmark) × `appearance`(outline/transparent — Figma `style` 를 네이티브 속성 충돌 회피로 개명) 에 `label`(옵션, 생략 시 아이콘+숫자 조합) · `count`(옵션) · `checked`(controlled/uncontrolled) · `readOnly` 를 지원한다. 라벨은 checked 와 무관하게 항상 Medium — 굵어지는 건 count 뿐이다. `label` 을 생략할 땐 `aria-label` 로 접근성 이름을 채워야 한다.',
      },
    },
  },
  args: {
    variant: "heart",
    appearance: "outline",
    label: "좋아요",
    defaultChecked: false,
    readOnly: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    appearance: { control: "inline-radio", options: APPEARANCES },
    color: { control: "inline-radio", options: COLORS },
    label: { control: "text" },
    count: { control: "number" },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
} satisfies Meta<typeof LikeToggleWithLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {};

/** heart(카운트 있음) / bookmark(카운트 없음) — unchecked · checked. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-16)]">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-[var(--sz-8)]">
          <LikeToggleWithLabel
            {...args}
            variant={variant}
            label={DEFAULT_LABEL[variant]}
            count={variant === "heart" ? 0 : undefined}
            defaultChecked={false}
          />
          <LikeToggleWithLabel
            {...args}
            variant={variant}
            label={DEFAULT_LABEL[variant]}
            count={variant === "heart" ? 1 : undefined}
            defaultChecked
          />
        </div>
      ))}
    </div>
  ),
};

/** outline(테두리+배경, 아이콘 18) / transparent(크롬 없음, 아이콘 24). */
export const Appearances: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-16)]">
      {APPEARANCES.map((appearance) => (
        <div key={appearance} className="flex items-center gap-[var(--sz-8)]">
          <LikeToggleWithLabel
            {...args}
            appearance={appearance}
            defaultChecked={false}
          />
          <LikeToggleWithLabel
            {...args}
            appearance={appearance}
            count={1}
            defaultChecked
          />
        </div>
      ))}
    </div>
  ),
};

/** count 생략(카운트 없음) vs 지정(0 포함 표시). */
export const Count: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-12)]">
      <LikeToggleWithLabel {...args} label="관심있어요" />
      <LikeToggleWithLabel {...args} count={0} />
      <LikeToggleWithLabel {...args} count={12} defaultChecked />
    </div>
  ),
};

/**
 * 라벨 노출 여부를 boolean 컨트롤로 관리한다(Figma `label` boolean 축, 2026-09-19 추가).
 * 아이콘+숫자만 노출하는 조합을 위한 기능 — 라벨을 끄면 count 만으로는 스크린리더가
 * "좋아요"/"관심있어요" 를 구분할 수 없으므로 `aria-label` 을 대신 채워 접근성 이름을 유지한다.
 */
export const LabelVisibility: StoryObj<typeof meta> = {
  argTypes: { label: { control: "boolean" } },
  args: { label: true, count: 3 },
  render: ({ label, variant = "heart", ...args }) => {
    const hasLabel = Boolean(label);
    const text = DEFAULT_LABEL[variant];
    return (
      <LikeToggleWithLabel
        {...args}
        variant={variant}
        label={hasLabel ? text : undefined}
        aria-label={hasLabel ? undefined : text}
      />
    );
  },
};

/** unchecked / checked. */
export const Checked: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-12)]">
      <LikeToggleWithLabel {...args} defaultChecked={false} />
      <LikeToggleWithLabel {...args} defaultChecked />
    </div>
  ),
};

/**
 * `neutralNormal`(기본) / `neutralLight` — unchecked 상태의 라벨·count·아이콘 라인 톤만
 * 바꾼다. checked 색은 color 와 무관하므로 unchecked 만 비교한다(2026-09-19 Figma 반영).
 */
export const Colors: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-16)]">
      {COLORS.map((color) => (
        <LikeToggleWithLabel
          key={color}
          {...args}
          color={color}
          count={0}
          defaultChecked={false}
        />
      ))}
    </div>
  ),
};

/** readOnly — 색은 그대로, 클릭만 막힌다(Figma `state=readOnly`). */
export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => (
    <div className="flex items-center gap-[var(--sz-12)]">
      <LikeToggleWithLabel {...args} defaultChecked={false} />
      <LikeToggleWithLabel {...args} defaultChecked />
    </div>
  ),
};

/** variant × appearance(행) × [unchecked · checked](열). */
export const Matrix: Story = {
  render: (args) => (
    <table className="border-separate border-spacing-[var(--sz-8)]">
      <thead>
        <tr>
          <th />
          {["unchecked", "checked"].map((h) => (
            <th
              key={h}
              className="text-body-6 text-typo-neutral-light capitalize"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {VARIANTS.flatMap((variant) =>
          APPEARANCES.map((appearance) => (
            <tr key={`${variant}-${appearance}`}>
              <th className="text-body-6 text-typo-neutral-light text-right capitalize">
                {variant} / {appearance}
              </th>
              <td>
                <LikeToggleWithLabel
                  {...args}
                  variant={variant}
                  appearance={appearance}
                  label={DEFAULT_LABEL[variant]}
                  count={variant === "heart" ? 0 : undefined}
                  defaultChecked={false}
                />
              </td>
              <td>
                <LikeToggleWithLabel
                  {...args}
                  variant={variant}
                  appearance={appearance}
                  label={DEFAULT_LABEL[variant]}
                  count={variant === "heart" ? 1 : undefined}
                  defaultChecked
                />
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  ),
};

/**
 * `LikeToggle` 과 공유하는 `LikeToggleGlyph` 의 off→on 바운스가 여기서도 그대로
 * 동작하는지 확인(구현은 `LikeToggle` story 참고, 여긴 공유 여부만 문서화).
 */
export const BounceOnCheck: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "좋아요",
    });
    const icon = () => button.querySelector("svg");

    await userEvent.click(button);
    await expect(icon()).toHaveClass("animate-like-bounce");

    icon()?.dispatchEvent(new Event("animationend", { bubbles: true }));
    await waitFor(() => expect(icon()).not.toHaveClass("animate-like-bounce"));
  },
};

/** 클릭 시 aria-pressed 가 토글되고 onCheckedChange 가 호출되는지 검증. */
export const TogglesOnClick: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "좋아요",
    });
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};

/** readOnly 는 클릭해도 토글되지 않는다. */
export const ReadOnlyIgnoresClick: Story = {
  args: { readOnly: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "좋아요",
    });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
