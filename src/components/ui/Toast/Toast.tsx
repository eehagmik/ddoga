/**
 * Toast — 페이지 최상단에 노출되는 알림 배너 UI 프리미티브.
 *
 * Figma "또가3.0 Design System / Toast" (컴포넌트 세트 node 51405:152394) 와 1:1.
 *
 * 범위(의도적 축소, Tooltip 선례와 동일한 결): 이 컴포넌트는 **배너 그 자체(presentational)만**
 * 책임진다. 화면 상단 고정 위치·슬라이드 인/아웃 애니메이션·5초 후 자동 소멸 타이머는
 * Figma 노드 구조에 정의되어 있지 않은(문서 프레임의 사용법 안내일 뿐인) 값이므로 범위 밖이며,
 * 호스트(또는 후속 `useToast` 훅/컨테이너)가 담당한다.
 *
 * 축(Figma variant → props):
 * - `status` (normal/danger/warning/info/icon, 단일 축) → 동일 prop명 유지.
 *   normal 은 아이콘 없이 텍스트 중앙 정렬. danger/warning/info 는 고정 아이콘 + 좌측 정렬.
 *   icon 은 `icon` prop 으로 자유 슬롯(아이콘 종류·색 제한 없음 — Figma "Type=icon" 설명 그대로).
 * - `text` → `children: ReactNode`. 최대 2줄 권장(Figma Text 스펙 문서) → `line-clamp-2`.
 *
 * 토큰 매핑 (Figma 검증 · get_variable_defs):
 * - 배경(5개 variant 공통): overlay_blackDark → 유틸 bg-bg-overlay-blackDark
 * - 텍스트 색(공통)   : typo_inverse_normal → 유틸 text-typo-inverse-normal
 * - 타이포(공통)      : body_4_bold → 유틸 text-body-4-bold
 * - 아이콘 색         : icon_danger_normal / icon_warning_subtle / icon_info_normal
 * - 레이아웃          : padding 세로 scale_8·가로 scale_14, gap scale_8, min-height scale_40,
 *                       아이콘 슬롯 scale_18 + 상단 보정 scale_4(baseline)
 *
 * Figma 와 의도적으로 다른 부분:
 * 1. Figma 심볼 캔버스 폭(360)은 문서화용 크기일 뿐 — 실제로는 `w-full` 로 구현해
 *    항상 부모(뷰포트 전체 폭 컨테이너)를 꽉 채운다. border-radius 는 Figma 노드에 없어 미적용.
 * 2. 텍스트 2줄 제한은 Figma 노드 속성이 아니라 Text 스펙 문서의 안내이므로 `line-clamp-2` 로 반영.
 * 3. 문서의 "Label" 이중 텍스트 배지·하단 progress bar·상단 "5s" 타이머 배지·슬라이드 애니메이션은
 *    Toast 컴포넌트 노드 자체에 없는 스펙 문서용 장식/사용법 안내이므로 구현하지 않는다.
 */

import type { HTMLAttributes, ReactNode } from "react";

import { Icon } from "../../../icons";
import type { IconName } from "../../../icons";

export type ToastStatus = "normal" | "danger" | "warning" | "info" | "icon";

type FixedIconStatus = "danger" | "warning" | "info";

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** 상황별 타입(Figma `status`). 기본 'normal' */
  status?: ToastStatus;
  /** `status='icon'` 일 때만 쓰이는 자유 아이콘 슬롯(종류·색 제한 없음) */
  icon?: ReactNode;
  /** 안내 메시지(필수, Figma `text`). 최대 2줄로 잘린다 */
  children: ReactNode;
}

/** 고정 아이콘이 있는 3개 status 의 Figma 심볼명. */
const STATUS_ICON: Record<FixedIconStatus, IconName> = {
  danger: "alert_triangle_solid",
  warning: "alert_circle_solid",
  info: "info_circle_solid",
};

/** 고정 아이콘 status 별 색 유틸(Figma icon/<status>/*). */
const STATUS_ICON_COLOR: Record<FixedIconStatus, string> = {
  danger: "text-icon-danger-normal",
  warning: "text-icon-warning-subtle",
  info: "text-icon-info-normal",
};

function isFixedIconStatus(status: ToastStatus): status is FixedIconStatus {
  return status === "danger" || status === "warning" || status === "info";
}

export function Toast({
  status = "normal",
  icon,
  children,
  className,
  ...rest
}: ToastProps) {
  const hasIcon = status !== "normal";

  const iconSlot = isFixedIconStatus(status) ? (
    <Icon
      name={STATUS_ICON[status]}
      size={18}
      className={STATUS_ICON_COLOR[status]}
    />
  ) : status === "icon" ? (
    icon
  ) : null;

  return (
    <div
      data-status={status}
      className={[
        "flex w-full items-center justify-center gap-[var(--sz-8)]",
        "min-h-[var(--sz-40)] px-[var(--sz-14)] py-[var(--sz-8)]",
        "bg-bg-overlay-blackDark",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div
        className={[
          "flex min-w-0 flex-1 justify-center",
          hasIcon ? "items-start gap-[var(--sz-8)]" : "items-center",
        ].join(" ")}
      >
        {hasIcon && iconSlot != null && (
          <span
            className={[
              "flex shrink-0 items-center justify-center",
              "pt-[var(--sz-4)] [&>svg]:size-[var(--sz-18)]",
            ].join(" ")}
          >
            {iconSlot}
          </span>
        )}
        <span
          className={[
            "min-w-0 line-clamp-2 text-body-4-bold text-typo-inverse-normal",
            hasIcon ? "text-left" : "text-center",
          ].join(" ")}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
