---
name: header-always-sticky
description: Header 컴포넌트는 항상 화면 최상단에 sticky 고정 — 어떤 화면을 구현하든 예외 없음
metadata:
  type: feedback
---

`src/components/ui/Header`는 2026-09-26부터 `sticky top-0 z-40`이 컴포넌트 자체(`ROOT_BASE`)에 항상 박혀 있다. 화면마다 개별적으로 고정 처리를 추가할 필요 없음 — Header를 쓰기만 하면 자동으로 상단 고정된다. 끄는 prop도 없다(사용자가 "어떤 페이지를 구현하든 무조건 상단 고정"이라고 명시적으로 확정, 옵트아웃 불허).

**Why:** 헤더는 스크롤 중에도 항상 보여야 하는 게 역할의 전제다. 화면별로 className을 덧붙이는 방식은 까먹기 쉽고 일관성이 깨지므로, 컴포넌트 레벨에서 강제해 앞으로 어떤 화면을 구현하든 자동으로 지켜지게 했다.

**How to apply:**

- `Header`를 쓰는 화면에서 별도로 sticky/fixed 처리를 추가하지 말 것(이미 컴포넌트에 있음, 중복하면 충돌 위험).
- `Header` 바로 아래에 두 번째 고정 바(예: `Profile`)를 배치할 때는 `sticky top-(--sz-52)`(Header 높이) + `z-30`(Header의 `z-40`보다 낮게)로 스택한다 — `Profile.tsx` 선례 참고.
- `z-40`은 `BottomNavigation`과 같은 "앱 셸 고정 UI" 티어, `z-50`(`TopButton`/플로팅 버튼)보다는 아래.
