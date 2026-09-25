/**
 * 아코디언(Accordion).
 *
 * Figma "또가3.0 Design System / Accordion" (node 51405:3189) 와 1:1.
 * 헤더를 클릭하면 콘텐츠 영역을 펼치고 접는 단일 인터랙티브 컴포넌트다.
 * `BoardAccordion`/`FooterAccordion`은 레이어 구조(패딩·색·축)가 달라 이 컴포넌트를
 * 합성하지 않고 별도로 구현한다 — 다만 아래 상태관리/토큰 사용 패턴을 그대로 따른다.
 *
 * - controlled(`expanded`+`onExpandedChange`) / uncontrolled(`defaultExpanded`) 둘 다 지원.
 * - 헤더는 `<button type="button" aria-expanded aria-controls>`, 콘텐츠는 `<div id>` 로 연결한다.
 * - 펼침 인디케이터는 회전이 아니라 `chevron_down_line` ↔ `chevron_up_line` 아이콘 교체로
 *   처리한다(Figma 검증 — rotate 트랜지션이 아니라 별도 아이콘 애셋).
 * - hover 배경 전환은 collapsed 상태에서만 적용된다 — Figma 에 expanded+hover 조합이
 *   정의되어 있지 않다(`accordionHeaderClass` 참고, `Switch` 의 `switchColors` 선례와 동일하게
 *   상태에 따라 hover 유틸 자체를 조건부로 포함/제외한다).
 * - 펼침/접힘은 MUI `Accordion` 의 기본 트랜지션(`Collapse`, `timeout="auto"`)과 동일한 방식으로
 *   구현한다: 콘텐츠를 항상 DOM 에 유지(`aria-hidden` 으로만 상태 표시)하고 `scrollHeight` 를
 *   측정해 `height` 를 0 ↔ px 값으로 전환한 뒤, 펼침이 끝나면 `height: auto` 로 되돌려 이후
 *   콘텐츠 크기 변화에도 대응한다(`getAutoHeightDuration` 이 MUI 와 동일한 지속시간 공식 —
 *   콘텐츠가 클수록 조금 더 길게 움직인다). 이징은 Material 표준
 *   `cubic-bezier(0.4, 0, 0.2, 1)`. 프로젝트에 트랜지션 전용 토큰이 없어(`Switch`/`Checkbox`
 *   선례와 동일하게) duration/easing 은 하드코딩한다.
 * - 하단 구분선은 기존 `Divider`(thin/horizontal 기본값)를 그대로 재사용하고 `divider` prop 으로
 *   노출을 제어한다(리스트 마지막 아이템에서 `false` 로 오버라이드). 프로젝트 대다수 boolean prop
 *   이 `is` 접두사 없이 명명되어(`bold`/`chevron`/`checked`/`expanded` 등) 이 관례를 따른다.
 *
 * 상태별 색상(Figma 검증, 5개 조합 중 3개만 존재 — expanded=true+hover 없음):
 * | expanded | state  | 배경                       | 아이콘             |
 * | false    | enable | background/neutral/normal | chevron_down_line |
 * | false    | hover  | background/neutral/deep   | chevron_down_line |
 * | true     | enable | background/neutral/normal | chevron_up_line   |
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

export interface AccordionProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "title" | "onClick" | "aria-expanded" | "aria-controls"
> {
  /** 헤더에 표시할 제목 슬롯. 타이포 스타일은 강제하지 않는다. */
  title: ReactNode;
  /** 펼쳤을 때 노출할 콘텐츠 슬롯. 없으면 콘텐츠 영역 자체를 렌더하지 않는다. */
  children?: ReactNode;
  /** 펼침 여부 — controlled. 지정 시 `onExpandedChange` 로 상태를 갱신해야 한다. */
  expanded?: boolean;
  /** uncontrolled 초기 펼침 여부. 기본 false */
  defaultExpanded?: boolean;
  /** 펼침 상태가 바뀔 때 호출. */
  onExpandedChange?: (expanded: boolean) => void;
  /** 하단 구분선 노출 여부. 기본 true(리스트 중간 아이템 기준) */
  divider?: boolean;
  /** 루트 요소에 전달할 클래스. */
  className?: string;
}

/** 헤더 공통 — 레이아웃 + padding/gap + 배경색 전이(색 자체는 accordionHeaderClass 가 더함). */
const HEADER_BASE =
  "flex w-full cursor-pointer items-center justify-between " +
  "px-(--sz-20) py-(--sz-10) gap-(--sz-16) " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** 콘텐츠 wrapper 공통 — overflow 클립 + height 트랜지션(Material 표준 이징). */
const CONTENTS_WRAPPER_CLASS =
  "overflow-hidden transition-[height] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

/** 콘텐츠 공통 — 레이아웃 + padding/gap(Figma 실측). */
const CONTENTS_CLASS =
  "flex flex-col gap-(--sz-24) px-(--sz-20) pt-(--sz-10) pb-(--sz-20)";

/**
 * expanded 별 헤더 배경(`Switch` 의 `switchColors` 선례).
 * hover 유틸은 collapsed(false) 일 때만 포함한다 — expanded+hover 조합은 Figma 에 없다.
 */
function accordionHeaderClass(expanded: boolean): string {
  return expanded
    ? "bg-bg-neutral-normal"
    : "bg-bg-neutral-normal hover:bg-bg-neutral-deep";
}

/**
 * 콘텐츠 높이에 비례한 지속시간(ms). MUI `Collapse` 의 `timeout="auto"` 공식과 동일하다 —
 * 콘텐츠가 클수록 조금 더 길게 움직여 자연스럽게 느껴진다.
 */
function getAutoHeightDuration(height: number): number {
  if (!height) return 0;
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

export function Accordion({
  title,
  children,
  expanded,
  defaultExpanded,
  onExpandedChange,
  divider = true,
  className,
  ...rest
}: AccordionProps) {
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
        onClick={handleClick}
        className={[HEADER_BASE, accordionHeaderClass(isExpanded)]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        <span className="min-w-0 flex-1 text-left">{title}</span>
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
