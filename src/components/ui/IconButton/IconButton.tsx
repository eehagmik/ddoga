/**
 * 아이콘 버튼(IconButton).
 *
 * Figma "또가3.0 Design System / IconButton" (문서 페이지 node 51405:85581,
 * 메인 컴포넌트 node 51405:94614) 와 1:1.
 *
 * Icon 을 중심으로 한 맨아이콘 버튼이다. 배경·테두리·radius 같은 버튼 크롬이 전혀 없고
 * (ButtonWithIcon 과 다름), 우측 상단에 알림 배지(Dot 또는 BadgeNumber)를 선택적으로
 * 얹을 수 있다. 헤더의 알림(벨) 버튼 같은 곳에 쓴다.
 *
 * 기본 형태는 아이콘 단독이다 — `badge` 를 생략하면 배지 노드를 아예 렌더하지 않는다.
 * 아이콘 전용이라 `aria-label` 이 필수다.
 *
 * 축(Figma variant → props):
 * - `badgeType` + `badge`(bool) → `badge?: "dot" | "number"` 로 통합. 생략 시 배지 없음.
 * - `state` (enabled/disabled) → `disabled?: boolean`.
 * - Figma 에 color·size·hover·focus·pressed 축이 없다. 색은 자유(`currentColor` 상속),
 *   크기는 24 고정. hover 스타일은 두지 않고 `focus-visible` 만 처리(ClearButton 선례).
 *
 * 토큰 매핑 (Figma 검증):
 * | 대상            | 스펙                          | 토큰                                  |
 * | 아이콘 박스      | 24×24                         | size-[var(--sz-24)]                   |
 * | disabled 아이콘 | opacity 0.4 (배지는 불변)      | opacity-[var(--alpha-40)]             |
 * | focus-visible   | opacity dip                   | opacity-[var(--alpha-60)]            |
 * | dot 배지        | 6px, red, top/right -2px      | Dot size="xs" + -top/-right var(--sz-2) |
 * | number 배지     | min 14, red, top -3 / right -6 | BadgeNumber size="xs" + -top var(--sz-3) / -right var(--sz-6) |
 *
 * 아이콘 색은 강제하지 않는다 — 소비자가 루트 `className` 에 `text-icon-*` 를 주면
 * `currentColor` 로 상속된다(Storybook 은 `src/icons` 의 `<Icon>` 사용).
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { BadgeNumber } from "../BadgeNumber";
import { Dot } from "../Dot";

export type IconButtonBadge = "dot" | "number";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 접근 가능한 이름(필수). 아이콘 버튼에는 텍스트가 없다. */
  "aria-label": string;
  /** 중앙 아이콘(필수). */
  children: ReactNode;
  /** 우측 상단 배지. 생략 시 배지를 렌더하지 않는다. */
  badge?: IconButtonBadge;
  /** `badge="number"` 일 때 표시할 개수. 기본 0 */
  count?: number;
  /** `badge="number"` 일 때 이 값을 초과하면 `${max}+` 로 축약. 기본 99 */
  max?: number;
  /** 루트 button 에 병합할 클래스 (색 오버라이드·배치용) */
  className?: string;
}

/**
 * 루트 공통 — 아이콘 중앙정렬 + 레이아웃에서 눌리지 않도록 shrink-0 + 배지 절대배치 기준(relative).
 * hover 스타일은 Figma 미정의라 두지 않고 `focus-visible` opacity dip 만 준다(ClearButton 선례).
 */
const BASE_CLASS =
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center " +
  "focus-visible:opacity-[var(--alpha-60)] focus-visible:outline-none";

/**
 * 아이콘 wrapper — disabled 시 여기에만 opacity(배지는 형제라 불변).
 * 자식 svg 는 박스를 채우게 한다(소비자가 크기를 안 줘도 24 로 맞음).
 */
const ICON_BOX =
  "inline-flex size-[var(--sz-24)] items-center justify-center [&>svg]:size-full";

export function IconButton({
  badge,
  count = 0,
  max = 99,
  children,
  disabled,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      data-badge={badge ?? "none"}
      className={[BASE_CLASS, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <span
        className={[ICON_BOX, disabled && "opacity-[var(--alpha-40)]"]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
      {badge === "dot" && (
        <Dot
          size="xs"
          color="red"
          className="absolute -top-[var(--sz-2)] -right-[var(--sz-2)]"
        />
      )}
      {badge === "number" && (
        <BadgeNumber
          size="xs"
          count={count}
          max={max}
          className="absolute -top-[var(--sz-3)] -right-[var(--sz-6)]"
        />
      )}
    </button>
  );
}
