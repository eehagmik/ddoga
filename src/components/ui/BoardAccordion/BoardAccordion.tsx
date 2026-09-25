/**
 * 게시판 아코디언(BoardAccordion).
 *
 * Figma "또가3.0 Design System / BoardAccordion" (node 51405:3210) 와 1:1.
 * `Accordion`(51405:3189) 을 기반으로 만든 후속 컴포넌트지만, 레이어 구조(패딩·타이포·
 * 아이콘 슬롯·날짜 슬롯 축)가 달라 합성하지 않고 별도로 구현한다 — 대신 아래 상태관리/
 * 트랜지션/hover 패턴은 `Accordion` 과 동일하게 그대로 따른다(패밀리 모션 일관성).
 *
 * - controlled(`expanded`+`onExpandedChange`) / uncontrolled(`defaultExpanded`) 둘 다 지원.
 * - 헤더는 `<button type="button" aria-expanded aria-controls>`, 콘텐츠는 `<div id>` 로 연결한다
 *   (Figma 는 collapsed/enable 조합만 원본 export 코드가 `<div>` 로 나오는데, 이는 Figma 코드젠이
 *   "기본" variant 를 다르게 직렬화하는 산출물 특성일 뿐 실제 설계 차이가 아니다 — 6개 조합 모두
 *   동일하게 클릭 가능한 `<button>` 으로 구현한다, `Accordion` 선례와 동일).
 * - 펼침 인디케이터는 회전이 아니라 `chevron_down_line` ↔ `chevron_up_line` 아이콘 교체(Figma 검증,
 *   `Accordion` 과 동일 아이콘 자원).
 * - 펼침/접힘 트랜지션은 `Accordion` 의 로직을 그대로 복제한다: 콘텐츠를 항상 DOM 에 유지
 *   (`aria-hidden` 으로만 상태 표시)하고 `scrollHeight` 를 측정해 `height` 를 0 ↔ px 값으로
 *   전환한 뒤 펼침이 끝나면 `height: auto` 로 되돌린다(`getAutoHeightDuration` — MUI `Collapse`
 *   `timeout="auto"` 와 동일한 지속시간 공식). 이징은 Material 표준 `cubic-bezier(0.4, 0, 0.2, 1)`.
 * - 하단 구분선은 `Divider`(thin/horizontal 기본값)를 재사용하고 `divider` prop(Figma 원본과
 *   동일 이름, `Accordion` 도 동일하게 명명)으로 노출을 제어한다(리스트 마지막 아이템에서
 *   `false` 로 오버라이드).
 *
 * Figma 축 → props 매핑(`Accordion` 에 없던 것만):
 * - `titleDirection`(horizontal/vertical, 기본 horizontal) — 그대로 유지.
 * - `startSlot`(boolean) + `startSlotContents`(slot) → `startSlot?: ReactNode` 하나로 통합
 *   (`HorizontalMenuButton` 선례와 동일 — 값이 있으면만 24x24 슬롯을 렌더한다).
 * - `date`(boolean) + `dateValue`(text) → `date?: ReactNode` 하나로 통합(값이 있으면만 렌더).
 * - `contentsSlot` → `children` (자유 콘텐츠 슬롯, `Accordion` 과 동일 네이밍).
 *
 * 상태별 배경/타이포(Figma 검증, 5개 조합 중 3개만 존재 — expanded=true+hover 없음.
 * `Accordion` 과 동일하게 hover 유틸 자체를 상태별로 조건부 포함/제외한다):
 * | expanded | state  | 배경                       | Title 타이포              | 아이콘             |
 * | false    | enable | background/neutral/normal | body/3 (Medium)          | chevron_down_line |
 * | false    | hover  | background/neutral/deep   | body/3_bold (Bold)       | chevron_down_line |
 * | true     | enable | background/neutral/normal | body/3_bold (Bold)       | chevron_up_line   |
 *
 * hover 로 인한 Title 볼드 전환은 배경과 달리 "루트 자신"이 아니라 "자식 텍스트"의 스타일
 * 변경이므로 `group`/`group-hover:` 로 처리한다(배경은 루트 자신 상태라 `hover:` 를 그대로 쓴다 —
 * 같은 버튼 안에 두 가지 hover 적용 방식이 공존하는 것은 의도된 것이다).
 *
 * Title 문구 노출 기준(Figma 디자이너 주석): collapsed 시 최대 2줄(`line-clamp-2`), expanded=true
 * 면 전체 노출(클램프 해제) — hover 여부와 무관하다. Figma 주석의 "Type=text/file" 축은 이
 * 컴포넌트의 실제 variant 로 존재하지 않아(get_design_context 재검증 결과 `type` prop 없음)
 * 구현에 반영하지 않았다.
 *
 * Figma 원본 코드에는 collapsed 상태의 아이콘+제목 줄에 고정폭 `w-[284px]`(360 - 좌우 패딩 -
 * chevron 폭/gap)과 불필요한 중첩 wrapper div 가 있으나, 이는 variant 별로 프레임이 개별
 * 고정폭으로 얼려진 Figma auto-layout 산출물일 뿐 의도된 상수가 아니다 — 실제 구현은 `Left`
 * 를 `flex-1`, 제목 줄을 `w-full` 로 두어 임의 폭에서도 동일하게 동작하게 했다.
 */

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  type TransitionEvent,
} from "react";

