/**
 * 푸터 아코디언(FooterAccordion).
 *
 * Figma "또가3.0 Design System / FooterAccordion" (node 51405:3273) 와 1:1.
 * `Accordion`(51405:3189)/`BoardAccordion`(51405:3210)과 형제 컴포넌트지만 레이어 구조
 * (배경색·패딩·타이포·모서리 반경)가 달라 합성하지 않고 별도로 구현한다 — 다만 상태관리/
 * 트랜지션 로직은 두 컴포넌트와 동일하게 그대로 따른다(패밀리 모션 일관성).
 *
 * - controlled(`expanded`+`onExpandedChange`) / uncontrolled(`defaultExpanded`) 둘 다 지원.
 * - 헤더는 `<button type="button" aria-expanded aria-controls>`, 콘텐츠는 `<div id>` 로 연결한다.
 * - 펼침 인디케이터는 회전이 아니라 `chevron_down_line` ↔ `chevron_up_line` 아이콘 교체로
 *   처리한다(Figma 검증, `Accordion` 과 동일 아이콘 자원).
 * - 펼침/접힘 트랜지션은 `Accordion`/`BoardAccordion` 의 로직을 그대로 복제한다: 콘텐츠를
 *   항상 DOM 에 유지(`aria-hidden` 으로만 상태 표시)하고 `scrollHeight` 를 측정해 `height` 를
 *   0 ↔ px 값으로 전환한 뒤 펼침이 끝나면 `height: auto` 로 되돌린다(`getAutoHeightDuration` —
 *   MUI `Collapse` `timeout="auto"` 와 동일한 지속시간 공식). 이징은 Material 표준
 *   `cubic-bezier(0.4, 0, 0.2, 1)`.
 * - Figma 원본 코드는 `contentsSlot`(children)을 헤더 `<button>` 내부의 자식으로 직렬화하지만,
 *   이는 Figma 코드젠이 auto-layout 트리를 그대로 뱉은 결과일 뿐이다 — `children`(자유 콘텐츠
 *   슬롯)에 버튼/링크 등 인터랙티브 요소가 들어올 수 있어 그대로 두면 버튼-in-버튼 HTML 위반이
 *   생긴다(`TextCard`/`MenuItem` 에서 이미 다룬 문제). 그래서 `Accordion`/`BoardAccordion` 과
 *   동일하게 바깥 `<div>`(카드, 배경·모서리 담당)로 감싸고 그 안에 헤더 `<button>`(제목 줄만)과
 *   콘텐츠 `<div>`(형제)를 따로 둔다 — 배경/모서리가 바깥 `<div>` 에 있으므로 hover 는 자식(버튼)
 *   위에 마우스가 있어도 부모까지 자연히 히트돼 CSS `hover:` 만으로 동작한다(collapsed 시엔
 *   콘텐츠가 없어 시각적으로 Figma 의 "카드 전체가 버튼" 구조와 동일하게 보인다).
 *
 * FooterAccordion 고유 규칙(Accordion 계열과 다른 점, Figma 실측):
 * - 배경색 방향이 반대다 — Accordion 계열은 enable=밝음/hover=어두움이지만, 이 컴포넌트는
 *   enable=`background/neutral/deepDark`(#eee, 어두움) / hover=`background/neutral/dark`
 *   (#f3f3f3, 밝음)이다. hover 유틸은 `Accordion` 선례와 동일하게 collapsed(false) 일 때만
 *   조건부로 포함한다(5개 조합 중 expanded=true+hover 없음).
 * - 제목 타이포는 `text-body-3-bold`(line-height 1.47)가 아니라 `text-label-1-bold`
 *   (Figma 스타일명 `label/1_bold`, size sm=16px, line-height 1, letter-spacing -1.5%)다.
 *   hover/expanded 와 무관하게 항상 Bold 고정 — `BoardAccordion` 처럼 볼드 전환 축이 없다.
 * - 루트 모서리는 `radius/2xl`(16px)로 둥글다 — 리스트 행인 `Accordion`/`BoardAccordion` 에는
 *   없던 축이다(독립 카드형 컨테이너라서 존재).
 * - 콘텐츠 상단 여백(제목 줄과의 gap)은 Figma 실측 24 를 헤더 하단 padding(14)+콘텐츠 상단
 *   padding(10) 으로 나눠 재현한다(`Accordion` 의 헤더/콘텐츠 패딩 분리 패턴과 동일 원칙).
 * - Figma 원본 코드의 `w-[360px]` 고정폭은 문서화용 캔버스 아티팩트라 `w-full` 로 오버라이드
 *   한다(`HorizontalMenuButton`/`BoardAccordion` 선례와 동일 원칙).
 * - `contentsSlot` 의 `h-[32px]`·빨간 점선 테두리는 문서화용 placeholder 라 렌더하지 않는다
 *   (`CheckboxCard`/`TextCard` 선례와 동일 원칙) — 실제로는 `children` 자유 높이다.
 * - Figma 레이어에 하단 구분선이 없어(`Accordion`/`BoardAccordion` 과 달리 독립 카드형
 *   컨테이너) `divider` prop 자체를 두지 않는다(2026-09-25 사용자 확정).
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

export interface FooterAccordionProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "title" | "onClick" | "aria-expanded" | "aria-controls"
> {
  /** 헤더에 표시할 제목 슬롯. 타이포 스타일은 강제하지 않는다. */
  title: ReactNode;
  /** 펼쳤을 때 노출할 콘텐츠 슬롯(Figma `contentsSlot`). 없으면 콘텐츠 영역 자체를 렌더하지 않는다. */
  children?: ReactNode;
  /** 펼침 여부 — controlled. 지정 시 `onExpandedChange` 로 상태를 갱신해야 한다. */
  expanded?: boolean;
  /** uncontrolled 초기 펼침 여부. 기본 false */
  defaultExpanded?: boolean;
  /** 펼침 상태가 바뀔 때 호출. */
  onExpandedChange?: (expanded: boolean) => void;
  /** 루트 요소에 전달할 클래스. */
  className?: string;
}

