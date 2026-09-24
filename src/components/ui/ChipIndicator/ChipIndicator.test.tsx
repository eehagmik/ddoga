import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChipIndicator } from "./ChipIndicator";

describe("ChipIndicator", () => {
  it("기본값(type=default)으로 라벨·구분점·카운트를 모두 렌더한다", () => {
    render(
      <ChipIndicator label="사진" currentCount={1} totalCount={3} unit="개" />,
    );
    expect(screen.getByText("사진")).toBeInTheDocument();
    expect(screen.getByText("·")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("개")).toBeInTheDocument();
  });

  it("type=onlyLabel 이면 라벨만 렌더하고 구분점·카운트는 렌더하지 않는다", () => {
    render(
      <ChipIndicator
        type="onlyLabel"
        label="사진"
        currentCount={1}
        totalCount={3}
      />,
    );
    expect(screen.getByText("사진")).toBeInTheDocument();
    expect(screen.queryByText("·")).not.toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("type=onlyCount 이면 카운트만 렌더하고 라벨·구분점은 렌더하지 않는다", () => {
    render(
      <ChipIndicator
        type="onlyCount"
        label="사진"
        currentCount={2}
        totalCount={5}
        unit="개"
      />,
    );
    expect(screen.queryByText("사진")).not.toBeInTheDocument();
    expect(screen.queryByText("·")).not.toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("개")).toBeInTheDocument();
  });

  it("type 을 data 속성으로 노출한다", () => {
    const { container } = render(
      <ChipIndicator type="onlyLabel" currentCount={1} totalCount={3} />,
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-type",
      "onlyLabel",
    );
  });

  it("label/unit 기본값은 각각 'Label'/'Unit' 이다", () => {
    render(<ChipIndicator currentCount={1} totalCount={3} />);
    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <ChipIndicator
        currentCount={1}
        totalCount={3}
        className="absolute bottom-[var(--sz-10)]"
      />,
    );
    expect(container.firstElementChild).toHaveClass(
      "absolute",
      "bottom-[var(--sz-10)]",
      "rounded-2xl",
      "bg-bg-overlay-blackDeep",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <ChipIndicator label="사진" currentCount={1} totalCount={3} unit="개" />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
