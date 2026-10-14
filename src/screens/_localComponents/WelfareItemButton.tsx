/**
 * WelfareItemButton — "구매/대여 가능한 복지용구" 그리드 타일.
 *
 * Figma "김또가" 화면(node 31062:105117/105140, "VerticalMenuButton" 인스턴스)과
 * 1:1이지만, 기존 디자인시스템 `VerticalMenuButton`(폭 고정 68px, 카드 배경 없음)과
 * 시각 구조가 달라(그라데이션 배경 카드, 테두리, 그리드 셀에 맞춘 `w-full`, 하단
 * "0개" 카운트 뱃지가 테두리 안쪽에 포함) 별도 로컬 컴포넌트로 분리했다.
 *
 * 배경은 `background/brandgrayish/normal → background/neutral/normal` 세로
 * 그라데이션(Figma 실측)을 기존 `Main.tsx` 그라데이션 배경 선례와 동일하게
 * `bg-[linear-gradient(...)]`로 직접 조립한다(Tailwind `from-*`/`to-*` 유틸은
 * 프로젝트에 선례가 없어 기존 패턴을 따름). 테두리는 `border-width-2xs`(0.5px,
 * Figma 실측).
 *
 * 카운트("0개")는 실제 재고 연동이 없어 정적 텍스트로만 표기한다(Figma 기본값
 * 그대로, 이번 구현 범위 밖).
 *
 * 높이(Figma 실측 110px)는 `--sz` 스케일에 정확히 일치하는 토큰이 없어(100→128로
 * 건너뜀) `Avatar`/`HorizontalMenuButton` 선례의 "가장 가까운 기존 토큰 근사"
 * 원칙대로 `min-h-(--sz-100)`로 근사하고 내부 콘텐츠는 `justify-center`로 중앙
 * 정렬해 10px 오차가 시각적으로 두드러지지 않게 한다.
 *
 * @example
 * <WelfareItemButton iconSrc={walkerIcon} label="성인용보행기" count="0개" onClick={goToItem} />
 */

import type { ReactNode } from "react";

export interface WelfareItemButtonProps {
  /** 품목 아이콘 이미지. */
  iconSrc: string;
  /** 품목명(2줄까지 자연 줄바꿈). */
  label: string;
  /** 하단 카운트 뱃지 텍스트. 기본 "0개"(Figma 기본값, 실연동 없음). */
  count?: ReactNode;
  /** 클릭 핸들러. */
  onClick?: () => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

const ROOT_CLASS =
  "flex min-h-(--sz-100) w-full cursor-pointer flex-col items-center justify-center gap-(--sz-4) " +
  "rounded-lg border-[length:var(--border-width-2xs)] border-border-brandGrayish-light px-(--sz-4) " +
  "bg-[linear-gradient(to_bottom,var(--color-bg-brandGrayish-normal),var(--color-bg-neutral-normal))] " +
  "transition-opacity hover:opacity-(--alpha-80) " +
  "focus-visible:opacity-(--alpha-60) focus-visible:outline-none";

export function WelfareItemButton({
  iconSrc,
  label,
  count = "0개",
  onClick,
  className,
}: WelfareItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[ROOT_CLASS, className].filter(Boolean).join(" ")}
    >
      <span className="flex flex-col items-center gap-(--sz-8)">
        <img src={iconSrc} alt="" aria-hidden className="size-(--sz-42)" />
        <span className="w-full text-center text-label-2 text-typo-neutral-subtle">
          {label}
        </span>
      </span>
      <span className="text-label-2-bold text-typo-neutral-normal">
        {count}
      </span>
    </button>
  );
}
