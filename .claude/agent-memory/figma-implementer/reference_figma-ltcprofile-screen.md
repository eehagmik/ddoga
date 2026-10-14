---
name: reference-figma-ltcprofile-screen
description: "김또가" 화면(LtcProfile, node 31062:105088) 화면 전체 구현 — annotation 활용, 신규 세만틱 토큰 금지 정책 반영, 기존 아바타 SVG 자산 재발견
metadata:
  type: reference
---

"김또가" 화면(fileKey AIuptRAEknR0QET5syVMF5, node 31062:105088 "1) 수급자") 구현 기록. `/screens/ltc-profile`, `LtcProfile.tsx`. `BottomNavigation`의 "김또가"(profile) 탭 목적지를 이 화면으로 최초 연결(이전엔 `ComingSoon` 플레이스홀더).

**Figma 주석(annotation) 활용 사례**: `shape-with-text`/`connector` 노드는 `get_design_context`가 "node type not supported"로 거부하지만 `get_screenshot`은 지원 — 주석 텍스트를 읽으려면 스크린샷으로 캡처해서 시각적으로 읽어야 한다. 이 화면에서 "구매하기"→"스토어로 이동", "대여하기"→"안내"→"2depth-복지용구 품목 안내 바텀시트"(라벨만 있고 실제 목업 없음, `onClick` 빈 스텁 처리), "수정버튼"→"성별 이미지" 바텀시트(실제 목업 있음, node 31156:77994) 3개 주석을 확인. 좌표 겹침으로 실제 BottomSheet 인스턴스(진짜 UI)와 라벨 전용 `shape-with-text`(텍스트만, 목업 없음)를 혼동하기 쉬우니 각 annotation 노드의 x/y/width/height를 metadata로 먼저 대조해 어느 게 "실제 디자인"이고 어느 게 "설명 텍스트뿐"인지 구분해야 한다.

**기존 아바타 SVG 자산 재발견**: 메인 화면 Profile.tsx/BottomNavigation.tsx가 그동안 "실제 인물사진 자산은 범위 밖"이라며 `Avatar` 기본 placeholder로 통일해왔는데, 이번에 Figma가 실제 일러스트 아바타(`Person=female_pink` 등)를 쓰는 걸 재확인하고 Figma에서 새로 다운로드하려다가 `src/assets/images/avatar/Person=*.svg`(색상 8종: female pink/orange/purple/yellow, male blue/green/mint/skyblue)가 **이미 저장소에 존재하지만 어디서도 import되지 않은 미사용 자산**이었음을 발견 — Figma 레이어명과 파일명이 정확히 일치, `Avatar.tsx` 문서의 "컬러 아바타 이미지는 호출부가 src로 주입" 설명과 정확히 맞는 용도였다. Figma PNG 재다운로드를 폐기하고 이 기존 SVG로 교체해 중복 자산 생성을 피했다. **교훈: "화면 범위 밖"이라고 적힌 과거 메모를 맹신하지 말고, 새 화면에서 같은 자산이 필요할 때 `src/assets/images/`를 먼저 뒤져볼 것** — 이미 준비된 미사용 자산이 있을 수 있다.

**신규 세만틱 토큰 정책 변경(2026-10-07, 메인 세션 확정, 소급 적용됨)**: "의미 없는 1회성 장식색"을 위한 전용 세만틱 그룹(`kakao.*`/`accent.*`/`grade.badgeBg` 등) 신설을 중단. 대신 (1) Figma raw 값이 기존 primitive와 일치하면 세만틱 별칭 없이 `bg-orange-60`/`text-orange-600`처럼 primitive 유틸을 컴포넌트에서 직접 참조, (2) 일치하는 primitive가 아예 없는 완전히 새로운 hex면 primitive도 추가하지 않고 `bg-[#fee500]` 리터럴 hex를 쓰되 왜 예외인지 주석 필수. 이 화면의 등급 뱃지(`LtcProfileSummaryCard`, Figma "PalleteChip" bg orange/60·text orange/600)에 적용 — `grade.badgeBg`/`badgeText` 세만틱 신설 계획을 취소하고 `bg-orange-60 text-orange-600` 직접 참조로 전환. `tokens/color/semantic.json`의 `accent` 그룹은 이미 제거됐고 `Main.tsx` CATEGORY_MENU도 `bg-orange-10`/`bg-blue-60`/`bg-purple-10` 등 primitive 직접 참조로 전환 완료된 상태였음(코디네이터가 선행 작업). `[[figma-main-screen]]`의 "accent 세만틱 그룹 신설" 기록은 이 정책 변경으로 사실상 폐기됨.

