/**
 * 메뉴 항목(MenuItem).
 *
 * Figma "또가3.0 Design System / MenuItem" (node 51405:126122) 와 1:1.
 * 세로로 쌓이는 메뉴/리스트에 쓰는 행(row) 프리미티브 — 좌측 라벨 + 우측
 * 보조 콘텐츠 슬롯 구조다. `HorizontalMenuButton`(가로 버튼, chevron 포함)과는
 * 별개 컴포넌트로 유지한다(사용자 확정 사항) — MenuItem 에는 chevron 이 없고,
 * 우측 슬롯이 icon/graphic/중첩 Chip 까지 4갈래로 갈린다는 점이 다르다.
 *
 * 축(Figma variant → props):
 * - `variant` : text / icon / graphic / chip — 우측 슬롯의 종류.
 * - `size`    : xs / sm / md / lg.
 * - hover / focus 는 상태이므로 props 가 아니라 CSS 의사클래스로 처리.
 * - disabled  : Figma `state=disabled` → boolean prop(Chip/Switch 선례와 동일 컨벤션).
 *
 * 변경 이력(2026-09-13, 사용자가 Figma 원본을 두 차례 직접 수정):
 * 1. (1차, 당시 미완 상태로 남음) disabled 일 때 우측에 중첩된 컨트롤에도 disabled
 *    스타일을 적용하도록 시도 — 그 시점엔 우측 컨트롤이 `ButtonWithLabel` 이었고,
 *    "`ButtonWithLabel` 노드에 `opacity: 60%` 가 걸림" 까지 조사되었으나 세션이
 *    끊겨 코드에는 반영되지 못했다.
 * 2. (2차, 이번 변경) `variant="button"` 을 `variant="chip"` 으로 개명하고, 우측
 *    중첩 컴포넌트를 `ButtonWithLabel` 에서 `Chip` 으로 전면 교체했다. 이 교체로
 *    1차의 "중첩 컨트롤 disabled 전파" 논의는 무효가 되었다 — Figma 실측 결과
 *    (`get_design_context`, `variant=chip` 의 `state=enable` 과 `state=disabled`
 *    노드) 상 중첩 `Chip` 은 두 상태에서 완전히 동일한 마크업/클래스를 갖는다
 *    (배경색·불투명도·아이콘 전부 동일). 즉 disabled 시 변하는 건 좌측 라벨
 *    텍스트 색상뿐이고, `Chip` 은 어떤 형태로든(불투명도 포함) 영향을 받지 않는다.
 *    `Chip` 컴포넌트 자체에 `disabled` prop 이 없다는 사실과도 정합적이다 —
 *    별도 래퍼 오버라이드(예: `opacity-(--alpha-60)`)를 씌울 필요가 없다.
 *
 * 구조 결정(루트 엘리먼트 타입, Figma 에 없는 부분 — 사용자 승인 사항, 2차 변경으로 갱신):
 * 이전에는 `variant="button"` 이 실제 `<button>`(`ButtonWithLabel`)을 중첩해서
 * 루트도 `<button>` 이면 `<button><button /></button>` 무효 HTML이 되는 문제가
 * 있어 루트를 `<div>` 로 분기했었다. `Chip` 은 `deletable=true` 일 때만 내부에
 * 실제 `<button>`(삭제 버튼)을 렌더하는데, 이 컴포넌트는 `deletable` 을 노출하지
 * 않고 항상 기본값(`false`)으로 렌더하므로 중첩 `Chip` 은 이 컨텍스트에서 절대
 * `<button>` 을 포함하지 않는다(내부는 항상 `<span>`). 따라서 `<button>` 중첩
 * 충돌이 재발하지 않아, 루트를 4개 variant 전부 동일하게 `<button>` 으로
 * 되돌렸다(div/PASSIVE_ROOT 분기 제거) — hover/focus-visible/disabled 모두
 * 네이티브 `<button>` 의사클래스 하나로 처리해 코드가 단순해진다.
 * `inner`(라벨+슬롯 래퍼)의 focus 시 60% 투명도는 **자손**이므로 `group-focus-visible:`
 * 로 건다(`group-*` 를 루트 자신에게 걸면 셀프 적용이 안 되는 버그 패턴 — CheckboxCard 선례).
 *
 * size 별 토큰(Figma 검증):
 * | size | 높이      | 좌우 padding | 타이포       | 아이콘/그래픽 슬롯 |
 * | xs   | --sz-44  | --sz-12     | text-body-4 | --sz-20           |
 * | sm   | --sz-48  | --sz-14     | text-body-4 | --sz-20           |
 * | md   | --sz-46  | --sz-16     | text-body-3 | --sz-24           |
 * | lg   | --sz-50  | --sz-16     | text-body-3 | --sz-24           |
 * 공통: inner gap `--sz-8`.
 *
 * 색(Figma 검증): 배경 enable/disabled `bg-neutral-normal`, hover/focus `bg-neutral-deep`.
 * 라벨 enable/hover/focus `typo-neutral-normal`, disabled `typo-disabled-normal`.
 *
 * `variant="chip"` 의 중첩 `Chip`(Figma 검증, node 51405:126122 하위 chip 계열 인스턴스):
 * `color="brand"` `variant="fill"` 고정 — enable/hover/focus/disabled 모든 상태에서
 * 완전히 동일하다(별도 상태 반응 없음). 라벨은 `chipLabel` prop(기본 "Label")으로
 * 커스터마이즈한다. leading 아이콘은 Figma 데모상 "blank" 플레이스홀더가 항상
 * 보이지만, 다른 BlankIcon/BlankGraphic 슬롯과 동일한 원칙(플레이스홀더는 Storybook
 * 데모 전용, 컴포넌트 자체엔 하드코딩하지 않음)에 따라 `Chip` 의 `startSlot` 은
 * 넘기지 않는다(이전 `ButtonWithLabel` 사용 때도 아이콘을 넣지 않았던 것과 동일한
 * 범위). size 는 `xs` 고정 — Figma 실측 높이가 MenuItem xs/sm 에서는 26px(Chip
 * `xs` 와 정확히 일치), md/lg 에서는 24px(Chip 공식 사이즈 `xs`(26)/`sm`(32) 어디에도
 * 없는 값)로 나타나는데, `sm`(32)과는 8px 차이로 명백히 다른 반면 `xs`(26)와는 2px
 * 차이에 불과해 인스턴스 리사이즈 오차로 판단했다. Figma 컴포넌트 설명에도 "Button
 * 의 사이즈는 변경할 수 없습니다" 라는 문구가 남아 있어(개명 전 문구가 그대로
 * 남아있는 것으로 보이나, 의도는 유지됨) 중첩 컨트롤의 사이즈를 MenuItem `size` 에
 * 따라 가변시키지 않는다는 원 설계 의도와도 일치한다 — 이 컴포넌트는 모든
 * MenuItem `size` 에 대해 `Chip` `size="xs"` 로 고정한다.
 *
 * `variant="icon"`/`variant="graphic"` 의 우측 슬롯은 `children` 으로 노출한다
 * (`IconButton`/`HorizontalMenuButton` 선례처럼 BlankIcon/BlankGraphic 은 Storybook
 * 데모에서만 채워 넣고, 컴포넌트 자체는 슬롯만 제공한다). 라벨 텍스트는 `label` prop
 * (기본 "Label")으로 별도 노출한다 — `VerticalMenuButton` 선례(슬롯=children, 텍스트=label)
 * 를 따른다(HorizontalMenuButton 처럼 children=라벨로 하면 icon/graphic 우측 슬롯과 겹친다).
 * `variant="icon"` 슬롯은 기본색 `text-icon-neutral-bright`(사용자 확정) — `fill="currentColor"`
 * 아이콘을 끼우면 이 색을 상속하고, children 쪽에서 자체 색 클래스를 주면 그게 우선한다.
 *
 * 색·크기·간격은 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

import type { HTMLAttributes, ReactNode } from "react";

import { Chip } from "../Chip";

export type MenuItemVariant = "text" | "icon" | "graphic" | "chip";
export type MenuItemSize = "xs" | "sm" | "md" | "lg";

export interface MenuItemProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** 우측 슬롯 종류(Figma variant). 기본 'text' */
  variant?: MenuItemVariant;
  /** 크기 축. 기본 'md' */
  size?: MenuItemSize;
  /** 비활성 여부(Figma state=disabled). 기본 false */
  disabled?: boolean;
  /** 라벨 텍스트. 기본 "Label" */
  label?: string;
  /** `variant="icon"`/`"graphic"` 전용 우측 슬롯 콘텐츠. 없으면 미렌더. */
  children?: ReactNode;
  /** `variant="chip"` 전용, 중첩 `Chip` 라벨. 기본 "Label" */
  chipLabel?: string;
}

