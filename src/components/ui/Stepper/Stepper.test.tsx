import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stepper } from "./Stepper";

describe("Stepper", () => {
  it("role=progressbar 와 aria-value* 를 루트에 부여한다", () => {
    const { container } = render(<Stepper currentStep={2} totalSteps={4} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("role", "progressbar");
    expect(root).toHaveAttribute("aria-valuemin", "0");
    expect(root).toHaveAttribute("aria-valuemax", "4");
    expect(root).toHaveAttribute("aria-valuenow", "2");
  });

  it("트랙에 토큰 기반 배경/높이 클래스를 적용한다", () => {
    const { container } = render(<Stepper currentStep={1} totalSteps={4} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass(
      "relative",
      "w-full",
      "h-(--sz-2)",
      "overflow-hidden",
      "bg-bg-brandGrayish-deep",
    );
  });

  it.each([
    [0, 4, "0%"],
    [1, 4, "25%"],
    [2, 4, "50%"],
    [3, 4, "75%"],
    [4, 4, "100%"],
  ])(
    "currentStep=%s / totalSteps=%s 이면 인디케이터 width 가 %s 다",
    (currentStep, totalSteps, expectedWidth) => {
      const { container } = render(
        <Stepper currentStep={currentStep} totalSteps={totalSteps} />,
      );
      const indicator = container.querySelector(
        "[role='progressbar'] > div",
      ) as HTMLElement;
      expect(indicator.style.width).toBe(expectedWidth);
    },
  );

  it("100% 미만이면 인디케이터 우측만 rounded-circle, 100% 면 전체 rounded-circle 이다", () => {
    const { container, rerender } = render(
      <Stepper currentStep={2} totalSteps={4} />,
    );
    let indicator = container.querySelector(
      "[role='progressbar'] > div",
    ) as HTMLElement;
    expect(indicator).toHaveClass("rounded-r-circle");
    expect(indicator).not.toHaveClass("rounded-circle");

    rerender(<Stepper currentStep={4} totalSteps={4} />);
    indicator = container.querySelector(
      "[role='progressbar'] > div",
    ) as HTMLElement;
    expect(indicator).toHaveClass("rounded-circle");
  });

  it("currentStep 이 totalSteps 를 넘어도 100% 로 클램프한다", () => {
    const { container } = render(<Stepper currentStep={99} totalSteps={4} />);
    const indicator = container.querySelector(
      "[role='progressbar'] > div",
    ) as HTMLElement;
    expect(indicator.style.width).toBe("100%");
  });

  it("currentStep 이 음수여도 0% 로 클램프한다", () => {
    const { container } = render(<Stepper currentStep={-1} totalSteps={4} />);
    const indicator = container.querySelector(
      "[role='progressbar'] > div",
    ) as HTMLElement;
    expect(indicator.style.width).toBe("0%");
  });

  it("totalSteps 가 0 이면 0% 로 렌더한다(0 나눗셈 방지)", () => {
    const { container } = render(<Stepper currentStep={0} totalSteps={0} />);
    const indicator = container.querySelector(
      "[role='progressbar'] > div",
    ) as HTMLElement;
    expect(indicator.style.width).toBe("0%");
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(
      <Stepper currentStep={1} totalSteps={4} className="mt-(--sz-8)" />,
    );
    expect(container.firstElementChild).toHaveClass("mt-(--sz-8)", "w-full");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다(토큰만 사용)", () => {
    const { container } = render(<Stepper currentStep={2} totalSteps={4} />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
