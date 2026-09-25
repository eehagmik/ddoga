/**
 * 떠 있는 메뉴 카드(FloatingMenu).
 *
 * Figma "또가3.0 Design System / FloatingMenu" (node 51405:85316) 와 1:1.
 * 흰 배경 카드형 컨테이너 — `MenuItem`(또는 유사 행)들을 세로로 쌓고, 항목
 * "사이"에만 `Divider`를 끼워 넣는다. Figma 상에는 `MenuItemGroup`이라는
 * 래퍼 인스턴스가 있지만, 이는 디자인 파일에서 MenuItem 개수를 쉽게 교체하기
 * 위한 도구일 뿐이라 코드에는 반영하지 않는다(사용자 확정 사항) — 그 안의
 * 실제 인스턴스(`MenuItem`, `Divider`)만 사용한다.
 *
 * Figma는 placement/size 등 variant 축이 없는 단일 컴포넌트다 → 컨테이너
 * 스타일만 책임지는 순수 presentational 컴포넌트로 만든다(`Tooltip` 선례와
 * 동일한 "범위 축소" 원칙 — 트리거/포지셔닝/열림 상태는 범위 밖).
 *
 * `items` 배열을 받아 각 항목 사이에만 `Divider`를 자동 삽입한다(첫 항목
 * 앞·마지막 항목 뒤는 제외, 사용자 확정 사항) — Figma의 `MenuItemGroup`
 * 내부 배치(MenuItem → Divider → MenuItem)를 그대로 재현한다.
 *
 * 너비(Figma 실측, min-width 120 ~ max-width 300)는 `--sz-*` 토큰에 없는
 * raw 값이라, 가장 가까운 토큰인 `--sz-128`/`--sz-256`으로 대체한다(사용자
 * 승인 사항).
 *
 * 색·radius·그림자는 전부 semantic 토큰 유틸로만 지정한다 — 하드코딩 없음.
 */

import { Fragment } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { Divider } from "../Divider";

export interface FloatingMenuProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 세로로 쌓일 MenuItem(또는 유사) 노드 배열. 항목 사이에 Divider가 자동 삽입된다. */
  items: ReactNode[];
}

/** 컨테이너 — 레이아웃 + 배경 + 테두리 + radius + 그림자 + 너비 제약(--sz-128~--sz-256). */
const ROOT =
  "inline-flex flex-col items-start overflow-clip rounded-2xl border " +
  "border-border-neutral-bright bg-bg-neutral-normal shadow-black-lg " +
  "min-w-(--sz-128) max-w-(--sz-256)";

export function FloatingMenu({ items, className, ...rest }: FloatingMenuProps) {
  const rootClassName = [ROOT, className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} {...rest}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {item}
          {index < items.length - 1 && <Divider />}
        </Fragment>
      ))}
    </div>
  );
}
