import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapPin } from "./MapPin";

describe("MapPin", () => {
  it("기본값은 color=normal / variant=circle 의 원형 점을 렌더하고 라벨은 없다", () => {
    const { container } = render(<MapPin />);
    const root = container.querySelector('[data-name="MapPin"]');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-color", "normal");
    expect(root).toHaveAttribute("data-variant", "circle");

    const circle = container.querySelector('[data-name="Circle"]');
    expect(circle).not.toBeNull();
    expect(circle).toHaveClass("bg-bg-danger-normal", "rounded-circle");

    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("span")).toBeNull();
  });

  it("color=brand 는 circle 배경을 bg-bg-brand-normal 로, marker 는 text-icon-brand-normal 로 렌더한다", () => {
    const { container: circleContainer } = render(
      <MapPin color="brand" variant="circle" />,
    );
    expect(circleContainer.querySelector('[data-name="Circle"]')).toHaveClass(
      "bg-bg-brand-normal",
    );

    const { container: markerContainer } = render(
      <MapPin color="brand" variant="marker" />,
    );
    const svg = markerContainer.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveClass("text-icon-brand-normal");
  });

  it("variant=marker 는 circle div 대신 인라인 SVG 를 렌더한다", () => {
    const { container } = render(<MapPin variant="marker" />);
    expect(container.querySelector('[data-name="Circle"]')).toBeNull();
    const svg = container.querySelector('[data-name="Pin"]');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("viewBox", "0 0 54 54");
    expect(svg?.querySelector("path")).toHaveAttribute("fill", "currentColor");
  });

  it("label 을 전달하면 라벨 텍스트를 렌더한다", () => {
    const { container } = render(<MapPin label="강남역" />);
    const label = container.querySelector("span");
    expect(label).not.toBeNull();
    expect(label?.textContent).toBe("강남역");
    expect(label).toHaveClass("text-body-5-bold", "break-words");
  });

  it("label 을 생략하면 라벨을 렌더하지 않는다", () => {
    const { container } = render(<MapPin />);
    expect(container.querySelector("span")).toBeNull();
  });

  it("label 이 빈 문자열이면 라벨을 렌더하지 않는다(presence 기반)", () => {
    const { container } = render(<MapPin label="" />);
    expect(container.querySelector("span")).toBeNull();
  });

  it("maxWidth 숫자는 px 로 변환해 인라인 style 에 적용한다", () => {
    const { container } = render(<MapPin label="라벨" maxWidth={110} />);
    const label = container.querySelector("span");
    expect(label).toHaveStyle({ maxWidth: "110px" });
  });

  it("maxWidth 문자열은 그대로 인라인 style 에 적용한다", () => {
    const { container } = render(<MapPin label="라벨" maxWidth="10rem" />);
    const label = container.querySelector("span");
    expect(label).toHaveStyle({ maxWidth: "10rem" });
  });

  it("라벨에 흰색 텍스트 아웃라인(8방향 text-shadow)을 항상 적용한다", () => {
    const { container } = render(<MapPin label="라벨" />);
    const label = container.querySelector("span");
    const textShadow = label?.style.textShadow ?? "";
    expect(textShadow).not.toBe("");
    // 8방향(상하좌우+대각선) 레이어 — border-width/xs 오프셋 + border/inverse/dark 색.
    expect(textShadow.split(",")).toHaveLength(8);
    expect(textShadow).toContain("var(--border-width-xs)");
    expect(textShadow).toContain("var(--color-border-inverse-dark)");
  });

  it("maxWidth 가 있어도 textShadow 아웃라인은 그대로 유지된다", () => {
    const { container } = render(<MapPin label="라벨" maxWidth={110} />);
    const label = container.querySelector("span");
    expect(label?.style.textShadow).not.toBe("");
    expect(label).toHaveStyle({ maxWidth: "110px" });
  });

  it("maxWidth 를 생략하면 maxWidth 인라인 style 이 없다", () => {
    const { container } = render(<MapPin label="라벨" />);
    const label = container.querySelector("span");
    expect(label?.style.maxWidth).toBe("");
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<MapPin className="absolute top-0 left-0" />);
    const root = container.querySelector('[data-name="MapPin"]');
    expect(root).toHaveClass("absolute", "top-0", "left-0");
  });

  it("색은 토큰 유틸/CSS 변수로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const { container } = render(
      <MapPin color="brand" variant="marker" label="라벨" />,
    );
    for (const el of container.querySelectorAll("*")) {
      expect(el.getAttribute("style") ?? "").not.toMatch(/#[0-9a-fA-F]{3,}/);
    }
  });
});
