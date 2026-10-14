import type { ReactNode } from "react";

/**
 * 앱 셸 — 전체 라우터 출력을 감싸는 최상위 레이아웃.
 *
 * `docs/DESIGN.md` §5 "화면 · 뷰포트 · 그리드"에 이미 정의돼 있던 정책을 그대로
 * 구현한다(문서엔 "TODO: 앱 셸 컴포넌트"로 남아있던 항목). 뷰포트 360~520px
 * 사이에서 유동(Stretch), 520px 초과(데스크톱 등)는 콘텐츠를 가운데 컬럼으로
 * 가두고 바깥은 회색 배경(`bg-bg-neutral-deep`, Primitive `gray/10` = `#f6f6f6`)
 * + 컬럼에 그림자(`shadow-greenGray-md`)로 "앱처럼" 떠 보이게 한다. 360px 미만은
 * 컬럼이 더 줄지 않고 가로 스크롤을 허용한다(레이아웃 재설계 안 함).
 *
 * 폭 리터럴(`max-w-[520px]`, `min-w-[360px]`)은 문서에 명시된 금지 패턴이다 —
 * `tokens/layout.json` 산출물인 `--layout-viewport-min`/`--layout-viewport-max`
 * 를 경유한다(`--sz-*`와 동일한 `var(--layout-*)` 참조 방식, §3-1).
 *
 * 2026-09-26 `overflow-x-auto` 제거(사용자가 지적한 `Header`/`Profile` sticky
 * 무효화 버그 수정): 바깥 wrapper에 `overflow-x-auto`만 줬는데도, CSS 스펙상
 * "두 축 중 하나라도 visible이 아니면 나머지 축도 자동으로 auto가 된다" 규칙
 * 때문에 이 div의 `overflow-y`까지 암묵적으로 `auto`가 돼버렸다 — 그 결과 이
 * div가 `position: sticky` 자손들의 "가장 가까운 스크롤 컨테이너"가 됐는데,
 * 실제 스크롤은 여전히 `window`/`document`에서 일어나서 서로 어긋나 sticky가
 * 전혀 작동하지 않았다(`Header`/`Profile`이 스크롤과 함께 그냥 흘러가버림).
 * 360px 미만 가로 스크롤은 이 속성 없이도 브라우저 기본 동작(문서가 뷰포트보다
 * 넓으면 자동으로 가로 스크롤바가 생김)으로 이미 충족되므로, 굳이 명시적으로
 * `overflow-x`를 선언할 필요가 없었다 — 제거만으로 두 요구사항(가로 스크롤
 * 허용 + sticky 정상 동작)이 동시에 해결된다.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-bg-neutral-deep">
      <div className="relative mx-auto min-h-screen w-full min-w-(--layout-viewport-min) max-w-(--layout-viewport-max) bg-bg-neutral-normal shadow-greenGray-md">
        {children}
      </div>
    </div>
  );
}
