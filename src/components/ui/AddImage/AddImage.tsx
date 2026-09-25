/**
 * 사진 등록(AddImage) — "사진" 버튼을 눌러 파일을 선택하면 오른쪽에 썸네일로 등록되고,
 * 각 썸네일을 `ClearButton` 으로 지울 수 있는 이미지 업로드 인터랙션 컴포넌트.
 *
 * Figma "또가3.0 Design System / AddImage" (문서 페이지 node 51405:5544 는 canvas 라
 * `get_design_context` 조회 불가 — 메인 컴포넌트 node 51405:5649 기준 구현) 및 내부
 * `_parts/AddImageItem`(node 51405:5637, private) 와 1:1. `_parts/` 는 Searchbar 선례처럼
 * 별도 public 컴포넌트로 노출하지 않고 이 컴포넌트에 통합한다.
 *
 * 구조(Figma): addButton(68×68, 카메라 아이콘 + "사진" 라벨) 1개 + 이미지 썸네일 N개가
 * `gap: 12px` 로 한 줄에 나열된다. `RatioHorizontal` 은 Figma 내부 1:1 비율 유지용 레이아웃
 * 트릭 노드일 뿐 실제 시각 요소가 아니라 구현에서 제외한다(고정 68×68 박스로 충분).
 *
 * 인터랙션(사용자 확정, Figma 에 없는 축):
 * - `addButton` 은 `<label>` + 시각적으로 숨긴 `<input type="file" class="sr-only">` 조합
 *   (Checkbox/Switch/LikeToggle 에서 쓴 `label + peer/hidden input` 컨벤션과 동일 계열).
 *   input 이 label 의 자식(형제 아님)이라 `peer-*` 대신 `focus-within:` 로 포커스 딥을 준다.
 * - 파일 선택 시 각 `File` 을 `URL.createObjectURL()` 로 미리보기 URL 화해 `images` 뒤에
 *   append(`onChange`) 한다. `crypto.randomUUID()` 로 id 부여.
 * - 개수 제한 없음(사용자 확정) — addButton 은 항상 노출.
 * - 삭제 시 해당 항목이 로컬에서 생성한 object URL(=`file` 존재)이면 `URL.revokeObjectURL`
 *   로 정리한다. `file` 없이 `url` 만 있는 프리필 항목(서버 기존 이미지)은 절대 revoke 하지
 *   않는다 — 일반 http(s) URL 이라 브라우저가 무시하지만, 의미상 이 컴포넌트가 만든 리소스가
 *   아니므로 구분한다. 언마운트 시 아직 정리되지 않은 로컬 object URL 도 모두 revoke 한다.
 * - `disabled` 시 `<input disabled>` 로 label 클릭이 네이티브하게 막히고(ClearButton/IconButton
 *   선례처럼 별도 JS 가드 없음), 각 썸네일의 `ClearButton` 도 `disabled` 전파.
 * - 썸네일이 많아지면 가로 스크롤(사용자 확정) — 자체 `overflow-x-auto` 를 새로 만들지 않고
 *   기존 `Scroll axis="x"` 를 재사용한다. 단 Figma 상 이 컴포넌트는 스크롤바가 보이지 않는
 *   형태라, `Scroll` 자체 코드는 건드리지 않고 이 컴포넌트 범위에서만 스크롤바를 시각적으로
 *   숨긴다 — `Scroll` 이 부여한 `[scrollbar-width:thin]`/`::-webkit-scrollbar` 유틸보다 항상
 *   이기도록 Tailwind v4 trailing `!` important 모디파이어로 오버라이드한다(클래스 순서가 아닌
 *   `!important` 로 이기므로 `Scroll` 내부에서 `className` 을 뒤에 병합하는 순서에 의존하지
 *   않는다). 스크롤 동작 자체(overflow-x-auto)는 `Scroll` 의 네이티브 구현 그대로 둔다.
 *
 * 토큰 매핑(Figma 실측):
 * | 대상                  | 토큰 유틸                                               |
 * | 아이템 크기 68×68      | `size-(--sz-68)`                                   |
 * | 아이템 간 gap 12       | `gap-(--sz-12)`                                    |
 * | radius/xl (12)        | `rounded-xl`                                            |
 * | addButton 배경         | `bg-bg-neutral-deep`                                    |
 * | addButton 테두리        | `border-xs border-solid border-border-neutral-bright`   |
 * | "사진" 라벨 색/스타일    | `text-typo-neutral-bright` + `text-label-2`             |
 * | camera_plus_line 색    | `text-icon-neutral-bright`                              |
 * | ClearButton 오프셋      | `-right-(--sz-9) -top-(--sz-8)` (Figma 실측 -9/-8 과 일치) |
 * | ClearButton 크기        | `size="md"`(18px, 기존 컴포넌트 그대로 재사용)            |
 *
 * 재사용: `ClearButton`(size="md"), `Icon`(`camera_plus_line`), `Scroll`(axis="x").
 */

import type { ChangeEvent } from "react";
import { useEffect, useRef } from "react";

import { Icon } from "../../../icons";
import { ClearButton } from "../ClearButton";
import { Scroll } from "../Scroll";

/** 등록된(혹은 등록 예정인) 이미지 한 장. */
export interface AddImageItem {
  /** 항목 식별자. `crypto.randomUUID()` 로 생성해 넘기는 것을 권장. */
  id: string;
  /** 미리보기 URL — 로컬 선택분은 object URL, 서버 기존 이미지는 원격 URL. */
  url: string;
  /** 로컬 파일 선택으로 생긴 항목만 존재(업로드용). 프리필 항목은 없음. */
  file?: File;
}

