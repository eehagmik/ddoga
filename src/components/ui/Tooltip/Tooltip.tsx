/**
 * Tooltip — 말풍선(툴팁) UI 프리미티브.
 *
 * Figma "또가3.0 Design System / Tooltip" (컴포넌트 세트 node 51405:154754) 와 1:1.
 * 기준 UI 요소 옆에 떠서 짧은 보조 설명을 보여주는 말풍선이다. 본문은 필수,
 * 좌측 아이콘과 우측 닫기 버튼은 선택.
 *
 * 범위(의도적 축소): 이 컴포넌트는 **말풍선 그 자체(presentational)만** 책임진다.
 * hover 트리거·anchor 기준 위치 계산(6px 간격)·portal·노출/비노출 GROW 애니메이션은
 * 범위에서 제외한다(호스트 또는 후속 Popover/TooltipTrigger 과제). 나머지 디자인 시스템
 * 컴포넌트가 전부 순수 표현 프리미티브인 것과 같은 결이다.
 *
 * 축(Figma variant → props):
 * - `color` (black/white) → `tone`: 'dark' | 'light'. 표면·글자·꼬리 색을 한 번에 결정.
 * - `direction` (12값: topLeft … left-bottom, camelCase/kebab 혼재) → `placement` 로 정규화.
 *   `<side>-<start|center|end>` 단일 규칙. bare `'top'` = 중앙 정렬.
 *   매핑: topLeft→top-start, topCenter→top, topRight→top-end,
 *         rightTop→right-start, rightCenter→right, rightBottom→right-end,
 *         bottomLeft→bottom-start, bottomCenter→bottom, bottomRight→bottom-end,
 *         left-top→left-start, left-center→left, left-bottom→left-end.
 * - `isIcon` (bool, Figma 기본 true) → `icon?: ReactNode`. presence 기반(Chip `startSlot` 선례).
 *   슬롯 래퍼 16×16 정사각 + 상단 2px 보정 + tone 별 명시 icon 색.
 * - `isCloseButton` (bool) → `closable?: boolean` + `onClose`. 닫기 버튼(`<button>`),
 *   `x_close_line` 아이콘 16×16, `focus-visible` 시 opacity 60%.
 * - `text` (string) → `children: ReactNode`. 개행은 `whitespace-pre-line` 으로 보존.
 * - Figma 에 hover/pressed/focus/disabled state 축이 **없다** → 말풍선 자체엔 상태 스타일을
 *   두지 않는다(ClearButton/TopButton 선례). 닫기 버튼만 `focus-visible` 처리.
 *
 * 토큰 매핑 (Figma 검증 · get_variable_defs). N 은 sz 스케일 숫자:
 * - 본체 배경 dark  : Figma background_inverse_normal → 유틸 bg-bg-inverse-normal
 * - 본체 배경 light : Figma background_neutral_normal → 유틸 bg-bg-neutral-normal
 * - 본문 색         : Figma typo_inverse_normal / typo_neutral_normal → 유틸 text-typo-inverse-normal / text-typo-neutral-normal
 * - 아이콘 슬롯 색  : Figma icon_(tone)_subtle → 유틸 text-icon-inverse-subtle / text-icon-neutral-subtle
 * - 닫기 아이콘 색  : Figma icon_(tone)_normal → 유틸 text-icon-inverse-normal / text-icon-neutral-normal
 * - 본체 radius     : Figma radius_xl (12) → 유틸 rounded-xl
 * - 본체 padding    : Figma scale_10 / scale_12 → 세로 var(--sz-10), 가로 var(--sz-12)
 * - 내부 gap        : Figma scale_6 → var(--sz-6)
 * - 슬롯 상단 보정  : Figma scale_2 → var(--sz-2)
 * - 슬롯/닫기 박스  : 16 정사각 → var(--sz-16)
 * - 꼬리(beak)      : 삼각형 인라인 SVG(BlankIcon 선례). 세로형(top/bottom) 16x8,
 *                    가로형(left/right) 8x16 — 방향별 viewBox·path + 축 반전(회전 아님)으로
 *                    박스가 flex 로 눌리지 않게 한다. fill 은 본체 배경 토큰.
 * - 꼬리 인셋       : Figma scale_12 → var(--sz-12)
 * - 본문 타이포     : Figma body_5 (Pretendard Medium 14 / line-height 1.46 / letter-spacing -1%) → 유틸 text-body-5
 * - 그림자 dark     : Figma shadow_black_sm (drop-shadow 2겹) → color-shadow-black-light/normal + sz 오프셋
 * - 그림자 light    : Figma shadow_greenGray_sm → color-shadow-greenGray-light/normal
 *
 * Figma 와 의도적으로 다른 부분:
 * 1. `direction` 12값의 혼재된 네이밍(topLeft vs left-top)을 `placement` 단일 규칙으로 정규화.
 * 2. 본문 max-width 는 Figma 데모값 300(토큰 아님) 대신 calc(100vw - var(--sz-32))
 *    (Spec "좌우 최소 여백 16 확보") + 선택적 `maxWidth` prop(인라인 style override).
 * 3. 그림자: Figma 는 drop-shadow 필터. 프로젝트 shadow 토큰은 box-shadow 포맷이라,
 *    꼬리까지 그림자가 이어지도록 color-shadow 색 토큰 + sz 오프셋으로 drop-shadow 를 직접 조립.
 *    (값은 Figma shadow_(tone)_sm = "0 1px 4px light, 0 4px 8px normal" 과 동일)
 * 4. 좌측 아이콘 플레이스홀더(Figma "_blank용 아이콘")는 디자인 표식이므로 렌더하지 않는다 —
 *    `icon` 을 넘길 때만 슬롯을 그린다.
 */

