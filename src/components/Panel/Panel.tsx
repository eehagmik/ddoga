import type { ReactNode } from "react";

export interface PanelProps {
  /** Background color variant */
  color?: "white" | "dim";
  /** Panel placement (affects corner radius and shadow direction) */
  placement?: "top" | "bottom";
  /** Enable rounded corners (3xl radius) */
  radius?: boolean;
  /** Enable drop shadow */
  shadow?: boolean;
  /** Panel content */
  children?: ReactNode | null;
  /** Optional CSS class override */
  className?: string;
}

/**
 * Panel component — a flexible container with customizable background, placement, and visual effects.
 *
 * - **color**: Background color (white or dim overlay)
 * - **placement**: Position-aware styling (top applies shadow upward and rounds bottom; bottom applies shadow downward and rounds top)
 * - **radius**: Toggles 3xl border radius (default false)
 * - **shadow**: Toggles greenGray drop shadow (default false)
 *
 * Note: When placement=top, y-axis coordinates may need adjustment based on your layout (e.g., if no Header is present).
 */
export function Panel({
  color = "white",
  placement = "bottom",
  radius = false,
  shadow = false,
  children = null,
  className,
}: PanelProps) {
  // Build base classes
  const baseClasses = [
    "flex flex-col items-center gap-0 relative w-[360px]",
    "px-(--sz-20) py-(--sz-16)",
  ];

  // Background color
  const colorClasses = {
    white: "bg-bg-neutral-normal",
    dim: "bg-bg-overlay-blackDark",
  };
  baseClasses.push(colorClasses[color]);

  // Radius (placement determines which corners round)
  if (radius) {
    const radiusClasses = {
      top: "rounded-bl-(--radius-3xl) rounded-br-(--radius-3xl)",
      bottom: "rounded-tl-(--radius-3xl) rounded-tr-(--radius-3xl)",
    };
    baseClasses.push(radiusClasses[placement]);
  }

  // Shadow (direction depends on placement)
  if (shadow) {
    if (placement === "top") {
      baseClasses.push(
        "[filter:drop-shadow(0_var(--sz-8)_calc(var(--sz-20)/2)_var(--color-shadow-greenGray-normal))_drop-shadow(0_var(--sz-3)_calc(var(--sz-8)/2)_var(--color-shadow-greenGray-light))]",
      );
    } else {
      baseClasses.push(
        "[filter:drop-shadow(0_calc(var(--sz-8)*-1)_calc(var(--sz-20)/2)_var(--color-shadow-greenGray-normal))_drop-shadow(0_calc(var(--sz-8)*-1)_calc(var(--sz-8)/2)_var(--color-shadow-greenGray-light))]",
      );
    }
  }

  const finalClassName = className || baseClasses.join(" ");

  return (
    <div className={finalClassName} data-node-id="51405:127512">
      <div
        className="border border-red-500 border-dashed h-[30px] relative shrink-0 w-full"
        data-node-id="51405:127514"
        data-name="contentsSlot"
      >
        {children}
      </div>
    </div>
  );
}
