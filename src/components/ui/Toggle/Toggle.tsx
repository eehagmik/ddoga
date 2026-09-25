/**
 * 토글 버튼(Toggle).
 *
 * Figma "또가3.0 Design System / Toggle" (node 51405:152870) 와 1:1.
 * **on/off 스위치가 아니다.** 라벨 텍스트를 담는 "선택형 토글 버튼"(세그먼트·필터 선택 UI).
 * 형태·토큰 사용 패턴은 `Chip` 과 유사하나, 선택(pressed) 상태 표현이 핵심이다.
 *
 * 축(Figma variant → props):
 * - `variant`: square / round / text  (모서리 반경·배경 유무 차이. text 는 배경·아웃라인 없음)
 * - `type`   : multi / single  — **시각 영향 0**. 개발자에게 선택 동작을 알리고 ARIA 를 가른다
 *              (multi → `aria-pressed`, single → `role="radio"` + `aria-checked`).
 * - `size`   : xs / sm / md / lg  (Button 스케일의 하위 4단계)
 * - hover / active / focus 는 상태이므로 props 가 아니라 CSS 의사클래스로 처리한다.
 * - `disabled` 는 명시 상태이므로 boolean prop.
 *
 * 선택 상태:
 * - `pressed`(controlled) 또는 `defaultPressed`(uncontrolled) + `onPressedChange(next)` 콜백.
 * - `disabled` 면 클릭해도 토글되지 않는다.
 *
 * 상태 규칙(Figma 검증):
 * - 아웃라인은 border 가 아니라 **inset shadow**(자연스러운 트랜지션). unchecked 1px / checked 2px.
 * - unchecked enable : 배경 `bg-neutral-normal` + `shadow-borderNeutral-xs` + 라벨 `typo-neutral-normal`.
 * - unchecked hover  : 배경 `bg-brand-bright` + `shadow-borderBrand-xs` (라벨색은 그대로). text 는 라벨 `typo-brand-dark`.
 * - checked          : 배경 `bg-brand-bright` + `shadow-borderBrand-sm` + 라벨 `typo-brand-dark` Bold.
 *                      **checked + hover 심볼은 Figma 에 없다 → checked enable 스타일 유지.**
 * - disabled unchecked: enable 유지 + 라벨 `typo-disabled-normal`.
 * - disabled checked  : 배경 `bg-disabled-subtle` + `shadow-borderNeutral-sm` + 라벨 `typo-disabled-normal` Bold.
 * - focus-visible / active(pressed 제스처): 루트 `opacity` `--alpha-80` (Button family 선례. 포커스 링 없음).
 *
 * size 별 토큰(Figma 검증):
 * | size | 타이포(normal/bold)     | square px/py       | round px/py        | text px/py         |
 * | xs   | body-5 / body-5-bold   | --sz-8  / --sz-3  | --sz-8  / --sz-3  | 0 / --sz-3        |
 * | sm   | body-5 / body-5-bold   | --sz-10 / --sz-6  | --sz-10 / --sz-6  | 0 / --sz-6        |
 * | md   | body-4 / body-4-bold   | --sz-10 / --sz-8  | --sz-12 / --sz-8  | 0 / --sz-8        |
 * | lg   | body-3 / body-3-bold   | --sz-10 / --sz-10 | --sz-12 / --sz-10 | 0 / --sz-10       |
 * radius: square·text → `rounded-md`, round → `rounded-circle`.
 * square·round 는 `min-w-(--sz-42)` + 라벨 `flex-1 text-center`, text 는 가로 Hug(`whitespace-nowrap shrink-0`).
 *
 * 색은 전부 semantic 토큰 유틸, 크기·간격은 `var(--sz-*)`, 투명도는 `var(--alpha-*)`, 아웃라인은
 * `shadow-border*` 유틸로만 지정한다 — 하드코딩 없음.
 */

import { useState } from "react";
import type { ReactNode } from "react";

export type ToggleVariant = "square" | "round" | "text";
export type ToggleType = "multi" | "single";
export type ToggleSize = "xs" | "sm" | "md" | "lg";

export interface ToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  /** 라벨(필수, Figma `label`). */
  children: ReactNode;
  /** 모서리·배경 스타일 축(Figma `variant`). 기본 'square' */
  variant?: ToggleVariant;
  /** 선택 동작 축(Figma `type`). 시각 영향 없음, ARIA 만 가른다. 기본 'multi' */
  type?: ToggleType;
  /** 크기 축(Figma `size`). 기본 'md' */
  size?: ToggleSize;
  /** 선택 상태(controlled). 지정 시 `defaultPressed` 는 무시된다. */
  pressed?: boolean;
  /** 초기 선택 상태(uncontrolled). 기본 false */
  defaultPressed?: boolean;
  /** 선택 상태 변경 콜백. `disabled` 면 호출되지 않는다. */
  onPressedChange?: (pressed: boolean) => void;
  /** 비활성(Figma `state=disabled`). 기본 false */
  disabled?: boolean;
}

