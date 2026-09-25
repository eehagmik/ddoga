/**
 * Textarea — 순수 여러 줄 입력 프리미티브(테두리·배경 크롬이 전혀 없는 "transparent"
 * 텍스트영역 하나뿐 — 라벨·헬퍼텍스트·글자수 카운터 없음).
 *
 * Figma "또가3.0 Design System / Textarea" 컴포넌트 세트(node 51405:135814, `state`
 * enable/focus/disabled × `hasValue` 2 = 6 variant)와 1:1.
 *
 * **참고 노드 51405:135245 와의 관계**: 요청받은 참고 노드는 별도 컴포넌트가 아니라
 * 캔버스("❖ Textarea" 페이지) 자체다(`get_design_context` 가 "nothing selected" 오류를
 * 내는 이유 — canvas 타입 루트라 컴포넌트가 아님, `get_metadata` 로 구조만 확인 가능).
 * 그 안의 Guide 프레임이 이 Textarea 와 형제 컴포넌트인 `LineTextarea`(node
 * 51405:135837)를 나란히 문서화해 둔 것으로, `Input`↔`TextField` 와 동일한 아톰↔몰리큘
 * 구조다 — Textarea 가 아톰(크롬 없음), LineTextarea 는 이 Textarea 를 감싸 라벨/필수
 * 표시/정보아이콘/헬퍼텍스트/글자수 카운터/`PartsInputLine` 밑줄까지 얹은 몰리큘(Figma
 * 실측 코드 상 실제로 `<Textarea state=... hasValue=... />` 를 그대로 인스턴스로 사용).
 * 이번 작업 범위는 사용자가 명시한 대로 135814(Textarea)까지이며, LineTextarea 는
 * 구현하지 않는다 — 추후 필요해지면 `Input`→`TextField` 리팩토링 선례와 동일하게 이
 * `Textarea` 를 조합해 만들 것.
 *
 * 축(Figma variant/state → props):
 * - `state`: enable(기본)/focus → **Figma 실측상 이 아톰 자체는 포커스 시 별도 시각
 *   변화가 없다**(enable/focus 두 심볼의 클래스가 완전히 동일 — 밑줄·색 변경은
 *   LineTextarea 쪽 책임). 그래서 focus 를 위한 별도 CSS 도 추가하지 않고 네이티브
 *   `<textarea>` 그대로 둔다. disabled → 네이티브 `disabled` prop.
 * - `hasValue`: 별도 prop 없이 `value` 존재 여부로 판단(placeholder ↔ 값 텍스트 색 분기).
 * - `placeholder`/`placeholderValue`(Figma 데모용 토글 + 문자열) → 네이티브
 *   `placeholder?: string` 하나로 통합(문자열이 없으면 표시하지 않는 네이티브 동작과 동일
 *   해 별도 boolean 이 필요 없다).
 * - `scrollable`(Figma, 우측 2px pill 모양 `Scroll` 데코 바 노출 여부) →
 *   `scrollable?: boolean`(기본 true). Figma 원본은 별도 데코 엘리먼트를 그리지만, 이
 *   디자인시스템의 `Scroll` 컴포넌트 자체 코멘트("텍스트 영역 등의 스크롤 존재 여부를
 *   위해 제작 — 커스텀 스타일 없이 OS 기본 스크롤 사용, 트랙/썸 색만 토큰으로 오버라이드")
 *   를 따라 **의도적으로** 별도 데코 요소 대신 `<textarea>` 자체의 네이티브 스크롤에
 *   `Scroll`(`src/components/ui/Scroll`)과 동일한 `scrollbar-color`/
 *   `::-webkit-scrollbar*` 토큰 스타일을 직접 적용한다(해당 클래스는 `Scroll` 내부
 *   private 상수라 export 되어 있지 않아 동일 토큰 값으로 인라인 복제). `scrollable=false`
 *   면 스크롤 자체를 막고 넘치는 내용을 자른다(`overflow-hidden`).
 * - Figma 프레임 320×110(px) 은 문서 미리보기 크기일 뿐이다. 폭은 `Input`/`TextField`
 *   선례처럼 `w-full` 로 유연하게 두고, 높이는 (사이즈 토큰에 110px 에 정확히 대응하는
 *   값이 없기도 하고, 확장성을 위해) 고정 px 대신 네이티브 `rows`(기본 4)로 정한다.
 *
 * 색 매핑(Figma 실측):
 *
 * | 상태                                | 텍스트 색                     |
 * | ----------------------------------- | ------------------------------ |
 * | enable/focus, 값 없음(placeholder)  | `text-typo-hint-subtle`        |
 * | enable/focus, 값 있음               | `text-typo-neutral-normal`     |
 * | disabled, 값 없음(placeholder)      | `text-typo-disabled-subtle`    |
 * | disabled, 값 있음                   | `text-typo-disabled-normal`(placeholder 보다 진함 — Figma 실측) |
 *
 * 타이포: `text-body-1`(22px, line-height 1.56, tracking -0.01em) — Figma
 * `font/size/xl` 22px + tracking -0.22px 와 정확히 일치(-0.22/22 = -0.01em).
 */

import type { ChangeEvent, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "className" | "children"
> {
  /** controlled value */
  value?: string;
  /** 입력값 변경 */
  onChange?: (value: string) => void;
  /**
   * 스크롤 가능 여부(Figma `scrollable`). true 면 `Scroll` 컴포넌트와 동일한 토큰으로
   * 스타일링된 네이티브 스크롤을 허용하고, false 면 넘치는 내용을 자른다. 기본 true.
   */
  scrollable?: boolean;
  /** 루트(`<textarea>`)에 병합할 클래스 */
  className?: string;
}

/**
 * `Scroll`(`src/components/ui/Scroll/Scroll.tsx`)과 동일한 트랙/썸 토큰 스타일.
 * `scrollbar-color` 는 `<thumb> <track>` 순서(스펙 순서, 반대로 쓰면 색이 뒤바뀐다).
 */
const SCROLLBAR_CLASS =
  "[scrollbar-width:thin] " +
  "[scrollbar-color:var(--color-bg-overlay-greenGrayDeep)_var(--color-bg-overlay-greenGraySubtle)] " +
  "[&::-webkit-scrollbar]:size-(--sz-2) " +
  "[&::-webkit-scrollbar-track]:bg-bg-overlay-greenGraySubtle " +
  "[&::-webkit-scrollbar-track]:rounded-circle " +
  "[&::-webkit-scrollbar-thumb]:bg-bg-overlay-greenGrayDeep " +
  "[&::-webkit-scrollbar-thumb]:rounded-circle";

export function Textarea({
  value,
  onChange,
  scrollable = true,
  disabled = false,
  rows = 4,
  className,
  ...rest
}: TextareaProps) {
  const hasValue = Boolean(value);
  const placeholderColor = disabled
    ? "text-typo-disabled-subtle"
    : "text-typo-hint-subtle";
  const valueColor = disabled
    ? "text-typo-disabled-normal"
    : "text-typo-neutral-normal";

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <textarea
      value={value ?? ""}
      onChange={handleChange}
      disabled={disabled}
      rows={rows}
      data-scrollable={scrollable}
      className={[
        "w-full resize-none bg-transparent py-(--sz-1) outline-none",
        "text-body-1 [word-break:break-word]",
        hasValue ? valueColor : placeholderColor,
        `placeholder:${placeholderColor}`,
        disabled ? "cursor-not-allowed" : "",
        scrollable ? `overflow-y-auto ${SCROLLBAR_CLASS}` : "overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
