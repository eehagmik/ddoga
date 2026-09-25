/**
 * Searchbar — 검색 입력 필드 겸 검색 페이지 진입 트리거.
 *
 * Figma "또가3.0 Design System / Searchbar" (문서 node 51405:130482, 컴포넌트 세트
 * node 51405:130536) 와 1:1. 내부 "값 영역"(`_parts/Searchbar`, node 51405:130517)은
 * 재사용처가 이 컴포넌트 하나뿐이라 별도 파일 없이 인라인했다.
 *
 * 축(Figma variant → props):
 * - `variant` : header(38, 배경만) / body(46, 배경+테두리). size 축이 아니라 배치 맥락이다.
 * - `state`   : button / enable / focus / hover — Figma 4심볼 중 `button`과 `enable`은
 *   스타일이 완전히 동일하고 DOM만 다르다("button"은 실제 입력 기능 없이 검색 페이지로
 *   이동을 유도하는 트리거, "enable"부터 실제 입력). 그래서 스타일 분기 대신 `asButton`
 *   prop 으로 엘리먼트 자체를 스왑한다(`asButton=true` → `<button>`, 기본 `false` →
 *   `<input>`). `hover`/`focus`는 상태이므로 props 가 아니라 CSS 의사클래스
 *   (`hover:`, `focus-within:`)로 처리한다(Chip·Checkbox 선례).
 * - Figma 에 `disabled` 축 없음 → 추가하지 않았다.
 *
 * 좌측 아이콘은 non-interactive 표시용이며 `asButton` 여부와 무관하게 항상 `search_md_line`
 * 이다. 우측 clear 버튼(`ClearButton size="sm"` 재사용)은 `asButton=false`이고 `value`가
 * 있을 때만 노출된다(Figma `_parts` `hasValue` 축). 애니메이션 캐럿(purple/500, semantic
 * 토큰이 없는 Figma 전용 아티팩트)은 렌더하지 않고 네이티브 `<input>` caret 에 맡긴다.
 *
 * 토큰 매핑 (Figma 검증):
 * | variant | 높이       | padding                              | 배경(enable/button)  | 배경(hover)         | 테두리(enable/button)        | 테두리·아이콘(hover/focus)                  |
 * | ------- | ---------- | ------------------------------------- | --------------------- | -------------------- | ------------------------------ | --------------------------------------------- |
 * | header  | `--sz-38`  | `px --sz-14`                          | `bg-bg-neutral-deep`  | `bg-bg-neutral-dark` | 없음                            | 배경만 hover 로 전환(아이콘 색 불변)          |
 * | body    | `--sz-46`  | `px --sz-14` / `py --sz-4`, `border-xs` | `bg-bg-neutral-normal` | 불변                  | `border-border-neutral-light`  | `border-border-brand-normal` + 아이콘 `text-icon-brand-deep` |
 *
 * - 아이콘 ↔ 값 gap: `gap-(--sz-8)`, 컨테이너 radius: `rounded-lg`
 * - 좌측 아이콘: `search_md_line` 18px. header 전 상태 + body enable/button →
 *   `text-icon-neutral-bright`, body hover/focus → `text-icon-brand-deep`
 *   (`group-hover:`/`group-focus-within:` — `focus-within`은 `asButton` 모드의 버튼 자체
 *   포커스도 매치한다).
 * - 타이포: placeholder·입력값·button 라벨 전부 `text-body-3`
 * - 텍스트 색: placeholder & button 라벨 `text-typo-hint-normal` / 입력값 `text-typo-neutral-normal`
 *
 * `asButton` 모드의 키보드 포커스 시각은 Figma에 별도 정의가 없어 `hover`와 동일한
 * 배경/아이콘 톤을 그대로 재사용한다(의도적 재조정 — 키보드 접근성을 위한 최소 피드백).
 *
 * `asButton=true` 일 때 `value`/`onChange`/`onClear`/`onSubmit` 은, `asButton=false`
 * 일 때 `onClick` 은 쓰이지 않는다.
 */

import type { KeyboardEvent, MouseEvent } from "react";

