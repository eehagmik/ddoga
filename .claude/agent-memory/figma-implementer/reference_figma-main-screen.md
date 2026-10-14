---
name: figma-main-screen
description: 메인 화면(node 30416:71106) 화면 전체 구현 — 노드 분류, SectionTitle/Swiper 조합 결정, BottomNavigation 고정 전략, kakao 브랜드 토큰 추가
metadata:
  type: reference
---

메인 화면(fileKey AIuptRAEknR0QET5syVMF5, node 30416:71106) 화면 전체 구현 기록. 첫 "화면 전체 구현" 노드 분류 절차(figma-implementer.md 신규 섹션) 적용 사례.

**노드 분류 결과**

- 기존 DS 재사용: VerticalMenuButton(size="2xl", 8개 그리드), Banner(round/4:1), Swiper(variant sharp indicator **none**+수동 오버레이), Tabs/Tab, TopButton, Avatar, Logo(lockup=symbol), Icon, BlankGraphic, ButtonWithLabel, IconButton, ScreenLayout, Empty.
- 신규 로컬(`src/screens/_shared/`): Profile, StoreProductCard, StoreEventCard, SectionTitle, BottomNavigation, Footer, ComingSoon(+PlaceholderRoute).
- 일회성 인라인: 카카오상담 플로팅 pill, 인기상품 스크롤 리스트("중간생략" 아티팩트 제외), 진열#1/#2 grid wrapper.
- 이번엔 DS 승격 후보(SectionTitle)를 사용자가 로컬 유지로 결정(나중에 개별 링크 주면 승격 검토) — [[figma-sectiontitle-component]] 미작성, 승격 시 새로 기록할 것.

**SectionTitle**: Figma 노드 161:2733 실측 — `typo`(title1/2/3, 각 --text-title-1/2/3 합성토큰과 1:1) × `buttonType`(empty/icon/button) × `count`(presence 기반). buttonType="icon"은 기존 `IconButton`, "button"은 기존 `ButtonWithLabel`(outline/neutral/xs) 재사용 — 신규 시각 요소 0.

**Swiper 칩 인디케이터 딜레마**: Swiper.tsx는 `indicator="chip"`일 때 내부적으로 `ChipIndicator type="default"`(라벨+·+카운트) 고정 렌더라, 라벨 없는 `type="onlyCount"` Figma 인스턴스를 화면에서 그대로 재현 불가. 사용자 결정: **Swiper API 확장 금지** — 화면 쪽에서 `indicator="none"` + 별도 `<ChipIndicator type="onlyCount">` 절대배치 오버레이로 우회(Swiper 자체는 무변경). DirectionIndicator 조합 방식은 검토했으나 이 배지형 UI엔 구조가 안 맞아 미채택.

**BottomNavigation 고정 전략**: 이 화면 전용 `fixed bottom-0`(앱 전역 탭바처럼 항상 노출). `TopButton`은 이미 문서화된 "다중 플로팅 버튼은 className으로 bottom-* 덮어쓰기" 패턴을 그대로 사용해 nav 높이(60)+gap(12) 위로 스택, 카카오상담 버튼은 그 위에 다시 TopButton 높이(54)+gap(8) 만큼 더 스택. `ScreenLayout`/다른 화면엔 영향 없음(Main 전용 인라인 className).

**registry `withLayout` 확장**: Main은 뒤로가기 헤더 없이 자기 셸(Profile+BottomNavigation)을 쓰므로, `ScreenEntry`에 `withLayout?: boolean`(기본 true) 추가해 `router.tsx`에서 `withLayout===false`면 `ScreenLayout` 래핑을 스킵하도록 분기. 향후 비슷한 "자기 셸을 가진" 화면(예: 로그인 등)도 이 플래그로 처리.

