/**
 * LineTextarea — 라벨 + 여러 줄 입력 + 밑줄 애니메이션 + 헬퍼텍스트 + 글자수 카운터를
 * 갖춘 몰리큘 텍스트영역(`Textarea` 아톰을 조합).
 *
 * Figma "또가3.0 Design System / LineTextarea" (컴포넌트 세트 node 51405:135837, 형제
 * 아톰 `Textarea` 는 node 51405:135814, `src/components/ui/Textarea` 로 이미 구현됨)와
 * 1:1 — `Input`→`TextField` 리팩토링과 정확히 같은 아톰↔몰리큘 구조를 그대로 따른다.
 * Figma 실측 코드 상으로도 실제 `<Textarea state=... hasValue=... />` 를 그대로 인스턴스로
 * 사용하고 그 아래 밑줄(`PartsInputLine`) + `Label` + `HelperLabel` + `CountLabel`("1/500자")
 * 을 얹는 구조다.
 *
 * 축(Figma variant/prop → props):
 * - `state`: enable(기본)/hover/focus → **CSS 의사클래스**로 흡수(props 아님, `Input`
 *   선례와 동일). danger/disabled → `danger?`/`disabled` props.
 * - `hasValue`: 별도 prop 없이 `value` 존재 여부로 판단(`Textarea` 에 그대로 위임).
 * - `isLabel` → `label` presence 기반(값이 없으면 라벨 행 자체를 렌더하지 않음).
 * - `Label` 의 `principal`(필수 표시 `*`) → `required?: boolean`. `info`(정보 아이콘) →
 *   `onInfoClick?` presence 기반(`TextField`/`Label` 선례와 동일 — 생략 시 아이콘 자체를
 *   렌더하지 않는다). 라벨 텍스트를 실제 `<label htmlFor>` 로 감싸 `Textarea` 와
 *   접근성으로 연결한다(Figma `Label` 컴포넌트 자체는 `<div>` 라 라벨-폼 연결이 없다 —
 *   `TextField` 의 `<label>` 래핑 관례를 그대로 적용).
 * - `isHelper`/`isInputCount`/`isOption`: 개별 boolean 토글이지만 Figma 실측 코드를 보면
 *   `isInputCount` 는 "enable && !hasValue" 한 심볼에서만 실제로 조건에 쓰이고 나머지
 *   (hover/focus/danger/disabled/enable+hasValue) 심볼에서는 카운터가 조건 없이 항상
 *   렌더된다 — Figma 컴포넌트 프로퍼티 배선 누락으로 보인다. `TextField`/`HelperLabel`
 *   선례(presence 기반)를 따라 별도 boolean 을 두지 않고 `helperText`/`maxLength`
 *   presence 로 통일했다: `helperText` 가 있으면 헬퍼 행, `maxLength` 가 있으면(네이티브
 *   `<textarea maxlength>` 속성 겸용) 카운터를 렌더한다. 헬퍼&카운터 행 자체(`isOption`)도
 *   둘 중 하나라도 있을 때만 렌더된다.
 * - danger 헬퍼는 `HelperLabel`(size=md, variant=danger — Figma 실측 16px + 경고
 *   삼각형 아이콘)로, 기본 헬퍼는 `HelperLabel`(size=md, variant=default)로 그대로
 *   재사용한다. `CountLabel` 은 별도 컴포넌트가 없어 이 파일에서 직접 마크업한다(구조가
 *   단순한 텍스트 한 줄뿐).
 * - Figma 코멘트("최소 2줄~최대 5줄까지 노출 가능")는 컨슈머가 `rows` 를 2~5 사이로
 *   고르라는 사용 가이드로 해석했다 — `Textarea` 아톰 자체가 고정 `rows` 기반(자동
 *   grow 없음)이라 이 컴포넌트도 `rows` 를 그대로 `Textarea` 에 전달만 한다(기본값은
 *   `Textarea` 의 기본 4를 그대로 상속).
 *
 * 밑줄(`PartsInputLine`) 색 매핑(Figma 실측, `hasValue` 와 무관 — Figma 코드 상 밑줄은
 * `state` 값에만 반응한다):
 * - enable/hover(기본): `bg-bg-neutral-deepDark`, 포커스 시 `bg-bg-brand-normal` 로 전환.
 * - danger: `bg-bg-danger-normal`(포커스 여부 무관, 상시).
 * - disabled: `bg-bg-disabled-normal`.
 *
 * **`Input` 대비 의도적 정정**: `Input` 의 line 밑줄은 `focus-within:` 을 밑줄 엘리먼트
 * 자기 자신에 걸어 두는데, 밑줄은 내용이 없는 빈 `<div>` 라 실제로는 포커스를 받을 수
 * 없어 이 클래스가 절대 발동하지 않는(sibling 의 포커스에 반응 못하는) 잠재 버그로
 * 보인다. `LineTextarea` 는 필드+밑줄의 공통 부모에 `group` 을 걸고 밑줄에
 * `group-focus-within:` 을 사용해 실제로 동작하도록 구현했다([[.group 루트 자기 hover
 * 스타일]] 메모의 self-vs-descendant 구분 원칙과 동일한 논리).
 *
 * hover 는 필드(Textarea 를 감싼) 컨테이너 자기 자신에 `rounded-md` + `hover:bg-bg-
 * overlay-greenGraySubtle` 배경 틴트만 추가한다(밑줄 불변, disabled/danger 는 hover
 * 틴트 자체를 제외 — `Input` 의 danger/disabled 분기와 동일 규칙).
 *
 * 타이포: 라벨 `Label`(size=sm 기본), 헬퍼 `HelperLabel`(size=md), 카운터
 * `text-xs`(14px) `text-typo-neutral-light`.
 */

