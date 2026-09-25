/**
 * 빈 상태(Empty).
 *
 * Figma "또가3.0 Design System / Empty" (node 51405:83959) 와 1:1.
 * 목록·페이지에 표시할 내용이 없거나(조회 결과 없음) 오류가 발생했을 때 쓰는
 * 빈 상태 컴포넌트. 그래픽(72×72) + 메인/서브 텍스트 + 액션 버튼 2개(선택)로 구성.
 *
 * 축(Figma variant → props):
 * - `variant`: default(문서상 "Type=etc") / empty / error
 *   - `default` : 그래픽을 자유롭게 교체(Figma 설명 "Type=etc의 경우, 이미지를 자유롭게
 *     교체합니다") — `graphic` 슬롯, 생략 시 디자인 시스템 플레이스홀더 `BlankGraphic` 렌더.
 *   - `empty`   : 고정 일러스트 `notfound.png`("조회 결과 없음").
 *   - `error`   : 고정 일러스트 `error.png`("오류 발생").
 * - 버튼(`_master/Empty` 설명 "Button은 상황에 맞게 Style을 자유롭게 선택하여 사용")은
 *   고정 라벨이 아니라 `leftButton`/`rightButton` 슬롯 — 실제 사용 시 `ButtonWithLabel`
 *   (`variant="outline" color="neutral"` / `variant="fill" color="brand"`)을 그대로 꽂는다.
 *   둘 다 없으면 버튼 행 자체를 렌더하지 않는다(Figma `isButtons` 축의 presence 기반 대응).
 * - `subText` 도 presence 기반 — 생략하면 서브 텍스트 줄을 렌더하지 않는다(Figma `subText1` 대응).
 *
 * 토큰 (Figma 검증):
 * | 요소            | 토큰                                             |
 * | --------------- | ------------------------------------------------ |
 * | 그래픽 크기     | `--sz-72`                                         |
 * | 그래픽↔설명 gap | `--sz-16`                                         |
 * | 설명 좌우 padding| `--sz-20`                                         |
 * | 타이틀↔서브 gap | `--sz-4`                                          |
 * | 메인 텍스트     | `text-body-3-bold`(Figma `body/3_bold`, size md/18)|
 * | 서브 텍스트     | `text-body-4`(Figma `body/4`, size sm/16)         |
 * | 텍스트 색       | `text-typo-neutral-normal`                        |
 * | 설명↔버튼 gap   | `--sz-16`                                         |
 * | 버튼 간 gap     | `--sz-8`                                          |
 */

import type { ReactNode } from "react";

import errorImg from "../../../assets/images/error.png";
import notfoundImg from "../../../assets/images/notfound.png";
import { BlankGraphic } from "../BlankGraphic";

export type EmptyVariant = "default" | "empty" | "error";

export interface EmptyProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 빈 상태 종류. 기본 'default'. */
  variant?: EmptyVariant;
  /** `variant="default"` 전용 그래픽 슬롯. 생략 시 `BlankGraphic` 플레이스홀더. */
  graphic?: ReactNode;
  /** 메인 텍스트. 기본 "Main Text". */
  mainText?: string;
  /** 서브 텍스트. 생략하면 렌더하지 않는다. 기본 "Sub Text". */
  subText?: string;
  /** 좌측 보조 액션 슬롯(예: `<ButtonWithLabel variant="outline" color="neutral">`). */
  leftButton?: ReactNode;
  /** 우측 주요 액션 슬롯(예: `<ButtonWithLabel>`). */
  rightButton?: ReactNode;
}

const GRAPHIC_CLASS = "relative size-(--sz-72) shrink-0 overflow-hidden";

export function Empty({
  variant = "default",
  graphic,
  mainText = "Main Text",
  subText = "Sub Text",
  leftButton,
  rightButton,
  className,
  ...rest
}: EmptyProps) {
  const hasButtons = Boolean(leftButton || rightButton);

  return (
    <div
      className={["flex w-full flex-col items-center gap-(--sz-16)", className]
        .filter(Boolean)
        .join(" ")}
      data-variant={variant}
      {...rest}
    >
      <div className={GRAPHIC_CLASS}>
        {variant === "empty" ? (
          <img alt="" className="size-full object-cover" src={notfoundImg} />
        ) : variant === "error" ? (
          <img alt="" className="size-full object-cover" src={errorImg} />
        ) : (
          (graphic ?? <BlankGraphic ratio="1/1" className="size-full" />)
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-(--sz-4) px-(--sz-20) text-center text-typo-neutral-normal">
        <p className="w-full text-body-3-bold">{mainText}</p>
        {subText ? <p className="w-full text-body-4">{subText}</p> : null}
      </div>

      {hasButtons ? (
        <div className="flex w-full items-start justify-center gap-(--sz-8)">
          {leftButton}
          {rightButton}
        </div>
      ) : null}
    </div>
  );
}
