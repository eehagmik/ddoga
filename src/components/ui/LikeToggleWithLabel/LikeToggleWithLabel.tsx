/**
 * 라벨 붙은 좋아요/북마크 토글 버튼(LikeToggleWithLabel).
 *
 * Figma "또가3.0 Design System / LikeToggleWithLabel" (node 51405:112853) 와 1:1.
 * 아이콘 + 라벨 + (옵션) 카운트가 하나의 알약(pill) 버튼으로 묶인 몰리큘이다.
 *
 * `LikeToggle`(node 51405:112826, ATOM)의 아이콘 렌더 로직(`LikeToggleGlyph`)을
 * 그대로 가져다 쓴다. Figma 는 이 컴포넌트 내부에서 `LikeToggle` 인스턴스를 중첩하지
 * 않고 별도 하위 아이콘 컴포넌트(`LikeToggle/Heart`, `LikeToggle/Bookmark`)를 쓰는데,
 * 이는 HTML 로 옮기면 "버튼 안에 버튼"이 되는 걸 피하기 위함과 같은 이치다 — 이 컴포넌트도
 * `<button>` 을 직접 소유하고 `LikeToggle` 의 `<button>` 은 쓰지 않는다(2026-09-12 확정).
 *
 * 축(Figma variant → props):
 * - `variant`   : heart / bookmark
 * - `appearance`: outline(테두리+배경 있는 알약, 아이콘 18px, `label-2` 타이포) /
 *                 transparent(크롬 없음, 아이콘 24px, `label-1` 타이포).
 *                 Figma 축 이름은 `style` 이지만 네이티브 HTML `style` 속성과 충돌해
 *                 `appearance` 로 개명했다(`Chip` 이 Figma `Style` → `variant` 로 개명한 선례).
 * - `checked`   : controlled(`checked`+`onCheckedChange`) 또는 uncontrolled(`defaultChecked`).
 * - `readOnly`  : Figma `state=readOnly`. 네이티브 `disabled` 로 매핑 — 클릭·포커스만 막고
 *                 색은 바꾸지 않는다(Figma 실측: readOnly 심볼이 enable 과 시각적으로 동일).
 *                 Figma 에는 heart+checked=false 조합에만 readOnly 심볼이 있지만(bookmark ·
 *                 checked=true 조합은 없음), "클릭 불가"라는 의미상 모든 조합에 동일하게
 *                 일반화해 지원한다.
 * - `label`     : 옵션(Figma `label` boolean 축). 지정하면 표시하고, 생략하면 렌더하지 않는다
 *                 (`count` 와 동일한 presence 패턴 — 아이콘+숫자만 노출하는 조합을 위해
 *                 2026-09-19 optional 로 전환, `ReactNode` prop 노출 자체는 2026-09-12 확정
 *                 유지). 생략 시 버튼에 시각적 텍스트가 없어지므로 소비자가 `aria-label` 을
 *                 직접 지정해야 한다.
 * - `count`     : 옵션. 지정하면(0 포함) 라벨 뒤에 표시한다. 생략하면 렌더하지 않는다
 *                 (Figma `countable` boolean 을 presence 기반으로 대체 — `CheckboxCard` 선례).
 * - `color`     : `neutralNormal`(기본) / `neutralLight` — **unchecked 상태의 톤만** 바꾼다.
 *                 Figma `active` variant 는 `checked=true` 일 때의 표시일 뿐이라 별도 prop 으로
 *                 노출하지 않는다(2026-09-19 확정) — checked 색은 기존처럼 `checked` boolean 에
 *                 의해서만 결정된다. `LikeToggle` 아톰의 `color` 축(라인 아이콘 색 전용, 3종)과
 *                 이름은 같지만 라벨·count 색까지 함께 바꾸는 더 넓은 범위라 값 종류가 다르다
 *                 (아톰의 `inverse` 는 여기 없음).
 *
 * 라벨과 count 는 checked 여부와 무관하게 항상 Medium 굵기다(2026-09-19: count 도 Bold →
 * Medium 으로 통일 — `Toggle`/`CheckboxCard` 의 "checked 면 라벨이 Bold" 패턴과 다르다).
 * 굵기는 바뀌지 않고 색만 checked/color 로 바뀐다.
 *
 * 색상 매핑(Figma 검증, unchecked 는 `color='neutralNormal'` 기준 — `neutralLight` 는 표 아래 참고):
 * | 대상        | unchecked(outline)     | unchecked(transparent) | checked(heart)      | checked(bookmark)   |
 * | 라벨        | typo-neutral-normal    | typo-neutral-subtle    | typo-like-dark       | typo-info-dark       |
 * | count       | typo-neutral-normal    | typo-neutral-normal    | typo-like-dark       | typo-info-dark       |
 * | 아이콘 라인색 | icon-neutral-normal    | icon-neutral-subtle    | (그라데이션, 고정)    | (icon-info-normal, 고정) |
 * | 배경(outline)| bg-neutral-normal      | —                       | bg-like-bright       | bg-info-bright       |
 * | 테두리(outline)| border-neutral-light | —                       | border-like-normal   | border-info-normal   |
 *
 * `color='neutralLight'` 인 unchecked 상태(appearance 무관 고정 오버라이드): 라벨
 * `typo-neutral-bright` / count `typo-neutral-light` / 아이콘 라인 `icon-neutral-light`
 * (`LikeToggle` 아톰의 `neutralLight` 매핑과 동일한 방식). checked 배경/테두리(outline)는
 * color 와 무관하게 위 표를 그대로 따른다.
 *
 * heart 의 checked 배경/테두리/텍스트는 `like` 세만틱 컬러 스케일(`LikeToggle` 에서 신설,
 * danger/info 패턴 확장)을 쓴다 — 프리미티브 직접 참조 없음.
 *
 * 색·크기·간격·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

import { useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

import { LikeToggleGlyph } from "../LikeToggle";
import type { LikeToggleGlyphSize, LikeToggleVariant } from "../LikeToggle";

export type { LikeToggleVariant } from "../LikeToggle";
export type LikeToggleWithLabelAppearance = "outline" | "transparent";
export type LikeToggleWithLabelColor = "neutralNormal" | "neutralLight";

export interface LikeToggleWithLabelProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "style"
> {
  /** 아이콘·문구 종류(Figma `variant`). 기본 'heart' */
  variant?: LikeToggleVariant;
  /** 크롬 스타일(Figma `style` → 개명). 기본 'outline' */
  appearance?: LikeToggleWithLabelAppearance;
  /**
   * unchecked 상태의 톤(라벨·count·아이콘 라인). 기본 'neutralNormal'(기존 동작과 동일).
   * checked 색은 이 prop 과 무관하게 기존 로직(`checked`/`variant` 기반)을 그대로 쓴다.
   */
  color?: LikeToggleWithLabelColor;
  /**
   * 라벨 텍스트(Figma `label` boolean 콘텐츠). 생략하면 렌더하지 않는다(`count` 와 동일한
   * presence 패턴, 2026-09-19: 아이콘+숫자만 노출하는 조합을 위해 optional 로 전환 — 애초
   * 2026-09-12 "필수" 확정은 Figma 의 `label` boolean 축을 놓친 결과였다).
   * 생략 시 시각적 텍스트가 없어 버튼의 접근성 이름이 사라지므로, 소비자가 `aria-label` 을
   * 직접 지정해야 한다(count 숫자만으로는 "좋아요"/"관심있어요" 구분이 안 됨).
   */
  label?: ReactNode;
  /** 카운트 숫자. 지정하면(0 포함) 표시하고, 생략하면 렌더하지 않는다(Figma `countable`). */
  count?: number;
  /** 체크 여부(controlled). 지정 시 `defaultChecked` 는 무시된다. */
  checked?: boolean;
  /** 초기 체크 여부(uncontrolled). 기본 false */
  defaultChecked?: boolean;
  /** 체크 상태 변경 콜백. `readOnly` 면 호출되지 않는다. */
  onCheckedChange?: (checked: boolean) => void;
  /** 읽기 전용(Figma `state=readOnly`). 클릭·포커스를 막는다(색 변화 없음). 기본 false */
  readOnly?: boolean;
  /** 루트 button 에 병합할 클래스 */
  className?: string;
}

