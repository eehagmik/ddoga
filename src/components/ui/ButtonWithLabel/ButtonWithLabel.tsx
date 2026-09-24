/**
 * 라벨 버튼(ButtonWithLabel).
 *
 * Figma "또가3.0 Design System / ButtonWithLabel" (node 51405:18495) 와 1:1.
 * 디자인 시스템의 기본 액션 버튼이다. 라벨은 필수, 앞/뒤 아이콘 슬롯은 선택.
 *
 * 구현: `fill / bright / outline` 은 원형 `Button` (node 51405:17049) 을 합성한다
 * (컨테이너 배경·테두리·hover/focus/pressed·disabled·min-h·radius 는 `Button` 담당).
 * `text` variant 만 자체 렌더한다(`Button` 에 없는 개념 — 배경 없이 루트 opacity 로 상태 표현).
 * 이 컴포넌트는 좌우 padding·타이포·라벨/아이콘 색·inner 레이어만 얹는다.
 *
 * 축(Figma variant → props):
 * - `color`  : brand / neutral / danger / warning / info
 * - `variant`: fill / bright / outline / text  (Figma Style)
 * - `size`   : 2xl / xl / lg / md / sm / xs
 * - hover / focus / disabled 는 상태이므로 props 가 아니라 CSS 의사클래스·`disabled` 속성으로 처리.
 *
 * 상태 규칙:
 * - hover  : (Button) 배경을 한 단계 진한 토큰으로 교체. `text` 는 루트 `opacity` `--alpha-80`.
 * - focus/pressed(`:active`) : 배경은 hover 와 동일 + 루트 `opacity` `--alpha-80`(`BUTTON_BASE` 담당,
 *            전 variant 동일). 포커스 링·그림자는 없다. pressed 는 Figma엔 없으나 피드백용 추가.
 * - disabled: enable 디자인 유지 + 루트 전체 `opacity`(fill/outline/text `--alpha-60`, bright `--alpha-40`).
 *
 * size 별 토큰 (Figma 검증 완료):
 * | size | min-h    | px(좌우)   | inner gap  | icon size    | 타이포      | radius     |
 * | 2xl  | --sz-54 | --sz-14   | --sz-8    | --sz-22     | body-1     | rounded-xl |
 * | xl   | --sz-50 | --sz-12   | --sz-6    | --sz-20     | body-2     | rounded-lg |
 * | lg   | --sz-46 | --sz-10   | --sz-6    | --sz-18     | body-3     | rounded-md |
 * | md   | --sz-40 | --sz-10   | --sz-4    | --sz-16     | body-4     | rounded-md |
 * | sm   | --sz-32 | --sz-8    | --sz-3    | --sz-14     | body-5     | rounded-sm |
 * | xs   | --sz-26 | --sz-8    | --sz-3    | --sz-14     | body-5     | rounded-sm |
 * `variant="text"` 는 좌우 padding 0 (가로 hug). `outline` 은 `border-xs`(Button).
 *
 * 색은 전부 semantic 토큰 유틸, 크기·간격은 `var(--sz-*)`, 투명도는 `var(--alpha-*)` 로만 지정한다 — 하드코딩 없음.
 * 아이콘은 `currentColor` 를 따르는 것을 전제로 슬롯에 `text-icon-*` 를 준다(Storybook 은 `src/icons` 의 `<Icon>` 사용).
 */

import type { ReactNode } from "react";

import { BUTTON_BASE, Button } from "../Button";

export type ButtonColor = "brand" | "neutral" | "danger" | "warning" | "info";
export type ButtonVariant = "fill" | "bright" | "outline" | "text";
export type ButtonSize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

