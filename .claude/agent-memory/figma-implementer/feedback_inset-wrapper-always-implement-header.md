---
name: inset-wrapper-always-implement-header
description: 화면 최상단 Inset 컴포넌트는 통째로 스킵하지 말 것 — 내부 Header는 항상 구현
metadata:
  type: feedback
---

화면 최상단 노드가 `Inset` 컴포넌트일 때, 이걸 "디바이스 상태바 장식이니 전체 스킵"으로 오판하지 않는다. `Inset`은 `OS/Bar/Top`(디바이스 상태바)와 실제 화면 `Header`를 한 세트로 묶어둔 디자인 작업 효율용 래퍼일 뿐이다.

**규칙**: `Inset` 자식을 `get_metadata`로 펼쳐서 `OS/Bar/Top`만 웹 범위 밖으로 제외하고, `Header`(hidden 아닌 상태)는 **어느 화면을 구현하든 항상** `src/components/ui/Header`로 구현한다. `Header` 하위의 다른 옵션 아이콘/슬롯이 꺼져 있는 것과 `Header` 자체의 노출 여부는 별개다.

**Why:** 메인 화면 1차 구현(node 30416:71106) 때 `Inset(31522:190075)` 전체를 상태바로 오판해 자식을 펼쳐보지 않고 통째로 스킵 → 실제로는 그 안에 `Header`(type="home", Logo+user/cart)가 hidden 아닌 상태로 들어있어서 화면 최상단 헤더가 통째로 누락됐다. 사용자가 화면에서 직접 발견해 리포트(2026-09-24) → node 재조사로 확인·수정.

**How to apply:** 화면(페이지) 전체 구현 요청의 1단계 Clarify에서, 최상단 노드가 `Inset`이면 항상 이 분해 절차부터 수행한다. 단일 컴포넌트 요청에는 해당 없음(화면 전체 구현일 때만 발생하는 패턴). 관련: `.claude/agents/figma-implementer.md`의 "`Inset` 래퍼 — 절대 통째로 스킵하지 말 것" 절.
