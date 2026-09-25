/**
 * 버튼 원형(Button).
 *
 * Figma "또가3.0 Design System / Button" (node 51405:17049) 와 1:1.
 * 모든 버튼의 공통 셸이다. `ButtonWithLabel`·`ButtonWithIcon` 이 이 컴포넌트를 합성한다.
 *
 * 특징(Figma 검증 완료):
 * - 자유 `children` 슬롯 1개. 라벨/아이콘 고정 아님, inner 래퍼 레이어 없음.
 * - 좌우 padding·gap 전부 0 — 사용처(합성 컴포넌트)에서 부여한다.
 * - 텍스트/아이콘 색을 지정하지 않는다 — 슬롯 콘텐츠의 몫.
 * - **focus·pressed = bg 교체 + 루트 opacity `--alpha-80`**. hover 는 bg 교체만(구분됨).
 *   `focus-visible:bg-*`·`active:bg-*` 를 `hover:bg-*` 와 같은 토큰으로 주고, opacity 는
 *   `BUTTON_BASE` 에서 `focus-visible`·`active` 에 `--alpha-80` 을 얹는다(합성 컴포넌트도 이 값 상속).
 *
 * 축(Figma variant → props):
 * - `color`  : brand / neutral / danger / warning / info
 * - `variant`: fill / bright / outline  (`text` 없음)
 * - `size`   : 2xl / xl / lg / md / sm / xs
 * - hover / focus / disabled 는 상태이므로 props 가 아니라 CSS 의사클래스·`disabled` 속성으로 처리.
 *
 * size 별 컨테이너 토큰(ButtonWithLabel/ButtonWithIcon 과 동일):
 * | size | min-h    | radius     |
 * | 2xl  | --sz-54 | rounded-xl |
 * | xl   | --sz-50 | rounded-lg |
 * | lg   | --sz-46 | rounded-md |
 * | md   | --sz-40 | rounded-md |
 * | sm   | --sz-32 | rounded-sm |
 * | xs   | --sz-26 | rounded-sm |
 *
 * 상태 규칙:
 * - hover        : 배경을 한 단계 진한 토큰으로 교체(fill→deep, bright→light, outline→해당 hover bg).
 * - focus/pressed: hover 와 동일 배경 + 루트 `opacity` `--alpha-80`(hover 와 구분). pressed 는
 *                  Figma 엔 없으나 상호작용 피드백용으로 추가.
 * - disabled     : enable 디자인 유지 + 루트 전체 `opacity`(fill/outline `--alpha-60`, bright `--alpha-40`).
 *
 * 색은 전부 semantic 토큰 유틸(`bg-bg-*`, `border-border-*`), 크기는 `var(--sz-*)`,
 * 투명도는 `var(--alpha-*)` 로만 지정한다 — 하드코딩 없음.
 */

import type { ReactNode } from "react";

export type ButtonColor = "brand" | "neutral" | "danger" | "warning" | "info";
export type ButtonVariant = "fill" | "bright" | "outline";
export type ButtonSize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  /** 색상 축. 기본 'brand' */
  color?: ButtonColor;
  /** 스타일 축(Figma Style). 기본 'fill' */
  variant?: ButtonVariant;
  /** 크기 축. 기본 'md' */
  size?: ButtonSize;
  /** 자유 슬롯 콘텐츠(필수). 색·padding·gap 은 슬롯에서 부여한다. */
  children: ReactNode;
}

/**
 * 루트 공통 — group(포커스 전파용) · 중앙정렬 · 트랜지션 · disabled 처리. 포커스 링 없음.
 * 합성 컴포넌트가 `text` 브랜치 등에서 재사용하므로 named export.
 */
export const BUTTON_BASE =
  "group inline-flex items-center justify-center " +
  "transition-[background-color,opacity] duration-150 ease-in-out motion-reduce:transition-none " +
  "focus-visible:outline-none " +
  "focus-visible:opacity-(--alpha-80) active:opacity-(--alpha-80) " +
  "disabled:pointer-events-none disabled:cursor-not-allowed";