/** appearance 별 아이콘 크기(Figma 검증: outline 18 / transparent 24). */
const GLYPH_SIZE: Record<LikeToggleWithLabelAppearance, LikeToggleGlyphSize> = {
  outline: 18,
  transparent: 24,
};

/** appearance 별 타이포 유틸(라벨·count 공용, 둘 다 항상 Medium). */
const TYPO: Record<LikeToggleWithLabelAppearance, string> = {
  outline: "text-label-2",
  transparent: "text-label-1",
};

/** unchecked 라인 아이콘 색(appearance 종속, `LikeToggle` 의 `color` 축과는 별개 팔레트). */
const LINE_COLOR_CLASS: Record<LikeToggleWithLabelAppearance, string> = {
  outline: "text-icon-neutral-normal",
  transparent: "text-icon-neutral-subtle",
};

/**
 * unchecked 라인 아이콘 색. `color='neutralLight'` 면 appearance 와 무관하게
 * `icon-neutral-light` 로 고정 오버라이드한다(`LikeToggle` 아톰의 매핑과 동일한 방식).
 */
function lineColorClass(
  appearance: LikeToggleWithLabelAppearance,
  color: LikeToggleWithLabelColor,
): string {
  return color === "neutralLight"
    ? "text-icon-neutral-light"
    : LINE_COLOR_CLASS[appearance];
}

