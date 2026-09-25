/**
 * ShortcutList — VerticalMenuButton 등을 grid 로 배치하는 레이아웃 컨테이너.
 *
 * Figma "또가3.0 Design System / ShortcutList" (node 51405:131245)와 1:1. 참고로
 * 준 node 51405:131032는 별도 컴포넌트가 아니라 이 컴포넌트를 담고 있는 문서화
 * 캔버스(페이지) 전체였다 — 실제 구현 대상은 131245 하나뿐이다.
 *
 * 축(Figma variant → props):
 * - `column` : 3 / 4 / 5 — 유일한 variant 축.
 *
 * Figma 문서 심볼은 column 별로 3×3 / 4×3 / 5×3(행 3 고정, 9/12/15개) 예시로
 * 구성되어 있지만, 이는 문서화용 샘플일 뿐 컴포넌트 자체에 "행 3개 고정" 제약은
 * 없다. 행 개수를 하드코딩하면 콘텐츠가 늘어날 때 확장이 막히므로, 열 개수만
 * `column` 으로 고정하고 나머지는 children(임의 개수)으로 받아 grid 가 자동으로
 * 행을 늘리도록 구현했다.
 *
 * gap 은 16px(Figma 변수 `scale/16`) 고정이며, 프로젝트 토큰 체계에 `--spacing-*`
 * 가 없고 전부 `--sz-*` 로 통일되어 있어 `--sz-16` 을 사용한다(Figma 컴포넌트
 * 설명에 "행렬 간격값은 디자이너 재량으로 수정 가능, 변경 시 공유" 메모 있음).
 *
 * 그리드 아이템은 이 컴포넌트가 직접 렌더하지 않고 children 으로 위임한다 —
 * Figma 예시는 전부 `VerticalMenuButton`(size="lg")이지만, ShortcutList 자체는
 * 특정 아이템 컴포넌트에 의존하지 않는 범용 grid 컨테이너다.
 */

import type { HTMLAttributes, ReactNode } from "react";

export type ShortcutListColumn = "3" | "4" | "5";

export interface ShortcutListProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 그리드 열 개수. 기본 '3' */
  column?: ShortcutListColumn;
  /** 그리드 아이템(예: VerticalMenuButton). 개수 제한 없음. */
  children: ReactNode;
}

/** column 별 grid-template-columns — 전 열 동일 비율(1fr). */
const COLUMN_GRID: Record<ShortcutListColumn, string> = {
  "3": "grid-cols-[repeat(3,minmax(0,1fr))]",
  "4": "grid-cols-[repeat(4,minmax(0,1fr))]",
  "5": "grid-cols-[repeat(5,minmax(0,1fr))]",
};

export function ShortcutList({
  column = "3",
  children,
  className,
  ...rest
}: ShortcutListProps) {
  return (
    <div
      data-column={column}
      className={["grid gap-(--sz-16)", COLUMN_GRID[column], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
