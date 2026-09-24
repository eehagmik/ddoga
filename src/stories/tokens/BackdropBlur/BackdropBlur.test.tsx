import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BackdropBlur } from "./BackdropBlur";

describe("BackdropBlur", () => {
  it("전체 렌더 시 dim · header 2개 섹션을 순서대로 표시한다", () => {
    const { container } = render(<BackdropBlur />);
    const sections = Array.from(
      container.querySelectorAll("[data-section]"),
    ).map((el) => el.getAttribute("data-section"));
    expect(sections).toEqual(["dim", "header"]);
  });

  it("Figma BackdropBlur 문서의 2개 --blur 토큰을 렌더한다", () => {
    const { container } = render(<BackdropBlur />);
    const tokens = Array.from(container.querySelectorAll("[data-token]")).map(
      (el) => el.getAttribute("data-token"),
    );
    expect(tokens).toEqual(["--blur-dim", "--blur-header"]);
  });

  it("section prop 지정 시 해당 토큰만 렌더한다", () => {
    const { container } = render(<BackdropBlur section="header" />);
    expect(container.querySelectorAll("[data-section]")).toHaveLength(1);
    expect(container.querySelector('[data-section="header"]')).not.toBeNull();
    expect(
      container.querySelector('[data-token="--blur-header"]'),
    ).not.toBeNull();
  });

  it("유리 패널은 backdrop-blur 유틸 클래스로 흐림을 지정한다", () => {
    const { container } = render(<BackdropBlur section="dim" />);
    const panel = container.querySelector('[data-token="--blur-dim"]');
    expect(panel?.className).toContain("backdrop-blur-dim");
  });
});