import type { HTMLAttributes, ReactNode } from "react";

import { Icon } from "../../../icons";

export type TooltipTone = "dark" | "light";

export type TooltipPlacement =
  | "top-start"
  | "top"
  | "top-end"
  | "right-start"
  | "right"
  | "right-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "left-start"
  | "left"
  | "left-end";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "color"
> {
  /** 표면·글자·꼬리 색(Figma `color`). 기본 'dark' */
  tone?: TooltipTone;
  /** 꼬리 방향 + 정렬(Figma `direction` 정규화). 기본 'top' */
  placement?: TooltipPlacement;
  /** 좌측 아이콘 슬롯(Figma `isIcon`). 넘길 때만 렌더 */
  icon?: ReactNode;
  /** 우측 닫기 버튼 노출(Figma `isCloseButton`). 기본 false */
  closable?: boolean;
  /** 닫기 버튼 클릭 콜백 */
  onClose?: () => void;
  /** 닫기 버튼 `aria-label`. 기본 '닫기' */
  closeLabel?: string;
  /** 본문 최대 폭 override. number 는 px 로 해석. 없으면 `calc(100vw - var(--sz-32))` */
  maxWidth?: number | string;
  /** 본문(필수, Figma `text`). 개행 보존 */
  children: ReactNode;
}

/** 루트 공통 — 자식(본체 + 꼬리) 스택. 그림자는 tone 별 필터. */
const ROOT_BASE = "inline-flex w-fit items-start";

/**
 * tone 별 drop-shadow 2겹. Figma `shadow/<tone>/sm` (`0 1px 4px light, 0 4px 8px normal`) 과 동일.
 * box-shadow 토큰 대신 필터로 조립해야 꼬리까지 그림자가 이어진다.
 */
const TONE_SHADOW: Record<TooltipTone, string> = {
  dark: "[filter:drop-shadow(0_var(--sz-1)_var(--sz-4)_var(--color-shadow-black-light))_drop-shadow(0_var(--sz-4)_var(--sz-8)_var(--color-shadow-black-normal))]",
  light:
    "[filter:drop-shadow(0_var(--sz-1)_var(--sz-4)_var(--color-shadow-greenGray-light))_drop-shadow(0_var(--sz-4)_var(--sz-8)_var(--color-shadow-greenGray-normal))]",
};

/** tone 별 본체 배경 + 본문 색. */
const TONE_SURFACE: Record<TooltipTone, string> = {
  dark: "bg-bg-inverse-normal text-typo-inverse-normal",
  light: "bg-bg-neutral-normal text-typo-neutral-normal",
};

/** tone 별 좌측 아이콘 슬롯 색(Figma icon/<tone>/subtle). */
const TONE_ICON: Record<TooltipTone, string> = {
  dark: "text-icon-inverse-subtle",
  light: "text-icon-neutral-subtle",
};

/** tone 별 닫기 아이콘 색(Figma icon/<tone>/normal). */
const TONE_CLOSE: Record<TooltipTone, string> = {
  dark: "text-icon-inverse-normal",
  light: "text-icon-neutral-normal",
};