import { Icon } from "../../../icons";
import { Divider } from "../Divider";

export type BoardAccordionTitleDirection = "horizontal" | "vertical";

export interface BoardAccordionProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "title" | "onClick" | "aria-expanded" | "aria-controls"
> {
  /** 헤더 제목. */
  title: ReactNode;
  /** 제목 앞(또는 위) 아이콘/그래픽 슬롯. 없으면 미렌더(Figma `startSlot`+`startSlotContents` 통합). */
  startSlot?: ReactNode;
  /** 제목 아래 날짜/보조 텍스트. 없으면 미렌더(Figma `date`+`dateValue` 통합). */
  date?: ReactNode;
  /** 아이콘·제목 배치 방향. 기본 'horizontal' */
  titleDirection?: BoardAccordionTitleDirection;
  /** 펼쳤을 때 노출할 콘텐츠 슬롯(Figma `contentsSlot`). 없으면 콘텐츠 영역 자체를 렌더하지 않는다. */
  children?: ReactNode;
  /** 펼침 여부 — controlled. 지정 시 `onExpandedChange` 로 상태를 갱신해야 한다. */
  expanded?: boolean;
  /** uncontrolled 초기 펼침 여부. 기본 false */
  defaultExpanded?: boolean;
  /** 펼침 상태가 바뀔 때 호출. */
  onExpandedChange?: (expanded: boolean) => void;
  /** 하단 구분선 노출 여부. 기본 true(리스트 마지막 아이템에서 false 로 오버라이드) */
  divider?: boolean;
  /** 루트 요소에 전달할 클래스. */
  className?: string;
}

/**
 * 헤더 공통 — 레이아웃 + padding/gap. `group` 은 하위 제목 텍스트가 hover 시 볼드로
 * 전환되도록 하기 위한 표식(배경 자체는 버튼 자신의 `hover:` 로 처리, 아래 참고).
 */
const HEADER_BASE =
  "group flex w-full cursor-pointer items-center justify-between " +
  "px-(--sz-20) py-(--sz-18) gap-(--sz-16) " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** 콘텐츠 wrapper 공통 — overflow 클립 + height 트랜지션(Material 표준 이징) + 배경(Figma 명시). */
const CONTENTS_WRAPPER_CLASS =
  "overflow-hidden bg-bg-neutral-normal transition-[height] " +
  "ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

/** 콘텐츠 공통 — 레이아웃 + padding/gap(Figma 실측, `Accordion` 과 동일 수치). */
const CONTENTS_CLASS =
  "flex flex-col gap-(--sz-24) px-(--sz-20) pt-(--sz-10) pb-(--sz-20)";

/** 제목 줄(아이콘+제목) 레이아웃 — direction 별 축/gap(Figma 실측: horizontal=8, vertical=6). */
const TITLE_ROW_CLASS: Record<BoardAccordionTitleDirection, string> = {
  horizontal: "flex w-full flex-row items-center gap-(--sz-8)",
  vertical: "flex w-full flex-col items-start gap-(--sz-6)",
};

/** 제목 텍스트 너비 처리 — horizontal 은 아이콘 옆에서 남는 폭을 채우고(min-w-0 필수), vertical 은 줄 전체를 채운다. */
const TITLE_TEXT_WIDTH_CLASS: Record<BoardAccordionTitleDirection, string> = {
  horizontal: "min-w-0 flex-1",
  vertical: "w-full",
};

