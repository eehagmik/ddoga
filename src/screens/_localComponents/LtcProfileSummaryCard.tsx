/**
 * LtcProfileSummaryCard — "김또가" 화면 상단 프로필 요약 카드.
 *
 * Figma "김또가" 화면(node 31062:105097, "section-프로필") 과 1:1. 어르신
 * 아바타(편집 배지 포함) + 이름 + 등급 뱃지(`PalleteChip`) + 연 잔여 지원금 +
 * "어르신 상세 정보" 버튼으로 구성된다.
 *
 * 이 카드에서만 조합되는 레이아웃이라 `src/screens/_localComponents/`에 둔다.
 *
 * 아바타: 기존 `Avatar`(size="lg"=60px, type="person", variant="edit") 를 그대로
 * 재사용한다 — `variant="edit"`가 정확히 Figma의 "이미지는 비인터랙티브, 우하단
 * 편집 배지만 클릭 가능" 구조와 1:1이다(`onEditClick`으로 "성별 이미지" 바텀시트를
 * 연다, 화면 파일에서 연결).
 *
 * 등급 뱃지(Figma `PalleteChip`, bg orange/60 · text orange/600): 세만틱 토큰을 새로
 * 만들지 않고(2026-10-07 정책) Figma 값과 정확히 일치하는 기존 primitive
 * (`tokens/color/primitive.json`의 `orange.60`/`orange.600`, `_generated.css`에 이미
 * `--color-orange-60`/`--color-orange-600`로 노출돼 있음)를 `bg-orange-60`/
 * `text-orange-600`로 직접 참조한다 — `kakao`/`accent` 그룹 제거 선례와 동일 원칙.
 *
 * 금액(`1,600,000원`)은 `text-body-3-bold`(18px, line-height 1.47, tracking -1.5%,
 * Figma 실측과 1:1) + 숫자만 `text-typo-brand-normal`로 강조하고 "원" 접미사는
 * 기본색으로 둔다(`Profile.tsx`의 적립금 표기 선례와 동일 패턴).
 *
 * "어르신 상세 정보" 버튼은 기존 `ButtonWithLabel`(color="brand" variant="bright"
 * size="md", minHeight 40 · radius-md 실측과 1:1)을 그대로 재사용한다.
 *
 * @example
 * <LtcProfileSummaryCard
 *   name="김또가"
 *   avatarSrc={avatarSrc}
 *   gradeText="일반 15%"
 *   remainingAmount="1,600,000"
 *   validUntilText="~27.12.31까지"
 *   onEditAvatarClick={openAvatarSheet}
 *   onDetailClick={goToElderDetail}
 * />
 */

import { Icon } from "../../icons";
import { Avatar } from "../../components/ui/Avatar";
import { ButtonWithLabel } from "../../components/ui/ButtonWithLabel";

export interface LtcProfileSummaryCardProps {
  /** 어르신 이름. */
  name: string;
  /** 아바타 이미지 URL. 없으면 `Avatar` 기본 placeholder. */
  avatarSrc?: string;
  /** 등급/성실도 뱃지 텍스트(예: "일반 00%"). */
  gradeText: string;
  /** 연 잔여 지원금 금액(숫자만, "원" 접미사는 컴포넌트가 붙인다). */
  remainingAmount: string;
  /** 지원금 유효기간 보조 텍스트(예: "~YY.MM.DD까지"). */
  validUntilText: string;
  /** 아바타 편집 배지 클릭 핸들러("성별 이미지" 바텀시트 열기). */
  onEditAvatarClick?: () => void;
  /** "어르신 상세 정보" 버튼 클릭 핸들러. */
  onDetailClick?: () => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

export function LtcProfileSummaryCard({
  name,
  avatarSrc,
  gradeText,
  remainingAmount,
  validUntilText,
  onEditAvatarClick,
  onDetailClick,
  className,
}: LtcProfileSummaryCardProps) {
  return (
    <div
      className={[
        "flex w-full flex-col items-start gap-(--sz-8) rounded-2xl border-[length:var(--border-width-xs)]",
        "border-border-brandGrayish-bright bg-bg-neutral-normal px-(--sz-20) pt-(--sz-16) pb-(--sz-20)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full items-center gap-(--sz-12)">
        <Avatar
          size="lg"
          type="person"
          variant="edit"
          src={avatarSrc}
          onEditClick={onEditAvatarClick}
        />
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-(--sz-1)">
          <p className="w-full truncate text-body-1-bold text-typo-neutral-normal">
            {name}
          </p>
          <span className="inline-flex h-(--sz-26) shrink-0 items-center justify-center rounded-circle bg-orange-60 px-(--sz-8) text-label-2 text-orange-600">
            {gradeText}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-(--sz-2) pt-(--sz-8)">
        <div className="flex w-full items-center gap-(--sz-8)">
          <div className="flex min-w-0 flex-1 items-center gap-(--sz-4)">
            <span className="text-label-1 text-typo-neutral-normal">
              연 잔여 지원금
            </span>
            <Icon
              name="info_circle_line"
              size={16}
              className="shrink-0 text-icon-neutral-bright"
            />
          </div>
          <p className="shrink-0 text-right text-body-3-bold text-typo-neutral-normal">
            <span className="text-typo-brand-normal">{remainingAmount}</span>원
          </p>
        </div>
        <p className="w-full text-right text-label-3 text-typo-neutral-bright">
          {validUntilText}
        </p>
      </div>

      <ButtonWithLabel
        color="brand"
        variant="bright"
        size="md"
        onClick={onDetailClick}
        className="w-full"
      >
        어르신 상세 정보
      </ButtonWithLabel>
    </div>
  );
}
