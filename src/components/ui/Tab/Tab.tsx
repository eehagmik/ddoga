/**
 * 개별 탭 아이템(Tab).
 *
 * Figma "또가3.0 Design System / Tabs" 내부 `_parts/Tab` (node 51405:133812) 와 1:1.
 * `Tabs` 컨테이너 안에 나열해 쓰는 밑줄(underline) 인디케이터형 탭 아이템이다.
 *
 * 축(Figma variant → props):
 * - `size`: sm/md — 타이포·밑줄 두께가 바뀐다(패딩은 size 무관 동일).
 * - `selected`: false/true — 라벨 색·굵기·밑줄 색이 바뀐다.
 *
 * 태그 선택(`Tabs` `type` 축과 연동):
 * - `href` 를 넘기면 `<a href>` 로 렌더된다 — `Tabs type="link"`(클릭 시 다른 페이지로 이동) 용도.
 * - `href` 를 넘기지 않으면 `<button type="button">` 으로 렌더된다 — `Tabs type="focus"`
 *   (같은 페이지 안에서 스크롤 이동, `selected` 는 상위에서 스크롤 위치에 따라 controlled 로 넘김) 용도.
 * - 이 컴포넌트는 스크롤 스파이 로직 자체를 갖지 않는다(순수 presentational) — 관찰·이동 로직은
 *   호출부 책임이다.
 * - ARIA 는 `role="tab"` 이 아니라 `aria-current`(선택된 탭)만 쓴다 — 페이지 이동/스크롤 이동
 *   모두 "탭 모양 내비게이션"이지 별도 tabpanel 을 전환하는 위젯이 아니라서, WAI-ARIA APG 가
 *   권장하는 tab 위젯 패턴(role=tab/tablist) 대상이 아니다.
 *
 * 상태 규칙(Figma 검증, 레이아웃 시프트 방지):
 * - 밑줄은 `border-b` 로 selected 여부와 무관하게 항상 두께를 확보하고, 색만
 *   `border-transparent` ↔ `border-border-brand-normal` 로 전환한다(`Radio`/`Switch` 선례와
 *   동일한 "폭 고정, 색만 전환" 패턴).
 *
 * size 별 토큰(Figma 검증):
 * | size | 타이포(normal/selected)        | 밑줄 두께             |
 * | sm   | text-body-3 / text-body-3-bold | border-width-sm(2px) |
 * | md   | text-body-2 / text-body-2-bold | border-width-md(3px) |
 * 패딩: `px-(--sz-6) py-(--sz-12)`(size 무관 공통).
 * 라벨 색: subtle(`text-typo-neutral-subtle`) ↔ normal(`text-typo-neutral-normal`).
 *
 * 색은 전부 semantic 토큰 유틸, 크기·간격은 `var(--sz-*)`, 밑줄 두께는 `var(--border-width-*)`
 * 로만 지정한다 — 하드코딩 없음.
 */

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type TabSize = "sm" | "md";

interface TabOwnProps {
  /** 라벨(필수, Figma `label`). */
  children: ReactNode;
  /** 크기 축(Figma `size`). 기본 'md' */
  size?: TabSize;
  /** 선택 상태(Figma `selected`). 기본 false */
  selected?: boolean;
  /** 루트 요소에 병합할 클래스. */
  className?: string;
}

type TabLinkProps = TabOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    /** 지정하면 `<a>` 로 렌더된다(`Tabs type="link"` 용). */
    href: string;
  };

type TabButtonProps = TabOwnProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children" | "type"
  > & {
    href?: undefined;
  };

export type TabProps = TabLinkProps | TabButtonProps;

/** size → 라벨 타이포(일반/선택). */
const SIZE_TEXT: Record<TabSize, { normal: string; selected: string }> = {
  sm: { normal: "text-body-3", selected: "text-body-3-bold" },
  md: { normal: "text-body-2", selected: "text-body-2-bold" },
};

/** size → 밑줄 두께(Figma 실측: sm 2px / md 3px). selected 여부와 무관하게 항상 확보한다. */
const SIZE_UNDERLINE_WIDTH: Record<TabSize, string> = {
  sm: "border-b-[length:var(--border-width-sm)]",
  md: "border-b-[length:var(--border-width-md)]",
};

const TAB_BASE =
  "inline-flex shrink-0 items-center justify-center border-solid " +
  "px-(--sz-6) py-(--sz-12) whitespace-nowrap " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:opacity-(--alpha-80) " +
  "active:opacity-(--alpha-80) disabled:cursor-not-allowed " +
  "[font-feature-settings:var(--font-feature-case)]";

export function Tab({
  children,
  size = "md",
  selected = false,
  className,
  href,
  ...rest
}: TabProps) {
  const classes = [
    TAB_BASE,
    SIZE_UNDERLINE_WIDTH[size],
    selected ? SIZE_TEXT[size].selected : SIZE_TEXT[size].normal,
    selected
      ? "border-border-brand-normal text-typo-neutral-normal"
      : "border-transparent text-typo-neutral-subtle",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const sharedProps = {
    "data-size": size,
    "data-selected": selected,
    "aria-current": selected ? ("true" as const) : undefined,
    className: classes,
  };

  if (href !== undefined) {
    return (
      <a
        href={href}
        {...sharedProps}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      {...sharedProps}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
