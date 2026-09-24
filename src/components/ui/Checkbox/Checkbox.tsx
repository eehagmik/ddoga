/**
 * 체크박스 표시 요소(Checkbox).
 *
 * Figma "또가3.0 Design System / Checkbox" (node 51405:45384) 와 1:1.
 * 라벨·히트영역 없이 "체크 상태 상자" 시각만 담당하는 ATOM 이다.
 * 상위 몰리큘(CheckboxWithLabel · CheckboxCard)이 이 아톰을 조합해 실제 입력·라벨 연결을 처리한다.
 *
 * - 순수 시각 프리미티브다. `<span>` 하나만 렌더하며 native `<input>`·`onChange`·포커스 관리가 없다
 *   (`Dot` 선례와 동일). 상호작용 의미는 부모가 부여한다.
 * - `checked` / `disabled` 는 props. `hover` 는 상태 prop 이 아니다 — 루트 배경은 `hover:`(단독 사용)와
 *   `group-hover:`(조상 `.group` 이 hover 될 때, 예: `CheckboxWithLabel` 의 `<label class="group">`)를
 *   함께 부여하고, 내부 체크마크 틴트는 `group-hover:` 로만 반응한다. Figma 에 focus·pressed·indeterminate 없음.
 * - 색·크기·radius·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 * - 체크마크(`_checkboxImage` / `Union`)는 파운데이션 아이콘셋에 없는 커스텀 벡터라
 *   비공개 `CheckMark` 헬퍼로 인라인한다(`BlankIcon` 선례). `fill="currentColor"` 로
 *   부모의 `text-icon-*` 색을 상속한다.
 *
 * 축(Figma variant → props):
 * - `variant`: circle / square / mark  (mark 는 상자·테두리 없이 체크마크만)
 * - `size`   : sm(22) / md(24) / lg(28)
 * - `checked`: true / false
 * - `state`  : enable(기본) / hover(→ `hover:` + `group-hover:`) / disabled(→ `disabled` prop)
 *
 * 상태별 색상(Figma node 51405:45384 검증. circle·square 동일, 모양만 다름):
 * | checked | state    | 배경                        | 테두리                      | 체크마크                    |
 * | false   | enable   | bg/neutral/normal          | border/neutral/light 2px    | icon/brandGrayish/light @40%|
 * | false   | hover    | bg/brandGrayish/deep       | border/neutral/light 2px    | icon/brandGrayish/subtle@40%|
 * | false   | disabled | bg/disabled/subtle         | border/disabled/normal 2px  | icon/disabled/normal @40%   |
 * | true    | enable   | bg/brand/normal            | 없음                        | icon/inverse/normal         |
 * | true    | hover    | bg/brand/deep              | 없음                        | icon/inverse/normal         |
 * | true    | disabled | bg/disabled/normal         | 없음                        | icon/inverse/normal         |
 *
 * mark(상자·테두리·40% 불투명도 없음):
 * | checked | state    | 체크마크                 |
 * | false   | enable   | icon/brandGrayish/light  |
 * | false   | hover    | icon/brandGrayish/subtle |
 * | false   | disabled | icon/disabled/light      |
 * | true    | enable   | icon/brand/normal        |
 * | true    | hover    | icon/brand/deep          |
 * | true    | disabled | icon/disabled/subtle     |
 */