/**
 * expanded 별 헤더 배경(`Accordion` 의 `accordionHeaderClass` 선례와 동일 패턴).
 * hover 유틸은 collapsed(false) 일 때만 포함한다 — expanded+hover 조합은 Figma 에 없다.
 */
function boardAccordionHeaderClass(expanded: boolean): string {
  return expanded
    ? "bg-bg-neutral-normal"
    : "bg-bg-neutral-normal hover:bg-bg-neutral-deep";
}

/**
 * 제목 타이포 — expanded 는 항상 Bold, collapsed 는 평상시 Medium 이고 헤더(부모 `group`) hover 시
 * `group-hover:` 로 Bold 로 전환된다. collapsed 일 때만 2줄 클램프(Figma 디자이너 주석).
 */
function boardAccordionTitleTypoClass(expanded: boolean): string {
  return expanded
    ? "text-body-3-bold"
    : "text-body-3 line-clamp-2 group-hover:text-body-3-bold";
}

/**
 * 콘텐츠 높이에 비례한 지속시간(ms). `Accordion` 과 동일한 MUI `Collapse` `timeout="auto"` 공식.
 */
function getAutoHeightDuration(height: number): number {
  if (!height) return 0;
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

export function BoardAccordion({
  title,
  startSlot,
  date,
  titleDirection = "horizontal",
  children,
  expanded,
  defaultExpanded,
  onExpandedChange,
  divider = true,
  className,
  ...rest
}: BoardAccordionProps) {
  const contentId = useId();
  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(
    defaultExpanded ?? false,
  );
  const isExpanded = expanded ?? internalExpanded;

  const innerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [height, setHeight] = useState<number | "auto">(
    isExpanded ? "auto" : 0,
  );
  const [duration, setDuration] = useState(0);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const node = innerRef.current;
    if (!node) return;

    const target = node.scrollHeight;
    setDuration(getAutoHeightDuration(target));

    if (isExpanded) {
      setHeight(target);
      return;
    }

    // 'auto' 는 트랜지션이 불가능하므로 현재 렌더 높이를 px 로 고정한 뒤
    // 다음 프레임에 0 으로 내려 실제로 애니메이션이 보이게 한다.
    setHeight(target);
    const frame = requestAnimationFrame(() => setHeight(0));
    return () => cancelAnimationFrame(frame);
  }, [isExpanded]);

  const handleClick = () => {
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "height") return;
    if (isExpanded) setHeight("auto");
  };

  return (
    <div
      className={["flex w-full flex-col", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        data-expanded={isExpanded}
        data-title-direction={titleDirection}
        onClick={handleClick}
        className={[HEADER_BASE, boardAccordionHeaderClass(isExpanded)]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        <span className="flex min-w-0 flex-1 flex-col items-start gap-(--sz-8)">
          <span className={TITLE_ROW_CLASS[titleDirection]}>
            {startSlot ? (
              <span className="inline-flex size-(--sz-24) shrink-0 items-center justify-center text-icon-neutral-light">
                {startSlot}
              </span>
            ) : null}
            <span
              className={[
                "break-words text-left text-typo-neutral-normal",
                TITLE_TEXT_WIDTH_CLASS[titleDirection],
                boardAccordionTitleTypoClass(isExpanded),
              ].join(" ")}
            >
              {title}
            </span>
          </span>
          {date ? (
            <span className="whitespace-nowrap text-left text-label-2 text-typo-neutral-light">
              {date}
            </span>
          ) : null}
        </span>
        <Icon
          name={isExpanded ? "chevron_up_line" : "chevron_down_line"}
          size={20}
          className="shrink-0 text-icon-neutral-light"
          aria-hidden
        />
      </button>

      {children ? (
        <div
          id={contentId}
          aria-hidden={!isExpanded}
          onTransitionEnd={handleTransitionEnd}
          style={{
            height: height === "auto" ? "auto" : `${height}px`,
            transitionDuration: `${duration}ms`,
          }}
          className={CONTENTS_WRAPPER_CLASS}
        >
          <div ref={innerRef} className={CONTENTS_CLASS}>
            {children}
          </div>
        </div>
      ) : null}

      {divider ? <Divider /> : null}
    </div>
  );
}