export interface ButtonWithLabelProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  /** 색상 축. 기본 'brand' */
  color?: ButtonColor;
  /** 스타일 축(Figma Style). 기본 'fill' */
  variant?: ButtonVariant;
  /** 크기 축. 기본 'md' */
  size?: ButtonSize;
  /** 라벨 앞 아이콘 슬롯. 없으면 미렌더. */
  startIcon?: ReactNode;
  /** 라벨 뒤 아이콘 슬롯. 없으면 미렌더. */
  endIcon?: ReactNode;
  /** 라벨(필수). */
  children: ReactNode;
}

/** 루트에 얹는 공통 클래스(폰트 굵기). 레이아웃·트랜지션·disabled 는 `Button`(BUTTON_BASE) 담당. */
const ROOT_EXTRA = "font-normal";

/** inner 공통 — 라벨·아이콘 레이아웃만. opacity(focus/pressed)는 루트(`BUTTON_BASE`) 담당. */
const INNER_BASE = "inline-flex items-center justify-center";

/** 아이콘 슬롯 공통 — 레이아웃에서 눌리지 않도록 shrink-0. */
const ICON_SLOT = "inline-flex shrink-0 items-center justify-center";

/** `text` variant 전용 — min-height · radius (Button 의 SIZE_CLASS 와 동일 매핑). */
const SIZE_MIN_RADIUS: Record<ButtonSize, string> = {
  "2xl": "min-h-[var(--sz-54)] rounded-xl",
  xl: "min-h-[var(--sz-50)] rounded-lg",
  lg: "min-h-[var(--sz-46)] rounded-md",
  md: "min-h-[var(--sz-40)] rounded-md",
  sm: "min-h-[var(--sz-32)] rounded-sm",
  xs: "min-h-[var(--sz-26)] rounded-sm",
};

/** size 별 좌우 padding (variant="text" 는 미적용 → 0). */
const SIZE_PADDING: Record<ButtonSize, string> = {
  "2xl": "px-[var(--sz-14)]",
  xl: "px-[var(--sz-12)]",
  lg: "px-[var(--sz-10)]",
  md: "px-[var(--sz-10)]",
  sm: "px-[var(--sz-8)]",
  xs: "px-[var(--sz-8)]",
};

/** size 별 타이포 유틸. */
const SIZE_TYPO: Record<ButtonSize, string> = {
  "2xl": "text-body-1",
  xl: "text-body-2",
  lg: "text-body-3",
  md: "text-body-4",
  sm: "text-body-5",
  xs: "text-body-5",
};

/** size 별 inner gap(라벨·아이콘 간격). */
const SIZE_INNER_GAP: Record<ButtonSize, string> = {
  "2xl": "gap-[var(--sz-8)]",
  xl: "gap-[var(--sz-6)]",
  lg: "gap-[var(--sz-6)]",
  md: "gap-[var(--sz-4)]",
  sm: "gap-[var(--sz-3)]",
  xs: "gap-[var(--sz-3)]",
};

/** size 별 아이콘 정사각 크기. */
const SIZE_ICON: Record<ButtonSize, string> = {
  "2xl": "size-[var(--sz-22)]",
  xl: "size-[var(--sz-20)]",
  lg: "size-[var(--sz-18)]",
  md: "size-[var(--sz-16)]",
  sm: "size-[var(--sz-14)]",
  xs: "size-[var(--sz-14)]",
};

/**
 * `text` variant 루트 상태 클래스(배경 없음 → 루트 opacity 로 표현).
 * hover 는 여기서, focus/pressed 는 `BUTTON_BASE` 가 `--alpha-80` 을 준다.
 */
const TEXT_STATE =
  "hover:opacity-[var(--alpha-80)] disabled:opacity-[var(--alpha-60)]";