export type CheckboxVariant = "circle" | "square" | "mark";
export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps {
  /** 모양 축. mark 는 상자 없이 체크마크만. 기본 'circle' */
  variant?: CheckboxVariant;
  /** 크기 축. 기본 'md' */
  size?: CheckboxSize;
  /** 체크 여부. 기본 false */
  checked?: boolean;
  /** 비활성 여부. 기본 false */
  disabled?: boolean;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** 공통 루트 — 중앙정렬 · 축소 방지 · 색 전이. (`group` 은 붙이지 않는다 — 조상 `.group` 에 hover 를 위임) */
const ROOT_CLASS =
  "inline-flex shrink-0 items-center justify-center " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** 글리프 공통 — 색 전이 */
const GLYPH_BASE_CLASS =
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** circle/square 박스 정사각 (Figma: scale/22·24·28) */
const BOX_SIZE_CLASS: Record<CheckboxSize, string> = {
  sm: "size-[var(--sz-22)]",
  md: "size-[var(--sz-24)]",
  lg: "size-[var(--sz-28)]",
};

/** circle/square 내부 체크마크 글리프 정사각 (sm 16 / md 18 / lg 20 로 정규화) */
const GLYPH_SIZE_CLASS: Record<CheckboxSize, string> = {
  sm: "size-[var(--sz-16)]",
  md: "size-[var(--sz-18)]",
  lg: "size-[var(--sz-20)]",
};

/** mark 는 상자 없이 글리프가 박스 크기(sm 22 / md 24 / lg 28)를 채운다 */
const MARK_SIZE_CLASS: Record<CheckboxSize, string> = {
  sm: "size-[var(--sz-22)]",
  md: "size-[var(--sz-24)]",
  lg: "size-[var(--sz-28)]",
};

/** variant 별 모서리 (mark 는 상자 없음) */
const SHAPE_CLASS: Record<CheckboxVariant, string> = {
  circle: "rounded-circle",
  square: "rounded-sm",
  mark: "",
};

/** (variant, checked, disabled) → 컨테이너 / 글리프 클래스 묶음 */
interface StateClass {
  container: string;
  glyph: string;
}

/** circle·square 공통 색상. hover 는 `group-hover:` 로만(부모 hover 전파). */
function boxColors(checked: boolean, disabled: boolean): StateClass {
  if (disabled) {
    return checked
      ? {
          container: "bg-bg-disabled-normal",
          glyph: "text-icon-inverse-normal",
        }
      : {
          container:
            "bg-bg-disabled-subtle border-sm border-solid border-border-disabled-normal",
          glyph: "text-icon-disabled-normal opacity-[var(--alpha-40)]",
        };
  }
  return checked
    ? {
        container:
          "bg-bg-brand-normal hover:bg-bg-brand-deep group-hover:bg-bg-brand-deep",
        glyph: "text-icon-inverse-normal",
      }
    : {
        container:
          "bg-bg-neutral-normal border-sm border-solid border-border-neutral-light hover:bg-bg-brandGrayish-deep group-hover:bg-bg-brandGrayish-deep",
        glyph:
          "text-icon-brandGrayish-light group-hover:text-icon-brandGrayish-subtle opacity-[var(--alpha-40)]",
      };
}

/** mark 색상 — 상자·테두리·40% 불투명도 없음. */
function markColors(checked: boolean, disabled: boolean): StateClass {
  if (disabled) {
    return {
      container: "",
      glyph: checked ? "text-icon-disabled-subtle" : "text-icon-disabled-light",
    };
  }
  return {
    container: "",
    glyph: checked
      ? "text-icon-brand-normal hover:text-icon-brand-deep group-hover:text-icon-brand-deep"
      : "text-icon-brandGrayish-light hover:text-icon-brandGrayish-subtle group-hover:text-icon-brandGrayish-subtle",
  };
}

/**
 * Figma `_checkboxImage` 의 `Union` 벡터(두꺼운 체크마크).
 * 파운데이션 아이콘셋(`src/icons`)에 형태가 일치하는 글리프가 없어 인라인 SVG 로 렌더한다.
 * `fill="currentColor"` 라 색은 부모의 `text-icon-*` 를 상속한다. 항상 장식용이라 `aria-hidden`.
 */
function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      focusable={false}
      aria-hidden
      className={className}
    >
      <path
        d="M20.4777 6.02235C19.7812 5.32588 18.6284 5.32588 17.932 6.02235L9.5984 14.3559L6.06805 10.8256C5.37158 10.1291 4.21881 10.1291 3.52235 10.8256C2.82588 11.522 2.82588 12.6748 3.52235 13.3712L8.32555 18.1745C8.66177 18.5107 9.11808 18.7028 9.5984 18.7028C10.0787 18.7028 10.535 18.5107 10.8712 18.1745L20.4777 8.56805C21.1741 7.87158 21.1741 6.71881 20.4777 6.02235Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Checkbox({
  variant = "circle",
  size = "md",
  checked = false,
  disabled = false,
  className,
}: CheckboxProps) {
  const isMark = variant === "mark";
  const { container, glyph } = isMark
    ? markColors(checked, disabled)
    : boxColors(checked, disabled);

  return (
    <span
      data-variant={variant}
      data-size={size}
      data-checked={checked}
      data-state={disabled ? "disabled" : "enable"}
      className={[
        ROOT_CLASS,
        isMark ? MARK_SIZE_CLASS[size] : BOX_SIZE_CLASS[size],
        SHAPE_CLASS[variant],
        container,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CheckMark
        className={[
          GLYPH_BASE_CLASS,
          isMark ? MARK_SIZE_CLASS[size] : GLYPH_SIZE_CLASS[size],
          glyph,
        ].join(" ")}
      />
    </span>
  );
}
