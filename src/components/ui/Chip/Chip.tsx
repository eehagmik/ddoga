/**
 * 칩(Chip).
 *
 * Figma "또가3.0 Design System / Chip" (node 51405:52642) 와 1:1.
 * 상태·카테고리·필터를 나타내는 pill 형태의 작은 라벨이다. 라벨은 필수,
 * 앞(leading) 슬롯과 삭제 버튼은 선택.
 *
 * 축(Figma variant → props):
 * - `color`    : neutral / danger / info / warning / brand
 * - `variant`  : fill / bright / outline
 * - `size`     : xs(26) / sm(32)
 * - `bold`     : 라벨 굵기(Figma `bold` 축 → `text-label-*-bold` 로 전환)
 * - `deletable`: 우측 삭제 버튼 노출(Figma `deletable`). true 일 때만 hover/focus 상태가 존재한다.
 * - `startType`: leading 슬롯 종류(icon / graphic). 슬롯 래퍼 스타일만 제어한다.
 * - hover / focus 는 상태이므로 props 가 아니라 CSS 의사클래스로 처리한다(Figma `state`).
 *   `deletable=false` 조합에는 Figma 에 hover/focus state 가 없어 상태 클래스를 붙이지 않는다.
 *
 * 구조: 루트 `<span class="group">` → inner(슬롯 + 라벨) → 삭제 `<button>`(deletable).
 * Chip 자체는 인터랙티브 요소가 아니다(삭제 버튼만 `<button>`).
 *
 * size 별 토큰 (Figma 검증):
 * | size | 높이     | px(deletable=false) | pl/pr(deletable) | 외곽 gap | inner gap | 슬롯/삭제 크기 | 타이포(normal/bold)          |
 * | xs   | --sz-26 | --sz-8              | --sz-10 / --sz-6 | --sz-3  | --sz-4   | --sz-16       | text-label-2 / -2-bold       |
 * | sm   | --sz-32 | --sz-10             | --sz-12 / --sz-8 | --sz-4  | --sz-6   | --sz-18       | text-label-1 / -1-bold       |
 *
 * 상태(deletable=true 전용):
 * - hover / focus : 루트 배경을 한 단계 진한 토큰으로 교체(fill→deep, bright→light/dark, outline→neutral-deep).
 *                   삭제 버튼 상호작용에 반응하도록 `group-hover:` · `group-focus-within:` 로 부여한다.
 * - focus         : 위 배경 교체 + 삭제 버튼 `opacity` `--alpha-60`(Figma `state=focus` 의 "삭제버튼 60%").
 *
 * 삭제 버튼(`x_close_solid`)에만 `cursor-pointer` 를 준다 — Chip 본체·leading 슬롯은
 * 인터랙티브 요소가 아니라 커서를 바꾸지 않는다.
 *
 * 색은 전부 semantic 토큰 유틸(`bg-bg-*`, `text-typo-*`, `text-icon-*`, `border-border-*`),
 * 크기·간격은 `var(--sz-*)`, 투명도는 `var(--alpha-*)` 로만 지정한다 — 하드코딩 없음.
 * leading 슬롯이 `currentColor` 를 따르는지는 Figma 미실측 → 슬롯 래퍼에 명시 `text-icon-*` 를 준다
 * (`ButtonWithLabel` 선례). Storybook 은 `src/icons` 의 `<Icon>` · `BlankGraphic` 을 넣는다.
 * `startType="graphic"` 슬롯 래퍼는 각진 사각형(radius 없음, `overflow-hidden` 만)으로 클립한다 — 원형 아님.
 */

import type { ReactNode } from "react";

import { Icon } from "../../../icons";

export type ChipColor = "neutral" | "danger" | "info" | "warning" | "brand";
export type ChipVariant = "fill" | "bright" | "outline";
export type ChipSize = "xs" | "sm";

export interface ChipProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  /** 색상 축. 기본 'neutral' */
  color?: ChipColor;
  /** 스타일 축(Figma Style). 기본 'fill' */
  variant?: ChipVariant;
  /** 크기 축. 기본 'xs' */
  size?: ChipSize;
  /** 라벨 굵기(Figma `bold` 축). 기본 false */
  bold?: boolean;
  /** 우측 삭제 버튼 노출(Figma `deletable`). 기본 false */
  deletable?: boolean;
  /** 삭제 버튼 클릭 콜백 */
  onDelete?: () => void;
  /** 삭제 버튼 `aria-label`. 기본 '삭제' */
  deleteLabel?: string;
  /** leading 슬롯 종류(Figma `startType`). 슬롯 래퍼 스타일만 제어. 기본 'icon' */
  startType?: "icon" | "graphic";
  /** leading 아이콘/그래픽 실제 콘텐츠(Figma `startBlank`). 없으면 미렌더 */
  startSlot?: ReactNode;
  /** 라벨(필수, Figma `label`). */
  children: ReactNode;
}

