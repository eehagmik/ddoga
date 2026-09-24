import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Empty } from "./Empty";

describe("Empty", () => {
  it("기본값(variant=default)으로 렌더하고 data-variant 를 부여한다", () => {
    const { container, getByText } = render(<Empty />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-variant", "default");
    expect(getByText("Main Text")).toBeInTheDocument();
    expect(getByText("Sub Text")).toBeInTheDocument();
  });

  it("variant='default' 는 graphic 을 안 주면 BlankGraphic 플레이스홀더를 렌더한다", () => {
    const { container } = render(<Empty />);
    expect(container.querySelector('[data-blank="graphic"]')).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("graphic 슬롯을 주면 variant='default' 에서 해당 슬롯을 렌더한다", () => {
    const { getByTestId, container } = render(
      <Empty graphic={<span data-testid="custom-graphic">g</span>} />,
    );
    expect(getByTestId("custom-graphic")).toBeInTheDocument();
    expect(container.querySelector('[data-blank="graphic"]')).toBeNull();
  });

  it("variant='empty' 는 notfound 이미지를 렌더하고 graphic prop 을 무시한다", () => {
    const { container } = render(
      <Empty variant="empty" graphic={<span data-testid="ignored">g</span>} />,
    );
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain("notfound");
    expect(container.querySelector('[data-testid="ignored"]')).toBeNull();
  });

  it("variant='error' 는 error 이미지를 렌더한다", () => {
    const { container } = render(<Empty variant="error" />);
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain("error");
  });

  it("mainText/subText 를 커스텀하고, subText 를 빈 문자열로 주면 서브 텍스트를 렌더하지 않는다", () => {
    const { getByText, queryByText } = render(
      <Empty mainText="타이틀" subText="" />,
    );
    expect(getByText("타이틀")).toBeInTheDocument();
    expect(queryByText("Sub Text")).not.toBeInTheDocument();
  });

  it("leftButton/rightButton 이 모두 없으면 버튼 행을 렌더하지 않는다", () => {
    const { queryByRole } = render(<Empty />);
    expect(queryByRole("button")).not.toBeInTheDocument();
  });

  it("leftButton/rightButton 슬롯을 렌더한다", () => {
    const { getByRole } = render(
      <Empty
        leftButton={<button type="button">취소</button>}
        rightButton={<button type="button">확인</button>}
      />,
    );
    expect(getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(getByRole("button", { name: "확인" })).toBeInTheDocument();
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(<Empty className="max-w-[400px]" />);
    expect(container.firstElementChild).toHaveClass(
      "max-w-[400px]",
      "flex",
      "flex-col",
      "items-center",
    );
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Empty
        variant="error"
        leftButton={<button type="button">취소</button>}
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("rest props(id 등)를 루트 div 로 전달한다", () => {
    const { container } = render(<Empty id="empty-1" title="설명" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "empty-1");
    expect(root).toHaveAttribute("title", "설명");
  });
});
