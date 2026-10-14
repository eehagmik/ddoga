/**
 * LtchProfileButtonCard — 재가서비스/요양원 링크 카드.
 *
 * Figma "김또가" 화면(node 31438:179915 외, "Card/profileLtchButton") 과 1:1.
 * 원형 아이콘 + 제목(+화살표) + 2줄 설명으로 구성된 리스트 행. "재가서비스 찾기"
 * 4종 + "요양원 찾기" 1종, 총 5곳에서 재사용돼 로컬 컴포넌트로 분리했다.
 *
 * 상태(Figma `state` enable/hover/state3)는 전부 루트 `opacity` 전환이라(그 외
 * 색 변화 없음) `VerticalMenuButton` 선례와 동일하게 CSS 의사클래스로 구현한다 —
 * hover=`--alpha-80`, pressed(`state3`)=`--alpha-60`(`active:` 의사클래스로 근사).
 *
 * @example
 * <LtchProfileButtonCard
 *   iconSrc={visitCareIcon}
 *   title="방문요양 찾기"
 *   description={"어르신 댁에 요양보호사가 방문하여\n신체 · 가사활동을 지원해요"}
 *   onClick={goToFacilitySearch}
 * />
 */

import { Icon } from "../../icons";

export interface LtchProfileButtonCardProps {
  /** 원형 배경 안 아이콘 이미지. */
  iconSrc: string;
  /** 시설/서비스 찾기 제목. */
  title: string;
  /** 2줄 설명. Figma 원본의 줄바꿈 그대로 "\n"으로 구분해서 넘기면 `whitespace-pre-line`로 렌더된다. */
  description: string;
  /** 클릭 핸들러. */
  onClick?: () => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

export function LtchProfileButtonCard({
  iconSrc,
  title,
  description,
  onClick,
  className,
}: LtchProfileButtonCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full cursor-pointer items-start gap-(--sz-12) py-(--sz-14) text-left",
        "transition-opacity hover:opacity-(--alpha-80) active:opacity-(--alpha-60)",
        "focus-visible:opacity-(--alpha-60) focus-visible:outline-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="flex shrink-0 items-center rounded-circle bg-bg-neutral-dark p-(--sz-6)">
        <img src={iconSrc} alt="" aria-hidden className="size-(--sz-24)" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-(--sz-4)">
        <span className="flex w-full items-center gap-(--sz-6)">
          <span className="min-w-0 flex-1 truncate text-body-4-bold text-typo-neutral-normal">
            {title}
          </span>
          <Icon
            name="chevron_right_line"
            size={16}
            className="shrink-0 text-icon-neutral-normal"
          />
        </span>
        <span className="w-full whitespace-pre-line text-body-5 text-typo-neutral-light">
          {description}
        </span>
      </span>
    </button>
  );
}