export interface AddImageProps {
  /** 현재 등록된 이미지 목록(controlled). */
  images: AddImageItem[];
  /** 추가 또는 삭제로 목록이 바뀔 때마다 새 배열과 함께 호출. */
  onChange: (images: AddImageItem[]) => void;
  /** 파일 선택 직후(추가 전, 원본 File[] 이 필요한 업로드 트리거용) 추가로 호출. */
  onAdd?: (files: File[]) => void;
  /** 특정 항목 삭제 직후 추가로 호출. */
  onRemove?: (id: string) => void;
  /** 파일 입력 `accept`. 기본 "image/*". */
  accept?: string;
  /** 파일 입력에서 다중 선택 허용 여부. 기본 true(사용자 확정). */
  multiple?: boolean;
  /** true 면 추가·삭제 모두 비활성화. */
  disabled?: boolean;
  /** addButton 라벨 텍스트. 기본 "사진". */
  addLabel?: string;
  /** 각 썸네일 ClearButton 의 `aria-label`. 기본 "이미지 삭제". */
  clearLabel?: string;
  /** 루트(Scroll) 에 병합할 클래스. */
  className?: string;
}

/** `Scroll` 이 부여하는 네이티브 스크롤바 트리트먼트를 이 컴포넌트 범위에서만 숨긴다. */
const HIDE_SCROLLBAR_CLASS =
  "[scrollbar-width:none]! [-ms-overflow-style:none]! [&::-webkit-scrollbar]:hidden!";

// Scroll 은 overflow-x-auto 라 CSS 스펙상 overflow-y 도 암묵적으로 auto(클리핑)로
// 강제된다. ClearButton 이 각 썸네일 상단 밖으로 sz-8, 마지막 썸네일은 우측 밖으로
// sz-9 만큼 튀어나오므로 그만큼 padding-top/padding-right 으로 클리핑 안전 영역을
// 확보한다. 이 padding 은 (top 만 상쇄하던 이전 버전과 달리) 음수 margin 으로
// 상쇄하지 않는다 — 상쇄하면 Scroll 박스가 그만큼 부모 쪽으로 넘쳐서, 부모가
// padding/overflow-hidden 을 가진 실제 배치 상황에서 이번엔 부모 경계에서 다시
// 잘리는 문제가 재발한다(사용자 확인 케이스). 대신 컴포넌트 자체 바운딩 박스가
// top 8px/right 9px 만큼 살짝 커지는 것을 감수하고, 그 여유 공간을 컴포넌트가
// 항상 소유해 어떤 부모에 배치되어도 ClearButton 이 잘리지 않도록 보장한다.
const ROOT_CLASS = "flex items-center gap-(--sz-12) pt-(--sz-8) pr-(--sz-9)";

const ADD_BUTTON_BASE_CLASS =
  "relative flex size-(--sz-68) shrink-0 flex-col items-center justify-center " +
  "gap-(--sz-8) overflow-hidden rounded-xl border-xs border-solid " +
  "border-border-neutral-bright bg-bg-neutral-deep " +
  "focus-within:opacity-(--alpha-60)";

const ADD_BUTTON_DISABLED_CLASS = "cursor-not-allowed opacity-(--alpha-40)";
const ADD_BUTTON_ENABLED_CLASS = "cursor-pointer";

const THUMB_CLASS = "relative size-(--sz-68) shrink-0";

const THUMB_IMAGE_WRAPPER_CLASS = "size-full overflow-hidden rounded-xl";

const CLEAR_BUTTON_POSITION_CLASS = "absolute -right-(--sz-9) -top-(--sz-8)";

export function AddImage({
  images,
  onChange,
  onAdd,
  onRemove,
  accept = "image/*",
  multiple = true,
  disabled = false,
  addLabel = "사진",
  clearLabel = "이미지 삭제",
  className,
}: AddImageProps) {
  // 이 컴포넌트가 직접 만든 object URL 만 추적해 언마운트 시 정리한다.
  // (프리필된 원격 URL 은 이 컴포넌트 소유 리소스가 아니므로 대상에서 제외.)
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    // 같은 파일을 연속으로 골라도 change 가 다시 발생하도록 즉시 리셋.
    event.target.value = "";
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const newItems: AddImageItem[] = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);
      return { id: crypto.randomUUID(), url, file };
    });

    onChange([...images, ...newItems]);
    onAdd?.(files);
  }

  function handleRemove(id: string) {
    const target = images.find((item) => item.id === id);
    if (target?.file) {
      URL.revokeObjectURL(target.url);
      objectUrlsRef.current.delete(target.url);
    }
    onChange(images.filter((item) => item.id !== id));
    onRemove?.(id);
  }

  return (
    <Scroll
      axis="x"
      className={[ROOT_CLASS, HIDE_SCROLLBAR_CLASS, className]
        .filter(Boolean)
        .join(" ")}
    >
      <label
        className={[
          ADD_BUTTON_BASE_CLASS,
          disabled ? ADD_BUTTON_DISABLED_CLASS : ADD_BUTTON_ENABLED_CLASS,
        ].join(" ")}
        data-disabled={disabled || undefined}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          className="sr-only"
        />
        <Icon
          name="camera_plus_line"
          size={24}
          className="text-icon-neutral-bright"
        />
        <span className="text-label-2 text-typo-neutral-bright">
          {addLabel}
        </span>
      </label>

      {images.map((item) => (
        <div key={item.id} className={THUMB_CLASS}>
          <div className={THUMB_IMAGE_WRAPPER_CLASS}>
            <img src={item.url} alt="" className="size-full object-cover" />
          </div>
          <ClearButton
            size="md"
            label={clearLabel}
            disabled={disabled}
            onClick={() => handleRemove(item.id)}
            className={CLEAR_BUTTON_POSITION_CLASS}
          />
        </div>
      ))}
    </Scroll>
  );
}
