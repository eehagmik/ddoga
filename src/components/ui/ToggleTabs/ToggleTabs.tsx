/**
 * 토글탭(ToggleTabs).
 *
 * Figma "또가3.0 Design System / ToggleTabs" (node 51405:153913) 와 1:1.
 * 가로 스크롤 가능한 `Toggle`(round) 목록을 감싸는 탭 바 컨테이너다. Figma 내부의
 * `_parts/ToggleList`(private part, `_` 접두사)는 별도 컴포넌트로 분리하지 않고 이 컴포넌트
 * 구조에 그대로 흡수한다.
 *
 * 축(Figma variant → props):
 * - `size`: sm/md — ToggleList 상하 패딩·chevron 인디케이터 크기·SubMenuList 패딩에 반영.
 * - `subMenu`: false/true — true 면 우측에 chevron 인디케이터 버튼이 추가된다.
 * - `expanded`: subMenu=true 일 때만 의미가 있다(subMenu=false 면 무시된다). controlled
 *   (`expanded`+`onExpandedChange`) / uncontrolled(`defaultExpanded`) 둘 다 지원한다
 *   (`Accordion`/`BoardAccordion` 과 동일한 상태관리 패턴).
 *
 * 펼침/접힘은 `Accordion`/`BoardAccordion` 과 완전히 동일한 방식으로 구현한다: `SubMenuList`
 * 를 항상 DOM 에 유지(`aria-hidden` 으로만 상태 표시)하고 `scrollHeight` 를 측정해 `height` 를
 * 0 ↔ px 값으로 전환한 뒤 펼침이 끝나면 `height: auto` 로 되돌린다(`getAutoHeightDuration` —
 * MUI `Collapse` `timeout="auto"` 와 동일한 지속시간 공식). 이징은 Material 표준
 * `cubic-bezier(0.4, 0, 0.2, 1)`.
 *
 * 펼침 인디케이터는 회전이 아니라 `chevron_down_line` ↔ `chevron_up_line` 아이콘 교체로
 * 처리한다(`Accordion` 선례와 동일 패턴).
 *
 * 재사용:
 * - 탭 아이템은 이 컴포넌트가 만들지 않는다 — 호출부가 `<Toggle variant="round">` 인스턴스를
 *   직접 `children` 으로 나열한다.
 * - 가로 스크롤은 `Scroll`(`axis="x"`) 을 그대로 재사용한다(자체 `overflow-x-auto` 구현 금지).
 *
 * 토큰(Figma 실측, `get_design_context`/`get_variable_defs` 재검증 완료):
 * - ToggleList 행: `bg-bg-neutral-normal`, 상하 패딩 `--sz-4`, 좌우 스크롤 영역 패딩 `--sz-20`,
 *   아이템 간격 `--sz-4`. 좌우 끝 `--sz-20` 폭은 스크롤 가능함을 알리는 화이트 페이드
 *   (`linear-gradient`, variable 값 그대로).
 * - chevron 인디케이터 버튼: `bg-bg-neutral-normal` + `border-xs border-border-neutral-bright`
 *   + `rounded-circle` + `shadow-black-xs`, 지름 sm=`--sz-32`/md=`--sz-40`, 아이콘 sm=16/md=20
 *   (Figma inset 비율 실측), 아이콘 색 `text-icon-neutral-normal`. 우측에서 `--sz-8` 만큼
 *   띄우고 수직 중앙 정렬. 버튼 왼쪽은 화이트 페이드로 스크롤 콘텐츠와 자연스럽게 섞인다 —
 *   Figma 의 60px(sm)/70px(md) 페이드 폭은 `get_variable_defs` 재확인 결과 variable 이 바인딩
 *   되지 않은 값(디자인 토큰이 아님)이라, 우측 여백(`--sz-8`) + 버튼 지름 + 페이드 여유
 *   (`--sz-20`) 조합의 `calc()` 로 근사한다.
 * - `SubMenuList`: `bg-bg-neutral-normal`, 하단만 `rounded-2xl`(`radius/2xl`), 좌우 패딩
 *   `--sz-8` 공통 + 상하 패딩 sm=`--sz-10`/md=`--sz-12`. 내부에 완전 자유 슬롯 1개
 *   (`subMenuContent`, Figma `🟥ContentsSlot`) — 높이를 강제하지 않는다.
 *
 * 색은 전부 semantic 토큰 유틸, 크기·간격은 `var(--sz-*)`, 그림자는 `shadow-black-xs` 유틸로만
 * 지정한다 — 하드코딩 없음.
 */

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";