/** 루트 공통 — 중앙정렬 · 전이 · focus-visible/active opacity dip. 포커스 링 없음(Button 선례). */
const TOGGLE_BASE =
  "group inline-flex items-center justify-center " +
  "transition-[background-color,box-shadow,color] duration-150 ease-in-out motion-reduce:transition-none " +
  "focus-visible:outline-none " +
  "focus-visible:opacity-(--alpha-80) active:opacity-(--alpha-80) " +
  "disabled:cursor-not-allowed " +
  "[font-feature-settings:var(--font-feature-case)]";

/** variant → radius. */
const VARIANT_RADIUS: Record<ToggleVariant, string> = {
  square: "rounded-md",
  round: "rounded-circle",
  text: "rounded-md",
};

/** variant × size → padding. */
const VARIANT_SIZE_PAD: Record<ToggleVariant, Record<ToggleSize, string>> = {
  square: {
    xs: "px-(--sz-8) py-(--sz-3)",
    sm: "px-(--sz-10) py-(--sz-6)",
    md: "px-(--sz-10) py-(--sz-8)",
    lg: "px-(--sz-10) py-(--sz-10)",
  },
  round: {
    xs: "px-(--sz-8) py-(--sz-3)",
    sm: "px-(--sz-10) py-(--sz-6)",
    md: "px-(--sz-12) py-(--sz-8)",
    lg: "px-(--sz-12) py-(--sz-10)",
  },
  text: {
    xs: "px-(--sz-0) py-(--sz-3)",
    sm: "px-(--sz-0) py-(--sz-6)",
    md: "px-(--sz-0) py-(--sz-8)",
    lg: "px-(--sz-0) py-(--sz-10)",
  },
};

/** size → 라벨 합성 타이포 유틸(normal / bold). */
const SIZE_TYPO: Record<ToggleSize, { normal: string; bold: string }> = {
  xs: { normal: "text-body-5", bold: "text-body-5-bold" },
  sm: { normal: "text-body-5", bold: "text-body-5-bold" },
  md: { normal: "text-body-4", bold: "text-body-4-bold" },
  lg: { normal: "text-body-3", bold: "text-body-3-bold" },
};

/** square·round 공통 표면(배경 + inset shadow 아웃라인 + 라벨색). */
const BOX_SURFACE = {
  base: "bg-bg-neutral-normal shadow-borderNeutral-xs text-typo-neutral-normal",
  hover: "hover:bg-bg-brand-bright hover:shadow-borderBrand-xs",
  pressed: "bg-bg-brand-bright shadow-borderBrand-sm text-typo-brand-dark",
  disabled:
    "bg-bg-neutral-normal shadow-borderNeutral-xs text-typo-disabled-normal",
  disabledPressed:
    "bg-bg-disabled-subtle shadow-borderNeutral-sm text-typo-disabled-normal",
};

/** text 표면(배경·아웃라인 없음, 라벨색만). */
const TEXT_SURFACE = {
  base: "text-typo-neutral-normal",
  hover: "hover:text-typo-brand-dark",
  pressed: "text-typo-brand-dark",
  disabled: "text-typo-disabled-normal",
  disabledPressed: "text-typo-disabled-normal",
};

/** (variant, pressed, disabled) → 표면 상태 클래스. */
function surfaceClass(
  variant: ToggleVariant,
  pressed: boolean,
  disabled: boolean,
): string {
  const surf = variant === "text" ? TEXT_SURFACE : BOX_SURFACE;
  if (disabled) return pressed ? surf.disabledPressed : surf.disabled;
  if (pressed) return surf.pressed;
  return `${surf.base} ${surf.hover}`;
}

export function Toggle({
  children,
  variant = "square",
  type = "multi",
  size = "md",
  pressed,
  defaultPressed = false,
  onPressedChange,
  disabled = false,
  className,
  onClick,
  ...rest
}: ToggleProps) {
  const isControlled = pressed !== undefined;
  const [internal, setInternal] = useState(defaultPressed);
  const current = isControlled ? (pressed as boolean) : internal;

  const isText = variant === "text";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (disabled || event.defaultPrevented) return;
    const next = !current;
    if (!isControlled) setInternal(next);
    onPressedChange?.(next);
  };

  const ariaProps: React.ButtonHTMLAttributes<HTMLButtonElement> =
    type === "single"
      ? { role: "radio", "aria-checked": current }
      : { "aria-pressed": current };

  return (
    <button
      type="button"
      disabled={disabled}
      data-variant={variant}
      data-type={type}
      data-size={size}
      data-pressed={current}
      data-disabled={disabled}
      onClick={handleClick}
      {...ariaProps}
      className={[
        TOGGLE_BASE,
        VARIANT_RADIUS[variant],
        VARIANT_SIZE_PAD[variant][size],
        isText ? "" : "min-w-(--sz-42) overflow-clip",
        current ? SIZE_TYPO[size].bold : SIZE_TYPO[size].normal,
        surfaceClass(variant, current, disabled),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span
        className={
          isText ? "shrink-0 whitespace-nowrap" : "min-w-0 flex-1 text-center"
        }
      >
        {children}
      </span>
    </button>
  );
}