/**
 * 라벨 색상. checked 는 appearance/color 무관 고정. unchecked 는 `color` 로 먼저 분기하고,
 * `neutralNormal`(기본) 이면 기존처럼 appearance 에 종속된다(회귀 없음).
 */
function labelColorClass(
  variant: LikeToggleVariant,
  checked: boolean,
  appearance: LikeToggleWithLabelAppearance,
  color: LikeToggleWithLabelColor,
): string {
  if (checked) {
    return variant === "heart" ? "text-typo-like-dark" : "text-typo-info-dark";
  }
  if (color === "neutralLight") return "text-typo-neutral-bright";
  return appearance === "outline"
    ? "text-typo-neutral-normal"
    : "text-typo-neutral-subtle";
}

/** count 색상(checked 는 라벨과 동일 고정, unchecked 는 appearance 무관·color 종속). */
function countColorClass(
  variant: LikeToggleVariant,
  checked: boolean,
  color: LikeToggleWithLabelColor,
): string {
  if (checked) {
    return variant === "heart" ? "text-typo-like-dark" : "text-typo-info-dark";
  }
  return color === "neutralLight"
    ? "text-typo-neutral-light"
    : "text-typo-neutral-normal";
}

/** outline 표면(배경 + 테두리). transparent 는 표면이 없다(크롬 없음). */
function surfaceClass(variant: LikeToggleVariant, checked: boolean): string {
  if (!checked) {
    return "bg-bg-neutral-normal border-xs border-solid border-border-neutral-light";
  }
  return variant === "heart"
    ? "bg-bg-like-bright border-xs border-solid border-border-like-normal"
    : "bg-bg-info-bright border-xs border-solid border-border-info-normal";
}

/** 루트 공통 — 인라인 정렬 · 아이콘/라벨/카운트 4px 갭 · focus-visible opacity dip. */
const BASE_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center gap-[var(--sz-4)] " +
  "disabled:cursor-default " +
  "transition-[background-color,opacity] duration-150 ease-in-out motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:opacity-[var(--alpha-60)] " +
  "[font-feature-settings:var(--font-feature-case)]";

/** outline 전용 여백·모서리(pill). transparent 는 크롬이 없어 패딩도 없다. */
const OUTLINE_SHAPE_CLASS = "rounded-circle px-[var(--sz-10)] py-[var(--sz-6)]";

export function LikeToggleWithLabel({
  variant = "heart",
  appearance = "outline",
  color = "neutralNormal",
  label,
  count,
  checked,
  defaultChecked = false,
  onCheckedChange,
  readOnly = false,
  className,
  onClick,
  type = "button",
  ...rest
}: LikeToggleWithLabelProps) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const current = isControlled ? (checked as boolean) : internal;
  const isOutline = appearance === "outline";
  const typo = TYPO[appearance];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (readOnly || event.defaultPrevented) return;
    const next = !current;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type={type}
      disabled={readOnly}
      aria-pressed={current}
      data-variant={variant}
      data-appearance={appearance}
      data-color={color}
      data-checked={current}
      data-readonly={readOnly}
      onClick={handleClick}
      className={[
        BASE_CLASS,
        isOutline ? OUTLINE_SHAPE_CLASS : "",
        isOutline ? surfaceClass(variant, current) : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <LikeToggleGlyph
        variant={variant}
        checked={current}
        size={GLYPH_SIZE[appearance]}
        lineColorClassName={lineColorClass(appearance, color)}
      />
      {label !== undefined && label !== "" && (
        <span
          className={[
            typo,
            labelColorClass(variant, current, appearance, color),
          ].join(" ")}
        >
          {label}
        </span>
      )}
      {count !== undefined && (
        <span
          className={[typo, countColorClass(variant, current, color)].join(" ")}
        >
          {count}
        </span>
      )}
    </button>
  );
}
