/**
 * 탭 바 컨테이너(Tabs).
 *
 * Figma "또가3.0 Design System / Tabs" (node 51405:133946) 와 1:1. 밑줄 인디케이터형
 * `Tab` 아이템을 나열하는 컨테이너다. Figma 내부의 고정 2개 탭 예시 + `showTabSlot` 슬롯
 * 구조는 문서화용 데모라 판단해, 실제 구현은 `ToggleTabs`(Toggle 인스턴스를 children 으로 자유
 * 나열)와 동일한 패턴으로 **탭 개수 제한 없이 `<Tab>` 인스턴스를 children 으로 나열**한다.
 *
 * 축(Figma variant → props):
 * - `type`: link/focus — **시각 영향 0**(추출 코드 확인 완료). 링크 이동인지, 같은 페이지 안
 *   스크롤 위치에 따라 선택 상태가 자동으로 바뀌는지 호출부에 알리는 시맨틱 축이다. 실제 태그
 *   선택은 각 `Tab` 이 `href` 유무로 스스로 정한다(`Tab` 문서 참고) — 이 컴포넌트는 관여하지 않고
 *   `data-type` 마킹만 한다(`Toggle` 의 `type` 선례와 동일).
 * - `layout`: fit(콘텐츠 폭만큼, 하단정렬) / full(균등 stretch, 중앙정렬).
 * - `size`: sm/md — **컨테이너 자체 스타일에는 영향 없음**(패딩·gap 은 Figma 실측상 size 무관
 *   공통). 호출부가 나열하는 각 `Tab` 에도 동일한 `size` 를 넘겨야 한다(`ToggleTabs`+`Toggle` 이
 *   size 를 자동 전파하지 않고 호출부가 맞춰 넘기는 선례와 동일) — `data-size` 마킹용으로만 쓴다.
 * - `variant`: normal/blur — blur 는 `Header` `variant="blur"` 와 완전히 동일한 토큰 조합.
 *
 * 재사용:
 * - 탭 아이템은 이 컴포넌트가 만들지 않는다 — 호출부가 `<Tab>` 인스턴스를 직접 `children` 으로
 *   나열한다.
 * - 탭 개수가 많아 넘칠 수 있는 경우 이 컴포넌트는 자체 스크롤 로직을 갖지 않는다 — 필요하면
 *   호출부가 `Scroll`(`axis="x"`) 로 감싼다(`ToggleTabs` 와 동일한 책임 분리).
 *
 * 토큰(Figma 실측):
 * - 하단 baseline 구분선: `border-b-[length:var(--border-width-xs)]`(1px) +
 *   `border-border-neutral-bright`(모든 축 공통, 개별 `Tab` 의 선택 밑줄과는 별개).
 * - 배경 normal: `bg-bg-neutral-normal`. 배경 blur: `bg-bg-overlay-whiteSubtle
 *   backdrop-blur-header`(`Header.tsx` 와 동일).
 * - 좌우 패딩 `--sz-20`, 탭 아이템 간 gap `--sz-10`.
 * - `layout=fit`: `items-end`(하단 정렬, 각 탭 콘텐츠 폭). `layout=full`: `items-center
 *   justify-center` + 각 탭 `flex-1`(균등 stretch, `[&>*]:flex-1` 로 자식에 직접 적용).
 *
 * 색은 전부 semantic 토큰 유틸, 간격은 `var(--sz-*)`, 구분선 두께는 `var(--border-width-*)`
 * 로만 지정한다 — 하드코딩 없음.
 */

import type { ReactNode } from "react";

export type TabsType = "link" | "focus";
export type TabsLayout = "fit" | "full";
export type TabsSize = "sm" | "md";
export type TabsVariant = "normal" | "blur";

export interface TabsProps {
  /** 시맨틱 동작 축(Figma `type`). 시각 영향 없음. 기본 'link' */
  type?: TabsType;
  /** 정렬/너비 축(Figma `layout`). 기본 'fit' */
  layout?: TabsLayout;
  /** 크기 축(Figma `size`) — 나열하는 각 `Tab` 에도 동일한 값을 넘겨야 한다. 기본 'sm' */
  size?: TabsSize;
  /** 배경 축(Figma `variant`). 기본 'normal' */
  variant?: TabsVariant;
  /** `<Tab>` 인스턴스들. */
  children: ReactNode;
  /** 루트 `<nav>` 접근성 라벨. */
  "aria-label"?: string;
  /** 루트에 병합할 클래스. */
  className?: string;
}

/** variant 별 배경(Figma 검증, `variant="blur"` 는 `Header` 와 동일한 토큰 조합). */
const VARIANT_BG: Record<TabsVariant, string> = {
  normal: "bg-bg-neutral-normal",
  blur: "bg-bg-overlay-whiteSubtle backdrop-blur-header",
};

/** layout 별 정렬(Figma 검증). full 은 자식 `Tab` 을 직접 stretch 시킨다. */
const LAYOUT_CLASS: Record<TabsLayout, string> = {
  fit: "items-end",
  full: "items-center justify-center [&>*]:flex-1",
};

export function Tabs({
  type = "link",
  layout = "fit",
  size = "sm",
  variant = "normal",
  children,
  className,
  "aria-label": ariaLabel,
}: TabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      data-type={type}
      data-layout={layout}
      data-size={size}
      data-variant={variant}
      className={[
        "flex w-full gap-(--sz-10) border-b-[length:var(--border-width-xs)]",
        "border-solid border-border-neutral-bright px-(--sz-20)",
        VARIANT_BG[variant],
        LAYOUT_CLASS[layout],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </nav>
  );
}