/** size 별 min-height · radius (padding·gap·타이포 없음). */
const SIZE_CLASS: Record<ButtonSize, string> = {
  "2xl": "min-h-(--sz-54) rounded-xl",
  xl: "min-h-(--sz-50) rounded-lg",
  lg: "min-h-(--sz-46) rounded-md",
  md: "min-h-(--sz-40) rounded-md",
  sm: "min-h-(--sz-32) rounded-sm",
  xs: "min-h-(--sz-26) rounded-sm",
};

/** variant 별 루트 disabled 투명도. */
const DISABLED_OPACITY: Record<ButtonVariant, string> = {
  fill: "disabled:opacity-(--alpha-60)",
  bright: "disabled:opacity-(--alpha-40)",
  outline: "disabled:opacity-(--alpha-60)",
};

/**
 * color × variant → 컨테이너 배경/테두리 + hover·focus·pressed 배경 (Figma node 51405:17049 검증).
 * focus·pressed(`:active`) 는 hover 와 동일 배경 토큰. opacity `--alpha-80` 은 `BUTTON_BASE` 담당.
 */
const VARIANT_COLOR: Record<ButtonVariant, Record<ButtonColor, string>> = {
  fill: {
    brand:
      "bg-bg-brand-normal hover:bg-bg-brand-deep focus-visible:bg-bg-brand-deep active:bg-bg-brand-deep",
    neutral:
      "bg-bg-inverse-normal hover:bg-bg-inverse-deep focus-visible:bg-bg-inverse-deep active:bg-bg-inverse-deep",
    danger:
      "bg-bg-danger-normal hover:bg-bg-danger-deep focus-visible:bg-bg-danger-deep active:bg-bg-danger-deep",
    warning:
      "bg-bg-warning-normal hover:bg-bg-warning-deep focus-visible:bg-bg-warning-deep active:bg-bg-warning-deep",
    info: "bg-bg-info-normal hover:bg-bg-info-deep focus-visible:bg-bg-info-deep active:bg-bg-info-deep",
  },
  bright: {
    brand:
      "bg-bg-brand-bright hover:bg-bg-brand-light focus-visible:bg-bg-brand-light active:bg-bg-brand-light",
    neutral:
      "bg-bg-neutral-dark hover:bg-bg-neutral-deepDark focus-visible:bg-bg-neutral-deepDark active:bg-bg-neutral-deepDark",
    danger:
      "bg-bg-danger-bright hover:bg-bg-danger-light focus-visible:bg-bg-danger-light active:bg-bg-danger-light",
    warning:
      "bg-bg-warning-bright hover:bg-bg-warning-light focus-visible:bg-bg-warning-light active:bg-bg-warning-light",
    info: "bg-bg-info-bright hover:bg-bg-info-light focus-visible:bg-bg-info-light active:bg-bg-info-light",
  },
  outline: {
    brand:
      "bg-bg-neutral-normal hover:bg-bg-brand-bright focus-visible:bg-bg-brand-bright active:bg-bg-brand-bright border-xs border-solid border-border-brand-subtle",
    neutral:
      "bg-bg-neutral-normal hover:bg-bg-neutral-deep focus-visible:bg-bg-neutral-deep active:bg-bg-neutral-deep border-xs border-solid border-border-neutral-bright",
    danger:
      "bg-bg-neutral-normal hover:bg-bg-danger-bright focus-visible:bg-bg-danger-bright active:bg-bg-danger-bright border-xs border-solid border-border-danger-subtle",
    warning:
      "bg-bg-neutral-normal hover:bg-bg-warning-bright focus-visible:bg-bg-warning-bright active:bg-bg-warning-bright border-xs border-solid border-border-warning-normal",
    info: "bg-bg-neutral-normal hover:bg-bg-info-bright focus-visible:bg-bg-info-bright active:bg-bg-info-bright border-xs border-solid border-border-info-subtle",
  },
};

export function Button({
  color = "brand",
  variant = "fill",
  size = "md",
  children,
  type,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      data-color={color}
      data-variant={variant}
      data-size={size}
      className={[
        BUTTON_BASE,
        SIZE_CLASS[size],
        VARIANT_COLOR[variant][color],
        DISABLED_OPACITY[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
