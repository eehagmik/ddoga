/**
 * 다이얼로그(Dialog) — 화면 중앙에 뜨는 모달 오버레이 카드.
 *
 * Figma "또가3.0 Design System / Dialog" (node 51405:74643) 와 "DialogText"
 * (node 51405:74651) 에 대응한다. 두 컴포넌트는 Figma 상에서는 형제(sibling) 마스터로
 * 분리돼 있고 서로를 인스턴스로 중첩하지 않는다. `DialogText` 는 Figma 설명에 "Typography
 * 일관성을 위해 디자인에서만 사용됩니다" 라고 명시돼 있어 별도 코드 컴포넌트로 옮기지
 * 않는다 — 대신 MainText/SubText 를 이 컴포넌트에 기본 내장해 `<Dialog />` 만으로도
 * 기본 타이포(Main Text/Sub Text)가 적용된 카드가 되도록 합성한다. 이후 "DialogText로
 * 구현해줘" 요청이 와도 이 컴포넌트 하나로 처리한다.
 *
 * 오버레이 오케스트레이션(`BottomSheet` 선례를 Dialog 전용으로 복제): `Dim` 을 내부적으로
 * 소유해 `open`/`onClose` 하나로 Dim fade + 카드 opacity·scale 트랜지션 + mount/unmount
 * 라이프사이클 전체를 오케스트레이션한다. `useSheetLifecycle`/`prefersReducedMotion` 과
 * 동일한 패턴이지만, `BottomSheet.tsx` 는 이번 변경 범위 밖이라 이름 충돌 없이 이 파일
 * 안에 별도로 구현한다(프로젝트 컨벤션상 오버레이 컴포넌트마다 duration 등을 각자
 * 하드코딩하며 공용 훅으로 추출하지 않는다).
 *
 * 범위(의도적 축소, 사용자 확인 완료):
 * - Dim 클릭으로 닫기, ESC 키로 닫기 — **지원하지 않는다.** `closeOnDimClick`/`closeOnEsc`
 *   같은 옵션 prop 도 노출하지 않는다. 헤더의 닫기(X) 버튼(`isCloseButton`/`onClose`)만
 *   유일한 닫기 트리거다.
 * - 포커스 트랩(Tab 순환 가둠)은 범위 밖이다 — 초기 포커스 이동/복귀만 지원한다
 *   (`BottomSheet` 와 동일 수준).
 *
 * 애니메이션(둘 다 300ms, `motion-reduce:transition-none`):
 * - Dim: `opacity` 페이드(`BottomSheet` `DIM_CLASS` 와 동일).
 * - 카드: `opacity` + `scale` 트랜지션(닫힘 `opacity-0 scale-95` → 열림 `opacity-100 scale-100`).
 *   `BottomSheet` 패널이 `translateY` 로 슬라이드하는 것과 달리, Dialog 는 화면 중앙에
 *   고정된 채로 뜨는 모달이라 위치 이동 대신 스케일 모션을 쓴다.
 * - 닫힐 때는 즉시 unmount 하지 않고 트랜지션 종료 후 unmount 한다(`useDialogLifecycle`).
 *
 * 배치/폭(Figma `get_design_context` 재검증 완료, 마스터 51405:74644 기본 className
 * 이 `w-[328px]` 임을 확인): 카드는 고정 328px 폭이 기준이지만, 반응형을 위해
 * `w-full max-w-[328px]` 로 캡하고 오버레이 래퍼에 `px-[var(--sz-16)]` 안전 마진을 둔다
 * (Figma 360px 프레임에서 좌우 16px 마진으로 뜨는 배치와 동일한 결과 — 뷰포트가 360 보다
 * 좁아도 마진이 유지된다).
 *
 * 축(Figma property → props):
 * - `open`          : 열림 상태(필수, controlled). `BottomSheet` 와 동일한 계약.
 * - `pageName`      : 헤더 타이틀(Figma `isPageName`/`pageName`). 넘기면 헤더 블록을
 *                      렌더하고, 생략(undefined)하면 헤더 자체를 렌더하지 않는다.
 * - `isCloseButton` : 헤더 우측 닫기 버튼 노출. 기본 true(Figma 기본값). `pageName` 이
 *                      없으면 헤더 자체가 없으므로 함께 렌더되지 않는다.
 * - `onClose`       : 닫기 버튼 클릭 콜백(유일한 닫기 트리거).
 * - `mainText`      : 본문 제목(Figma DialogText `mainText`). 기본 'Main Text'. 빈
 *                      문자열(`''`)을 명시적으로 넘기면 렌더하지 않는다.
 * - `subText`       : 본문 설명(Figma DialogText `subText`). 기본 'Sub Text'. 동일하게
 *                      `''` 로 숨길 수 있다.
 * - `children`      : MainText/SubText 아래 자유 콘텐츠 슬롯(Figma 빨간 점선
 *                      `slotContents`/`ContentsSlot` — 디자인 문서 전용 표식이라 코드에서는
 *                      렌더하지 않고 `children` 으로 대체한다).
 * - `primaryLabel` / `onPrimaryClick`     : 주 버튼(brand/fill, flex-1). 있을 때만 렌더.
 * - `secondaryLabel` / `onSecondaryClick` : 보조 버튼(neutral/outline, min-w 100). 있을
 *                      때만 렌더.
 *   버튼 영역 자체는 둘 중 하나라도 있으면 렌더한다.
 * - `aria-label`    : `pageName` 이 없을 때 다이얼로그 접근 가능한 이름을 직접 지정
 *                      (`BottomSheet` `aria-label` 과 동일 패턴). `pageName` 이 있으면
 *                      해당 타이틀을 `aria-labelledby` 로 자동 연결한다.
 *
 * 토큰 매핑 (Figma 검증 · `get_variable_defs`, node 51405:74672 / 51405:74749):
 * - 컨테이너 배경    : background/neutral/normal → `bg-bg-neutral-normal`
 * - 컨테이너 radius  : radius/2xl(16) → `rounded-2xl`
 * - 컨테이너 그림자  : shadow/black/lg(0 3px 8px light, 0 8px 20px normal) → `shadow-black-lg`
 *                      (`tokens/shadow.json` 의 `black-lg` 값이 Figma 와 정확히 일치)
 * - 헤더 높이        : scale/48 → `var(--sz-48)`
 * - 헤더 좌우 padding: scale/16 → `var(--sz-16)`
 * - 헤더 내부 gap    : scale/12 → `var(--sz-12)`
 * - 헤더 타이틀      : body/3_bold, typo/neutral/normal → `text-body-3-bold text-typo-neutral-normal`
 * - 닫기 아이콘      : icon/neutral/normal → `text-icon-neutral-normal`, `x_close_line` 24
 * - 바디 padding     : scale/20 → `var(--sz-20)`
 * - 바디 min-height  : 160(Figma 주석 "Body 레이어에 Min-height 확인") → `var(--sz-160)`
 * - 텍스트블록 ↔ 슬롯 gap : scale/26 → `var(--sz-26)`
 * - MainText         : title/3(Bold, xl=22, lh 1.38, ls -1%) → `text-title-3`
 * - SubText          : body/3(Medium, md=18, lh 1.47, ls -1%) → `text-body-3`
 * - MainText/SubText 간 gap : scale/8 → `var(--sz-8)`
 * - 텍스트 색        : typo/neutral/normal → `text-typo-neutral-normal`
 * - 버튼영역 padding : pt scale/4, pb scale/14, px scale/20 → `var(--sz-4/14/20)`
 * - 버튼 간 gap      : scale/8 → `var(--sz-8)`
 * - 보조 버튼 min-w  : scale/100 → `var(--sz-100)`
 * - 오버레이 좌우 안전마진 : scale/16(360px 프레임 실측) → `var(--sz-16)`
 *
 * 재사용 컴포넌트: `Dim`(오버레이), `ButtonWithLabel`(주/보조 버튼),
 * `IconButton` + `Icon name="x_close_line"`(닫기).
 * 색·크기·간격·타이포는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 * 유일한 예외는 `BottomSheet` 선례와 동일하게 프로젝트에 duration 토큰이 없어 하드코딩한
 * 300ms 트랜지션과 `scale-95`/`scale-100`(Tailwind 기본 스케일 값) 뿐이다.
 */

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Icon } from "../../../icons";
import { ButtonWithLabel } from "../ButtonWithLabel";
import { Dim } from "../Dim";
import { IconButton } from "../IconButton";

