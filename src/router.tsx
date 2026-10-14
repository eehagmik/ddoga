import { createBrowserRouter } from "react-router-dom";

import { Home } from "./screens/Home/Home";
import { ScreenLayout } from "./screens/ScreenLayout";
import { screenRegistry } from "./screens/registry";
import { PlaceholderRoute } from "./screens/_localComponents/ComingSoon";

/**
 * `/screens/placeholder/:name` — `BottomNavigation`의 미구현 메뉴(시설찾기/요양정보/
 * 검색)가 향하는 공용 플레이스홀더 경로. `screenRegistry`(홈 목록)와는 별도로 여기
 * 직접 등록한다(완성된 화면만 홈 목록에 노출하기 위함). "김또가"(profile) 탭은
 * `LtcProfile` 화면(`/screens/ltc-profile`, `screenRegistry`에 등록)으로 연결된다.
 */
export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/screens/placeholder/:name", element: <PlaceholderRoute /> },
  ...screenRegistry.map((screen) => ({
    path: `/screens/${screen.id}`,
    element:
      screen.withLayout === false ? (
        screen.element
      ) : (
        <ScreenLayout title={screen.title}>{screen.element}</ScreenLayout>
      ),
  })),
]);
