---
name: figma-footeraccordion-component
description: FooterAccordion(node 51405:3273) — Accordion 세 번째 자매 컴포넌트, 색 방향 반전(enable=어두움/hover=밝음), text-label-1-bold, divider 없음, 버튼-in-버튼 회피용 div+button 분리 구조
metadata:
  type: reference
---

파일 "또가3.0 Design System"(fileKey `kUirarWT1Xugaq0aajY4G6`), FooterAccordion 메인 노드 `51405:3273`(3개 심볼만 존재: `expanded=false,state=enable`/`expanded=false,state=hover`/`expanded=true,state=enable` — 5개 조합 중 2개 결측, [[reference-figma-boardaccordion-component]]와 동일한 결측 패턴). `Accordion`(51405:3189)/`BoardAccordion`(51405:3210)의 세 번째 자매 컴포넌트로, 상태관리(controlled/uncontrolled)·height 트랜지션(`getAutoHeightDuration`, MUI Collapse 공식)·아이콘 교체 로직은 그대로 복제하되 레이어 구조가 달라 합성하지 않고 별도 구현.

## Accordion 계열과 다른 점 (Figma 실측)

- **배경색 방향이 반대**: Accordion/BoardAccordion은 enable=밝음(`bg-neutral-normal`)→hover=어두움(`bg-neutral-deep`)인데, FooterAccordion은 enable=어두움(`bg-neutral-deepDark`, #eee)→hover=밝음(`bg-neutral-dark`, #f3f3f3)이다. Figma 코드 산출물의 CSS 변수 fallback 값(`var(--background/neutral/dark,#f3f3f3)` 등)을 실제 프로젝트 primitive(`gray-30`=#f3f3f3, `gray-60`=#eeeeee)와 대조해서 확정 — Figma 변수명 fallback 값이 실측 검증 수단으로 유효했던 사례.
- **제목 타이포는 `text-body-3-bold`가 아니라 `text-label-1-bold`**: Figma get_design_context 출력의 스타일 요약(`label/1_bold: Font(..., lineHeight: 1, letterSpacing: -1.5)`)을 근거로, `--text-label-1-bold`(line-height 1, letter-spacing -1.5%, size sm=16px)가 정확히 일치함을 토큰 파일 대조로 확인. Accordion 계열 선례(`text-body-3-bold`, line-height 1.47)를 무비판적으로 재사용하면 line-height가 틀어졌을 뻔한 케이스 — 형제 컴포넌트라고 동일 타이포 토큰을 가정하지 말고 매번 실측 스타일명을 대조해야 한다.
- **hover로 인한 볼드 전환 없음**: BoardAccordion은 hover 시 `group-hover:text-body-3-bold`로 제목이 볼드 전환되지만, FooterAccordion은 항상 Bold 고정(전환 축 자체가 없음).
- **루트에 `rounded-2xl` 모서리 존재**: 리스트 행인 Accordion/BoardAccordion에는 없던 축 — 독립 카드형 컨테이너라서 존재.
- **Divider 없음**: Figma 레이어 구조상 하단 구분선이 존재하지 않아 `divider` prop 자체를 만들지 않음(2026-09-25 사용자 확정 — Clarify 단계에서 권장안으로 제시 후 승인받음).

## 구조적 판단: Figma 산출물을 그대로 베끼면 버튼-in-버튼이 생기는 사례

Figma의 `expanded=true` 심볼 원본 코드는 `contentsSlot`(children)을 헤더 `<button>` 내부의 자식으로 직렬화한다(auto-layout 트리를 그대로 뱉은 결과). 이걸 그대로 구현하면 `children`에 버튼/링크가 들어올 때 버튼-in-버튼 HTML 위반이 생긴다([[reference-figma-menuitem-component]]/TextCard에서 이미 다룬 문제와 동일 계열). 그래서 Accordion/BoardAccordion과 동일하게 바깥 `<div>`(카드, 배경·모서리 담당)로 감싸고 그 안에 헤더 `<button>`(제목 줄만)과 콘텐츠 `<div>`(형제)를 분리했다. 배경/hover가 바깥 `<div>`에 있으므로 자식(버튼) 위에 마우스가 있어도 부모까지 자연히 hover가 히트돼 `hover:` 유틸만으로 정상 동작(collapsed 시엔 콘텐츠가 없어 시각적으로 Figma의 "카드 전체가 버튼" 구조와 동일하게 보임).

## 패딩 재현

Figma 실측 title-to-content gap 24px를 헤더 `pb-14` + 콘텐츠 `pt-10`으로 나눠 재현(Accordion의 헤더/콘텐츠 패딩 분리 패턴과 동일 원칙) — 단일 값으로 뭉치지 않고 두 요소에 나눠 배분해야 하는 이유는 헤더 자체도 collapsed일 때 독립적으로 pb-14를 유지해야 하기 때문(콘텐츠 없어도 카드 하단 패딩이 14여야 함).

구현 파일: `src/components/ui/FooterAccordion/{FooterAccordion.tsx,FooterAccordion.stories.tsx,FooterAccordion.test.tsx,index.ts}`. 완료(2026-09-25). code-connect 매핑 미추가(Accordion/BoardAccordion도 없음, 선례 일치). 빌드/타입체크/lint/vitest(10개) 전부 통과.

## Footer.tsx 통합 시 패딩 재배치(승격 후속 작업)

`Footer.tsx`(`src/screens/_localComponents/`)는 원래 이 아코디언을 화면 전용으로 인라인 구현했었는데(헥톤프로젝트 데이터 하드코딩), 정식 컴포넌트 승격 후 `title`+`children` 만 넘기는 방식으로 교체했다. 이때 주의할 점: `FooterAccordion`이 이제 헤더/콘텐츠에 자체 `px-16`을 내장한 독립 카드라, `Footer`의 바깥 카드가 기존처럼 전체에 `px-16`을 주면 아코디언 영역만 이중 들여쓰기(32px)가 생긴다 — `Footer` 바깥 카드는 `py-24`만 갖고, `px-16`은 형제 섹션(고객센터 블록/약관·SNS 블록)에 개별로 줘야 `FooterAccordion`의 자체 패딩과 좌우 정렬이 맞는다. 컴포넌트가 "패딩을 스스로 갖는" 방향으로 승격되면 부모 쪽 래퍼 패딩을 반드시 재검토해야 하는 일반 패턴.