/** 루트 공통 — 레이아웃 + 배경 + hover/focus-visible/disabled(모든 variant 가 `<button>` 이라 group- 접두사 없음). */
const ROOT =
  "group flex w-full items-center gap-(--sz-8) bg-bg-neutral-normal " +
  "[font-feature-settings:var(--font-feature-case)] transition-colors cursor-pointer " +
  "hover:bg-bg-neutral-deep focus-visible:bg-bg-neutral-deep focus-visible:outline-none " +
  "disabled:pointer-events-none disabled:cursor-not-allowed";

/** size 별 높이(Figma 실측, `min-h` 아닌 고정 `h`). */
const SIZE_HEIGHT: Record<MenuItemSize, string> = {
  xs: "h-(--sz-44)",
  sm: "h-(--sz-48)",
  md: "h-(--sz-46)",
  lg: "h-(--sz-50)",
};

/** size 별 좌우 padding. */
const SIZE_PADDING_X: Record<MenuItemSize, string> = {
  xs: "px-(--sz-12)",
  sm: "px-(--sz-14)",
  md: "px-(--sz-16)",
  lg: "px-(--sz-16)",
};

/** size 별 라벨 타이포(xs·sm 은 body-4, md·lg 는 body-3 — Figma 실측 2단). */
const SIZE_TYPO: Record<MenuItemSize, string> = {
  xs: "text-body-4",
  sm: "text-body-4",
  md: "text-body-3",
  lg: "text-body-3",
};

