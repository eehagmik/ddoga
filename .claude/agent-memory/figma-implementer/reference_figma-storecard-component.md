---
name: figma-storecard-component
description: StoreCard(구 PopularProductCard+StoreProductCard 통합) — Vertical/Horizontal 두 컴포넌트 세트, direction×size 축, compact/regular 타이포 그룹
metadata:
  type: reference
---

StoreCard는 `src/screens/_localComponents/StoreCard/StoreCard.tsx` (2026-09-25 통합, 로컬컴포넌트 규칙: [[feedback_local-components-convention]] 그대로 단일 파일).

**Figma node-id**:

- 문서 섹션 "Store"(캔버스, get_design_context 불가): `15449:19325`
- `Card/Store/Vertical`(세트): `14885:16824` — size=maximum(`14885:16731`, soldout `15854:40079`) / size=minimum(`15564:171356`, soldout `15854:40093`)
- `Card/Store/Horizontal`(세트): `16458:44058` — size=maximum(`14885:16873`, soldout `15854:40104`) / size=minimum(`16111:233283`, soldout `16111:235126`)

**핵심 재발견**: 기존 두 로컬 컴포넌트(`PopularProductCard`/`StoreProductCard`)는 이름과 달리 **둘 다 Vertical 계열**이었다(각각 size=minimum/maximum). "Horizontal"(썸네일 왼쪽 배치, flex-row)은 이번에 처음 구현. `direction`(vertical/horizontal) × `size`(maximum/minimum) 2×2 조합 — `soldout`은 범위 밖 유지.

**타이포는 4조합이 아니라 2그룹**("compact"/"regular")로만 갈린다 — `direction=vertical && size=maximum`만 "regular"(`text-body-*` 계열), 나머지 세 조합(vertical/minimum, horizontal/maximum, horizontal/minimum)은 전부 "compact"(`text-label-3`/`text-other-store-card`/`text-other-price-2`/`text-label-2-bold`/`text-body-4-bold`/`text-label-2`) — Horizontal은 `size` variant와 무관하게 항상 `EtcCost`의 xs(compact) 스타일만 쓰기 때문. 이 발견 덕분에 4갈래 대신 2갈래 typo 분기로 구현 단순화됨.

**랭킹 뱃지 정정**: 구 `StoreProductCard`가 원형 숫자 배지로 근사했던 게 오류로 확인됨 — Vertical/Horizontal 양쪽 모두(Horizontal은 size=maximum만) 동일한 리본형(`_parts/Sticker/Ranking`, `PopularProductCard`의 기존 `RankBadge`와 동일)을 쓴다. `direction=horizontal && size=minimum`은 Figma에 뱃지 슬롯 자체가 없어 `rank` prop이 있어도 렌더 안 함.

**렌더링 불변 원칙**: 사용자가 "기존 vertical 렌더링 결과가 바뀌면 안 됨"을 명시(랭킹 뱃지 정정만 유일한 예외) — 그 결과 regular 타이포 그룹의 `BadgesRow`는 `w-full`/`pb-*` 없는(구 `StoreProductCard`의 실측과 다를 수 있는) 상태를 그대로 보존했다. Figma와 완벽히 일치하지 않아도 기존 동작 보존이 우선이라는 판단 기준으로 참고할 것.

`badges?: string[]` prop은 Figma의 2슬롯(무료배송/안심보장) 구조를 개별 boolean으로 쪼개지 않고 기존 방식(`Main.tsx` 데이터 호환) 그대로 유지.

구현 완료(2026-09-25). `src/screens/Main/Main.tsx`에서 사용 중.
