/**
 * 바텀시트(BottomSheet) — 화면 하단에서 올라오는 오버레이 패널.
 *
 * Figma "또가3.0 Design System / BottomSheet" (문서 페이지 node 51405:8199,
 * 메인 컴포넌트 node 51405:8551/8552) 와 1:1.
 *
 * 프로젝트 최초의 오버레이 합성 컴포넌트다. `Dim`(배경 오버레이 아톰)을 내부적으로
 * 소유해 `open`/`onClose` 하나로 Dim fade + 패널 슬라이드 + mount/unmount 라이프사이클
 * 전체를 오케스트레이션한다(`Header` 가 `IconButton`/`Dot`/`BadgeNumber` 를 내장 합성하는
 * 기존 패턴의 연장선). Portal(`createPortal`) 은 쓰지 않는다 — 프로젝트에 전례가 없고
 * `TopButton`/`FixButton` 도 전부 `position: fixed` + `z-50` 만으로 동작한다.
 *
 * 레이어 순서(화면 < Dim < 패널)는 별도 z-index 없이 DOM 순서만으로 해결한다 —
 * `fixed inset-0` 래퍼 안에서 `Dim` 이 먼저, 패널이 다음 형제로 오므로 같은 stacking
 * context 안에서 패널이 항상 위에 그려진다.
 *
 * 애니메이션:
 * - Dim: `opacity` 로 fade in/out (사용자 명시 요구사항).
 * - 패널: `translateY` 로 슬라이드업/다운. Dim 과 다른 속성을 써서 "요청받은 Dim 페이드"와
 *   "일관된 UX 를 위해 추가한 패널 모션"을 시각적으로도 구분한다.
 * - 둘 다 동일 `TRANSITION_MS`(300ms, 프로젝트에 duration 토큰이 없어 `TopButton`(800ms)/
 *   `Accordion` 선례처럼 하드코딩)로 동시에 시작·종료된다.
 * - 닫힐 때는 즉시 unmount 하지 않고 트랜지션 종료 후(`setTimeout`) unmount 한다 — 열려
 *   있지 않을 때는 DOM 에서 완전히 제거해 배경 클릭/스크롤을 막는다(TopButton 처럼 계속
 *   mount 된 채 opacity 만 토글하는 방식은 쓸 수 없다).
 *
 * FixButton 합성: Figma 스펙상 FixButton 은 패널의 세 번째 섹션(header/body/fixButton)
 * 으로 존재한다. 그런데 `FixButton` 루트는 `position: fixed` 를 하드코딩하고 있어 패널
 * 내부에 그대로 넣으면 flex 흐름을 이탈해 body 콘텐츠 위에 겹쳐 그려진다 — `!static
 * !z-auto` important 유틸로 강제 오버라이드해 패널의 정상 flex 자식으로 편입시킨다
 * (`BottomSheetFixButtonProps` 가 `className` 을 막아 소비자가 이 오버라이드를 깨지
 * 못하게 한다).
 *
 * 패널 폭: Figma 는 360px 고정이지만 `FixButton`/`BoardAccordion` 선례와 동일하게
 * "모바일 뷰포트 전체 폭" 의도로 해석해 `w-full` 로 구현한다 — 이 판단 덕분에 내부
 * FixButton 과 패널 폭이 항상 정확히 일치한다.
 *
 * 높이(Figma 가이드 "Height" 섹션 1:1): 패널은 콘텐츠 길이에 따라 가변적으로 늘어나되
 * 화면의 90%(`max-h-[90dvh]`)를 넘지 않는다 — 상단에 최소 10% 여백이 항상 남는다.
 * 헤더(`shrink-0`)·FixButton(`shrink-0`)은 고정 높이를 유지하고, 바디(`flex-1 min-h-0`)만
 * 남는 공간을 채우며 패널이 90dvh 상한에 닿으면 그때부터 바디 내부에서만 스크롤된다(Figma
 * "Scroll Behavior — Web" 스펙). 스크롤 동작·스크롤바 색상은 `Scroll`(axis="y") 합성으로
 * 위임한다 — `overflow-y-auto` 는 더 이상 `BODY_CLASS` 가 아니라 `Scroll` 이 소유한다.
 *
 * 색·크기·간격·타이포는 전부 semantic 토큰 유틸/`var(--sz-*)` 로만 지정한다 — 하드코딩 없음.
 * 유일한 예외는 프로젝트에 전례가 없는 duration(300ms)/`90dvh`(Figma 가이드에 명시된
 * "최대 높이 화면의 90%" 규칙) 뿐이다.
 */

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";

