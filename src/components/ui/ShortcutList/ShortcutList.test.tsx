import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ShortcutListColumn } from "./ShortcutList";
import { ShortcutList } from "./ShortcutList";

const COLUMNS: ShortcutListColumn[] = ["3", "4", "5"];

describe("ShortcutList", () => {
  it("기본값은 column='3' 이고 grid + gap 토큰을 적용한다", () => {
    const { container } = render(
      <ShortcutList>
        <div>item</div>
      </ShortcutList>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-column", "3");
    expect(root).toHaveClass("grid", "gap-(--sz-16)");
  });

  it.each(COLUMNS)("column=%s 별 grid-cols 유틸을 적용한다", (column) => {
    const { container } = render(
      <ShortcutList column={column}>
        <div>item</div>
      </ShortcutList>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-column", column);
    expect(root).toHaveClass(`grid-cols-[repeat(${column},minmax(0,1fr))]`);
  });

  it("children 개수와 무관하게 그대로 렌더한다(행 개수 하드코딩 없음)", () => {
    const { getAllByText } = render(
      <ShortcutList column="4">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i}>item-{i}</div>
        ))}
      </ShortcutList>,
    );
    expect(getAllByText(/^item-/)).toHaveLength(20);
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <ShortcutList className="mt-(--sz-8)">
        <div>item</div>
      </ShortcutList>,
    );
    expect(container.firstElementChild).toHaveClass("mt-(--sz-8)", "grid");
  });

  it("색·크기를 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { container } = render(
      <ShortcutList>
        <div>item</div>
      </ShortcutList>,
    );
    expect(
      container.firstElementChild?.getAttribute("style") ?? "",
    ).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
