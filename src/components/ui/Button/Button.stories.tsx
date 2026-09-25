import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { Loader } from "../Loader";
import type { ButtonColor, ButtonSize, ButtonVariant } from "./Button";
import { Button } from "./Button";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-17049";

const COLORS: ButtonColor[] = ["brand", "neutral", "danger", "warning", "info"];
const VARIANTS: ButtonVariant[] = ["fill", "bright", "outline"];
const SIZES: ButtonSize[] = ["2xl", "xl", "lg", "md", "sm", "xs"];

/**
 * variant 별 슬롯 콘텐츠 텍스트 색. Button 은 색을 주지 않으므로 데모에서 명시한다.
 */
const CONTENT_COLOR: Record<ButtonVariant, string> = {
  fill: "text-typo-inverse-normal",
  bright: "text-typo-neutral-normal",
  outline: "text-typo-neutral-normal",
};

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Button" (node 51405:17049) 와 1:1. 모든 버튼의 원형 셸이다. 자유 `children` 슬롯 1개(라벨·아이콘·임의 노드), 좌우 padding·gap 0, 텍스트/아이콘 색 미지정. hover 는 배경만, focus·pressed 는 배경 + opacity `--alpha-80`. `ButtonWithLabel`·`ButtonWithIcon` 이 이 컴포넌트를 합성한다. 색·크기·투명도는 전부 디자인 토큰만 사용한다.',
      },
    },
  },
  args: {
    color: "brand",
    variant: "fill",
    size: "md",
    disabled: false,
    onClick: fn(),
    children: (
      <span className="text-typo-inverse-normal text-body-4 px-(--sz-10)">
        슬롯
      </span>
    ),
  },
  argTypes: {
    color: { control: "inline-radio", options: COLORS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    disabled: { control: "boolean" },
    // 자유 슬롯 — 기본 "Set object" 컨트롤이 `{}` 를 주입해 렌더 에러가 나므로 컨트롤 비활성.
    children: { control: false, table: { type: { summary: "ReactNode" } } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. 클릭 시 onClick 호출(비활성 시 미호출)을 검증한다. */
export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole("button");
    await userEvent.click(btn);
    if (args.disabled) {
      await expect(args.onClick).not.toHaveBeenCalled();
    } else {
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    }
  },
};

/** 한 color(brand)의 fill / bright / outline. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          <span
            className={`${CONTENT_COLOR[variant]} text-body-4 px-(--sz-10)`}
          >
            {variant}
          </span>
        </Button>
      ))}
    </div>
  ),
};

/** 2xl ~ xs (min-h·radius 만 변한다 — padding 은 슬롯에서). */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {SIZES.map((size) => (
        <Button key={size} {...args} size={size}>
          <span className="text-typo-inverse-normal text-body-4 px-(--sz-10)">
            {size}
          </span>
        </Button>
      ))}
    </div>
  ),
};

/** 5색 × fill. */
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      {COLORS.map((color) => (
        <Button key={color} {...args} color={color} variant="fill">
          <span className="text-typo-inverse-normal text-body-4 px-(--sz-10)">
            {color}
          </span>
        </Button>
      ))}
    </div>
  ),
};