/** 루트 공통 — group(삭제 버튼 상호작용 전파) · 중앙정렬 · pill · 배경 전이. */
const CHIP_BASE =
  "group inline-flex items-center justify-center rounded-circle " +
  "transition-[background-color] duration-150 ease-in-out motion-reduce:transition-none";

/** inner 공통 — 슬롯·라벨 레이아웃만. */
const INNER_BASE = "inline-flex items-center justify-center";

/** 슬롯/삭제 버튼 공통 — 레이아웃에서 눌리지 않도록 shrink-0. */
const SLOT_BASE = "inline-flex shrink-0 items-center justify-center";

/** 라벨 공통 — 줄바꿈 방지 + 기호(+,-) 중앙 정렬. */
const LABEL_BASE =
  "whitespace-nowrap [font-feature-settings:var(--font-feature-case)]";

/** size 별 높이. */
const SIZE_HEIGHT: Record<ChipSize, string> = {
  xs: "h-(--sz-26)",
  sm: "h-(--sz-32)",
};

/** size 별 좌우 padding (deletable=false). */
const SIZE_PX: Record<ChipSize, string> = {
  xs: "px-(--sz-8)",
  sm: "px-(--sz-10)",
};

/** size 별 비대칭 padding (deletable=true — 우측을 줄여 삭제 버튼에 밀착). */
const SIZE_PAD_DEL: Record<ChipSize, string> = {
  xs: "pl-(--sz-10) pr-(--sz-6)",
  sm: "pl-(--sz-12) pr-(--sz-8)",
};

/** size 별 외곽 gap (루트 ↔ 삭제 버튼, deletable=true). */
const SIZE_OUTER_GAP: Record<ChipSize, string> = {
  xs: "gap-(--sz-3)",
  sm: "gap-(--sz-4)",
};

/** size 별 inner gap (슬롯 ↔ 라벨). */
const SIZE_INNER_GAP: Record<ChipSize, string> = {
  xs: "gap-(--sz-4)",
  sm: "gap-(--sz-6)",
};

/** size 별 leading 슬롯 / 삭제 버튼 정사각 크기. */
const SIZE_SLOT: Record<ChipSize, string> = {
  xs: "size-(--sz-16)",
  sm: "size-(--sz-18)",
};

/** size 별 라벨 합성 타이포 유틸(normal / bold). */
const SIZE_TYPO: Record<ChipSize, { normal: string; bold: string }> = {
  xs: { normal: "text-label-2", bold: "text-label-2-bold" },
  sm: { normal: "text-label-1", bold: "text-label-1-bold" },
};

/** color × variant → 정적 배경/테두리 (Figma node 51405:52642 검증). */
const VARIANT_BG: Record<ChipVariant, Record<ChipColor, string>> = {
  fill: {
    neutral: "bg-bg-inverse-normal",
    brand: "bg-bg-brand-normal",
    danger: "bg-bg-danger-normal",
    warning: "bg-bg-warning-normal",
    info: "bg-bg-info-normal",
  },
  bright: {
    neutral: "bg-bg-neutral-deep",
    brand: "bg-bg-brandGrayish-deep",
    danger: "bg-bg-danger-bright",
    warning: "bg-bg-warning-bright",
    info: "bg-bg-info-bright",
  },
  outline: {
    neutral:
      "bg-bg-neutral-normal border-xs border-solid border-border-neutral-light",
    brand:
      "bg-bg-neutral-normal border-xs border-solid border-border-brand-subtle",
    danger:
      "bg-bg-neutral-normal border-xs border-solid border-border-danger-subtle",
    warning:
      "bg-bg-neutral-normal border-xs border-solid border-border-warning-normal",
    info: "bg-bg-neutral-normal border-xs border-solid border-border-info-subtle",
  },
};

/**
 * color × variant → deletable 상태(hover/focus) 배경 딥.
 * `group-hover:` · `group-focus-within:` 로 삭제 버튼 상호작용에 반응한다.
 * 딥 토큰은 이 노드의 `get_variable_defs` 로 확인됨(Button 컴포넌트의 "한 단계 딥" 규칙과 동일).
 */
