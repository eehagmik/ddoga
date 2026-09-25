/**
 * Label — 입력 필드, 폼 요소 위의 라벨 텍스트 요소.
 *
 * Figma "또가3.0 Design System / Label" (node 51405:108505) 와 1:1.
 *
 * size(sm/md) × isBold(false/true) 조합 4가지. 선택적으로 필수 표시(*) + 정보 아이콘 추가.
 * 정보 아이콘은 클릭 가능하며 onInfoClick 핸들러로 Tooltip, BottomSheet 등 overlay 를 트리거할 수 있다.
 *
 * 축(Figma property → props):
 * - `size`     : sm(16px) / md(18px). 기본 'sm'.
 * - `isBold`   : true(Bold 700) / false(Medium 500). 기본 false.
 * - `principal`: true → 빨강 필수표시(*) 렌더. 기본 true.
 * - `info`     : true → 정보 아이콘(info_circle_line) 렌더. 기본 true.
 * - `htmlFor`  : 지정하면 라벨 텍스트를 `<label htmlFor>` 로 렌더해 `<input id>` 와
 *   접근성을 연결한다(`label[for]` ↔ `input[id]`). 생략 시 기존처럼 `<p>` 로 렌더한다
 *   (하위 호환 — 폼 요소와 무관하게 쓰이는 순수 텍스트 라벨 용도).
 * - `infoLabel`: 정보 아이콘 버튼의 `aria-label`. 기본 '정보 보기'
 *   (`TextField` 조합 시엔 '자세히 보기' 등으로 덮어쓸 수 있다).
 *
 * 타이포(Figma 원본):
 * - sm + !bold : Pretendard Medium, 16px, tracking-[-0.16px]
 * - sm + bold  : Pretendard Bold, 16px, tracking-[-0.24px]
 * - md + !bold : Pretendard Medium, 18px, tracking-[-0.18px], line-height 1.47
 * - md + bold  : Pretendard Bold, 18px, tracking-[-0.27px], line-height 1.47
 *
 * 색상:
 * - 라벨 텍스트: typo/neutral/normal (--typo-neutral-normal, #272727)
 * - 필수표시(*): typo/danger/normal (--typo-danger-normal, #f84b55)
 * - 정보 아이콘: icon/info/normal (--color-icon-info-normal, #5383ff — Figma 원본 SVG
 *   에셋의 `fill` 실측값으로 확인. 로컬 `Icon name="info_circle_line"` 컴포넌트를
 *   `currentColor` 로 재사용하고 이 색을 텍스트 색으로 지정한다. 2026-09-17 이전에는
 *   Figma CDN `<img>` 에셋을 그대로 참조했으나, 코드베이스 아이콘 레지스트리에 동일
 *   글리프가 있어 로컬 컴포넌트로 교체했다 — 외부 네트워크 의존성 제거.)
 */

import { Icon } from "../../../icons";

export type LabelSize = "sm" | "md";

export interface LabelProps {
  /** 라벨 텍스트 내용. 기본 'Label' */
  label?: string;
  /** 크기 축. 기본 'sm' */
  size?: LabelSize;
  /** 굵게 여부(Pretendard Bold). 기본 false */
  isBold?: boolean;
  /** 필수 표시(*) 렌더 여부. 기본 true */
  principal?: boolean;
  /** 정보 아이콘(info_circle_line) 렌더 여부. 기본 true */
  info?: boolean;
  /** 정보 아이콘 클릭 핸들러(Tooltip, BottomSheet 등 overlay 트리거용) */
  onInfoClick?: () => void;
  /** 정보 아이콘 버튼 접근성 라벨(`aria-label`). 기본 '정보 보기' */
  infoLabel?: string;
  /**
   * 지정하면 라벨 텍스트를 `<label htmlFor={htmlFor}>` 로 렌더한다(폼 요소와의
   * 접근성 연결용). 생략 시 기존처럼 `<p>` 로 렌더한다(하위 호환).
   */
  htmlFor?: string;
  /** 루트에 병합할 클래스 */
  className?: string;
}

/** 공통 루트 — flex row, gap, 중앙정렬 */
const ROOT_CLASS = "flex flex-wrap items-center gap-(--sz-4)";

/** sm 사이즈, 굵기 아님 — Pretendard Medium 500, 16px, tracking -0.16px */
const SM_NORMAL_CLASS =
  "font-medium text-[length:var(--text-sm)] tracking-[-0.16px]";

/** sm 사이즈, 굵음 — Pretendard Bold 700, 16px, tracking -0.24px */
const SM_BOLD_CLASS =
  "font-bold text-[length:var(--text-sm)] tracking-[-0.24px]";

/** md 사이즈, 굵기 아님 — Pretendard Medium 500, 18px, tracking -0.18px, line-height 1.47 */
const MD_NORMAL_CLASS =
  "font-medium text-[length:var(--text-md)] tracking-[-0.18px] leading-[1.47]";

/** md 사이즈, 굵음 — Pretendard Bold 700, 18px, tracking -0.27px, line-height 1.47 */
const MD_BOLD_CLASS =
  "font-bold text-[length:var(--text-md)] tracking-[-0.27px] leading-[1.47]";

/** 정보 아이콘 크기(Figma: sm=16px, md=20px) */
const ICON_SIZE_CLASS: Record<LabelSize, string> = {
  sm: "size-(--sz-16)",
  md: "size-(--sz-20)",
};

/** 정보 아이콘 px(Icon 컴포넌트 size prop 용, ICON_SIZE_CLASS 와 1:1 대응) */
const ICON_PX: Record<LabelSize, number> = {
  sm: 16,
  md: 20,
};

/** (size, isBold) → 라벨 텍스트 클래스 */
function labelClass(size: LabelSize, isBold: boolean): string {
  if (size === "md") {
    return isBold ? MD_BOLD_CLASS : MD_NORMAL_CLASS;
  }
  return isBold ? SM_BOLD_CLASS : SM_NORMAL_CLASS;
}

export function Label({
  label = "Label",
  size = "sm",
  isBold = false,
  principal = true,
  info = true,
  onInfoClick,
  infoLabel = "정보 보기",
  htmlFor,
  className,
}: LabelProps) {
  const textClass = labelClass(size, isBold);
  const iconClass = ICON_SIZE_CLASS[size];
  const iconPx = ICON_PX[size];
  const textClassName = `${textClass} text-typo-neutral-normal whitespace-nowrap`;

  return (
    <div className={[ROOT_CLASS, className].filter(Boolean).join(" ")}>
      {/* 라벨 텍스트 — htmlFor 가 있으면 <label>, 없으면 기존처럼 <p>(하위 호환) */}
      {htmlFor ? (
        <label htmlFor={htmlFor} className={textClassName}>
          {label}
        </label>
      ) : (
        <p className={textClassName}>{label}</p>
      )}

      {/* 필수 표시(*) */}
      {principal && (
        <p
          className={`${
            size === "md"
              ? "text-[length:var(--text-md)]"
              : "text-[length:var(--text-sm)]"
          } font-medium text-typo-danger-normal whitespace-nowrap`}
        >
          *
        </p>
      )}

      {/* 정보 아이콘 */}
      {info && (
        <button
          type="button"
          onClick={onInfoClick}
          className={`inline-flex shrink-0 items-center justify-center ${iconClass} text-icon-info-normal focus-visible:opacity-(--alpha-60) transition-opacity duration-150 ease-in-out`}
          aria-label={infoLabel}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <Icon
            name="info_circle_line"
            size={iconPx}
            className="size-full pointer-events-none"
          />
        </button>
      )}
    </div>
  );
}