import { useId, type TextareaHTMLAttributes } from "react";

import { HelperLabel } from "../HelperLabel";
import { Label } from "../Label";
import { Textarea } from "../Textarea";

export interface LineTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "children" | "className"
> {
  /** 라벨 텍스트. 없으면 라벨 행 자체를 렌더하지 않는다(Figma `isLabel`) */
  label?: string;
  /** 라벨 옆 필수 표시 `*`(Figma `Label` `principal`). `label` 이 있을 때만 의미가 있다 */
  required?: boolean;
  /** 라벨 옆 정보 아이콘 버튼 클릭 핸들러. 생략 시 아이콘 자체를 렌더하지 않는다 */
  onInfoClick?: () => void;
  /** controlled value */
  value?: string;
  /** 입력값 변경 */
  onChange?: (value: string) => void;
  /** 스크롤 가능 여부(Figma `scrollable`), `Textarea` 로 그대로 전달. 기본 true */
  scrollable?: boolean;
  /** 헬퍼 텍스트. 있을 때만 렌더(danger 면 경고 아이콘 + 빨간색으로 자동 전환).
   * `HelperLabel` 재사용 때문에 문자열만 지원한다(TextField 의 helperText 는 ReactNode
   * 지만 이 프로젝트의 `HelperLabel` 컴포넌트 자체가 `label?: string` 만 받는다) */
  helperText?: string;
  /** 에러/경고 상태(Figma `state=danger`) */
  danger?: boolean;
  /** 루트에 병합할 클래스 */
  className?: string;
  /** 네이티브 `<textarea>` 에 병합할 클래스 */
  textareaClassName?: string;
}

/** 필드(Textarea) 컨테이너 hover 틴트 — disabled/danger 에서는 제외(`Input` 규칙과 동일) */
function getFieldContainerClass(danger: boolean, disabled: boolean): string {
  return [
    "w-full rounded-md",
    "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
    !danger && !disabled ? "hover:bg-bg-overlay-greenGraySubtle" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * 밑줄 색(Figma 실측 — `hasValue` 무관, `state` 만으로 결정).
 * `group-focus-within:` 은 공통 부모(`group`)를 통해 실제로 포커스에 반응한다.
 */
function getUnderlineClass(danger: boolean, disabled: boolean): string {
  const base = [
    "h-(--sz-2) w-full shrink-0 rounded-circle",
    "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
  ];
  if (disabled) return [...base, "bg-bg-disabled-normal"].join(" ");
  if (danger) return [...base, "bg-bg-danger-normal"].join(" ");
  return [
    ...base,
    "bg-bg-neutral-deepDark group-focus-within:bg-bg-brand-normal",
  ].join(" ");
}

export function LineTextarea({
  label,
  required = false,
  onInfoClick,
  value,
  onChange,
  scrollable = true,
  helperText,
  danger = false,
  disabled = false,
  className,
  textareaClassName,
  maxLength,
  id,
  ...rest
}: LineTextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  const showCount = typeof maxLength === "number";
  const showHelperRow = Boolean(helperText) || showCount;
  const count = value?.length ?? 0;

  return (
    <div
      data-danger={danger}
      data-disabled={disabled}
      className={["flex w-full flex-col items-start gap-(--sz-8)", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col items-start gap-(--sz-16)">
        {label ? (
          <label htmlFor={textareaId}>
            <Label
              label={label}
              principal={required}
              info={Boolean(onInfoClick)}
              onInfoClick={onInfoClick}
            />
          </label>
        ) : null}

        <div className="group flex w-full flex-col items-start gap-(--sz-8)">
          <div className={getFieldContainerClass(danger, disabled)}>
            <Textarea
              id={textareaId}
              value={value}
              onChange={onChange}
              scrollable={scrollable}
              disabled={disabled}
              maxLength={maxLength}
              aria-invalid={danger || undefined}
              className={textareaClassName}
              {...rest}
            />
          </div>
          <div className={getUnderlineClass(danger, disabled)} />
        </div>
      </div>

      {showHelperRow ? (
        <div className="flex w-full items-center justify-end gap-(--sz-8)">
          {helperText ? (
            <HelperLabel
              label={helperText}
              size="md"
              variant={danger ? "danger" : "default"}
              className="min-w-0 flex-1"
            />
          ) : null}
          {showCount ? (
            <p className="shrink-0 whitespace-nowrap py-(--sz-5) text-xs leading-none tracking-[-0.14px] text-typo-neutral-light">
              {count}/{maxLength}자
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
