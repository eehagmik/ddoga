import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BottomSheet } from "./BottomSheet";

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

describe("BottomSheet", () => {
  it("open=false 면 아무것도 렌더하지 않는다", () => {
    render(<BottomSheet open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("open=true 면 role=dialog 로 렌더한다", () => {
    render(<BottomSheet open title="Title" />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("패널은 화면의 90%까지만 늘어나고 바디만 남는 공간에서 스크롤된다", () => {
    render(
      <BottomSheet open title="Title">
        <p>본문</p>
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("max-h-[90dvh]");

    const body = screen.getByText("본문").closest('[data-axis="y"]');
    expect(body).toHaveAttribute("data-axis", "y");
    expect(body).toHaveClass("flex-1", "min-h-0");
  });

  it("open 이 false 로 바뀐 직후엔 타이머 전까지 DOM 에 남아있다가 트랜지션 종료 후 unmount 된다", () => {
    const { rerender } = render(<BottomSheet open title="Title" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(<BottomSheet open={false} title="Title" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("title 이 있으면 헤더에 타이틀 텍스트를 렌더하고 aria-labelledby 로 연결한다", () => {
    render(<BottomSheet open title="정산 내역" />);
    const dialog = screen.getByRole("dialog");
    const title = screen.getByText("정산 내역");
    expect(dialog).toHaveAttribute("aria-labelledby", title.id);
  });

  it("title 이 없으면 aria-label 을 사용한다", () => {
    render(<BottomSheet open aria-label="필터" />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "필터");
  });

  it("headerActionLabel 이 있을 때만 보조 텍스트 버튼을 렌더한다", () => {
    const { rerender } = render(<BottomSheet open title="Title" />);
    expect(screen.queryByText("편집")).toBeNull();

    rerender(<BottomSheet open title="Title" headerActionLabel="편집" />);
    expect(screen.getByText("편집")).toBeInTheDocument();
  });

  it("headerActionLabel 클릭 시 onHeaderActionClick 을 호출한다", () => {
    const onHeaderActionClick = vi.fn();
    render(
      <BottomSheet
        open
        title="Title"
        headerActionLabel="편집"
        onHeaderActionClick={onHeaderActionClick}
      />,
    );
    fireEvent.click(screen.getByText("편집"));
    expect(onHeaderActionClick).toHaveBeenCalledTimes(1);
  });

  it("closable=false 면 닫기 버튼을 렌더하지 않는다", () => {
    render(<BottomSheet open title="Title" closable={false} />);
    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });

  it("header=false 면 헤더 섹션 전체를 렌더하지 않는다", () => {
    render(<BottomSheet open title="Title" header={false} />);
    expect(screen.queryByText("Title")).toBeNull();
    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });

  it("닫기 버튼 클릭 시 onClose 를 1회 호출한다", () => {
    const onClose = vi.fn();
    render(<BottomSheet open title="Title" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Dim 클릭 시 기본적으로 onClose 를 호출한다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open title="Title" onClose={onClose} />,
    );
    const dim = container.querySelector('[data-variant="normal"]')!;
    fireEvent.click(dim);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeOnDimClick=false 면 Dim 클릭으로 닫히지 않는다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet
        open
        title="Title"
        onClose={onClose}
        closeOnDimClick={false}
      />,
    );
    const dim = container.querySelector('[data-variant="normal"]')!;
    fireEvent.click(dim);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ESC 키를 누르면 기본적으로 onClose 를 호출한다", () => {
    const onClose = vi.fn();
    render(<BottomSheet open title="Title" onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeOnEsc=false 면 ESC 로 닫히지 않는다", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open title="Title" onClose={onClose} closeOnEsc={false} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("children 을 body 슬롯에 그대로 렌더한다", () => {
    render(
      <BottomSheet open title="Title">
        <p>바디 콘텐츠</p>
      </BottomSheet>,
    );
    expect(screen.getByText("바디 콘텐츠")).toBeInTheDocument();
  });

  it("fixButton 이 없으면 FixButton 섹션을 렌더하지 않는다", () => {
    render(<BottomSheet open title="Title" />);
    expect(screen.queryByRole("button", { name: "확인" })).toBeNull();
  });

  it("fixButton 을 주면 FixButton 을 렌더하고 !static !z-auto 로 position 을 오버라이드한다", () => {
    render(
      <BottomSheet
        open
        title="Title"
        fixButton={{ variant: "single", primaryLabel: "확인" }}
      />,
    );
    const primaryButton = screen.getByRole("button", { name: "확인" });
    const fixButtonRoot = primaryButton.closest('[data-variant="single"]')!;
    expect(fixButtonRoot).toHaveClass("!static", "!z-auto", "shrink-0");
  });

  it("className 을 패널 루트에 병합한다", () => {
    render(
      <BottomSheet open title="Title" className="max-w-[var(--sz-320)]" />,
    );
    expect(screen.getByRole("dialog")).toHaveClass(
      "max-w-[var(--sz-320)]",
      "bg-bg-neutral-normal",
    );
  });

  it("마크업에 hex 코드가 없다", () => {
    const { container } = render(
      <BottomSheet
        open
        title="Title"
        headerActionLabel="편집"
        fixButton={{ variant: "single", primaryLabel: "확인" }}
      >
        본문
      </BottomSheet>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
