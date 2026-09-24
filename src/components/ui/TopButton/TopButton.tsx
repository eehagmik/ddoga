/**
 * TopButton — 무한 스크롤 페이지에서 화면 최상단으로 즉시 되돌리는 플로팅 버튼.
 *
 * Figma "또가3.0 Design System / TopButton" (node 51405:156837) 비주얼 +
 * 가이드 페이지 (node 51405:156825) 의 플로팅 동작 스펙을 1:1 로 구현한다.
 *
 * 비주얼 (Figma 토큰 → 코드 유틸):
 * - 54×54 원형: `size-[var(--sz-54)]` + `rounded-circle` (radius/circle)
 * - 배경 `background/neutral/dark`: `bg-bg-neutral-dark`
 * - 아이콘 `arrow_up_line` 22×22, `icon/neutral/light`: `<Icon size={22}>` + `text-icon-neutral-light`
 * - 그림자 `shadow/black/md`: `shadow-black-md`
 *
 * 배치·동작 (가이드 스펙):
 * - 화면 우하단 고정. OS safe-area 기준 하단/우측 12px (`--sz-12` + `env(safe-area-inset-*)`).
 * - 페이지 진입 시 미노출 → 아래로 `showAfter`(기본 20)px 초과 스크롤 시 자동 노출,
 *   최상단 도달 시 자동 숨김. 노출/숨김은 0.8초 fade (`duration-[800ms]`).
 * - 클릭 시 대상(기본 window)을 최상단으로 스크롤. `prefers-reduced-motion: reduce`
 *   이면 즉시(`auto`), 아니면 부드럽게(`smooth`).
 *
 * 다중 플로팅 버튼: "TopButton 이 항상 최상단, 다른 버튼과 8px 간격" 규칙은 호출부가
 * `className` 으로 `bottom-*` 을 덮어써서 처리한다 (예:
 * `bottom-[calc(env(safe-area-inset-bottom,0px)+var(--sz-12)+var(--sz-54)+var(--sz-8))]`).
 * 이 컴포넌트는 단일 버튼의 기본 위치만 책임진다.
 *
 * hover/pressed/disabled variant 는 Figma 에 없어 상태 스타일을 두지 않는다.
 * 색·크기·그림자는 전부 디자인 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

import { useEffect, useState } from "react";
import type { RefObject } from "react";

import { Icon } from "../../../icons";

export interface TopButtonProps {
  /** 스크롤 대상. 미지정 시 window(문서 전체). */
  scrollTargetRef?: RefObject<HTMLElement | null>;
  /** 이 스크롤 양(px)을 넘으면 자동 노출. 기본 20 (Figma 가이드). */
  showAfter?: number;
  /** 노출 상태를 외부에서 제어(controlled). 지정하면 내부 스크롤 감지를 끈다. */
  visible?: boolean;
  /** 클릭 동작 오버라이드. 지정하면 기본 "최상단 스크롤" 을 대체한다. */
  onClick?: () => void;
  /** 접근성 라벨. 기본 "맨 위로". */
  label?: string;
  /** 루트 button 에 병합할 클래스 (배치 커스터마이즈·플로팅 버튼 스택용). */
  className?: string;
}

/** Figma: 54×54 원형 / bg neutral dark / icon neutral light / shadow black md / 우하단 safe-area 12px / 0.8s fade */
const BASE_CLASS =
  "fixed z-50 inline-flex items-center justify-center " +
  "size-[var(--sz-54)] rounded-circle " +
  "bg-bg-neutral-dark text-icon-neutral-light shadow-black-md " +
  "right-[calc(env(safe-area-inset-right,0px)+var(--sz-12))] " +
  "bottom-[calc(env(safe-area-inset-bottom,0px)+var(--sz-12))] " +
  "transition-opacity duration-[800ms] ease-in-out motion-reduce:transition-none";

const VISIBLE_CLASS = "opacity-100";
const HIDDEN_CLASS = "opacity-0 pointer-events-none";

/** reduce 모션 사용자에게는 즉시 이동, 그 외에는 부드럽게. jsdom 등 matchMedia 미구현 환경 방어. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function scrollToTop(target: HTMLElement | Window) {
  target.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/** `visible` 미지정 시: 대상의 스크롤량이 `showAfter` 를 넘으면 노출. */
function useAutoVisible(
  showAfter: number,
  scrollTargetRef: RefObject<HTMLElement | null> | undefined,
  enabled: boolean,
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const target: HTMLElement | Window = scrollTargetRef?.current ?? window;

    const read = () => {
      const y =
        target === window ? window.scrollY : (target as HTMLElement).scrollTop;
      setVisible(y > showAfter);
    };

    read();
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, [showAfter, scrollTargetRef, enabled]);

  return visible;
}

export function TopButton({
  scrollTargetRef,
  showAfter = 20,
  visible: visibleProp,
  onClick,
  label = "맨 위로",
  className,
}: TopButtonProps) {
  const controlled = visibleProp !== undefined;
  const autoVisible = useAutoVisible(showAfter, scrollTargetRef, !controlled);
  const visible = controlled ? visibleProp : autoVisible;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    scrollToTop(scrollTargetRef?.current ?? window);
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      data-visible={visible}
      onClick={handleClick}
      className={[BASE_CLASS, visible ? VISIBLE_CLASS : HIDDEN_CLASS, className]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon name="arrow_up_line" size={22} aria-hidden />
    </button>
  );
}
