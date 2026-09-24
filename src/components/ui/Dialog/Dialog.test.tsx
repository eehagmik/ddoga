import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./Dialog";

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
}

beforeEach(() => {
  stubMatchMedia(false);
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
    ],
  });
});

afterEach(() => {
  act(() => {
    vi.runOnlyPendingTimers();
  });
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Dialog", () => {
  it("open=false 면 아무것도 렌더하지 않는다(Dialog·Dim 모두)", () => {
    const { container } = render(<Dialog open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(container.querySelector("[data-variant]")).toBeNull();
  });

  it("open=true 면 role=dialog 카드와 Dim 을 함께 렌더한다", () => {
    const { container } = render(<Dialog open />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(container.querySelector("[data-variant]")).toHaveAttribute(
      "data-variant",
      "normal",
    );
  });

  it("카드에 표면 토큰 클래스(배경·radius·그림자·폭 캡)를 적용한다", () => {
    render(<Dialog open />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass(
      "rounded-2xl",
      "bg-bg-neutral-normal",
      "shadow-black-lg",
      "max-w-[328px]",
    );
  });

  it("open 이 false 로 바뀌면 트랜지션(300ms) 종료 후 unmount 된다", () => {
    const { rerender } = render(<Dialog open pageName="타이틀" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(<Dialog open={false} pageName="타이틀" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Dim 을 클릭해도 onClose 를 호출하지 않는다(Dim 클릭 닫기 미지원)", () => {
    const onClose = vi.fn();
    const { container } = render(<Dialog open onClose={onClose} />);
    const dim = container.querySelector("[data-variant]") as HTMLElement;
    fireEvent.click(dim);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("pageName 을 넘기면 헤더를 렌더하고 타이틀 텍스트를 보여준다", () => {
    const { container } = render(<Dialog open pageName="타이틀" />);
    expect(screen.getByText("타이틀")).toBeInTheDocument();
    expect(container.querySelector('[data-name="header"]')).not.toBeNull();
  });

  it("pageName 을 생략하면 헤더 자체를 렌더하지 않는다", () => {
    const { container } = render(<Dialog open />);
    expect(container.querySelector('[data-name="header"]')).toBeNull();
  });

  it("isCloseButton=false 면 헤더는 있지만 닫기 버튼은 없다", () => {
    const { container } = render(
      <Dialog open pageName="타이틀" isCloseButton={false} />,
    );
    expect(container.querySelector('[data-name="header"]')).not.toBeNull();
    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });

  it("닫기(X) 버튼 클릭 시 onClose 를 호출한다(유일한 닫기 트리거)", () => {
    const onClose = vi.fn();
    render(<Dialog open pageName="타이틀" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mainText/subText 기본값('Main Text'/'Sub Text')을 렌더한다", () => {
    render(<Dialog open />);
    expect(screen.getByText("Main Text")).toBeInTheDocument();
    expect(screen.getByText("Sub Text")).toBeInTheDocument();
  });

  it("mainText/subText 를 커스텀 값으로 덮어쓴다", () => {
    render(<Dialog open mainText="제목입니다" subText="설명입니다" />);
    expect(screen.getByText("제목입니다")).toBeInTheDocument();
    expect(screen.getByText("설명입니다")).toBeInTheDocument();
    expect(screen.queryByText("Main Text")).toBeNull();
    expect(screen.queryByText("Sub Text")).toBeNull();
  });

  it("mainText='' 를 명시하면 MainText 를 렌더하지 않는다(SubText 는 유지)", () => {
    render(<Dialog open mainText="" />);
    expect(screen.queryByText("Main Text")).toBeNull();
    expect(screen.getByText("Sub Text")).toBeInTheDocument();
  });

  it("mainText/subText 를 둘 다 '' 로 명시하면 텍스트 블록 전체를 렌더하지 않는다", () => {
    const { container } = render(<Dialog open mainText="" subText="" />);
    const body = container.querySelector('[data-name="body"]') as HTMLElement;
    expect(body.textContent).toBe("");
  });

  it("children 을 본문 텍스트 아래 자유 슬롯으로 렌더한다", () => {
    render(
      <Dialog open>
        <div data-testid="slot">커스텀 콘텐츠</div>
      </Dialog>,
    );
    expect(screen.getByTestId("slot")).toBeInTheDocument();
    expect(screen.getByText("Main Text")).toBeInTheDocument();
  });

  it("primaryLabel/secondaryLabel 이 둘 다 없으면 버튼영역을 렌더하지 않는다", () => {
    const { container } = render(
      <Dialog open primaryLabel={undefined} secondaryLabel={undefined} />,
    );
    expect(container.querySelector('[data-name="buttons"]')).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("primaryLabel 만 있으면 주 버튼만 렌더한다", () => {
    render(<Dialog open primaryLabel="확인" />);
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "취소" })).toBeNull();
  });

  it("primary/secondary 버튼 클릭 시 각각의 콜백을 호출한다", () => {
    const onPrimaryClick = vi.fn();
    const onSecondaryClick = vi.fn();
    render(
      <Dialog
        open
        primaryLabel="확인"
        onPrimaryClick={onPrimaryClick}
        secondaryLabel="취소"
        onSecondaryClick={onSecondaryClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onSecondaryClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(onPrimaryClick).toHaveBeenCalledTimes(1);
  });

  it("className 을 카드 루트에 병합하고 기본 클래스도 유지한다", () => {
    render(<Dialog open className="custom-dialog" />);
    expect(screen.getByRole("dialog")).toHaveClass(
      "custom-dialog",
      "rounded-2xl",
    );
  });

  it("pageName 이 있으면 aria-labelledby 로 연결하고, 없으면 aria-label 을 사용한다", () => {
    const { rerender } = render(<Dialog open pageName="정산 내역" />);
    const dialog = screen.getByRole("dialog");
    const title = screen.getByText("정산 내역");
    expect(dialog).toHaveAttribute("aria-labelledby", title.id);

    rerender(<Dialog open aria-label="알림" />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "알림");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Dialog open pageName="타이틀" primaryLabel="확인" secondaryLabel="취소">
        <div>슬롯</div>
      </Dialog>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