/** color × variant → 라벨 텍스트 색 (Figma node 51405:18495 검증). */
const LABEL_COLOR: Record<ButtonVariant, Record<ButtonColor, string>> = {
  fill: {
    brand: "text-typo-inverse-normal",
    neutral: "text-typo-inverse-normal",
    danger: "text-typo-inverse-normal",
    warning: "text-typo-inverse-normal",
    info: "text-typo-inverse-normal",
  },
  bright: {
    brand: "text-typo-brand-deep",
    neutral: "text-typo-neutral-normal",
    danger: "text-typo-danger-deep",
    warning: "text-typo-warning-deep",
    info: "text-typo-info-deep",
  },
  outline: {
    brand: "text-typo-brand-deep",
    neutral: "text-typo-neutral-normal",
    danger: "text-typo-danger-deep",
    warning: "text-typo-warning-deep",
    info: "text-typo-info-deep",
  },
  text: {
    brand: "text-typo-neutral-normal",
    neutral: "text-typo-neutral-normal",
    danger: "text-typo-neutral-normal",
    warning: "text-typo-neutral-normal",
    info: "text-typo-neutral-normal",
  },
};

/** color × variant → 아이콘 슬롯 색 (Figma node 51405:18495 검증). */
const ICON_COLOR: Record<ButtonVariant, Record<ButtonColor, string>> = {
  fill: {
    brand: "text-icon-inverse-normal",
    neutral: "text-icon-inverse-normal",
    danger: "text-icon-inverse-normal",
    warning: "text-icon-inverse-normal",
    info: "text-icon-inverse-normal",
  },
  bright: {
    brand: "text-icon-brand-normal",
    neutral: "text-icon-neutral-light",
    danger: "text-icon-danger-normal",
    warning: "text-icon-warning-deep",
    info: "text-icon-info-normal",
  },
  outline: {
    brand: "text-icon-brand-normal",
    neutral: "text-icon-neutral-light",
    danger: "text-icon-danger-normal",
    warning: "text-icon-warning-deep",
    info: "text-icon-info-normal",
  },
  text: {
    brand: "text-icon-brand-normal",
    neutral: "text-icon-neutral-light",
    danger: "text-icon-danger-normal",
    warning: "text-icon-warning-deep",
    info: "text-icon-info-normal",
  },
};

interface LabelInnerProps {
  size: ButtonSize;
  variant: ButtonVariant;
  color: ButtonColor;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children: ReactNode;
}

/** 라벨·아이콘 슬롯 inner. `fill/bright/outline`(Button 합성)·`text`(자체 렌더) 가 공유한다. */
function LabelInner({
  size,
  variant,
  color,
  startIcon,
  endIcon,
  children,
}: LabelInnerProps) {
  const iconClass = [ICON_SLOT, SIZE_ICON[size], ICON_COLOR[variant][color]]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={[INNER_BASE, SIZE_INNER_GAP[size]].filter(Boolean).join(" ")}
    >
      {startIcon ? <span className={iconClass}>{startIcon}</span> : null}
      <span className="whitespace-nowrap">{children}</span>
      {endIcon ? <span className={iconClass}>{endIcon}</span> : null}
    </span>
  );
}

export function ButtonWithLabel({
  color = "brand",
  variant = "fill",
  size = "md",
  startIcon,
  endIcon,
  children,
  type,
  className,
  ...rest
}: ButtonWithLabelProps) {
  const inner = (
    <LabelInner
      size={size}
      variant={variant}
      color={color}
      startIcon={startIcon}
      endIcon={endIcon}
    >
      {children}
    </LabelInner>
  );

  if (variant === "text") {
    return (
      <button
        type={type ?? "button"}
        data-color={color}
        data-variant="text"
        data-size={size}
        className={[
          BUTTON_BASE,
          ROOT_EXTRA,
          SIZE_MIN_RADIUS[size],
          SIZE_TYPO[size],
          TEXT_STATE,
          LABEL_COLOR.text[color],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {inner}
      </button>
    );
  }

  return (
    <Button
      color={color}
      variant={variant}
      size={size}
      type={type}
      className={[
        ROOT_EXTRA,
        SIZE_PADDING[size],
        SIZE_TYPO[size],
        LABEL_COLOR[variant][color],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {inner}
    </Button>
  );
}