import { Icon } from "../../../icons";
import { Scroll } from "../Scroll";

export type ToggleTabsSize = "sm" | "md";

export interface ToggleTabsProps {
  /** 크기 축(Figma `size`). 기본 'sm' */
  size?: ToggleTabsSize;
  /** ToggleList 안에 나열할 `<Toggle variant="round">` 인스턴스들. */
  children: ReactNode;
  /** 우측 chevron 인디케이터 노출 여부(Figma `subMenu`). 기본 false */
  subMenu?: boolean;
  /** SubMenuList 펼침 여부 — controlled. `subMenu=false` 면 무시된다. */
  expanded?: boolean;
  /** uncontrolled 초기 펼침 여부. 기본 false */
  defaultExpanded?: boolean;
  /** 펼침 상태가 바뀔 때 호출. */
  onExpandedChange?: (expanded: boolean) => void;
  /** SubMenuList 내부 자유 슬롯(Figma `🟥ContentsSlot`). `subMenu=false` 면 렌더되지 않는다. */
  subMenuContent?: ReactNode;
  /** 루트 요소에 전달할 클래스. */
  className?: string;
}

/** size → chevron 인디케이터 버튼 지름(Figma 실측). */
const INDICATOR_SIZE_CLASS: Record<ToggleTabsSize, string> = {
  sm: "size-[var(--sz-32)]",
  md: "size-[var(--sz-40)]",
};

/** size → chevron 인디케이터 아이콘 픽셀 크기(Figma inset 비율 실측: sm 16 / md 20). */
const INDICATOR_ICON_SIZE: Record<ToggleTabsSize, number> = {
  sm: 16,
  md: 20,
};

/** size → SubMenuList 상하 패딩(Figma 실측: sm=`--sz-10` / md=`--sz-12`, 좌우 `--sz-8` 공통). */
const SUBMENU_PAD_CLASS: Record<ToggleTabsSize, string> = {
  sm: "px-[var(--sz-8)] py-[var(--sz-10)]",
  md: "px-[var(--sz-8)] py-[var(--sz-12)]",
};

/** ToggleList 좌/우 끝 화이트 페이드 폭 — Figma 실측 `--sz-20` 고정(size 무관). */
const EDGE_FADE_WIDTH_CLASS = "w-[var(--sz-20)]";

/** 좌측 끝 페이드: 왼쪽 20% 는 불투명, 오른쪽으로 갈수록 투명해진다(Figma 실측). */
const LEFT_EDGE_FADE_CLASS =
  "bg-[linear-gradient(to_right,var(--color-bg-neutral-normal)_20%,var(--color-bg-neutral-none)_100%)]";

/** 우측 끝 페이드: 왼쪽은 투명, 80% 지점부터 불투명해진다(Figma 실측). */
const RIGHT_EDGE_FADE_CLASS =
  "bg-[linear-gradient(to_right,var(--color-bg-neutral-none)_0%,var(--color-bg-neutral-normal)_80%)]";

/**
 * chevron 인디케이터 뒤 화이트 페이드 폭 — Figma 고정폭(sm 60px/md 70px)은 variable 미바인딩
 * (토큰 아님). 우측 여백(`--sz-8`) + 버튼 지름 + 페이드 여유(`--sz-20`) 로 근사한다.
 */
const INDICATOR_FADE_WIDTH_CLASS: Record<ToggleTabsSize, string> = {
  sm: "w-[calc(var(--sz-8)+var(--sz-32)+var(--sz-20))]",
  md: "w-[calc(var(--sz-8)+var(--sz-40)+var(--sz-20))]",
};