export interface DialogProps {
  /** 열림 상태(필수, controlled). */
  open: boolean;
  /** 헤더 타이틀. 넘기면 헤더 블록을 렌더하고, 생략하면 헤더 자체가 없다. */
  pageName?: string;
  /** 헤더 우측 닫기 버튼 노출(`pageName` 이 있을 때만 의미). 기본 true */
  isCloseButton?: boolean;
  /** 닫기 버튼 클릭 콜백(유일한 닫기 트리거 — Dim 클릭/ESC 는 지원하지 않는다). */
  onClose?: () => void;
  /** 본문 제목(Figma DialogText `mainText`). 기본 'Main Text'. `''` 로 명시하면 미렌더. */
  mainText?: string;
  /** 본문 설명(Figma DialogText `subText`). 기본 'Sub Text'. `''` 로 명시하면 미렌더. */
  subText?: string;
  /** MainText/SubText 아래 자유 콘텐츠 슬롯. */
  children?: ReactNode;
  /** 주 버튼 라벨. 있을 때만 렌더(brand/fill, flex-1). */
  primaryLabel?: string;
  /** 주 버튼 클릭 콜백. */
  onPrimaryClick?: () => void;
  /** 보조 버튼 라벨. 있을 때만 렌더(neutral/outline, min-w 100). */
  secondaryLabel?: string;
  /** 보조 버튼 클릭 콜백. */
  onSecondaryClick?: () => void;
  /** 카드 루트에 병합할 클래스. */
  className?: string;
  /** `pageName` 이 없을 때 다이얼로그 접근 가능한 이름을 직접 지정. */
  "aria-label"?: string;
}

