/**
 * 텍스트 카드(TextCard).
 *
 * Figma "또가3.0 Design System / Card" 문서 페이지(캔버스 51405:14293) 안의
 * TextCard 컴포넌트(node 51405:14446) 와 1:1. 제목 + 날짜로 구성된 리스트형
 * 카드 행 — 같은 페이지의 ImageCard/GalleryCard 와 형제 관계일 뿐 서로 합성하지
 * 않는 독립 컴포넌트다(이번 구현 범위는 TextCard 만).
 *
 * Figma 심볼은 `state=enable/hover/focus` 3개뿐(disabled·pressed 없음) — 상태이므로
 * props 가 아니라 CSS 의사클래스로 처리한다. hover 는 루트 자신의 상태라 `hover:`,
 * focus 로 인한 투명도는 **자손**(inner)에만 걸리므로 `group-focus-visible:` 로
 * 건다(`group-*` 를 루트 자신에게 걸면 셀프 적용이 안 되는 버그 패턴 — MenuItem/
 * CheckboxCard 선례와 동일 컨벤션). 투명도 값은 Figma 실측(60%)이 아니라
 * `--alpha-80` 이다 — ImageCard/GalleryCard(Figma 에 focus 상태 자체가 없어
 * 카드 전체 클릭 가능을 사용자 확장으로 추가하며 함께 넣은 opacity dip)와 값을
 * 맞추기 위해 2026-09-19 사용자 확정으로 Card 삼형제 전체를 `--alpha-80` 으로
 * 통일했다(TextCard 만 Figma 실측 60% 였던 걸 의도적으로 덮어씀).
 *
 * 구조 결정(Figma 밖, 사용자 승인 사항):
 * - 루트는 `<button>` 이 아니라 `<div role="button" tabIndex={0} onClick>` 이다
 *   (start/endSlotContents 에 임의 컨텐츠 — 버튼 포함 가능 — 가 들어올 수 있어
 *   버튼-in-버튼 충돌을 원천 차단하기 위함). 키보드 접근성을 위해 Enter/Space
 *   입력 시에도 클릭을 동일하게 트리거한다(`element.click()` 위임 — React 가
 *   네이티브 click 이벤트를 합성 이벤트로 감지해 `onClick` 핸들러가 그대로 호출됨).
 * - Figma 원본 prop 이름은 `deletable` 이었으나 실측 결과 삭제 기능과 무관하게
 *   날짜(`dateValue`) 줄 렌더 여부만 제어하고 있어, 코드에서는 `showDate` 로
 *   정정했다.
 * - Figma dev 주석("제목 n줄이상 생략 조건은 기획에 맞춰 1,2줄 중 하나로 적용")에
 *   따라 `titleLines`(1 | 2, 기본 1) prop 으로 제목 line-clamp 정책을 노출한다.
 *
 * 레이아웃(Figma 실측): 루트 `w-[var(--sz-320)]` flex-col. title area padding
 * `--sz-20`. inner flex-row `items-center` gap `--sz-12`. title & date 영역
 * flex-1 flex-col gap `--sz-8`. title row flex-row gap `--sz-2`(2px, 배지 점과
 * 제목 사이 미세 간격). hover/focus 시 title & date 열이 `justify-center` 로
 * 보정된다(Figma 실측 — enable 심볼에는 없음).
 *
 * 색·타이포(Figma 검증): 제목 `text-body-3`/`text-typo-neutral-normal`, 날짜
 * `text-label-2`/`text-typo-neutral-light`. hover/focus 배경 `bg-bg-neutral-deep`
 * (enable 은 배경 유틸 없음 — 투명, 호출부 배경 그대로 노출).
 *
 * 재사용: 배지는 기존 `Dot`(size="xs" color="red"), 하단 구분선은 기존
 * `Divider`(기본값 orientation="horizontal" thickness="thin") 그대로 사용한다.
 *
 * startSlot/endSlot 은 Figma 원본과 동일하게 "표시 여부(boolean)" + "콘텐츠
 * (ReactNode)" 두 축을 그대로 유지한다(콘텐츠가 있어도 boolean 이 false 면
 * 렌더하지 않음 — 슬롯 자리를 예약해두고 싶을 때/아닐 때를 boolean 으로 명시
 * 제어할 수 있게 하기 위함). Figma 의 빨간 점선 테두리는 디자인 표식이라
 * 렌더하지 않는다(CheckboxCard 선례와 동일 원칙).
 */

