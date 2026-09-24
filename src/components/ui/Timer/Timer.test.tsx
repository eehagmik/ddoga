import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Timer } from "./Timer";

describe("Timer", () => {
  it("minutes=true 일 때 179초를 02:59 로 표시한다", () => {
    const { container } = render(<Timer seconds={179} minutes />);
    expect(container.textContent).toBe("02:59");
  });

  it("minutes=true 일 때 0초를 00:00 으로 표시한다", () => {
    const { container } = render(<Timer seconds={0} minutes />);
    expect(container.textContent).toBe("00:00");
  });

  it("minutes=false 일 때 59초를 59 로 표시한다", () => {
    const { container } = render(<Timer seconds={59} minutes={false} />);
    expect(container.textContent).toBe("59");
  });

  it("minutes=false 일 때 0초를 00 으로 표시한다", () => {
    const { container } = render(<Timer seconds={0} minutes={false} />);
    expect(container.textContent).toBe("00");
  });

  it("한 자리 분/초에 zero-padding 을 적용한다 (65초 → 01:05)", () => {
    const { container } = render(<Timer seconds={65} minutes />);
    expect(container.textContent).toBe("01:05");
  });

  it("minutes 기본값은 true 다", () => {
    const { container } = render(<Timer seconds={65} />);
    expect(container.textContent).toBe("01:05");
  });

  it("type 기본값은 countdown 이며 data-type 속성에 반영된다", () => {
    const { container } = render(<Timer seconds={0} />);
    expect(container.querySelector("span")).toHaveAttribute(
      "data-type",
      "countdown",
    );
  });

  it("type=countup 을 지정하면 data-type 속성에 반영된다", () => {
    const { container } = render(<Timer seconds={0} type="countup" />);
    expect(container.querySelector("span")).toHaveAttribute(
      "data-type",
      "countup",
    );
  });

  it("색·타이포를 토큰 유틸로만 지정한다", () => {
    const { container } = render(<Timer seconds={0} />);
    const el = container.querySelector("span");
    expect(el).toHaveClass("text-typo-info-normal", "text-label-2");
  });

  it("className 을 루트 span 에 병합한다", () => {
    const { container } = render(<Timer seconds={0} className="opacity-50" />);
    expect(container.querySelector("span")).toHaveClass(
      "text-typo-info-normal",
      "opacity-50",
    );
  });

  it("인라인 style 에 hex 값이 없다", () => {
    const { container } = render(<Timer seconds={0} />);
    const el = container.querySelector("span");
    expect(el?.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
