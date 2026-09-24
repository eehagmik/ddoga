import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Banner } from "./Banner";

describe("Banner", () => {
  it("기본값(variant=round, ratio=16:9)은 rounded-2xl + aspect-[16/9] 를 적용하고 BlankGraphic 플레이스홀더를 렌더한다", () => {
    const { container } = render(<Banner />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("rounded-2xl");
    expect(root).toHaveClass("aspect-[16/9]");
    expect(container.querySelector('[data-blank="graphic"]')).not.toBeNull();
  });

  it("variant=sharp 는 모서리 클래스를 적용하지 않는다", () => {
    const { container } = render(<Banner variant="sharp" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveClass("rounded-2xl");
  });

  it("ratio=4:1 은 aspect-[4/1] 을 적용한다", () => {
    const { container } = render(<Banner ratio="4:1" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("aspect-[4/1]");
  });

  it("variant/ratio data attribute 를 노출한다", () => {
    const { container } = render(<Banner variant="sharp" ratio="4:1" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-variant", "sharp");
    expect(root).toHaveAttribute("data-ratio", "4:1");
  });

  it("children 슬롯을 전달하면 기본 BlankGraphic 대신 그것을 렌더한다", () => {
    render(
      <Banner>
        <img alt="thumb" data-testid="thumb" />
      </Banner>,
    );
    expect(screen.getByTestId("thumb")).toBeInTheDocument();
    expect(screen.queryByAltText("thumb")).toBeInTheDocument();
  });

  it("className prop 을 루트에 병합한다", () => {
    const { container } = render(<Banner className="custom-class" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-class");
  });
});
