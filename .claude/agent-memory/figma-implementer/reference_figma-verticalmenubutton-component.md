---
name: figma-verticalmenubutton-component
description: Figma VerticalMenuButton 세트(51405:116775) 구조·축·토큰 매핑 — 그리드형 메뉴 타일, 68px 고정폭(HorizontalMenuButton과 달리 w-full 오버라이드 없음), md만 root/inner gap 비대칭
metadata:
  type: reference
---

Figma "또가3.0 Design System / VerticalMenuButton" (node 51405:116775, 컴포넌트 세트 15개 = size 5 × state 3)를 `src/components/ui/VerticalMenuButton/`에 구현 완료(2026-09-13). [[figma-horizontalmenubutton-component]]의 세로형 자매 컴포넌트지만 축·구조가 다름.

**구조**: root(button) > inner(image + label) + endSlot(선택). image = 그래픽 정사각(children, 필수) + 배지(Dot, 선택). variant(text/outline)·bold 축 없음 — Horizontal과 달리 단일 스타일.

**축**: `size`(sm/md/lg/xl/2xl) × `badge`(boolean, opt-in 기본 false — Figma 변형 기본값은 true 지만 IconButton 선례 따름) × `endSlot`(ReactNode 존재 여부로 렌더). state(enabled/hover/focus)는 CSS 처리 — disabled 없음.

**폭 오버라이드 없음(Horizontal과 결정적 차이)**: get_metadata 로 15개 심볼 전부 width=68 실측 확인 — size 와 무관하게 고정폭. 그리드 타일 용도라 판단해 `w-full` 오버라이드하지 않고 Figma 값 그대로 `w-[var(--sz-68)]` 채택. 향후 유사 "그리드 타일형" 컴포넌트는 고정폭이 정상일 수 있음 — Horizontal(리스트 행)과 자동으로 같은 패턴을 적용하면 안 됨, 반드시 실측할 것.

**gap 비대칭(중요, 반드시 높이 역산으로 검증)**: root-level gap(inner 블록 ↔ endSlot)과 inner-level gap(그래픽 ↔ 라벨)이 md 사이즈에서만 다르다 — inner-gap=6, root-gap=8. sm 은 둘 다 6, lg/xl/2xl 은 둘 다 8. Figma raw 코드의 조건부 className 이 아주 미묘하게 갈려 있어 놓치기 쉬움 — 각 size 의 실측 루트 높이(94/102/114/124/132)를 padding+그래픽+라벨+gap 합으로 역산해 교차검증함(패딩 8 고정 + endSlot 32 고정 + 라벨 14(sm)/16(md~2xl) 공통 전제).

**size 표**: sm(그래픽28·배지xs6·label text-body-5) / md(그래픽32·배지xs6·label text-body-4) / lg(그래픽42·배지sm8) / xl(그래픽52·배지sm8) / 2xl(그래픽60·배지sm8) — lg~2xl 는 text-body-4 로 동일(라벨 타이포는 2단만 존재, sm 만 다름).

**공통(전 size)**: 폭 `--sz-68`, 패딩 `--sz-4`(4방향), radius `md`(size 무관 고정 — Horizontal 의 sm-only-radius-sm 패턴과 다름), 배지 위치 `-top-[--sz-2] -right-[--sz-2]`(배지 크기 6/8 과 무관하게 오프셋 고정 — Figma 의 sm size hover/focus 에서 `left-24px`로 표기된 것은 `right:-2px`와 수학적으로 동일 위치, 상태별 실제 차이 아님, 착시 주의), endSlot 높이 `--sz-32`(전 size 공통 고정, Horizontal 의 endSlotContents 처럼 "크기 무시하고 자유폭"이 아니라 진짜 고정값으로 채택 — 5개 size 전부 동일 값으로 나온 건 placeholder 우연이 아니라 실제 디자인 의도로 판단).

**재사용 컴포넌트**: `Dot`(`src/components/ui/Dot`, size="xs"(6)/"sm"(8) 그대로 매치) — IconButton 과 동일 재사용 패턴. `BlankGraphic`(`src/components/ui/BlankGraphic`)을 Storybook 기본 children 데모로 사용(Figma의 "BlankGraphic" 인스턴스 이름과 의미상 일치, 실제 프로덕션에서는 호출부가 아이콘/그래픽으로 교체).

**children 설계 결정**: HorizontalMenuButton 은 `children`=라벨 텍스트였지만, Vertical 은 `children`=필수 그래픽/아이콘(IconButton 의 children=아이콘 필수 패턴과 동일), `label`=별도 string prop. 형제 컴포넌트라도 Figma 구조가 다르면 prop 네이밍 관례를 억지로 맞추지 않음.

**Storybook endSlot placeholder**: HorizontalMenuButton.stories.tsx 의 `slotPaddingClass`/`renderEndSlotPlaceholder`/`resolveSlot` 헬퍼와 동일한 시각 디자인(회색 rounded-xs 박스 + "슬롯" 텍스트, sm 만 text-[10px] 예외)을 VerticalMenuButton.stories.tsx 안에 복제. 공유 유틸 파일로 추출하지 않음(최소 침습, 기존 HorizontalMenuButton.stories.tsx 비수정 — 사용자가 새 공유 파일 생성 권한 불확실성을 이유로 이 방식을 명시적으로 허용함).

**테스트 함정**: children 자리에 일반 텍스트(`<span>graphic</span>`)를 넣으면 버튼의 접근성 이름이 "graphic Label"처럼 라벨과 합쳐져 `getByRole("button",{name:"Label"})` 매칭이 실패한다 — 순수 시각적 그래픽 자식은 테스트에서 `aria-hidden="true"` 를 줘야 함.

code-connect 매핑은 아직 `figma-code-connect.json` 에 추가 안 함(요청 범위 밖).