**신규 토큰(kakao)**: 카카오상담 플로팅 버튼 배경(#fee500)/텍스트(#191919)는 Figma에도 변수 미바인딩 raw hex — `logo.ink` 선례를 따라 `tokens/color/semantic.json`에 `color.kakao.brand`/`color.kakao.ink` 세만틱 그룹 신규 추가 후 `npm run build:tokens` 실행(컴포넌트 코드에 hex 직접 금지 규칙 준수).

**BottomNavigation 미구현 탭 처리**: 4개(프로필/시설찾기/요양정보/검색) 죽은 버튼 대신 공용 `/screens/placeholder/:name` 라우트(`ComingSoon`+`PlaceholderRoute`, `screenRegistry`엔 미등록 — 홈 목록엔 완성 화면만).

**에셋 전략**: Figma 실제 콘텐츠 이미지(상품사진/배너/스티커)까지 전부 다운로드하는 대신, 전부 기존 `BlankGraphic` 프리미티브로 통일(포트폴리오 데모 속도 우선, 사용자에게 사전 고지 후 이견 없어 채택). 유일한 실자산 재사용은 `store_ctg_all.svg`(카테고리 아이콘, 이미 레포에 존재)와 `menu/ltch-line.svg`(시설찾기 내비 아이콘, 기존 자산).

**Profile 재조사(2026-09-25, node 30733:33910 "Profile" 문서 섹션)**: 핵심 3-심볼 마스터(30733:25378)는 불변. 다만 이 섹션에서 상태 텍스트의 실제 구조인 `_parts/ProfileLtcOption`(30733:33907, `type`×`typography` 8-variant)을 처음 발견해 기존 구현의 색상 누락을 찾음 — "일반 00%" 퍼센트 구간이 Figma에서 `orange/500`(세만틱 미바인딩 raw)로 강조돼 있는데 이전엔 통짜 `statusText` 문자열로 받아 전부 회색 처리했었음. `kakao` 선례대로 신규 세만틱 토큰 `color.grade.percent`(`--color-grade-percent`, orange-500 별칭) 추가 후 `statusText` prop을 `percentText`(주황 강조)+`suffixText`(기본색)로 분리. 같은 섹션에서 좌측 블록이 더 범용적인 `_parts/Button/ltcProfile`(30788:25276, optionType=cost/grade/empty 등)으로도 문서화돼 있었지만 이 Profile 바가 실제 쓰는 조합과 이미 일치해 변경 없음 — `optionType="cost"`(좌측 적립금)·`Profile/Category`(31470:183732, 이름부터 다른 별개 컴포넌트)는 범위 밖으로 판단. 동시 작업 중이던 다른 세션이 프로젝트 전역 Tailwind 화살괄호 문법(`[var(--sz-20)]`)을 CSS 변수 축약 문법(`(--sz-20)`)으로 이미 바꿔둔 상태라 신규 코드도 그 문법을 따름.

**Profile QA 재수정(2026-09-26, `_parts/Button/ltcProfile` 30788:25236 재조회 + 스크린샷 30727:25697 픽셀 비교)**: 사용자가 "이름 줄이 스크린샷과 어긋나 보인다"고 지적해 두 가지 실측 오류를 찾음 — (1) 이름 텍스트가 `text-body-4-bold`(line-height 1.47)였는데 실제는 `text-label-1-bold`(`leading-none`=line-height 1)였다. body 계열 선례를 무비판적으로 재사용하면 line-height 가 미묘하게 어긋나는 패턴이 [[reference-figma-footeraccordion-component]]에 이어 또 발생 — 형제/유사 컴포넌트라고 동일 타이포 토큰을 가정하지 말고 매번 `leading-none` 등 명시적 클래스를 대조해야 함. 아바타 크기(32px)·gap 값들은 재조회 결과 기존 구현과 전부 일치해 원인이 아니었음. (2) 드롭다운 아이콘 `chevron_down_line` 근사가 완전히 틀렸음 — 실제 `profileSelectIcon`(30788:25201, 14×15) SVG를 직접 다운로드해 확인한 결과 "회색 원(`gray/60`)+진회색 역삼각형(`gray/800`)" 조합의 카드 전용 커스텀 그래픽이었다(`PopularProductCard` `RankBadge` 선례와 동일하게 인라인 SVG로 교체, hex는 기존 세만틱 토큰 `--color-bg-neutral-deepDark`/`--color-icon-neutral-subtle`로 치환 — 신규 토큰 불필요). 에러 상태용 아이콘(30788:25295, 14×14)도 거의 동일 벡터라 별도 자산 없이 하나의 `ProfileSelectIcon` 컴포넌트로 통합.

**BlankGraphic → 실제 이미지 교체(2026-09-26)**: 화면 전체를 재조회해서 (a) 실제 콘텐츠 이미지 vs (b) Figma 자체도 미정 placeholder를 구분. (a)로 판정해 `src/assets/images/main/`에 다운로드+교체한 자리: `Swiper` 배너 1장, "실시간 인기 상품"(`StoreCard` `direction=vertical size=minimum`) 5개 썸네일(상품별로 다른 `Preview=상품명` 레이어 확인) — `StoreCard`에 `thumbnailSrc?: string` prop(내부 `Thumbnail` 헬퍼, 없으면 기존 `BlankGraphic`)을 신설해 연결. (b)로 판정해 그대로 둔 자리: 카테고리 메뉴 7개(당시 미검증), **"상품 진열#1/#2" 그리드 8개는 겉보기엔 실제 사진 같지만 실측 결과 전 카드가 완전히 동일한 `placeholder-store` 스톡 이미지를 재사용**(상품마다 다른 사진이 아님, 레이어 이름 자체가 placeholder) — "이미지 fill이 있으면 무조건 (a)"로 단정하지 말고 동일 에셋이 여러 인스턴스에 재사용되는지(= 사실상 (b)) 반드시 대조 확인해야 하는 사례.

**기획전 카드(node 30416:71139) 재검증 — 반대 방향 오판 정정(2026-09-26)**: 1차 조사 때 "또가 베스트 기획전" 3개 카드를 Figma **레이어 이름**("BlankGraphic")만 보고 (b)로 분류했었는데, 사용자가 재검증을 요청해 실제로 3개 URL을 `curl`+MD5로 대조한 결과 **완전히 다른 이미지**(하트/왕관/집 엠블럼 3D 아이콘, MD5 전부 다름)였다 — (a)로 정정하고 `src/assets/images/main/event-*.png`로 다운로드, `StoreEventCard`에 `iconSrc?: string` prop 신설해 연결. **핵심 교훈: Figma 레이어 이름이 "BlankGraphic"이어도 실제 이미지 콘텐츠까지 다운로드해서 확인하기 전엔 (a)/(b)를 단정할 수 없다** — "상품 진열" 그리드(동일 자산 재사용 확인됨 → 진짜 (b))와 정반대 결과가 나온 사례라 이름 기반 추정은 신뢰할 수 없음.

**카테고리 메뉴(node 30416:71110) 재검증 — 동일 패턴 재확인 + 배경색/radius 반영(2026-09-26)**: "BlankGraphic" 레이어 7개 전부 다운로드+MD5 대조한 결과 역시 전부 서로 다른 실제 아이콘(지팡이/목욕의자/병원침대/욕창예방매트리스/식사도구/케어십자가/심전도하트)이었다 — 기획전과 동일 패턴 재확인, (a)로 정정. 추가로 재조회 결과 각 아이콘이 `radius/lg`(10px) 둥근 사각 **색상 배경 타일** 위에 얹혀 있었는데(1차 조사 때는 이 배경 레이어 자체를 놓쳤었음 — get_design_context 응답이 상황에 따라 배경 div를 포함/생략할 수 있어 이미지 노드의 형제/부모 레이어까지 항상 확인해야 함), 7개 배경색이 danger/warning/info 같은 의미 축과 무관한 순수 장식용 구분색이라 기존 세만틱을 억지로 재사용하지 않고 신규 `accent.*` 그룹(cream/sky/lavender/butter/mint/honeydew/blush, 각각 가장 가까운 primitive에 별칭)을 새로 만들었다 — `kakao`/`grade` 선례와 같은 "의미 없는 raw 값은 전용 세만틱 그룹 신설" 원칙.
