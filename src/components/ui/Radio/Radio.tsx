/**
 * 라디오 표시 요소(Radio).
 *
 * Figma "또가3.0 Design System / Radio" (node 51405:128241) 와 1:1.
 * 라벨·히트영역 없이 "선택 상태 원" 시각만 담당하는 ATOM 이다.
 * 상위 몰리큘(RadioWithLabel · RadioCard)이 이 아톰을 조합해 실제 입력·라벨 연결을 처리한다.
 * `Checkbox` 아톰(node 51405:45384)과 같은 설계 원칙을 따른다.
 *
 * - 순수 시각 프리미티브다. `<span>` 하나만 렌더하며 native `<input>`·`onChange`·포커스 관리가 없다
 *   (`Checkbox`/`Dot` 선례와 동일). 상호작용 의미는 부모가 부여한다.
 * - `checked` / `disabled` 는 props. `hover` 는 상태 prop 이 아니다 — 루트 배경은 `hover:`(단독 사용)와
 *   `group-hover:`(조상 `.group` 이 hover 될 때, 예: `RadioWithLabel` 의 `<label class="group">`)를
 *   함께 부여하고, 내부 점(dot) 틴트는 `group-hover:` 로만 반응한다. Figma 에 focus·pressed 없음.
 * - 색·크기·radius·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 * - `variant`(circle/square/mark) 축이 없다 — Radio 는 항상 원형이다(`Checkbox` 대비 차이).
 * - 내부 점(`circle_solid`)은 단순 채워진 원이라 `Checkbox` 의 `CheckMark` 처럼 커스텀 path 를 그릴
 *   필요가 없다 — 배경색이 있는 `<span className="rounded-full">` 로 표현한다.
 *
 * 축(Figma property → props):
 * - `size`   : sm(22) / md(24) / lg(28), 내부 점 sm(10) / md(12) / lg(14)
 * - `checked`: true / false
 * - `state`  : enable(기본) / hover(→ `hover:` + `group-hover:`) / disabled(→ `disabled` prop)
 *
 * 상태별 색상(Figma node 51405:128241 검증 — SVG 원본을 다운로드해 점(dot) fill hex 를 토큰과 대조):
 * | checked | state    | 배경                   | 테두리                      | 점(dot)                                |
 * | false   | enable   | bg/neutral/normal     | border/neutral/light 2px    | icon/brandGrayish/light @40%(#c2ccc7)  |
 * | false   | hover    | bg/brandGrayish/deep  | border/neutral/light 2px    | icon/brandGrayish/subtle @40%(#a6b3ad) |
 * | false   | disabled | bg/disabled/subtle    | border/disabled/normal 2px  | icon/disabled/light 불투명(#d9d9d9)    |
 * | true    | enable   | bg/brand/normal       | 없음                         | icon/inverse/normal(흰색) 불투명       |
 * | true    | hover    | bg/brand/deep         | 없음                         | icon/inverse/normal(흰색) 불투명       |
 * | true    | disabled | bg/disabled/deep      | 없음                         | icon/inverse/normal(흰색) 불투명       |
 *
 * `Checkbox` 대비 차이(Figma 실측 — 추측 아님):
 * - checked+disabled 배경이 `bg/disabled/deep`(Checkbox 는 `bg/disabled/normal`).
 * - disabled 상태의 점은 `opacity-40%` 를 적용하지 않는다(Checkbox 의 체크마크는 disabled 에도 40% 유지) —
 *   Figma SVG 원본이 이미 흐린 색(#d9d9d9)/흰색으로 구워져 있어 추가 opacity 가 불필요하다.
 *
 * `border-sm border-solid` 는 checked 여부와 무관하게 루트에 항상 적용하고, checked 상태의
 * border-color 만 `border-transparent` 로 명시한다(폭은 항상 2px 로 고정). Tailwind preflight 는
 * border-width 기본값 0 · border-color 기본값 `currentColor` 를 깔아두므로, checked 상태에 border
 * 유틸리티를 아예 생략하면 `checked → unchecked` 전환 시 폭이 0→2px 로 순간 점프하는 동시에
 * `transition-colors`(border-color 포함)가 `currentColor`(상속된 텍스트색, 검정 계열)에서 목표색으로
 * 전이하며 검은 테두리가 깜빡이는 버그가 있었다 — `box-sizing: border-box` + 기본
 * `background-clip: border-box` 덕분에 투명 테두리는 배경이 그대로 비쳐 보여 외형 변화는 없다.
 */

export type RadioSize = "sm" | "md" | "lg";

export interface RadioProps {
  /** 크기 축. 기본 'md' */
  size?: RadioSize;
  /** 선택 여부. 기본 false */
  checked?: boolean;
  /** 비활성 여부. 기본 false */
  disabled?: boolean;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/**
 * 공통 루트 — 중앙정렬 · 축소 방지 · 원형 · 색 전이. (`group` 은 붙이지 않는다 — 조상 `.group` 에 hover 를 위임)
 * `border-sm border-solid` 는 checked 여부와 무관하게 항상 적용(폭 고정) — checked 상태의 색은
 * `colors()` 가 `border-transparent` 로 지정한다. 이유는 파일 상단 JSDoc 참고.
 */
const ROOT_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-circle border-sm border-solid " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** 내부 점 공통 — 원형 · 색 전이 */
const DOT_BASE_CLASS =
  "rounded-circle transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** 박스 정사각(Figma: scale/22·24·28) */
const BOX_SIZE_CLASS: Record<RadioSize, string> = {
  sm: "size-(--sz-22)",
  md: "size-(--sz-24)",
  lg: "size-(--sz-28)",
};

/** 내부 점 정사각(Figma: scale/10·12·14) */
const DOT_SIZE_CLASS: Record<RadioSize, string> = {
  sm: "size-(--sz-10)",
  md: "size-(--sz-12)",
  lg: "size-(--sz-14)",
};

/** (container, dot) 클래스 묶음 */
interface StateClass {
  container: string;
  dot: string;
}

/** (checked, disabled) → 컨테이너 / 점 클래스. hover 는 `hover:`(단독) + `group-hover:`(조상 hover)로만. */
function colors(checked: boolean, disabled: boolean): StateClass {
  if (disabled) {
    return checked
      ? {
          container: "bg-bg-disabled-deep border-transparent",
          dot: "bg-icon-inverse-normal",
        }
      : {
          container: "bg-bg-disabled-subtle border-border-disabled-normal",
          dot: "bg-icon-disabled-light",
        };
  }
  return checked
    ? {
        container:
          "bg-bg-brand-normal border-transparent hover:bg-bg-brand-deep group-hover:bg-bg-brand-deep",
        dot: "bg-icon-inverse-normal",
      }
    : {
        container:
          "bg-bg-neutral-normal border-border-neutral-light hover:bg-bg-brandGrayish-deep group-hover:bg-bg-brandGrayish-deep",
        dot: "bg-icon-brandGrayish-light group-hover:bg-icon-brandGrayish-subtle opacity-(--alpha-40)",
      };
}

export function Radio({
  size = "md",
  checked = false,
  disabled = false,
  className,
}: RadioProps) {
  const { container, dot } = colors(checked, disabled);

  return (
    <span
      data-size={size}
      data-checked={checked}
      data-state={disabled ? "disabled" : "enable"}
      className={[ROOT_CLASS, BOX_SIZE_CLASS[size], container, className]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden
        className={[DOT_BASE_CLASS, DOT_SIZE_CLASS[size], dot].join(" ")}
      />
    </span>
  );
}