const VARIANT_BG_INTERACT: Record<ChipVariant, Record<ChipColor, string>> = {
  fill: {
    neutral:
      "group-hover:bg-bg-inverse-deep group-focus-within:bg-bg-inverse-deep",
    brand: "group-hover:bg-bg-brand-deep group-focus-within:bg-bg-brand-deep",
    danger:
      "group-hover:bg-bg-danger-deep group-focus-within:bg-bg-danger-deep",
    warning:
      "group-hover:bg-bg-warning-deep group-focus-within:bg-bg-warning-deep",
    info: "group-hover:bg-bg-info-deep group-focus-within:bg-bg-info-deep",
  },
  bright: {
    neutral:
      "group-hover:bg-bg-neutral-dark group-focus-within:bg-bg-neutral-dark",
    brand:
      "group-hover:bg-bg-brandGrayish-dark group-focus-within:bg-bg-brandGrayish-dark",
    danger:
      "group-hover:bg-bg-danger-light group-focus-within:bg-bg-danger-light",
    warning:
      "group-hover:bg-bg-warning-light group-focus-within:bg-bg-warning-light",
    info: "group-hover:bg-bg-info-light group-focus-within:bg-bg-info-light",
  },
  outline: {
    neutral:
      "group-hover:bg-bg-neutral-deep group-focus-within:bg-bg-neutral-deep",
    brand:
      "group-hover:bg-bg-neutral-deep group-focus-within:bg-bg-neutral-deep",
    danger:
      "group-hover:bg-bg-neutral-deep group-focus-within:bg-bg-neutral-deep",
    warning:
      "group-hover:bg-bg-neutral-deep group-focus-within:bg-bg-neutral-deep",
    info: "group-hover:bg-bg-neutral-deep group-focus-within:bg-bg-neutral-deep",
  },
};

/** color × variant → 라벨 텍스트 색 (Figma node 51405:52642 검증). */
const LABEL_COLOR: Record<ChipVariant, Record<ChipColor, string>> = {
  fill: {
    neutral: "text-typo-inverse-normal",
    brand: "text-typo-inverse-normal",
    danger: "text-typo-inverse-normal",
    warning: "text-typo-inverse-normal",
    info: "text-typo-inverse-normal",
  },
  bright: {
    neutral: "text-typo-neutral-normal",
    brand: "text-typo-brand-dark",
    danger: "text-typo-danger-deep",
    warning: "text-typo-warning-deep",
    info: "text-typo-info-deep",
  },
  outline: {
    neutral: "text-typo-neutral-normal",
    brand: "text-typo-brand-dark",
    danger: "text-typo-danger-deep",
    warning: "text-typo-warning-deep",
    info: "text-typo-info-deep",
  },
};

/** color × variant → leading 슬롯 · 삭제 버튼 아이콘 색 (Figma node 51405:52642 검증). */
const ICON_COLOR: Record<ChipVariant, Record<ChipColor, string>> = {
  fill: {
    neutral: "text-icon-inverse-normal",
    brand: "text-icon-inverse-normal",
    danger: "text-icon-inverse-normal",
    warning: "text-icon-inverse-normal",
    info: "text-icon-inverse-normal",
  },
  bright: {
    neutral: "text-icon-neutral-subtle",
    brand: "text-icon-brand-normal",
    danger: "text-icon-danger-normal",
    warning: "text-icon-warning-normal",
    info: "text-icon-info-normal",
  },
  outline: {
    neutral: "text-icon-neutral-subtle",
    brand: "text-icon-brand-normal",
    danger: "text-icon-danger-normal",
    warning: "text-icon-warning-normal",
    info: "text-icon-info-normal",
  },
};

export function Chip({
  color = "neutral",
  variant = "fill",
  size = "xs",
  bold = false,
  deletable = false,
  onDelete,
  deleteLabel = "삭제",
  startType = "icon",
  startSlot,
  children,
  className,
  ...rest
}: ChipProps) {
  const iconColor = ICON_COLOR[variant][color];

  return (
    <span
      data-color={color}
      data-variant={variant}
      data-size={size}
      data-bold={bold}
      data-deletable={deletable}
      className={[
        CHIP_BASE,
        SIZE_HEIGHT[size],
        deletable ? SIZE_PAD_DEL[size] : SIZE_PX[size],
        deletable ? SIZE_OUTER_GAP[size] : "",
        bold ? SIZE_TYPO[size].bold : SIZE_TYPO[size].normal,
        VARIANT_BG[variant][color],
        deletable ? VARIANT_BG_INTERACT[variant][color] : "",
        LABEL_COLOR[variant][color],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span
        className={[INNER_BASE, SIZE_INNER_GAP[size]].filter(Boolean).join(" ")}
      >
        {startSlot ? (
          <span
            className={[
              SLOT_BASE,
              SIZE_SLOT[size],
              iconColor,
              startType === "graphic" ? "overflow-hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {startSlot}
          </span>
        ) : null}
        <span className={LABEL_BASE}>{children}</span>
      </span>
      {deletable ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label={deleteLabel}
          className={[
            SLOT_BASE,
            SIZE_SLOT[size],
            iconColor,
            "cursor-pointer",
            "focus-visible:opacity-(--alpha-60) focus-visible:outline-none",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Icon name="x_close_solid" className="size-full" />
        </button>
      ) : null}
    </span>
  );
}
