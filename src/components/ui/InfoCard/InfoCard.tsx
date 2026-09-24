/**
 * 정보/안내 카드(InfoCard).
 *
 * Figma "또가3.0 Design System / InfoCard" (node 51405:102841) 와 1:1.
 * 배경색이 있는 카드로 안내 메시지를 보여주는 정적 컴포넌트 — 인터랙션(hover/focus/disabled)이
 * 없다(Figma 심볼에 `state` 축 자체가 없음).
 *
 * 축(Figma property → props):
 * - `color`      : neutral / danger / info / warning
 * - `variant`    : horizontal(아이콘+제목 가로 배치) / vertical(아이콘 위 · 제목 아래)
 * - `titleValue` : 제목(Figma `title` boolean + `titleValue` text) → **presence 기반**.
 *                  값이 있을 때만 header(아이콘+제목) 영역을 렌더한다(사용자 승인 — 별도
 *                  boolean prop 을 만들지 않음). 아이콘은 Figma `infoIcon` 토글과 무관하게
 *                  항상 제목과 함께 노출되는 고정 글리프 `info_circle_solid` 다.
 * - `textValue`  : 본문(Figma `text` boolean + `textValue` text) → presence 기반, 값이 있을
 *                  때만 렌더.
 * - `children`   : 하단 자유 콘텐츠 슬롯(Figma 레이어 `Custom > slotContents`, 문서용 빨간
 *                  점선 placeholder 는 렌더하지 않는다) → presence 기반, 값이 있을 때만 렌더.
 *
 * 레이아웃(Figma node 51405:102841 실측):
 * - horizontal: header 는 가로 `flex`(아이콘 `pt-[var(--sz-3)]` 로 제목 첫 줄과 광학 정렬,
 *   제목은 `flex-1`). 본문·슬롯은 header 와 무관하게 항상 좌측 정렬 + 전폭.
 * - vertical: header 는 세로 `flex-col`(아이콘 → 제목 순으로 쌓임). **본문/슬롯 정렬은
 *   horizontal 과 동일하게 좌측 정렬** — Figma 실측 결과 vertical 이라도 텍스트 블록은
 *   중앙정렬되지 않는다(아이콘·제목 relation 만 세로로 바뀔 뿐).
 * - 루트는 `flex-col` · `gap-[var(--sz-6)]`(header/본문/슬롯 블록 사이 + header 내부 아이콘-제목
 *   사이에 동일하게 재사용), `p-[var(--sz-16)]`, `rounded-2xl`.
 * - 슬롯 블록만 `pt-[var(--sz-8)]` 추가 여백을 가진다(Figma `Custom` 래퍼).
 *
 * 카드 폭: Figma 원본은 320px 고정 캔버스지만 `w-full` 로 구현해 호출부(부모 레이아웃)가
 * 폭을 결정하도록 한다(HorizontalMenuButton/GalleryCard 등 선례와 동일 원칙).
 *
 * color 별 토큰(Figma node 51405:102841 검증):
 * | color   | 배경               | 아이콘 색               | 제목 색            | 본문 색            |
 * | neutral | bg-bg-neutral-deep | text-icon-neutral-bright | text-typo-neutral-normal | text-typo-neutral-subtle |
 * | danger  | bg-bg-danger-bright| text-icon-danger-subtle  | text-typo-danger-dark    | text-typo-danger-deep    |
 * | info    | bg-bg-info-bright  | text-icon-info-subtle    | text-typo-info-dark      | text-typo-info-deep      |
 * | warning | bg-bg-warning-bright| text-icon-warning-subtle| text-typo-warning-dark   | text-typo-warning-deep   |
 *
 * 타이포: 제목 `text-body-3-bold`(Figma `body/3_bold`, 18/Bold), 본문 `text-body-4`(Figma
 * `body/4`, 16/Medium). 아이콘 크기 `size-[var(--sz-18)]`.
 *
 * 색·크기·간격은 전부 semantic 토큰 유틸/`var(--sz-*)` 로만 지정한다 — 하드코딩 없음.
 */

import type { HTMLAttributes, ReactNode } from "react";