import { Icon } from "../../../icons";
import { ButtonWithLabel } from "../ButtonWithLabel";
import { Dim } from "../Dim";
import { FixButton } from "../FixButton";
import type { FixButtonProps } from "../FixButton";
import { IconButton } from "../IconButton";
import { Scroll } from "../Scroll";

/**
 * 일반 `Omit` 은 유니온(`FixButtonProps`)에 분배되지 않아 variant 별 전용 필드
 * (`icon`/`toggleSlot`/`secondaryLabel` 등)가 통째로 사라진다 — 분배형으로 직접 정의한다.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** FixButton 섹션 props — `className` 은 `!static !z-auto` 오버라이드 보장을 위해 막는다. */
export type BottomSheetFixButtonProps = DistributiveOmit<
  FixButtonProps,
  "className"
>;

export interface BottomSheetProps {
  /** 열림 상태(필수, controlled). */
  open: boolean;
  /** 닫기 요청 콜백 — 닫기 아이콘버튼, (옵션에 따라) Dim 클릭, ESC 키에서 호출된다. */
  onClose?: () => void;

  /** 헤더 섹션 전체 노출(Figma `header`). 기본 true */
  header?: boolean;
  /** 타이틀 텍스트. 값이 있을 때만 렌더(Figma `title`+`titleValue` 통합). */
  title?: ReactNode;
  /** 헤더 우측 보조 텍스트 버튼 라벨. 값이 있을 때만 렌더(Figma `button`). */
  headerActionLabel?: ReactNode;
  onHeaderActionClick?: () => void;
  /** 닫기 아이콘버튼 노출(Figma `closable`). 기본 true */
  closable?: boolean;

  /** 하단 FixButton 섹션. 값이 있을 때만 렌더(Figma `fixButton`). */
  fixButton?: BottomSheetFixButtonProps;

  /** Dim 클릭 시 닫힘 여부. 기본 true */
  closeOnDimClick?: boolean;
  /** ESC 키 닫힘 여부. 기본 true */
  closeOnEsc?: boolean;

  /** 본문 콘텐츠 슬롯(Figma `children`, 자유 콘텐츠). */
  children?: ReactNode;

  /** 패널 루트에 병합할 클래스. */
  className?: string;
  /** `title` 이 없을 때 다이얼로그 접근 가능한 이름을 직접 지정. */
  "aria-label"?: string;
}

/** Dim opacity / 패널 translateY 트랜지션 지속시간. duration 토큰이 없어 하드코딩(TopButton 선례). */
const TRANSITION_MS = 300;

/** reduce 모션 사용자 방어. jsdom 등 matchMedia 미구현 환경도 방어(TopButton 선례와 동일). */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * `open` → 실제 mount 상태(닫힘 트랜지션 종료까지 유지) + `entered`(트랜지션 시작 트리거)
 * 를 분리 관리한다. `open=true` 가 되는 순간 mount 하고 1프레임 뒤 `entered=true` 로
 * 전환해 "닫힌 초기 상태 페인트 → 열린 상태로 트랜지션" 이 실제로 보이게 한다.
 */