/** size 별 icon/graphic 정사각 슬롯 크기. */
const SIZE_SLOT: Record<MenuItemSize, string> = {
  xs: "size-(--sz-20)",
  sm: "size-(--sz-20)",
  md: "size-(--sz-24)",
  lg: "size-(--sz-24)",
};

/** 중첩 `Chip` size — MenuItem `size` 와 무관하게 고정(Figma 실측 근거는 상단 JSDoc 참고). */
const CHIP_SIZE = "xs" as const;

export function MenuItem({
  variant = "text",
  size = "md",
  disabled = false,
  label = "Label",
  children,
  chipLabel = "Label",
  className,
  ...rest
}: MenuItemProps) {
  const isChipVariant = variant === "chip";
  const labelColor = disabled
    ? "text-typo-disabled-normal"
    : "text-typo-neutral-normal";

  const inner = (
    <span
      data-name="inner"
      className="flex min-w-0 flex-1 items-center gap-(--sz-8) group-focus-visible:opacity-(--alpha-60)"
    >
      <span
        className={[
          "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left",
          SIZE_TYPO[size],
          labelColor,
        ].join(" ")}
      >
        {label}
      </span>
      {isChipVariant ? (
        <Chip color="brand" variant="fill" size={CHIP_SIZE}>
          {chipLabel}
        </Chip>
      ) : variant === "text" ? null : (
        <span
          data-name={variant === "icon" ? "BlankIcon" : "BlankGraphic"}
          className={[
            "flex shrink-0 items-center justify-center",
            SIZE_SLOT[size],
            variant === "icon" ? "text-icon-neutral-bright" : "",
          ].join(" ")}
        >
          {children}
        </span>
      )}
    </span>
  );

  const rootClassName = [
    ROOT,
    SIZE_HEIGHT[size],
    SIZE_PADDING_X[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={rootClassName}
      {...rest}
    >
      {inner}
    </button>
  );
}