import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

import { Divider } from "../Divider";
import { Dot } from "../Dot";

export type TextCardTitleLines = 1 | 2;

export interface TextCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "onClick"
> {
  /** 제목 텍스트. 기본 "제목" */
  title?: string;
  /**
   * 제목 최대 노출 줄 수(초과 시 말줄임). 1 또는 2 중 기획에 맞춰 선택
   * (Figma dev 주석 근거). 기본 1
   */
  titleLines?: TextCardTitleLines;
  /**
   * 날짜 줄(`dateValue`) 렌더 여부. 기본 true.
   * Figma 원본 prop 이름은 `deletable` 이었으나 실측 결과 날짜 표시 여부만
   * 제어할 뿐 삭제 기능과 무관해 `showDate` 로 정정했다.
   */
  showDate?: boolean;
  /** 날짜 텍스트. `showDate=true` 일 때만 의미. 기본 "YYYY.MM.DD" */
  dateValue?: string;
  /** 제목 옆 신규 표시 배지(`Dot`) 렌더 여부. 기본 false */
  badge?: boolean;
  /** 좌측 24x24 슬롯 표시 여부. 기본 false */
  startSlot?: boolean;
  /** 좌측 슬롯 콘텐츠. `startSlot=true` 일 때만 렌더 */
  startSlotContents?: ReactNode;
  /** 우측 24x24 슬롯 표시 여부. 기본 false */
  endSlot?: boolean;
  /** 우측 슬롯 콘텐츠. `endSlot=true` 일 때만 렌더 */
  endSlotContents?: ReactNode;
  /** 하단 구분선(`Divider`) 렌더 여부. 기본 true */
  divider?: boolean;
  /**
   * 클릭 핸들러. 루트가 `role="button"` 인 `<div>` 라 Enter/Space 키 입력도
   * 클릭과 동일하게 트리거한다.
   */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

/** 루트 공통 — 레이아웃 + hover/focus-visible 배경(props 아님, CSS 의사클래스). */
const ROOT =
  "group flex w-[var(--sz-320)] flex-col cursor-pointer transition-colors " +
  "hover:bg-bg-neutral-deep focus-visible:bg-bg-neutral-deep focus-visible:outline-none";

/** 제목 `titleLines` 별 line-clamp 유틸. */
const TITLE_LINE_CLASS: Record<TextCardTitleLines, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
};

export function TextCard({
  title = "제목",
  titleLines = 1,
  showDate = true,
  dateValue = "YYYY.MM.DD",
  badge = false,
  startSlot = false,
  startSlotContents,
  endSlot = false,
  endSlotContents,
  divider = true,
  onClick,
  className,
  onKeyDown,
  ...rest
}: TextCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.currentTarget.click();
  };

  const rootClassName = [ROOT, className].filter(Boolean).join(" ");

  return (
    <div
      role="button"
      tabIndex={0}
      data-name="TextCard"
      className={rootClassName}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div data-name="title area" className="w-full p-[var(--sz-20)]">
        <div
          data-name="inner"
          className="flex w-full items-center gap-[var(--sz-12)] group-focus-visible:opacity-[var(--alpha-80)]"
        >
          {startSlot && (
            <div
              data-name="startSlotContents"
              className="flex size-[var(--sz-24)] shrink-0 items-center justify-center"
            >
              {startSlotContents}
            </div>
          )}
          <div
            data-name="title & date"
            className="flex min-w-0 flex-1 flex-col gap-[var(--sz-8)] group-hover:justify-center group-focus-visible:justify-center"
          >
            <div
              data-name="title"
              className="flex items-center gap-[var(--sz-2)]"
            >
              <p
                className={[
                  "min-w-0 text-body-3 text-typo-neutral-normal",
                  TITLE_LINE_CLASS[titleLines],
                ].join(" ")}
              >
                {title}
              </p>
              {badge && <Dot size="xs" color="red" />}
            </div>
            {showDate && (
              <p className="text-label-2 text-typo-neutral-light">
                {dateValue}
              </p>
            )}
          </div>
          {endSlot && (
            <div
              data-name="endSlotContents"
              className="flex size-[var(--sz-24)] shrink-0 items-center justify-center"
            >
              {endSlotContents}
            </div>
          )}
        </div>
      </div>
      {divider && <Divider />}
    </div>
  );
}