import { Icon } from "../../../icons";
import { ClearButton } from "../ClearButton";

export type SearchbarVariant = "header" | "body";

export interface SearchbarProps {
  /** 배치 맥락(Figma `variant`). 기본 'header' */
  variant?: SearchbarVariant;
  /** true → 실제 입력 없이 `<button>` 트리거로 렌더(Figma `state=button`). 기본 false(`<input>`, `state=enable`부터) */
  asButton?: boolean;
  /** controlled value (`asButton=false`) */
  value?: string;
  /** 입력값 변경 (`asButton=false`) */
  onChange?: (value: string) => void;
  /** placeholder(입력 모드) / 라벨 텍스트(버튼 모드). 기본 '검색' */
  placeholder?: string;
  /** clear 버튼 클릭 시(`asButton=false`이고 `value` 가 있을 때만 clear 버튼이 노출됨) */
  onClear?: () => void;
  /** Enter 키 제출 (`asButton=false`) */
  onSubmit?: (value: string) => void;
  /** 클릭 시(`asButton=true`, 검색 페이지 이동 등) */
  onClick?: () => void;
  /** 접근 가능한 이름. 미지정 시 `placeholder` 를 사용 */
  "aria-label"?: string;
  /** 루트에 병합할 클래스 */
  className?: string;
}

/** 루트 공통 — 레이아웃 + 배경/테두리 전이. `group` 은 아이콘 색 전환(`group-hover:`)에 쓴다. */
const ROOT_BASE =
  "group inline-flex w-full items-center gap-(--sz-8) rounded-lg px-(--sz-14) " +
  "text-body-3 transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** variant 별 높이 · padding · 배경 · 테두리(Figma 검증). */
const VARIANT_ROOT: Record<SearchbarVariant, string> = {
  header:
    "h-(--sz-38) bg-bg-neutral-deep " +
    "hover:bg-bg-neutral-dark focus-within:bg-bg-neutral-dark",
  body:
    "h-(--sz-46) py-(--sz-4) border-xs border-solid bg-bg-neutral-normal " +
    "border-border-neutral-light " +
    "hover:border-border-brand-normal focus-within:border-border-brand-normal",
};

/** variant 별 좌측 아이콘 색(hover/focus 에서만 body 가 brand 톤으로 전환). */
const ICON_COLOR: Record<SearchbarVariant, string> = {
  header: "text-icon-neutral-bright",
  body:
    "text-icon-neutral-bright " +
    "group-hover:text-icon-brand-deep group-focus-within:text-icon-brand-deep",
};

export function Searchbar({
  variant = "header",
  asButton = false,
  value,
  onChange,
  placeholder = "검색",
  onClear,
  onSubmit,
  onClick,
  "aria-label": ariaLabelProp,
  className,
}: SearchbarProps) {
  const ariaLabel = ariaLabelProp ?? placeholder;
  const rootClassName = [ROOT_BASE, VARIANT_ROOT[variant], className]
    .filter(Boolean)
    .join(" ");
  const iconClassName = ["shrink-0", ICON_COLOR[variant]].join(" ");

  if (asButton) {
    return (
      <button
        type="button"
        data-variant={variant}
        data-as-button="true"
        aria-label={ariaLabel}
        onClick={onClick}
        className={[rootClassName, "cursor-pointer text-left"].join(" ")}
      >
        <Icon name="search_md_line" size={18} className={iconClassName} />
        <span className="min-w-0 flex-1 truncate text-typo-hint-normal">
          {placeholder}
        </span>
      </button>
    );
  }

  const hasValue = Boolean(value);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSubmit?.(value ?? "");
    }
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onClear?.();
  };

  return (
    <div
      data-variant={variant}
      data-as-button="false"
      className={rootClassName}
    >
      <Icon name="search_md_line" size={18} className={iconClassName} />
      <input
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 truncate bg-transparent text-body-3 text-typo-neutral-normal outline-none placeholder:text-typo-hint-normal"
      />
      {hasValue ? <ClearButton size="sm" onClick={handleClear} /> : null}
    </div>
  );
}
