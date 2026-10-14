/**
 * FloatingLayer — 화면 하단 플로팅 버튼(TopButton, 상담 버튼 등)을 담는 레이어.
 *
 * 앱은 520px 넘는 화면에서 콘텐츠를 가운데 컬럼으로 가둔다(`AppShell`). 그런데
 * `position: fixed` 버튼은 기본적으로 브라우저 전체 화면 기준으로 붙어서 컬럼 밖
 * 오른쪽 끝으로 가버린다. 이 레이어에 `transform`을 걸면 CSS 규칙상 안쪽 fixed
 * 요소의 기준점이 "이 레이어(= 가운데 컬럼)"로 바뀌어, 버튼들이 항상 컬럼의
 * 오른쪽 아래에 붙는다.
 *
 * 레이어 자체는 클릭을 통과시킨다(`pointer-events-none`) — 안에 넣는 버튼마다
 * `pointer-events-auto`를 꼭 붙여야 클릭된다.
 *
 * @example
 * <FloatingLayer>
 *   <TopButton className="pointer-events-auto ..." />
 *   <button className="pointer-events-auto fixed ...">상담</button>
 * </FloatingLayer>
 */

import type { ReactNode } from "react";

export interface FloatingLayerProps {
  /** 플로팅 요소들. 각자 `fixed` + `pointer-events-auto` + 위치 클래스를 가져야 한다. */
  children: ReactNode;
}

export function FloatingLayer({ children }: FloatingLayerProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto h-0 max-w-(--layout-viewport-max) overflow-visible transform-[translateZ(0)]">
      {children}
    </div>
  );
}
