/**
 * ComingSoon — 아직 구현되지 않은 화면으로 향하는 공용 플레이스홀더.
 *
 * `BottomNavigation`의 미구현 탭(김또가/시설찾기/요양정보/검색)이 죽은 버튼이
 * 되지 않도록 임시로 연결하는 화면. `ScreenLayout`(뒤로가기 헤더)으로 감싸고
 * 본문에는 기존 `Empty` 컴포넌트로 안내 문구만 보여준다 — 신규 시각 요소 없음.
 *
 * `PlaceholderRoute` 는 `src/router.tsx` 의 `/screens/placeholder/:name` 라우트용
 * 래퍼 — 라우트 파라미터를 화면 제목으로 매핑해 `ComingSoon` 에 넘긴다(라우터
 * 파일이 컴포넌트와 비컴포넌트 값을 함께 export 하면 Fast Refresh 경고가 나서
 * 이 파일로 옮겨뒀다).
 *
 * @example
 * // 라우터에 등록해 아직 없는 화면 자리를 채운다.
 * { path: "/screens/placeholder/:name", element: <PlaceholderRoute /> }
 * <ComingSoon title="시설찾기" />
 */

import { useParams } from "react-router-dom";

import { ScreenLayout } from "../ScreenLayout";
import { Empty } from "../../components/ui/Empty";

export interface ComingSoonProps {
  /** 헤더 타이틀 겸 안내 문구에 쓰일 화면 이름. */
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <ScreenLayout title={title}>
      <div className="flex items-center justify-center px-(--sz-20) py-(--sz-64)">
        <Empty
          mainText="준비 중인 화면입니다"
          subText={`${title} 화면은 곧 만나보실 수 있어요`}
        />
      </div>
    </ScreenLayout>
  );
}

/** `BottomNavigation` 미구현 탭 키 → 안내 문구에 쓸 화면 이름. */
const PLACEHOLDER_TITLES: Record<string, string> = {
  profile: "김또가",
  ltch: "시설찾기",
  guide: "요양정보",
  search: "검색",
};

export function PlaceholderRoute() {
  const { name } = useParams<{ name: string }>();
  const title = (name && PLACEHOLDER_TITLES[name]) || "준비중";
  return <ComingSoon title={title} />;
}
