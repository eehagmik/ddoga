import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ImagePreview } from "./ImagePreview";

function renderSlides(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} data-testid={`slide-${index}`}>
      슬라이드 {index + 1}
    </div>
  ));
}

describe("ImagePreview", () => {
  it("풀스크린 dialog role 로 렌더되고 기본 aria-label 이 붙는다", () => {
    const { container } = render(
      <ImagePreview>{renderSlides(2)}</ImagePreview>,
    );
    const root = container.querySelector('[role="dialog"]');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("aria-modal", "true");
    expect(root).toHaveAttribute("aria-label", "이미지 미리보기");
    expect(root).toHaveClass("fixed", "inset-0");
  });

  it("aria-label 을 커스텀으로 지정할 수 있다", () => {
    const { container } = render(
      <ImagePreview aria-label="상품 이미지 미리보기">
        {renderSlides(1)}
      </ImagePreview>,
    );
    expect(container.querySelector('[role="dialog"]')).toHaveAttribute(
      "aria-label",
      "상품 이미지 미리보기",
    );
  });

  it("모든 슬라이드를 렌더한다", () => {
    const { getByTestId } = render(
      <ImagePreview>{renderSlides(3)}</ImagePreview>,
    );
    expect(getByTestId("slide-0")).toBeInTheDocument();
    expect(getByTestId("slide-1")).toBeInTheDocument();
    expect(getByTestId("slide-2")).toBeInTheDocument();
  });

  it("ChipIndicator 가 type=onlyCount, unit 없이 '1 / N' 형태로 렌더된다", () => {
    const { container } = render(
      <ImagePreview>{renderSlides(5)}</ImagePreview>,
    );
    const chip = container.querySelector('[data-type="onlyCount"]');
    expect(chip).not.toBeNull();
    expect(chip).toHaveTextContent("1/5");
  });

  it("슬라이드가 없으면 ChipIndicator 를 렌더하지 않는다", () => {
    const { container } = render(<ImagePreview>{null}</ImagePreview>);
    expect(container.querySelector('[data-type="onlyCount"]')).toBeNull();
  });

  it("닫기 버튼을 클릭하면 onClose 를 호출한다", () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <ImagePreview onClose={onClose}>{renderSlides(2)}</ImagePreview>,
    );
    fireEvent.click(getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <ImagePreview className="custom-class">{renderSlides(1)}</ImagePreview>,
    );
    expect(container.querySelector('[role="dialog"]')).toHaveClass(
      "custom-class",
    );
  });

  it("인라인 style 에 hex 컬러가 없다", () => {
    const { container } = render(
      <ImagePreview>{renderSlides(2)}</ImagePreview>,
    );
    expect(container.innerHTML).not.toMatch(/style="[^"]*#[0-9a-fA-F]{3,}/);
  });
});
