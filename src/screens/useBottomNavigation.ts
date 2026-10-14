import { useNavigate } from "react-router-dom";

import type { BottomNavigationItem } from "./_localComponents/BottomNavigation";

/**
 * 하단 탭바 각 탭이 이동할 경로. 아직 화면이 없는 탭은 공용 "준비 중" 화면으로 보낸다.
 * TODO(dev): 시설찾기/요양정보/검색 화면 구현 시 placeholder 경로를 실제 경로로 교체
 */
export const BOTTOM_NAVIGATION_PATH: Record<BottomNavigationItem, string> = {
  profile: "/screens/ltc-profile",
  ltch: "/screens/placeholder/ltch",
  store: "/screens/main",
  guide: "/screens/placeholder/guide",
  search: "/screens/placeholder/search",
};

/**
 * `BottomNavigation`의 `onNavigate`에 그대로 넘기는 핸들러를 만든다.
 * 현재 화면의 탭(`current`)을 다시 누르면 이동하지 않는다.
 *
 * @example
 * const handleNavigate = useBottomNavigation("store");
 * <BottomNavigation active="store" onNavigate={handleNavigate} />
 */
export function useBottomNavigation(current: BottomNavigationItem) {
  const navigate = useNavigate();
  return (item: BottomNavigationItem) => {
    if (item === current) return;
    navigate(BOTTOM_NAVIGATION_PATH[item]);
  };
}
