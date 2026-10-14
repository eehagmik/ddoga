import type { ReactNode } from "react";

import { LtcProfile } from "./LtcProfile/LtcProfile";
import { Main } from "./Main/Main";

/**
 * 구현한 화면 목록 레지스트리.
 *
 * 화면을 하나 추가할 때 이 배열에만 항목을 추가하면, 홈 화면 목록과
 * 라우터(src/router.tsx)에 동시에 반영된다.
 *
 * 참고: 메인 화면 하단 탭바의 미구현 메뉴(시설찾기/요양정보/검색)가 향하는
 * `ComingSoon` 플레이스홀더 라우트는 이 배열에 넣지 않는다(홈 목록에는 완성된
 * 화면만 노출) — `src/router.tsx`에 별도로 직접 등록돼 있다. "김또가"(profile)
 * 탭은 `LtcProfile` 화면 구현 후 `/screens/ltc-profile`로 연결됐다.
 */
export interface ScreenEntry {
  /** 라우트 경로 세그먼트(`/screens/:id`). 예: "login" */
  id: string;
  /** 홈 목록에 노출할 제목. */
  title: string;
  /** 홈 목록에 노출할 한 줄 설명(선택). */
  description?: string;
  /** 해당 화면 컴포넌트. */
  element: ReactNode;
  /**
   * `ScreenLayout`(뒤로가기 헤더) 으로 감쌀지 여부. 기본 true.
   * 화면 자체가 자기 헤더/셸을 갖는 경우(예: 메인 화면의 `Profile` 상단바 +
   * 전역 `BottomNavigation`) false 로 지정해 이중 헤더를 막는다.
   */
  withLayout?: boolean;
}

export const screenRegistry: ScreenEntry[] = [
  {
    id: "main",
    title: "메인 화면",
    description: "프로필 · 카테고리 · 스토어 상품 진열이 있는 앱 메인 화면",
    element: <Main />,
    withLayout: false,
  },
  {
    id: "ltc-profile",
    title: "김또가 어르신",
    description:
      "장기요양 수급자 어르신 정보 · 복지용구 구매/대여 · 재가·요양원 혜택",
    element: <LtcProfile />,
    withLayout: false,
  },
];