**JSDoc 블록 안의 `*/` 리터럴 함정**: 설명 주석에서 `` `from-*/to-*` `` 처럼 백틱 안에 `*/`가 포함되면 JSDoc 블록(`/** ... */`)이 그 지점에서 조기 종료돼 TS1109/TS1005 등 줄줄이 파싱 에러가 난다(`[[reference-figma-tooltip-component]]`에 이미 기록된 "JSDoc `*/` 함정"과 동일 패턴, 다른 컴포넌트에서 재발). `from-*`/`to-*`처럼 슬래시 앞뒤로 공백이나 백틱 경계를 분리해서 피해야 한다.

**`--sz` 스케일 비연속 구간**: `--sz-100` 다음이 `--sz-128`로 건너뛴다(104/108/110/112/116/120/124 없음). Figma 실측 110px(복지용구 그리드 타일 높이) 같은 값은 `min-h-(--sz-100)` + `justify-center`로 근사(`Avatar`/`HorizontalMenuButton`의 "가장 가까운 토큰 근사" 선례와 동일 원칙).

**노드 분류**: 기존 DS 재사용 — `Header`(type="normal" variant="blur" bold, 뒤로가기+"김또가 어르신"+유저뱃지+장바구니뱃지1), `BottomNavigation`(active="profile"), `Avatar`(variant="edit"=프로필 편집배지, variant="checkable"=바텀시트 선택 그리드, 둘 다 기존 축이 정확히 들어맞아 신규 그래픽 불필요), `BottomSheet`+`FixButton`(성별 이미지 선택), `FooterAccordion`+`BulletItem`, `ButtonWithLabel`, `Divider`. 신규 로컬(`src/screens/_localComponents/`): `ProfileListTabs`, `LtcProfileSummaryCard`, `AvatarPickerBottomSheet`, `LtcAlarmCard`, `WelfareItemButton`(Figma엔 `VerticalMenuButton` 인스턴스라고 적혀 있지만 실제 구조가 카드 배경·그라데이션·카운트뱃지 포함이라 DS 컴포넌트와 달라 분리), `LtchProfileButtonCard`. 디자인시스템 승격 후보 없음.

**범위 밖으로 둔 것**: `Card/LtcAlarm`의 날짜 기반 노출조건(90~30일 전), 삭제 버튼의 실제 삭제/토스트 로직, 프로필목록 탭 전환 시 본문 데이터 연동(다인 가구), 구매/대여 수량 "0개" 실연동 — 전부 백엔드 없음 + Figma 주석에 명시된 비즈니스 로직이라 주석으로만 문서화하고 정적 렌더.

**2026-10-07 재대조 QA(같은 날 후속 세션, node 31062:105089 재조회)**: 코디네이터가 "형제 노드"라며 새 node-id를 줬는데 실제로는 **방금 구현한 것과 완전히 동일한 프레임**(내부 노드 ID 전부 1:1 일치)이었다 — 그 사이 Figma 파일이 편집돼 있어 사실상 QA 재대조 요청이었다. `get_metadata`만으로는 이 동일성을 못 알아챌 뻔했는데, 실제로 `get_design_context`를 돌려 텍스트/노드ID를 비교하고서야 "새 화면"이 아니라 "같은 화면의 드리프트"라는 걸 확인했다 — **"형제/다른 화면"이라는 코디네이터 설명을 그대로 믿지 말고, node ID 집합을 실제로 대조해서 직접 판단할 것**.

발견한 드리프트(전부 Figma 기준으로 수정 완료):