/** tone 별 꼬리 채움색(본체 배경과 동일). */
const TONE_BEAK_FILL: Record<TooltipTone, string> = {
  dark: "fill-bg-inverse-normal",
  light: "fill-bg-neutral-normal",
};

/** align → 꼬리 정렬(교차축). */
const ALIGN_JUSTIFY: Record<Align, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

/**
 * 꼬리 삼각형 path. 세로형(top/bottom)은 16×8 아래 방향, 가로형(left/right)은 8×16 오른쪽 방향.
 * CSS 회전으로 눌린 박스를 돌리는 대신, 방향에 맞는 intrinsic 크기의 SVG 를 그대로 그린다.
 */
const BEAK_PATH = {
  vertical: "M0 0H16L9.1 7.2C8.5 7.8 7.5 7.8 6.9 7.2L0 0Z",
  horizontal: "M0 0V16L7.2 9.1C7.8 8.5 7.8 7.5 7.2 6.9L0 0Z",
} as const;

/** side → 기본 방향(아래·오른쪽) 삼각형을 실제 방향으로 뒤집는 축 반전. 회전이 아니라 박스 크기를 유지한다. */
const BEAK_FLIP: Record<Side, string> = {
  top: "",
  bottom: "-scale-y-100",
  left: "",
  right: "-scale-x-100",
};

export function Tooltip({
  tone = "dark",
  placement = "top",
  icon,
  closable = false,
  onClose,
  closeLabel = "닫기",
  maxWidth,
  children,
  className,
  ...rest
}: TooltipProps) {
  const dash = placement.indexOf("-");
  const side = (dash === -1 ? placement : placement.slice(0, dash)) as Side;
  const align = (dash === -1 ? "center" : placement.slice(dash + 1)) as Align;
  const isVertical = side === "top" || side === "bottom";
  const beakFirst = side === "bottom" || side === "right";
  const textCenter = isVertical && align === "center";

  const beak = (
    <div
      aria-hidden
      className={[
        "flex shrink-0 items-center self-stretch",
        isVertical
          ? `px-(--sz-12) ${ALIGN_JUSTIFY[align]}`
          : `flex-col py-(--sz-12) ${ALIGN_JUSTIFY[align]}`,
      ].join(" ")}
    >
      <svg
        width={isVertical ? 16 : 8}
        height={isVertical ? 8 : 16}
        viewBox={isVertical ? "0 0 16 8" : "0 0 8 16"}
        focusable={false}
        aria-hidden
        className={["shrink-0", BEAK_FLIP[side], TONE_BEAK_FILL[tone]]
          .filter(Boolean)
          .join(" ")}
      >
        <path d={isVertical ? BEAK_PATH.vertical : BEAK_PATH.horizontal} />
      </svg>
    </div>
  );

  const content = (
    <div
      className={[
        "inline-flex items-start gap-(--sz-6) rounded-xl",
        "py-(--sz-10) px-(--sz-12)",
        "max-w-[calc(100vw-var(--sz-32))]",
        TONE_SURFACE[tone],
      ].join(" ")}
      style={
        maxWidth != null
          ? {
              maxWidth:
                typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
            }
          : undefined
      }
    >
      {icon != null && (
        <span
          className={[
            "inline-flex shrink-0 items-center justify-center",
            "size-(--sz-16) pt-(--sz-2) [&>svg]:size-full",
            TONE_ICON[tone],
          ].join(" ")}
        >
          {icon}
        </span>
      )}
      <span
        className={[
          "min-w-0 flex-1 whitespace-pre-line text-body-5",
          "[font-feature-settings:var(--font-feature-case)]",
          textCenter ? "text-center" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
      {closable && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={[
            "inline-flex shrink-0 cursor-pointer items-center justify-center",
            "size-(--sz-16) pt-(--sz-2) [&>svg]:size-full",
            "focus-visible:opacity-(--alpha-60) focus-visible:outline-none",
            TONE_CLOSE[tone],
          ].join(" ")}
        >
          <Icon name="x_close_line" size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div
      data-tone={tone}
      data-placement={placement}
      className={[
        ROOT_BASE,
        isVertical ? "flex-col" : "flex-row",
        TONE_SHADOW[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {beakFirst ? beak : null}
      {content}
      {beakFirst ? null : beak}
    </div>
  );
}
