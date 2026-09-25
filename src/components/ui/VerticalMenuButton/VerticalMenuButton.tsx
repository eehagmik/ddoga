/**
 * VerticalMenuButton — 세로형 메뉴 버튼(그리드형 메뉴 타일).
 *
 * Figma "또가3.0 Design System / VerticalMenuButton" (node 51405:116775, 컴포넌트
 * 세트 15개 = `size`(sm/md/lg/xl/2xl) × `state`(enabled/hover/focus))와 1:1.
 * `그래픽(이미지) 슬롯(children, 필수. 아이콘 아님) + 배지(badge) + 라벨(label, 필수) + 하단 임의
 * 콘텐츠 슬롯(endSlot)` 구조의 그리드 타일형 버튼이다. HorizontalMenuButton(가로
 * 리스트 행)과 자매 컴포넌트지만 구조·축이 다르다 — variant(text/outline)·bold 축이
 * 없고, 폭도 리스트 행처럼 `w-full` 로 늘리지 않는다.
 *
 * 폭: Figma 프레임은 `size` 와 무관하게 전 variant 공통 68px 고정이다(가장 큰
 * 그래픽(2xl, 60px)이 들어갈 폭에 나머지 사이즈가 가운데 정렬로 맞춰지는 구조,
 * 메타데이터로 5개 사이즈 모두 width=68 실측 확인) — HorizontalMenuButton 처럼
 * `w-full` 로 오버라이드하지 않고 Figma 값 그대로 `w-(--sz-68)` 를 쓴다.
 *
 * 구조(Figma 레이어 1:1): root(button) > inner(image + label) + endSlot(선택).
 * `image` 는 size 별 정사각 그래픽(children, 필수) + 우상단 배지(Dot, 선택) 조합이고,
 * `endSlot` 은 `endSlot` prop 이 있을 때만 렌더한다(HorizontalMenuButton 의 endSlot
 * 패턴과 동일 — Figma 의 빨간 점선 "↳ 🟥 EndSlot" 은 빈 슬롯 표시일 뿐이므로 테두리·
 * 색은 반영하지 않지만, 전 size 공통으로 고정된 높이(32px)는 실제 값이라 유지한다).
 *
 * 축(Figma variant → props):
 * - `size` : sm / md / lg / xl / 2xl
 * - `badge`: boolean — 그래픽 우상단 배지(Dot) 노출 여부. Figma 기본값은 true 지만,
 *   IconButton 선례(배지는 opt-in)를 따라 이 컴포넌트는 기본 false 로 둔다.
 * - hover / focus 는 상태이므로 props 가 아니라 CSS 의사클래스로 처리
 *   (Figma 에 disabled 없음 → 만들지 않는다).
 *
 * 상태 규칙(Figma 검증, size 와 무관하게 공통):
 * - hover : 루트 `opacity` `--alpha-80`
 * - focus : 루트 `opacity` `--alpha-60` (`focus-visible` 로 처리)
 *
 * size 별 토큰(Figma 실측 — root/inner 간 gap 이 md 만 비대칭인 점 주의):
 * | size | 그래픽 정사각 | 배지(Dot) 크기 | 라벨 타이포  | inner-gap(그래픽↔라벨) | root-gap(inner↔endSlot) |
 * | sm   | --sz-28      | xs(6)          | text-body-5 | --sz-6                 | --sz-6                  |
 * | md   | --sz-32      | xs(6)          | text-body-4 | --sz-6                 | --sz-8                  |
 * | lg   | --sz-42      | sm(8)          | text-body-4 | --sz-8                 | --sz-8                  |
 * | xl   | --sz-52      | sm(8)          | text-body-4 | --sz-8                 | --sz-8                  |
 * | 2xl  | --sz-60      | sm(8)          | text-body-4 | --sz-8                 | --sz-8                  |
 *
 * (md 의 root-gap=8·inner-gap=6 비대칭은 Figma 각 variant 의 실측 높이
 * 94/102/114/124/132(sm/md/lg/xl/2xl) 로 역산 검증 완료 — 단순 스케일링이 아니다.)
 *
 * 공통(전 size): 폭 `--sz-68`, 패딩 `--sz-4`(전 방향), radius `md`(size 무관 고정),
 * 배지 위치 `-top-[--sz-2] -right-[--sz-2]`(그래픽 우상단, 배지 크기와 무관하게 고정),
 * 라벨 색 `text-typo-neutral-normal`, endSlot 높이 `--sz-32`(전 size 공통 고정).
 *
 * `children`(그래픽/이미지, 아이콘 아님) 자리의 Figma "BlankGraphic" 인스턴스는 실제 콘텐츠가
 * 들어올 자리 표식일 뿐이므로(`src/components/ui/BlankGraphic` 선례와 동일 맥락),
 * 크기(정사각 치수)만 실제 값으로 채택하고 내용은 호출부가 채운다.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Dot } from "../Dot";

export type VerticalMenuButtonSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface VerticalMenuButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** 크기 축. 기본 'sm' */
  size?: VerticalMenuButtonSize;
  /** 그래픽 우상단 배지(Dot) 노출 여부. 기본 false(opt-in, IconButton 선례) */
  badge?: boolean;
  /** 그래픽(이미지, 필수). 아이콘이 아닌 이미지만 담는다. size 별 정사각 슬롯에 담긴다. */
  children: ReactNode;
  /** 라벨(필수). */
  label: string;
  /** 하단 임의 콘텐츠 슬롯. 없으면 미렌더. */
  endSlot?: ReactNode;
}