function useSheetLifecycle(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }

    setEntered(false);
    const delay = prefersReducedMotion() ? 0 : TRANSITION_MS;
    const timer = setTimeout(() => setMounted(false), delay);
    return () => clearTimeout(timer);
  }, [open]);

  return { mounted, entered };
}

const WRAPPER_CLASS = "fixed inset-0 z-50";

const DIM_CLASS =
  "transition-opacity duration-[300ms] ease-in-out motion-reduce:transition-none";

const PANEL_BASE =
  "fixed inset-x-0 bottom-0 flex max-h-[90dvh] w-full flex-col overflow-clip " +
  "rounded-t-3xl bg-bg-neutral-normal shadow-black-lg " +
  "transition-transform duration-[300ms] ease-in-out motion-reduce:transition-none focus:outline-none";

const HEADER_CLASS =
  "flex h-[var(--sz-58)] w-full shrink-0 flex-col justify-center " +
  "pt-[var(--sz-14)] pb-[var(--sz-8)]";

const HEADER_CONTAINER_CLASS =
  "flex w-full items-center gap-[var(--sz-8)] px-[var(--sz-16)]";

const HEADER_LEFT_CLASS = "flex min-w-0 flex-1 items-center gap-[var(--sz-8)]";

const TITLE_CLASS = "truncate text-body-3-bold text-typo-neutral-normal";

const TOUCH_AREA_ACTION_CLASS =
  "flex shrink-0 flex-col items-end justify-center py-[var(--sz-5)] px-[var(--sz-6)]";

const TOUCH_AREA_CLOSE_CLASS = "flex shrink-0 items-center p-[var(--sz-6)]";

const BODY_CLASS =
  "flex min-h-0 w-full flex-1 flex-col items-start py-[var(--sz-20)]";

const BODY_CONTENTS_CLASS = "flex w-full flex-col px-[var(--sz-20)]";

export function BottomSheet({
  open,
  onClose,
  header = true,
  title,
  headerActionLabel,
  onHeaderActionClick,
  closable = true,
  fixButton,
  closeOnDimClick = true,
  closeOnEsc = true,
  children,
  className,
  "aria-label": ariaLabel,
}: BottomSheetProps) {
  const { mounted, entered } = useSheetLifecycle(open);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      panelRef.current?.focus();
      return;
    }
    if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [open]);

  if (!mounted) return null;

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") event.stopPropagation();
  };

  return (
    <div className={WRAPPER_CLASS}>
      <Dim
        onClick={closeOnDimClick ? onClose : undefined}
        className={[DIM_CLASS, entered ? "opacity-100" : "opacity-0"].join(" ")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={[
          PANEL_BASE,
          entered ? "translate-y-0" : "translate-y-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {header && (
          <div className={HEADER_CLASS}>
            <div className={HEADER_CONTAINER_CLASS}>
              <div className={HEADER_LEFT_CLASS}>
                {title && (
                  <span id={titleId} className={TITLE_CLASS}>
                    {title}
                  </span>
                )}
              </div>
              {headerActionLabel && (
                <div className={TOUCH_AREA_ACTION_CLASS}>
                  <ButtonWithLabel
                    color="neutral"
                    variant="text"
                    size="xs"
                    onClick={onHeaderActionClick}
                  >
                    {headerActionLabel}
                  </ButtonWithLabel>
                </div>
              )}
              {closable && (
                <div className={TOUCH_AREA_CLOSE_CLASS}>
                  <IconButton aria-label="닫기" onClick={onClose}>
                    <Icon name="x_close_line" size={24} aria-hidden />
                  </IconButton>
                </div>
              )}
            </div>
          </div>
        )}

        <Scroll axis="y" className={BODY_CLASS}>
          <div className={BODY_CONTENTS_CLASS}>{children}</div>
        </Scroll>

        {fixButton && (
          <FixButton {...fixButton} className="!static !z-auto shrink-0" />
        )}
      </div>
    </div>
  );
}