/** Dim opacity / 카드 opacity·scale 트랜지션 지속시간. duration 토큰이 없어 하드코딩(`BottomSheet` 선례). */
const TRANSITION_MS = 300;

/** reduce 모션 사용자 방어. jsdom 등 matchMedia 미구현 환경도 방어(`BottomSheet` 선례와 동일). */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * `open` → 실제 mount 상태(닫힘 트랜지션 종료까지 유지) + `entered`(트랜지션 시작 트리거)
 * 를 분리 관리한다(`BottomSheet` `useSheetLifecycle` 과 동일 패턴, Dialog 전용 복제).
 */
function useDialogLifecycle(open: boolean) {
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

/** 오버레이 래퍼 — 전체화면 고정 + 카드 중앙정렬 + 뷰포트 360 미만 대비 좌우 안전마진. */
const WRAPPER_CLASS =
  "fixed inset-0 z-50 flex items-center justify-center px-[var(--sz-16)]";

/** Dim 페이드 트랜지션(`BottomSheet` `DIM_CLASS` 와 동일). */
const DIM_CLASS =
  "transition-opacity duration-[300ms] ease-in-out motion-reduce:transition-none";

/** 카드 — 고정 328px 캡 + opacity·scale 트랜지션. */
const CARD_TRANSITION_CLASS =
  "transition-[opacity,transform] duration-[300ms] ease-in-out " +
  "motion-reduce:transition-none focus:outline-none";

/** 카드 표면 — 배경·radius·그림자 + 세로 스택 + 코너 클립 + 폭 캡. */
const ROOT_CLASS =
  "flex w-full max-w-[328px] flex-col items-center overflow-clip rounded-2xl " +
  "bg-bg-neutral-normal shadow-black-lg [font-feature-settings:var(--font-feature-case)]";

/** 헤더 — 고정 높이 + 타이틀·닫기버튼 좌우 배치. */
const HEADER_CLASS =
  "flex h-[var(--sz-48)] w-full shrink-0 items-center justify-between " +
  "gap-[var(--sz-12)] px-[var(--sz-16)]";

/** 바디 — min-height 보장(Figma 주석) + 세로 중앙정렬 + 텍스트블록↔슬롯 gap. */
const BODY_CLASS =
  "flex min-h-[var(--sz-160)] w-full flex-col items-center " +
  "justify-center gap-[var(--sz-26)] overflow-clip p-[var(--sz-20)]";

/** 버튼영역 — 상/하/좌우 padding + 버튼 간 gap. */
const BUTTONS_CLASS =
  "flex w-full shrink-0 items-center justify-center gap-[var(--sz-8)] " +
  "px-[var(--sz-20)] pt-[var(--sz-4)] pb-[var(--sz-14)]";

export function Dialog({
  open,
  pageName,
  isCloseButton = true,
  onClose,
  mainText = "Main Text",
  subText = "Sub Text",
  children,
  primaryLabel,
  onPrimaryClick,
  secondaryLabel,
  onSecondaryClick,
  className,
  "aria-label": ariaLabel,
}: DialogProps) {
  const { mounted, entered } = useDialogLifecycle(open);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

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

  const showHeader = pageName !== undefined;
  const showMainText = mainText !== "";
  const showSubText = subText !== "";
  const showTextBlock = showMainText || showSubText;
  const showButtons = primaryLabel != null || secondaryLabel != null;

  return (
    <div className={WRAPPER_CLASS}>
      <Dim
        className={[DIM_CLASS, entered ? "opacity-100" : "opacity-0"].join(" ")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={showHeader ? undefined : ariaLabel}
        aria-labelledby={showHeader ? titleId : undefined}
        tabIndex={-1}
        data-has-header={showHeader}
        className={[
          ROOT_CLASS,
          CARD_TRANSITION_CLASS,
          entered ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showHeader && (
          <div className={HEADER_CLASS} data-name="header">
            <p
              id={titleId}
              className="min-w-0 flex-1 truncate text-body-3-bold text-typo-neutral-normal"
            >
              {pageName}
            </p>
            {isCloseButton && (
              <IconButton
                aria-label="닫기"
                onClick={onClose}
                className="shrink-0 text-icon-neutral-normal"
              >
                <Icon name="x_close_line" size={24} />
              </IconButton>
            )}
          </div>
        )}

        <div className={BODY_CLASS} data-name="body">
          {showTextBlock && (
            <div className="flex w-full flex-col items-center gap-[var(--sz-8)] text-center text-typo-neutral-normal">
              {showMainText && (
                <p className="w-full [word-break:keep-all] text-title-3">
                  {mainText}
                </p>
              )}
              {showSubText && (
                <p className="w-full [word-break:keep-all] text-body-3">
                  {subText}
                </p>
              )}
            </div>
          )}
          {children}
        </div>

        {showButtons && (
          <div className={BUTTONS_CLASS} data-name="buttons">
            {secondaryLabel != null && (
              <ButtonWithLabel
                color="neutral"
                variant="outline"
                size="2xl"
                onClick={onSecondaryClick}
                className="min-w-[var(--sz-100)]"
              >
                {secondaryLabel}
              </ButtonWithLabel>
            )}
            {primaryLabel != null && (
              <ButtonWithLabel
                color="brand"
                variant="fill"
                size="2xl"
                onClick={onPrimaryClick}
                className="flex-1"
              >
                {primaryLabel}
              </ButtonWithLabel>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