/** 루트 공통 — 세로 레이아웃 + 고정 폭·패딩·radius + hover/focus opacity(배경색은 불변). */
const ROOT_BASE =
  "inline-flex w-(--sz-68) flex-col items-center cursor-pointer " +
  "rounded-md p-(--sz-4) [font-feature-settings:var(--font-feature-case)] " +
  "transition-opacity hover:opacity-(--alpha-80) " +
  "focus-visible:opacity-(--alpha-60) focus-visible:outline-none";

/** inner(그래픽↔라벨) gap — sm·md 는 6, lg~2xl 는 8(Figma 실측). */
const SIZE_INNER_GAP: Record<VerticalMenuButtonSize, string> = {
  sm: "gap-(--sz-6)",
  md: "gap-(--sz-6)",
  lg: "gap-(--sz-8)",
  xl: "gap-(--sz-8)",
  "2xl": "gap-(--sz-8)",
};

/** root(inner↔endSlot) gap — sm 만 6, md~2xl 는 8(md 는 inner-gap 과 비대칭, Figma 실측). */
const SIZE_ROOT_GAP: Record<VerticalMenuButtonSize, string> = {
  sm: "gap-(--sz-6)",
  md: "gap-(--sz-8)",
  lg: "gap-(--sz-8)",
  xl: "gap-(--sz-8)",
  "2xl": "gap-(--sz-8)",
};

/** 그래픽 정사각 슬롯 크기(Figma 실측). */
const SIZE_GRAPHIC: Record<VerticalMenuButtonSize, string> = {
  sm: "size-(--sz-28)",
  md: "size-(--sz-32)",
  lg: "size-(--sz-42)",
  xl: "size-(--sz-52)",
  "2xl": "size-(--sz-60)",
};

/** 배지(Dot) 크기 — sm·md 는 xs(6), lg~2xl 는 sm(8). */
const SIZE_BADGE: Record<VerticalMenuButtonSize, "xs" | "sm"> = {
  sm: "xs",
  md: "xs",
  lg: "sm",
  xl: "sm",
  "2xl": "sm",
};

/** 라벨 타이포 — sm 만 text-body-5(14px), md~2xl 는 text-body-4(16px, Figma 실측 2단). */
const SIZE_TYPO: Record<VerticalMenuButtonSize, string> = {
  sm: "text-body-5",
  md: "text-body-4",
  lg: "text-body-4",
  xl: "text-body-4",
  "2xl": "text-body-4",
};

export function VerticalMenuButton({
  size = "sm",
  badge = false,
  children,
  label,
  endSlot,
  type,
  className,
  ...rest
}: VerticalMenuButtonProps) {
  return (
    <button
      type={type ?? "button"}
      data-size={size}
      data-badge={badge}
      className={[ROOT_BASE, SIZE_ROOT_GAP[size], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span
        data-name="inner"
        className={["flex w-full flex-col items-center", SIZE_INNER_GAP[size]]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          data-name="image"
          className="relative flex shrink-0 items-center justify-center"
        >
          <span
            className={["flex items-center justify-center", SIZE_GRAPHIC[size]]
              .filter(Boolean)
              .join(" ")}
          >
            {children}
          </span>
          {badge ? (
            <Dot
              size={SIZE_BADGE[size]}
              color="red"
              className="absolute -top-(--sz-2) -right-(--sz-2)"
            />
          ) : null}
        </span>
        <span
          className={[
            "w-full break-words text-center text-typo-neutral-normal",
            SIZE_TYPO[size],
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </span>
      </span>
      {endSlot ? (
        <span data-name="endSlot" className="h-(--sz-32) w-full">
          {endSlot}
        </span>
      ) : null}
    </button>
  );
}