- 프로필 이름 "권희두"→"김또가"(프로필목록 탭 라벨과 불일치하던 게 해소됨 — 애초에 탭 라벨은 처음부터 "김또가"였는데 요약카드만 달랐던 Figma 쪽 실수였던 것으로 보임).
- "재가서비스" 한도액 라벨 "연 재가서비스 한도액"은 **1차 구현 때 실제 라벨 텍스트를 조회하지 않고 지어낸 것**이었다 — 실제는 "월 한도액". **교훈: `Label/Text` 같은 텍스트 슬롯은 반드시 실제 `get_design_context`로 리터럴을 확인하고, 추정 금지.**
- 한도액 박스 radius `rounded-md`→`rounded-lg`(10px).
- **"구매대여가능품목" 카드 배경 구조 오류**(가장 큰 버그): 카드 전체를 `bg-overlay-greenGraySubtle` 단색으로 감쌌었는데, 실제론 카드=흰 배경+테두리+`rounded-2xl`+`overflow-clip`이고 **최상단 코인 배너(40px)만** `linear-gradient(to right, bg-brand-bright, bg-info-bright)` 그라디언트. 1차 구현 때 코인 배너(`get_design_context`로 조회했던 node 31424:176773)의 그라디언트 자체를 놓치고 통째로 단색 근사해버린 게 원인 — **이 node가 나중에 "그라디언트 토큰 정정" 작업 요청의 대상 노드였음이 재조회로 확인됨(코드베이스 전체 `linear-gradient` grep과 BottomNavigation 비교까지 거쳐 식별)**.
- 코인 배너 텍스트 "잔여 지원금" 구간 강조(`text-typo-brand-normal` bold) 누락.
- **"section-재가/요양원혜택" 카드 배경 자체가 완전히 빠져 있었다**(흰 배경+테두리+`rounded-2xl` 없이 그냥 투명 배경 위에 노출) — 사용자가 "화면 배경색도 제대로 반영 안 됐다"고 지적한 지점. `get_variable_defs`로 노드 전체에서 쓰인 변수 목록을 뽑아 `background/neutral/normal`(#fff) 외 이상한 배경이 없는지 교차 확인하는 식으로 배경 누락을 추적했다.
- "①/②" 번호 뱃지: `border-border-brand-light` 테두리 누락, 텍스트가 `text-label-1-bold`+`text-typo-brand-deep`(16px, green-600)이 아니라 실제론 `text-label-2-bold`+`text-typo-brand-normal`(14px, green-500)이었다.
- `Contents List`(섹션 바깥 컨테이너) `gap`/`padding-bottom`이 `gap-(--sz-24)`/`pb-(--sz-40)`가 아니라 `gap-(--sz-16)`/`pb-(--sz-50)`.

**그라디언트 토큰화 여부 판단**: 코인 배너 그라디언트는 Figma에서 이름 붙은 재사용 그라디언트가 아니라 이 배너 1곳에만 쓰이는 인스턴스 값이라(`typo.gradient-highlight`/`like-gradient*`처럼 여러 컴포넌트가 공유하는 디자인시스템 그라디언트와 다름), 2026-10-07 정책대로 신규 세만틱 토큰 생성 없이 기존 세만틱 토큰 2개(`--color-bg-brand-bright`, `--color-bg-info-bright`)를 조합한 리터럴로 구현 — 사용자가 "다른 화면에서 재사용 계획 없다"고 확정해줌.

**시각 재대조 방법(브라우저 스크린샷 도구 없음)**: 이 에이전트는 `preview_start` 같은 브라우저 렌더링 도구가 없어 실제 빌드 결과물을 픽셀로 볼 수 없다. 대신 (1) Figma `get_screenshot`으로 전체 화면 PNG를 받아 `Read`로 육안 검토, (2) `npm run build` 산출물(`dist/assets/index-*.css`)을 `grep`해서 새로 쓴 유틸 클래스(`bg-[linear-gradient(...)]`, `rounded-lg`, `border-border-brand-light` 등)가 실제로 컴파일됐는지 직접 확인, (3) `get_design_context`/`get_variable_defs`로 얻은 리터럴 클래스 문자열과 작성한 JSX를 1:1 대조하는 방식으로 "시각적 재대조"를 대신했다.

**"어르신 정보 알림" 리디자인(2026-10-07, node 31424:176939)**: 사용자가 Figma에서 직접 수정 — 섹션 헤더·바깥 카드·Divider 제거, 카드 3장이 독립 카드(`rounded-2xl`+border+p-12)로 `gap-8` 스택, 순서/문구/아이콘 톤 변경, 요양원 카드 버튼 삭제. `LtcAlarmCard`에 `icon`+`tone`(neutral/warning/danger) prop 추가, 액션 옵셔널화. 톤 색은 Figma가 아이콘을 `<img>` SVG로만 내보내 클래스로 안 보이므로 **SVG URL을 curl로 받아 `fill` hex를 직접 확인**한 뒤 기존 `icon-*` 토큰과 대조(#ABABAB=icon-neutral-bright, #F4B02A=icon-warning-normal, #F84B55=icon-danger-normal) — 아이콘 색 확인 시 유용한 방법. 첫 진입 스태거는 `src/index.css`에 `--animate-fade-slide-in`(300ms ease-in-out both, translateY -sz-8→0) + 카드별 인라인 `animationDelay`(120ms 간격) + `motion-reduce:animate-none`, 마운트마다 재생(사용자 확정). `get_motion_context` 도구는 이 에이전트 툴셋에 없음 — 모션 스펙 요청 시 기본값으로 판단하고 그 사실을 보고할 것.

**하단 플로팅 버튼(2026-10-08, Inset node 31062:105216)**: 1차 구현 때 "상담사 대기중" `Button/QuickButton` 플로팅을 본문 "어르신 복지혜택 알림받기" 카드와 같은 것으로 오인해 "중복"으로 제외했었음 — 실제론 문구·이미지가 다른 별개 요소였다(같은 컴포넌트 이름 `Button/QuickButton`이라고 같은 내용으로 단정하지 말 것, 인스턴스 텍스트까지 대조). `Main.tsx` 플로팅 스택 패턴(transform 래퍼 + 리터럴 bottom 오프셋) 재사용, TopButton `showAfter={20}`, TopButton 하단 오프셋 덮어쓰기는 `!bottom-[...]`(important)로 우선순위 보장. TopButton 우측은 Figma 16이지만 메인 일관성 위해 DS 기본 12 유지(사용자 확정). 캐릭터 이미지는 저장소 기존 `character/guideman1.png` 재사용(Figma와 동일 일러스트, 압축본이라 MD5만 다름 — 육안 대조로 확인).

**5건 수정(2026-10-08)**: (1) `ProfileListTabs`의 `py-(--sz-8)`이 `swiper/css` `.swiper{padding:0}`에 밀려 **무음 실패**하고 있었고 그 탓에 선택 pill 그림자도 `.swiper{overflow:hidden}`에 잘림 — swiper 루트엔 Tailwind padding 금지, 인라인 `style={{paddingBlock:"var(--sz-8)"}}`로. 비선택 pill 이름은 Medium(label-2), plus 아이콘 icon-brandGrayish-normal. (2) 진입 애니를 translateX(+sz-24)로 변경, 컬럼 밖 삐져나감 방지에 리스트 래퍼 `-mx-(--sz-20) px-(--sz-20) self-stretch overflow-x-clip`(클리핑 경계를 컬럼 가장자리로, clip은 sticky 안전). (3) 코인 배너는 inner로 묶어 중앙정렬, 이미지는 저장소 기존 `src/assets/images/coin-1.png`(Figma와 동일). (4) "복지혜택 알림받기" 이미지=카카오톡+배지 3D, 원본 1177px/1.2MB라 `sips -Z 144`로 리사이즈해 `ltc-profile/kakaotalk-alarm.png`. (5) "어르신 상황에 맞는↵재가서비스를 찾아보세요" + typo-neutral-subtle.

**LtcAlarmCard 글래스 표면(2026-10-08)**: Figma 카드 fill이 GRADIENT_RADIAL(기울어진 타원, 중심 우하단, whiteSubtle 10%→whiteDark 80%) + 2px `border-inverse-dark`(흰) + `shadow-greenGray-md`로 바뀜. `get_design_context`는 radial을 `style={{backgroundImage:"url(data:image/svg+xml…radialGradient userSpaceOnUse gradientTransform=matrix(…))"}}`로 내보낸다 — CSS `radial-gradient`로는 기울어진 타원을 못 그리므로 **인라인 SVG + `gradientUnits="objectBoundingBox"`로 환산한 행렬**(x성분÷폭, y성분÷높이; 카드 높이별 행렬이 높이에 정확히 비례하는지 먼저 검증)로 구현, stop 색은 `style={{stopColor:"var(--color-…)"}}`로 토큰 참조. 검증은 `qlmanage -t -s 640 -o . a.svg`로 Figma 원본 SVG와 내 SVG를 래스터화해 육안 비교(이 머신엔 rsvg/ImageMagick/PIL 없음, qlmanage는 있음). 카드 루트 `relative isolate overflow-clip` + SVG `absolute inset-0 -z-10`. 코디네이터가 "linear-gradient 리터럴 클래스로"라고 지시했어도 Figma가 radial이면 실측 우선 + 이유 보고.
