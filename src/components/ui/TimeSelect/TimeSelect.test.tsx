import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { TimeSelectValue } from "./TimeSelect";
import { TimeSelect } from "./TimeSelect";

const DEFAULT_VALUE: TimeSelectValue = {
  meridiem: "오전",
  hour: 6,
  minute: 5,
};

describe("TimeSelect", () => {
  it("오전/오후·시·분 3열을 렌더한다", () => {
    render(<TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(
      screen.getByRole("listbox", { name: "오전 오후" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "시" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "분" })).toBeInTheDocument();
  });

  it("초기 선택 값이 checked 스타일(bg-bg-info-normal)로 표시된다", () => {
    render(<TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByRole("option", { name: "오전" })).toHaveClass(
      "bg-bg-info-normal",
    );
    expect(screen.getByRole("option", { name: "6" })).toHaveClass(
      "bg-bg-info-normal",
    );
    expect(screen.getByRole("option", { name: "05" })).toHaveClass(
      "bg-bg-info-normal",
    );
  });

  it("선택되지 않은 셀은 배경 없이 typo-neutral-bright 색만 갖는다", () => {
    render(<TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const hourSeven = screen.getByRole("option", { name: "7" });
    expect(hourSeven).toHaveClass("text-typo-neutral-bright");
    expect(hourSeven).not.toHaveClass("bg-bg-info-normal");
  });

  it("분 열은 0~59 전체(60개, 2자리 zero-pad)를 렌더한다", () => {
    render(<TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const minuteList = screen.getByRole("listbox", { name: "분" });
    expect(within(minuteList).getAllByRole("option")).toHaveLength(60);
    expect(
      within(minuteList).getByRole("option", { name: "00" }),
    ).toBeInTheDocument();
    expect(
      within(minuteList).getByRole("option", { name: "59" }),
    ).toBeInTheDocument();
  });

  it("시 열은 1~12(zero-pad 없음)를 렌더한다", () => {
    render(<TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const hourList = screen.getByRole("listbox", { name: "시" });
    const options = within(hourList).getAllByRole("option");
    expect(options).toHaveLength(12);
    expect(
      within(hourList).getByRole("option", { name: "1" }),
    ).toBeInTheDocument();
    expect(
      within(hourList).getByRole("option", { name: "12" }),
    ).toBeInTheDocument();
  });

  it("오전/오후 열은 클릭으로만 값이 바뀌고 onChange 에 나머지 값은 그대로 전달된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeSelect value={DEFAULT_VALUE} onChange={onChange} />);

    await user.click(screen.getByRole("option", { name: "오후" }));
    expect(onChange).toHaveBeenCalledWith({
      meridiem: "오후",
      hour: 6,
      minute: 5,
    });
  });

  it("시 셀 클릭 시 onChange 에 변경된 hour 와 기존 meridiem/minute 을 함께 전달한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeSelect value={DEFAULT_VALUE} onChange={onChange} />);

    await user.click(screen.getByRole("option", { name: "9" }));
    expect(onChange).toHaveBeenCalledWith({
      meridiem: "오전",
      hour: 9,
      minute: 5,
    });
  });

  it("분 셀 클릭 시 onChange 에 변경된 minute 을 전달한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeSelect value={DEFAULT_VALUE} onChange={onChange} />);

    const minuteList = screen.getByRole("listbox", { name: "분" });
    await user.click(within(minuteList).getByRole("option", { name: "30" }));
    expect(onChange).toHaveBeenCalledWith({
      meridiem: "오전",
      hour: 6,
      minute: 30,
    });
  });

  it("같은 값을 다시 클릭하면 onChange 를 호출하지 않는다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeSelect value={DEFAULT_VALUE} onChange={onChange} />);

    await user.click(screen.getByRole("option", { name: "오전" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  describe("disabled", () => {
    it("모든 셀이 disabled 이고 클릭해도 onChange 가 호출되지 않는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TimeSelect value={DEFAULT_VALUE} onChange={onChange} disabled />);

      const hourSeven = screen.getByRole("option", { name: "7" });
      expect(hourSeven).toBeDisabled();
      await user.click(hourSeven);
      expect(onChange).not.toHaveBeenCalled();

      const meridiemButton = screen.getByRole("option", { name: "오후" });
      expect(meridiemButton).toBeDisabled();
      await user.click(meridiemButton);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("disabled 여도 선택된 셀은 checked=true/enable 룩(bg-bg-info-normal)을 유지한다", () => {
      render(<TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} disabled />);
      expect(screen.getByRole("option", { name: "6" })).toHaveClass(
        "bg-bg-info-normal",
      );
    });

    it("disabled 이고 선택되지 않은 셀은 typo-disabled-subtle 색이다", () => {
      render(<TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} disabled />);
      expect(screen.getByRole("option", { name: "7" })).toHaveClass(
        "text-typo-disabled-subtle",
      );
    });
  });

  it("value prop 이 외부에서 바뀌면(controlled) 새 값이 checked 로 반영된다", () => {
    const { rerender } = render(
      <TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("option", { name: "6" })).toHaveClass(
      "bg-bg-info-normal",
    );

    rerender(
      <TimeSelect
        value={{ meridiem: "오후", hour: 11, minute: 45 }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("option", { name: "오후" })).toHaveClass(
      "bg-bg-info-normal",
    );
    const hourList = screen.getByRole("listbox", { name: "시" });
    expect(within(hourList).getByRole("option", { name: "11" })).toHaveClass(
      "bg-bg-info-normal",
    );
    const minuteList = screen.getByRole("listbox", { name: "분" });
    expect(within(minuteList).getByRole("option", { name: "45" })).toHaveClass(
      "bg-bg-info-normal",
    );
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} className="mt-4" />,
    );
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸/var(--color-*) 로만 지정하고 인라인 hex 가 없다", () => {
    const { container } = render(
      <TimeSelect value={DEFAULT_VALUE} onChange={vi.fn()} disabled />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