/** 카드(루트) 공통 — 레이아웃 + 모서리 + 배경색 전이(색 자체는 footerAccordionCardClass 가 더함). */
const CARD_BASE =
  "flex w-full flex-col rounded-2xl " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** 헤더(제목 줄) 공통 — 레이아웃 + padding/gap. */
const HEADER_BASE =
  "flex w-full cursor-pointer items-center gap-[var(--sz-16)] " +
  "px-[var(--sz-16)] pt-[var(--sz-14)] pb-[var(--sz-14)]";

/** 콘텐츠 wrapper 공통 — overflow 클립 + height 트랜지션(Material 표준 이징). */
const CONTENTS_WRAPPER_CLASS =
  "w-full overflow-hidden transition-[height] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

/** 콘텐츠 공통 — padding(Figma 실측: 헤더 pb-14 + 여기 pt-10 = gap 24). */
const CONTENTS_CLASS =
  "w-full px-[var(--sz-16)] pt-[var(--sz-10)] pb-[var(--sz-14)] text-left";

/**
 * expanded 별 카드 배경(`Accordion` 의 `accordionHeaderClass` 선례와 동일 패턴이나 색 방향은
 * 반대 — enable=neutral-deepDark(어두움) / hover=neutral-dark(밝음)).
 * hover 유틸은 collapsed(false) 일 때만 포함한다 — expanded+hover 조합은 Figma 에 없다.
 */
function footerAccordionCardClass(expanded: boolean): string {
  return expanded
    ? "bg-bg-neutral-deepDark"
    : "bg-bg-neutral-deepDark hover:bg-bg-neutral-dark";
}

/**
 * 콘텐츠 높이에 비례한 지속시간(ms). `Accordion`/`BoardAccordion` 과 동일한 MUI `Collapse`
 * `timeout="auto"` 공식.
 */
function getAutoHeightDuration(height: number): number {
  if (!height) return 0;
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

export function FooterAccordion({
  title,
  children,
  expanded,
  defaultExpanded,
  onExpandedChange,
  className,
  ...rest
}: FooterAccordionProps) {
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
      className={[CARD_BASE, footerAccordionCardClass(isExpanded), className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        data-expanded={isExpanded}
        onClick={handleClick}
        className={HEADER_BASE}
        {...rest}
      >
        <span className="min-w-0 flex-1 break-words text-left text-label-1-bold text-typo-neutral-normal">
          {title}
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
    </div>
  );
}
