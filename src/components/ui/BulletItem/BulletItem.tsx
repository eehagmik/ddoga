/**
 * 불릿 항목(BulletItem).
 *
 * Figma "또가3.0 Design System / BulletItem" (node 51405:10523) 와 1:1.
 * 가운뎃점(·) 마커와 함께 제목/본문을 한 항목으로 표시하는 프리미티브다.
 * 안내 문구·약관·주의사항 목록 등에서 사용한다.
 *
 * - 색·타이포·간격은 전부 디자인 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 * - 마커("·")는 장식 요소라 항상 `aria-hidden` 이며, `title`/`contents` 와 무관하게 항상 렌더한다.
 * - Figma 원본 variant 철자 `horizonal` 은 코드에서 `horizontal` 로 정정했다.
 * - Figma 는 320px 고정 프레임이나, 코드 루트는 `w-full` 로 부모 폭을 채운다.
 * - `direction="horizontal"` 의 제목 열 폭은 Figma raw 120px 를 `--sz` 스케일의 `--sz-128` 로 근사한다.
 */

export interface BulletItemProps {
  /** 제목 텍스트. 기본 "Title" */
  titleValue?: string;
  /** 본문 텍스트. 기본 "Contents Text" */
  contentsText?: string;
  /** 색상 계열. 기본 'neutral' */
  color?: "neutral" | "brand" | "danger" | "warning" | "info";
  /** 제목/본문 배치 방향. 기본 'vertical' */
  direction?: "vertical" | "horizontal";
  /** 크기. 기본 'sm' */
  size?: "sm" | "md" | "lg";
  /** 제목을 Bold 로 표시할지 여부. false 면 제목도 Medium. 본문은 항상 Medium. 기본 true */
  bold?: boolean;
  /** 제목 표시 여부. 기본 true */
  title?: boolean;
  /** 본문 표시 여부. 기본 true */
  contents?: boolean;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** 공통 레이아웃 — Figma: flex row, align-items flex-start, gap scale/4, font-feature "case" 1 */
const ROOT_CLASS =
  "flex w-full items-start gap-[var(--sz-4)] " +
  "[font-feature-settings:var(--font-feature-case)]";

/**
 * `color` 별 마커/제목/본문 색상 토큰.
 * neutral 만 (마커 light · 제목 normal · 본문 subtle) 3단계 패턴이고,
 * 시맨틱 컬러 4종은 마커·본문 모두 `deep`, 제목만 `dark` 다.
 */
const COLOR_CLASS: Record<
  NonNullable<BulletItemProps["color"]>,
  { marker: string; title: string; contents: string }
> = {
  neutral: {
    marker: "text-typo-neutral-light",
    title: "text-typo-neutral-normal",
    contents: "text-typo-neutral-subtle",
  },
  brand: {
    marker: "text-typo-brand-deep",
    title: "text-typo-brand-dark",
    contents: "text-typo-brand-deep",
  },
  danger: {
    marker: "text-typo-danger-deep",
    title: "text-typo-danger-dark",
    contents: "text-typo-danger-deep",
  },
  warning: {
    marker: "text-typo-warning-deep",
    title: "text-typo-warning-dark",
    contents: "text-typo-warning-deep",
  },
  info: {
    marker: "text-typo-info-deep",
    title: "text-typo-info-dark",
    contents: "text-typo-info-deep",
  },
};

/**
 * `size` 별 합성 타이포 토큰. `text-body-*` 유틸이 size + line-height + letter-spacing + weight 를 일괄 적용한다.
 * 마커는 `lg` 에서도 16px(`text-body-4`) 로, 본문 18px(`text-body-3`) 와 다르다.
 */
const SIZE_CLASS: Record<
  NonNullable<BulletItemProps["size"]>,
  { marker: string; title: string; titleBold: string; contents: string }
> = {
  sm: {
    marker: "text-body-5",
    title: "text-body-5",
    titleBold: "text-body-5-bold",
    contents: "text-body-5",
  },
  md: {
    marker: "text-body-4",
    title: "text-body-4",
    titleBold: "text-body-4-bold",
    contents: "text-body-4",
  },
  lg: {
    marker: "text-body-4",
    title: "text-body-3",
    titleBold: "text-body-3-bold",
    contents: "text-body-3",
  },
};

/** `direction` 별 contents 컨테이너 레이아웃 (Figma: vertical gap scale/6, horizontal gap scale/8) */
const GROUP_CLASS: Record<NonNullable<BulletItemProps["direction"]>, string> = {
  vertical: "flex min-w-0 flex-1 flex-col gap-[var(--sz-6)]",
  horizontal: "flex min-w-0 flex-1 flex-row gap-[var(--sz-8)]",
};

/** `direction` 별 제목 레이아웃 (horizontal 은 고정 폭 열) */
const TITLE_LAYOUT_CLASS: Record<
  NonNullable<BulletItemProps["direction"]>,
  string
> = {
  vertical: "w-full",
  horizontal: "w-[var(--sz-128)] shrink-0",
};

/** `direction` 별 본문 레이아웃 (horizontal 은 나머지 폭 채움) */
const CONTENTS_LAYOUT_CLASS: Record<
  NonNullable<BulletItemProps["direction"]>,
  string
> = {
  vertical: "w-full",
  horizontal: "min-w-0 flex-1",
};

export function BulletItem({
  titleValue = "Title",
  contentsText = "Contents Text",
  color = "neutral",
  direction = "vertical",
  size = "sm",
  bold = true,
  title = true,
  contents = true,
  className,
}: BulletItemProps) {
  const colors = COLOR_CLASS[color];
  const typo = SIZE_CLASS[size];

  return (
    <div
      data-color={color}
      data-direction={direction}
      data-size={size}
      className={[ROOT_CLASS, className].filter(Boolean).join(" ")}
    >
      <span
        data-part="marker"
        aria-hidden="true"
        className={[
          "shrink-0 whitespace-nowrap",
          colors.marker,
          typo.marker,
        ].join(" ")}
      >
        ·
      </span>

      {(title || contents) && (
        <div data-part="group" className={GROUP_CLASS[direction]}>
          {title && (
            <span
              data-part="title"
              className={[
                TITLE_LAYOUT_CLASS[direction],
                colors.title,
                bold ? typo.titleBold : typo.title,
              ].join(" ")}
            >
              {titleValue}
            </span>
          )}
          {contents && (
            <span
              data-part="contents"
              className={[
                CONTENTS_LAYOUT_CLASS[direction],
                colors.contents,
                typo.contents,
              ].join(" ")}
            >
              {contentsText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