/** color(행) × variant(열) 전체 조합 (size 는 md 고정). */
export const Matrix: Story = {
  render: (args) => (
    <table className="border-separate border-spacing-(--sz-8)">
      <thead>
        <tr>
          <th />
          {VARIANTS.map((variant) => (
            <th
              key={variant}
              className="text-body-6 text-typo-neutral-light capitalize"
            >
              {variant}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {COLORS.map((color) => (
          <tr key={color}>
            <th className="text-body-6 text-typo-neutral-light text-right capitalize">
              {color}
            </th>
            {VARIANTS.map((variant) => (
              <td key={variant}>
                <Button {...args} color={color} variant={variant} size="md">
                  <span
                    className={`${CONTENT_COLOR[variant]} text-body-4 px-(--sz-10)`}
                  >
                    슬롯
                  </span>
                </Button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** 상호작용 상태 데모용 한 줄(enable / disabled). */
function StateRow({
  label,
  args,
  disabled,
}: {
  label: string;
  args: Partial<React.ComponentProps<typeof Button>>;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-(--sz-12)">
      <span className="w-(--sz-64) text-body-6 text-typo-neutral-light">
        {label}
      </span>
      {(["fill", "outline"] as ButtonVariant[]).map((variant) => (
        <Button
          key={variant}
          {...args}
          color="brand"
          variant={variant}
          disabled={disabled}
        >
          <span
            className={`${CONTENT_COLOR[variant]} text-body-4 px-(--sz-10)`}
          >
            brand {variant}
          </span>
        </Button>
      ))}
    </div>
  );
}

/**
 * 상호작용 상태 데모 — enable(hover/focus/pressed) 와 disabled 를 나란히.
 * - hover = 마우스 올림(배경만 교체).
 * - focus = 키보드 Tab / pressed = 마우스 꾹 누름 : 배경 교체 + 루트 opacity `--alpha-80`(hover 와 구분).
 * - disabled : enable 디자인 유지 + opacity 저하(fill `--alpha-60` / bright `--alpha-40`), 클릭 불가.
 * - 정적으로 상태를 강제할 수 없어 나열 + 설명, play 에서 실제 트리거·검증한다.
 */
export const InteractiveStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "enable(hover=마우스 올림 / focus=키보드 Tab / pressed=마우스 꾹 누름) 와 disabled 를 나란히 보여준다. hover 는 배경만, focus·pressed 는 배경 + opacity `--alpha-80`, disabled 는 opacity 저하 + 클릭 불가.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-(--sz-8)">
      <StateRow label="enable" args={args} />
      <StateRow label="disabled" args={args} disabled />
      <p className="text-body-6 text-typo-neutral-light">
        마우스 올림(hover) / Tab 포커스(focus) / 꾹 누름(pressed) 시 배경이
        hover 토큰으로 바뀌고, focus·pressed 는 추가로 opacity 80%.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const btns = within(canvasElement).getAllByRole("button");
    const [fillBtn, outlineBtn] = btns;

    // enable: focus/pressed 배경·opacity 클래스
    await userEvent.tab();
    await expect(fillBtn).toHaveFocus();
    await expect(fillBtn).toHaveClass(
      "hover:bg-bg-brand-deep",
      "focus-visible:bg-bg-brand-deep",
      "active:bg-bg-brand-deep",
      "focus-visible:opacity-(--alpha-80)",
      "active:opacity-(--alpha-80)",
    );
    await expect(outlineBtn).toHaveClass(
      "hover:bg-bg-brand-bright",
      "active:bg-bg-brand-bright",
    );
    await userEvent.hover(fillBtn);
    await userEvent.pointer({ target: fillBtn, keys: "[MouseLeft>]" });
    await userEvent.pointer({ keys: "[/MouseLeft]" });

    // disabled: opacity 저하 + 포커스/클릭 불가
    const disabledFill = btns[2];
    await expect(disabledFill).toBeDisabled();
    await expect(disabledFill).toHaveClass("disabled:opacity-(--alpha-60)");
  },
};

/**
 * 자유 슬롯 데모 — 텍스트+아이콘, 아이콘만, 스피너 같은 임의 노드.
 * Button 이 색·padding·gap 을 주지 않으므로 슬롯에서 직접 지정한다.
 */
export const WithArbitraryContent: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-(--sz-12)">
      <Button {...args} variant="fill">
        <span className="inline-flex items-center gap-(--sz-4) px-(--sz-10) text-typo-inverse-normal text-body-4">
          <Icon
            name="download_01_line"
            className="size-(--sz-16) text-icon-inverse-normal"
          />
          다운로드
        </span>
      </Button>

      <Button {...args} variant="outline">
        <span className="inline-flex size-(--sz-40) items-center justify-center">
          <Icon
            name="plus_line"
            className="size-(--sz-16) text-icon-brand-normal"
          />
        </span>
      </Button>

      <Button {...args} variant="bright">
        <span className="inline-flex items-center gap-(--sz-4) px-(--sz-10) text-typo-neutral-normal text-body-4">
          <Loader size="sm" />
          로딩 중
        </span>
      </Button>
    </div>
  ),
};
