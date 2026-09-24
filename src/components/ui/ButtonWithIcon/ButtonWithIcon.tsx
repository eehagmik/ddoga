/**
 * 아이콘 버튼(ButtonWithIcon).
 *
 * Figma "또가3.0 Design System / ButtonWithIcon" (node 51405:17772) 와 1:1.
 * 라벨/타이포 없이 중앙에 아이콘 1개만 두는 정사각 버튼이다.
 * 접근성상 텍스트가 없으므로 `aria-label` 이 필수다.
 *
 * 구현: 원형 `Button` (node 51405:17049) 을 합성한다 — 컨테이너 배경·테두리·hover/focus/pressed·disabled·radius
 * 는 `Button` 담당. 이 컴포넌트는 정사각 크기(min-h 와 같은 값의 `size-*`)·아이콘 크기·아이콘 색만 얹는다.
 *
 * 축(Figma variant → props):
 * - `color`  : brand / neutral / danger / warning / info
 * - `variant`: fill / bright / outline   (ButtonWithLabel 의 `text` 는 없음)
 * - `size`   : 2xl / xl / lg / md / sm / xs
 * - hover / focus / disabled 는 상태이므로 props 가 아니라 CSS 의사클래스·`disabled` 속성으로 처리.
 *
 * 상태 규칙(전부 `Button` 담당):
 * - hover        : 배경을 한 단계 진한 토큰으로 교체.
 * - focus/pressed(`:active`) : 배경은 hover 와 동일 + 루트 `opacity` `--alpha-80`(전 variant 동일).
 *                  포커스 링·그림자는 없다. pressed 는 Figma엔 없으나 피드백용 추가.
 * - disabled     : enable 디자인 유지 + 루트 전체 `opacity`(fill/outline `--alpha-60`, bright `--alpha-40`).
 *
 * size 별 토큰 (Figma 검증 완료 — 컨테이너는 정사각, 좌우 padding·inner gap 없음):
 * | size | 컨테이너 | icon size | radius     |
 * | 2xl  | --sz-54 | --sz-22   | rounded-xl |
 * | xl   | --sz-50 | --sz-20   | rounded-lg |
 * | lg   | --sz-46 | --sz-18   | rounded-md |
 * | md   | --sz-40 | --sz-16   | rounded-md |
 * | sm   | --sz-32 | --sz-14   | rounded-sm |
 * | xs   | --sz-26 | --sz-14   | rounded-sm |
 *
 * `warning` 아이콘이 모든 variant 에서 `text-icon-warning-deep` 인 quirk 는 유지한다.
 * 색은 전부 semantic 토큰 유틸, 크기는 `var(--sz-*)`, 투명도는 `var(--alpha-*)` 로만 지정한다 — 하드코딩 없음.
 * 아이콘은 `currentColor` 를 따르는 것을 전제로 슬롯에 `text-icon-*` 를 준다(Storybook 은 `src/icons` 의 `<Icon>` 사용).
 */

import type { ReactNode } from "react";

import { Button } from "../Button";

export type ButtonWithIconColor =
  "brand" | "neutral" | "danger" | "warning" | "info";
export type ButtonWithIconVariant = "fill" | "bright" | "outline";
export type ButtonWithIconSize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

export interface ButtonWithIconProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  /** 접근 가능한 이름(필수). 아이콘 버튼에는 텍스트가 없다. */
  "aria-label": string;
  /** 색상 축. 기본 'brand' */
  color?: ButtonWithIconColor;
  /** 스타일 축(Figma Style). 기본 'fill' */
  variant?: ButtonWithIconVariant;
  /** 크기 축. 기본 'md' */
  size?: ButtonWithIconSize;
  /** 중앙 아이콘(필수). */
  children: ReactNode;
}

/** 아이콘 슬롯 공통 — 눌리지 않도록 shrink-0. opacity(focus/pressed)는 루트(`BUTTON_BASE`) 담당. */
const ICON_INNER = "inline-flex shrink-0 items-center justify-center";

/** size 별 정사각 컨테이너 크기(Button 의 min-h 와 같은 값 → 정사각 고정). */
const SIZE_SQUARE: Record<ButtonWithIconSize, string> = {
  "2xl": "size-[var(--sz-54)]",
  xl: "size-[var(--sz-50)]",
  lg: "size-[var(--sz-46)]",
  md: "size-[var(--sz-40)]",
  sm: "size-[var(--sz-32)]",
  xs: "size-[var(--sz-26)]",
};

/** size 별 아이콘 정사각 크기(ButtonWithLabel 과 동일). */
const SIZE_ICON: Record<ButtonWithIconSize, string> = {
  "2xl": "size-[var(--sz-22)]",
  xl: "size-[var(--sz-20)]",
  lg: "size-[var(--sz-18)]",
  md: "size-[var(--sz-16)]",
  sm: "size-[var(--sz-14)]",
  xs: "size-[var(--sz-14)]",
};

/** color × variant → 아이콘 색 (Figma node 51405:17772 검증). 컨테이너 색은 Button 담당. */
const ICON_COLOR: Record<
  ButtonWithIconVariant,
  Record<ButtonWithIconColor, string>
> = {
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
};

export function ButtonWithIcon({
  color = "brand",
  variant = "fill",
  size = "md",
  children,
  type,
  className,
  ...rest
}: ButtonWithIconProps) {
  return (
    <Button
      color={color}
      variant={variant}
      size={size}
      type={type}
      className={[SIZE_SQUARE[size], className].filter(Boolean).join(" ")}
      {...rest}
    >
      <span
        className={[ICON_INNER, SIZE_ICON[size], ICON_COLOR[variant][color]]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
    </Button>
  );
}
