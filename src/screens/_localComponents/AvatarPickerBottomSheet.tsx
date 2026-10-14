/**
 * AvatarPickerBottomSheet — "성별 이미지" 선택 바텀시트.
 *
 * Figma "김또가" 화면 주석 "수정버튼" → "성별 이미지" 바텀시트(node 31156:77994)와
 * 1:1. 프로필 아바타 옆 연필(편집) 배지를 누르면 열리는, 4종 일러스트 아바타 중
 * 하나를 고르는 바텀시트다.
 *
 * 기존 `BottomSheet`(header+body+`FixButton` variant="single") 합성을 그대로 쓰고,
 * 4개 선택지는 기존 `Avatar`(size="2xl"=84px, type="person", variant="checkable")를
 * 재사용한다 — `checkable` variant가 정확히 Figma의 "선택 시 브랜드 컬러 링" 구조와
 * 1:1이라 별도 포커스링 그래픽을 새로 만들 필요가 없다.
 *
 * @example
 * <AvatarPickerBottomSheet
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   options={[{ id: "pink", label: "분홍 일러스트", src: pinkSrc }]}
 *   selectedId={selectedId}
 *   onSelect={setSelectedId}
 *   onConfirm={saveAvatar}
 * />
 */

import { BottomSheet } from "../../components/ui/BottomSheet";
import { Avatar } from "../../components/ui/Avatar";

export interface AvatarPickerOption {
  id: string;
  /** 접근성 라벨(예: "분홍 할머니"). */
  label: string;
  src: string;
}

export interface AvatarPickerBottomSheetProps {
  /** 열림 상태. */
  open: boolean;
  /** 닫기 콜백. */
  onClose?: () => void;
  /** 선택지 목록(Figma 4개). */
  options: AvatarPickerOption[];
  /** 현재 선택된 옵션 id. */
  selectedId: string;
  /** 옵션 선택 콜백. */
  onSelect?: (id: string) => void;
  /** "변경완료" 클릭 콜백. */
  onConfirm?: () => void;
}

export function AvatarPickerBottomSheet({
  open,
  onClose,
  options,
  selectedId,
  onSelect,
  onConfirm,
}: AvatarPickerBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="성별 이미지"
      fixButton={{
        variant: "single",
        primaryLabel: "변경완료",
        onPrimaryClick: onConfirm,
      }}
    >
      <div className="grid w-full grid-cols-2 justify-items-center gap-(--sz-16)">
        {options.map((option) => (
          <Avatar
            key={option.id}
            size="2xl"
            type="person"
            variant="checkable"
            src={option.src}
            aria-label={option.label}
            checked={option.id === selectedId}
            onCheckedChange={(checked) => {
              if (checked) onSelect?.(option.id);
            }}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