/** chevron 인디케이터 뒤 화이트 페이드: 왼쪽은 투명, 20% 지점부터 불투명(Figma 실측). */
const INDICATOR_FADE_CLASS =
  "bg-[linear-gradient(to_right,var(--color-bg-neutral-none)_0%,var(--color-bg-neutral-normal)_20%)]";

/**
 * 콘텐츠 높이에 비례한 지속시간(ms). `Accordion`/`BoardAccordion` 과 동일한 MUI `Collapse`
 * `timeout="auto"` 공식 — 콘텐츠가 클수록 조금 더 길게 움직인다.
 */
function getAutoHeightDuration(height: number): number {
  if (!height) return 0;
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

export function ToggleTabs({
  size = "sm",
  children,
  subMenu = false,
  expanded,
  defaultExpanded,
  onExpandedChange,
  subMenuContent,
  className,
}: ToggleTabsProps) {
  const subMenuId = useId();
  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(
    defaultExpanded ?? false,
  );
  const isExpanded = subMenu && (expanded ?? internalExpanded);

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

  const handleToggleExpanded = () => {
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
      data-size={size}
      data-sub-menu={subMenu}
      className={["w-full rounded-tl-2xl rounded-tr-2xl", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative flex w-full items-center overflow-hidden bg-bg-neutral-normal py-[var(--sz-4)]">
        <Scroll axis="x" className="min-w-0 flex-1 px-[var(--sz-20)]">
          <div className="flex w-max items-center gap-[var(--sz-4)]">
            {children}
          </div>
        </Scroll>

        <div
          aria-hidden
          className={[
            "pointer-events-none absolute inset-y-0 left-0",
            EDGE_FADE_WIDTH_CLASS,
            LEFT_EDGE_FADE_CLASS,
          ].join(" ")}
        />
        <div
          aria-hidden
          className={[
            "pointer-events-none absolute inset-y-0 right-0",
            EDGE_FADE_WIDTH_CLASS,
            RIGHT_EDGE_FADE_CLASS,
          ].join(" ")}
        />

        {subMenu ? (
          <>
            <div
              aria-hidden
              className={[
                "pointer-events-none absolute inset-y-0 right-0",
                INDICATOR_FADE_WIDTH_CLASS[size],
                INDICATOR_FADE_CLASS,
              ].join(" ")}
            />
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={subMenuId}
              data-expanded={isExpanded}
              onClick={handleToggleExpanded}
              className={[
                "absolute right-[var(--sz-8)] top-1/2 -translate-y-1/2",
                "flex items-center justify-center",
                "rounded-circle border-xs border-solid border-border-neutral-bright",
                "bg-bg-neutral-normal shadow-black-xs",
                "transition-opacity duration-150 ease-in-out motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:opacity-[var(--alpha-80)]",
                "active:opacity-[var(--alpha-80)]",
                INDICATOR_SIZE_CLASS[size],
              ].join(" ")}
            >
              <Icon
                name={isExpanded ? "chevron_up_line" : "chevron_down_line"}
                size={INDICATOR_ICON_SIZE[size]}
                className="text-icon-neutral-normal"
              />
            </button>
          </>
        ) : null}
      </div>

      {subMenu ? (
        <div
          id={subMenuId}
          aria-hidden={!isExpanded}
          onTransitionEnd={handleTransitionEnd}
          style={{
            height: height === "auto" ? "auto" : `${height}px`,
            transitionDuration: `${duration}ms`,
          }}
          className="overflow-hidden bg-bg-neutral-normal transition-[height] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        >
          <div
            ref={innerRef}
            className={[
              "flex w-full flex-col items-start",
              "rounded-bl-2xl rounded-br-2xl bg-bg-neutral-normal",
              SUBMENU_PAD_CLASS[size],
            ].join(" ")}
          >
            {subMenuContent}
          </div>
        </div>
      ) : null}
    </div>
  );
}
