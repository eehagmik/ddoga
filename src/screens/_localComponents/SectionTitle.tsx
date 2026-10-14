/**
 * SectionTitle — 리스트/섹션 상단에 얹는 제목 + (선택) 카운트 + (선택) 더보기 버튼.
 *
 * Figma "또가3.0 Design System / SectionTitle" (node 161:2733, 9개 variant =
 * `typo`(title_1/title_2/title_3) × `buttonType`(empty/IconButton/Button)) 와 1:1.
 * 이 화면(메인)에는 `typo="title3"` 조합만 등장하지만(실시간 인기 상품=icon,
 * 나머지=empty), 다른 화면 재사용을 고려해 variant 전체를 반영한다 — 아직은
 * 화면 전용 로컬 컴포넌트로 두고(디자인시스템 승격은 보류), 나중에 개별 Figma
 * 링크가 주어지면 `src/components/ui/SectionTitle/` 로 승격 검토한다.
 *
 * Figma 컴포넌트 설명: "데이터가 1개 이상이어야 숫자+상세이동 버튼 노출" — 이 규칙은
 * 호출부 책임이라 컴포넌트 자체는 `count`/`buttonType` presence 만으로 렌더 여부를
 * 결정한다(강제하지 않음).
 *
 * 타이포는 프로젝트 합성 토큰(`text-title-1/2/3`, Figma title/1·2·3 과 1:1)을
 * 그대로 쓴다. `buttonType="button"` 은 기존 `ButtonWithLabel`(outline/neutral/xs)을
 * 재사용, `buttonType="icon"` 은 기존 `IconButton` 을 재사용한다(중복 구현 금지).
 *
 * @example
 * <SectionTitle title="실시간 인기 상품" typo="title3" buttonType="icon"
 *   moreAriaLabel="실시간 인기 상품 더보기" onMoreClick={goToPopular} />
 * <SectionTitle title="구매하기" typo="title3" /> // 더보기 없음
 */

import type { ReactNode } from "react";

import { Icon } from "../../icons";
import { ButtonWithLabel } from "../../components/ui/ButtonWithLabel";
import { IconButton } from "../../components/ui/IconButton";

export type SectionTitleTypo = "title1" | "title2" | "title3";
export type SectionTitleButtonType = "empty" | "icon" | "button";

export interface SectionTitleProps {
  /** 제목 텍스트(필수). */
  title: string;
  /** 타이포 축(Figma `typo`). 기본 'title3'(이 화면에서 쓰는 값). */
  typo?: SectionTitleTypo;
  /** 카운트 숫자. 생략하면 렌더하지 않는다(Figma `isCount` presence 대응). */
  count?: number;
  /** 우측 버튼 종류(Figma `buttonType`). 기본 'empty'(버튼 없음). */
  buttonType?: SectionTitleButtonType;
  /** `buttonType="button"` 일 때 라벨. 기본 '더보기'. */
  moreLabel?: string;
  /** `buttonType="icon"` 일 때 aria-label. 기본 '더보기'. */
  moreAriaLabel?: string;
  /** 더보기 클릭 핸들러(icon/button 공통). */
  onMoreClick?: () => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

/** typo 별 제목/카운트 타이포 + title↔count gap(Figma 실측: title1=8, title2=6, title3=4). */
const TYPO_CLASS: Record<SectionTitleTypo, { text: string; gap: string }> = {
  title1: { text: "text-title-1", gap: "gap-(--sz-8)" },
  title2: { text: "text-title-2", gap: "gap-(--sz-6)" },
  title3: { text: "text-title-3", gap: "gap-(--sz-4)" },
};

export function SectionTitle({
  title,
  typo = "title3",
  count,
  buttonType = "empty",
  moreLabel = "더보기",
  moreAriaLabel = "더보기",
  onMoreClick,
  className,
}: SectionTitleProps) {
  const { text: titleText, gap: titleGap } = TYPO_CLASS[typo];
  const hasCount = count !== undefined;

  let button: ReactNode = null;
  if (buttonType === "icon") {
    button = (
      <div className="flex h-full shrink-0 items-center pl-(--sz-6)">
        <IconButton aria-label={moreAriaLabel} onClick={onMoreClick}>
          <Icon name="chevron_right_line" size={24} />
        </IconButton>
      </div>
    );
  } else if (buttonType === "button") {
    button = (
      <ButtonWithLabel
        variant="outline"
        color="neutral"
        size="xs"
        onClick={onMoreClick}
      >
        {moreLabel}
      </ButtonWithLabel>
    );
  }

  return (
    <div
      className={[
        "flex w-full flex-col items-start px-(--sz-20) py-(--sz-4)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex w-full items-center",
          buttonType === "empty" ? "" : "gap-(--sz-16)",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-(--sz-4)">
          <div className={["flex w-full items-center", titleGap].join(" ")}>
            <p
              className={[
                titleText,
                "overflow-hidden text-ellipsis whitespace-nowrap text-typo-neutral-normal",
              ].join(" ")}
            >
              {title}
            </p>
            {hasCount ? (
              <p
                className={[titleText, "shrink-0 text-typo-brand-normal"].join(
                  " ",
                )}
              >
                {count}
              </p>
            ) : null}
          </div>
        </div>
        {button}
      </div>
    </div>
  );
}
