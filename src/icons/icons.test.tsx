import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./Icon";
import { ICON_NAMES } from "./iconNames";
import { iconRegistry } from "./iconRegistry";

describe("icon registry", () => {
  it("ICON_NAMES 는 중복이 없다", () => {
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });

  it("아이콘이 충분히 등록돼 있다", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(2300);
  });

  it("모든 IconName 에 레지스트리 컴포넌트가 있다", () => {
    for (const n of ICON_NAMES) {
      expect(typeof iconRegistry[n]).toBe("function");
    }
  });

  it("레지스트리에 여분 키가 없다", () => {
    expect(Object.keys(iconRegistry).sort()).toEqual([...ICON_NAMES].sort());
  });

  it("line / solid 는 별도 엔트리로 존재한다", () => {
    expect(ICON_NAMES).toContain("align_bottom_01_line");
    expect(ICON_NAMES).toContain("align_bottom_01_solid");
  });
});

describe("Icon", () => {
  it("샘플 아이콘이 <svg><path> 로 렌더되고 하드코딩 색이 없다", () => {
    for (const n of [
      "align_bottom_01_line",
      "atSign_line",
      "facebook",
    ] as const) {
      const { container, unmount } = render(<Icon name={n} />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg!.querySelector("path")).not.toBeNull();
      expect(svg!.getAttribute("width")).toBe("24");
      expect(svg!.getAttribute("aria-hidden")).toBe("true");
      expect(svg!.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      unmount();
    }
  });

  it("size prop 이 width/height 로 주입된다", () => {
    const { container } = render(<Icon name="facebook" size={40} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("40");
    expect(svg.getAttribute("height")).toBe("40");
  });

  it("title prop → role=img + <title>", () => {
    const { container } = render(<Icon name="facebook" title="페이스북" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.querySelector("title")?.textContent).toBe("페이스북");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
  });

  it("전체 스모크 — 모든 아이콘이 예외 없이 렌더된다", () => {
    for (const n of ICON_NAMES) {
      const { unmount } = render(<Icon name={n} />);
      unmount();
    }
  });
});
