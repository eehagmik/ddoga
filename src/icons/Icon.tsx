import type { SVGProps } from "react";

import type { IconName } from "./iconNames";
import { iconRegistry } from "./iconRegistry";

/** 기본 크기(px). 단위 없는 숫자라 토큰 규칙에 걸리지 않는다. rem 기반 크기는 className(size-6 등)으로. */
const DEFAULT_SIZE = 24;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "name" | "title"> & {
  /** Figma 심볼명 그대로. 예: 'align_bottom_01_line', 'atSign_line', 'facebook' */
  name: IconName;
  /** width/height 로 주입할 px 정수. 기본 24. */
  size?: number;
  /** 지정하면 접근 가능한 이름(role="img" + <title>). 미지정이면 aria-hidden 처리. */
  title?: string;
};

/**
 * 이름으로 아이콘을 그리는 래퍼. 색은 `currentColor` 를 상속하므로 부모에 `text-icon-*` 를 준다.
 * 개별 컴포넌트를 직접 import 해서 써도 된다 — `<AlignBottom01Line className="size-6" />`.
 */
export function Icon({
  name,
  size = DEFAULT_SIZE,
  title,
  children,
  ...rest
}: IconProps) {
  const Svg = iconRegistry[name];
  return (
    <Svg
      width={size}
      height={size}
      focusable={false}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </Svg>
  );
}
