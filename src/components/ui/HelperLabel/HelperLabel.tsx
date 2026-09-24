/**
 * HelperLabel — 폼 입력 필드 옆의 도움말/상태 메시지 프리미티브.
 *
 * Figma "또가3.0 Design System / HelperLabel" (node 51405:108524) 와 1:1.
 *
 * 사용자의 액션 결과나 입력 상태를 안내하는 텍스트 + 선택적 상태 아이콘. 성공/경고/오류 상태별로
 * 다른 아이콘과 텍스트 색을 사용하며, 문구가 2줄 이상일 때는 한글 단어 단위로 줄바꿈된다.
 *
 * 축(Figma property → props):
 * - `size`    : sm(14px) / md(16px). 기본 'sm'.
 * - `variant` : default(아이콘 없음) / success(체크) / danger(삼각형) / warning(원). 기본 'default'.
 *
 * 타이포(Figma 원본):
 * - sm + default/warning : Pretendard Medium, 14px, tracking-[-0.14px], leading-1.46
 * - md + default/warning : Pretendard Medium, 16px, tracking-[-0.16px], leading-1.47
 * - sm + danger/success  : Pretendard Medium, 14px, tracking-[-0.14px], leading-1.46
 * - md + danger/success  : Pretendard Medium, 16px, tracking-[-0.16px], leading-1.47
 *
 * 색상:
 * - default/warning 텍스트: typo/neutral/subtle (--color-typo-neutral-subtle, #4a4a4a)
 * - danger 텍스트: typo/danger/normal (--color-typo-danger-normal, #f84b55)
 * - success 텍스트: typo/brand/normal (--color-typo-brand-normal, #00af78)
 * - 아이콘 색: variant 에 따라 Figma 내 정의된 색 사용 (danger=danger, success=brand, warning=neutral/subtle)
 *
 * 아이콘(고정):
 * - success → check_circle_solid (원형 체크)
 * - danger → alert_triangle_solid (삼각형 경고)
 * - warning → alert_circle_solid (원형 느낌표)
 * - default → 없음
 *
 * 레이아웃:
 * - 루트 flex row, gap --sz-5 (5px), items-start
 * - 아이콘 wrapper 는 높이 기준 baseline 조정(pt): sm=--sz-2, md=--sz-4
 * - 아이콘 wrapper 자체가 크기를 갖는다(sm=--sz-16, md=--sz-18) — `Icon` 은
 *   `size-full` 로 그 박스를 그대로 채운다(2026-09-19 수정: 이전엔 크기 클래스가
 *   wrapper 가 아니라 `Icon` 에 붙어 있어, wrapper 박스 자체엔 명시적 크기가
 *   없는 버그였다 — 시각적으론 우연히 동일하게 보였지만 레이아웃 계약이 어긋나
 *   있었다).
 * - 문구 줄바꿈: word-break keep-all (한글)
 */

import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../../../icons";
import type { IconName } from "../../../icons";

export type HelperLabelSize = "sm" | "md";
export type HelperLabelVariant = "default" | "success" | "danger" | "warning";

export interface HelperLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** 도움말 텍스트 내용. 기본 'Helper Label Message' */
  label?: string;
  /** 크기 축. 기본 'sm' */
  size?: HelperLabelSize;
  /** 상태 축(아이콘·색). 기본 'default' */
  variant?: HelperLabelVariant;
  /** 루트에 병합할 클래스 */
  className?: string;
}

/** 공통 루트 — flex row, gap, 중앙정렬 */
const ROOT_CLASS = "flex items-start gap-[var(--sz-5)]";

/** sm 사이즈, Medium 500, 14px, tracking -0.14px, leading 1.46 */
const SM_CLASS =
  "font-medium text-[length:var(--text-xs)] tracking-[-0.14px] leading-[1.46]";

/** md 사이즈, Medium 500, 16px, tracking -0.16px, leading 1.47 */
const MD_CLASS =
  "font-medium text-[length:var(--text-sm)] tracking-[-0.16px] leading-[1.47]";

/** 타이포 클래스 */
function textClass(size: HelperLabelSize): string {
  return size === "md" ? MD_CLASS : SM_CLASS;
}

/** (size, variant) → 텍스트 색 클래스 */
function textColorClass(variant: HelperLabelVariant): string {
  switch (variant) {
    case "danger":
      return "text-typo-danger-normal";
    case "success":
      return "text-typo-brand-normal";
    case "default":
    case "warning":
    default:
      return "text-typo-neutral-subtle";
  }
}

/** variant → 아이콘 이름 (default 는 undefined) */
const VARIANT_ICON: Record<HelperLabelVariant, IconName | undefined> = {
  default: undefined,
  success: "check_circle_solid",
  danger: "alert_triangle_solid",
  warning: "alert_circle_solid",
};

/** variant → 아이콘 색 클래스 */
function iconColorClass(variant: HelperLabelVariant): string {
  switch (variant) {
    case "danger":
      return "text-icon-danger-normal";
    case "success":
      return "text-icon-brand-normal";
    case "warning":
      return "text-icon-neutral-subtle";
    case "default":
    default:
      return "";
  }
}

/** 아이콘 wrapper 패딩(baseline 정렬) */
function iconPaddingClass(size: HelperLabelSize): string {
  return size === "md" ? "pt-[var(--sz-4)]" : "pt-[var(--sz-2)]";
}

/** 아이콘 크기 클래스 */
function iconSizeClass(size: HelperLabelSize): string {
  return size === "md" ? "size-[var(--sz-18)]" : "size-[var(--sz-16)]";
}

export function HelperLabel({
  label = "Helper Label Message",
  size = "sm",
  variant = "default",
  className,
  ...rest
}: HelperLabelProps): ReactNode {
  const textClassStr = textClass(size);
  const textColorClassStr = textColorClass(variant);
  const iconName = VARIANT_ICON[variant];
  const iconColorClassStr = iconColorClass(variant);
  const iconPaddingClassStr = iconPaddingClass(size);
  const iconSizeClassStr = iconSizeClass(size);

  return (
    <div
      className={[ROOT_CLASS, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {/* 아이콘 — variant 에 따라 조건부 렌더 */}
      {iconName && (
        <div
          className={`flex shrink-0 items-center justify-center ${iconPaddingClassStr} ${iconSizeClassStr}`}
          data-name="icon area"
        >
          <Icon name={iconName} className={`${iconColorClassStr} size-full`} />
        </div>
      )}

      {/* 도움말 텍스트 */}
      <p
        className={`${textClassStr} ${textColorClassStr} break-keep relative shrink-0 whitespace-normal`}
      >
        {label}
      </p>
    </div>
  );
}
