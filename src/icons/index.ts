export { Icon } from "./Icon";
export type { IconProps } from "./Icon";
export { ICON_NAMES } from "./iconNames";
export type { IconName } from "./iconNames";
export { iconRegistry } from "./iconRegistry";
export type { IconComponent } from "./iconRegistry";

// 개별 아이콘 컴포넌트는 여기서 재-export 하지 않는다(번들 크기). 필요하면 직접 import:
//   import { AlignBottom01Line } from '../icons/components/align-bottom-01-line'