import { Icon } from "../../../icons";

export type InfoCardColor = "neutral" | "danger" | "info" | "warning";
export type InfoCardVariant = "horizontal" | "vertical";

export interface InfoCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "color" | "title"
> {
  /** 색상 축. 기본 'neutral' */
  color?: InfoCardColor;
  /** 레이아웃 축(Figma `variant`). 기본 'horizontal' */
  variant?: InfoCardVariant;
  /** 제목(Figma `titleValue`). 있을 때만 아이콘+제목 header 를 렌더한다. */
  titleValue?: ReactNode;
  /** 본문(Figma `textValue`). 있을 때만 렌더한다. */
  textValue?: ReactNode;
  /** 하단 자유 콘텐츠 슬롯(Figma `Custom` 레이어). 있을 때만 렌더한다. */
  children?: ReactNode;
}

/** 루트 공통 — 세로 스택 · 카드 표면 · font-feature(자손까지 상속). */
const ROOT_CLASS =
  "flex w-full flex-col gap-[var(--sz-6)] rounded-2xl p-[var(--sz-16)] " +
  "[font-feature-settings:var(--font-feature-case)]";

/** color → 카드 배경(Figma node 51405:102841 검증). */
const BG: Record<InfoCardColor, string> = {
  neutral: "bg-bg-neutral-deep",
  danger: "bg-bg-danger-bright",
  info: "bg-bg-info-bright",
  warning: "bg-bg-warning-bright",
};

/** color → 아이콘 색. */
const ICON_COLOR: Record<InfoCardColor, string> = {
  neutral: "text-icon-neutral-bright",
  danger: "text-icon-danger-subtle",
  info: "text-icon-info-subtle",
  warning: "text-icon-warning-subtle",
};

/** color → 제목 색. */
const TITLE_COLOR: Record<InfoCardColor, string> = {
  neutral: "text-typo-neutral-normal",
  danger: "text-typo-danger-dark",
  info: "text-typo-info-dark",
  warning: "text-typo-warning-dark",
};

/** color → 본문 색. */
const TEXT_COLOR: Record<InfoCardColor, string> = {
  neutral: "text-typo-neutral-subtle",
  danger: "text-typo-danger-deep",
  info: "text-typo-info-deep",
  warning: "text-typo-warning-deep",
};

export function InfoCard({
  color = "neutral",
  variant = "horizontal",
  titleValue,
  textValue,
  children,
  className,
  ...rest
}: InfoCardProps) {
  const hasTitle = titleValue != null && titleValue !== false;
  const hasText = textValue != null && textValue !== false;
  const hasSlot = children != null && children !== false;

  return (
    <div
      data-color={color}
      data-variant={variant}
      className={[ROOT_CLASS, BG[color], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {hasTitle ? (
        variant === "horizontal" ? (
          <div className="flex w-full items-start gap-[var(--sz-6)]">
            <span
              className={[
                "flex shrink-0 items-center pt-[var(--sz-3)]",
                ICON_COLOR[color],
              ].join(" ")}
            >
              <Icon name="info_circle_solid" size={18} />
            </span>
            <p
              className={[
                "min-w-0 flex-1 [word-break:break-word] text-body-3-bold",
                TITLE_COLOR[color],
              ].join(" ")}
            >
              {titleValue}
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-start gap-[var(--sz-6)]">
            <span className={["shrink-0", ICON_COLOR[color]].join(" ")}>
              <Icon name="info_circle_solid" size={18} />
            </span>
            <p
              className={[
                "w-full [word-break:break-word] text-body-3-bold",
                TITLE_COLOR[color],
              ].join(" ")}
            >
              {titleValue}
            </p>
          </div>
        )
      ) : null}

      {hasText ? (
        <p
          className={[
            "w-full [word-break:break-word] text-body-4",
            TEXT_COLOR[color],
          ].join(" ")}
        >
          {textValue}
        </p>
      ) : null}

      {hasSlot ? (
        <div className="w-full pt-[var(--sz-8)]">{children}</div>
      ) : null}
    </div>
  );
}
