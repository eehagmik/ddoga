import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "./DatePicker";
import type { DatePickerRangeProps, DatePickerSingleProps } from "./DatePicker";

const TODAY = new Date(2026, 8, 10); // 2026-09-10

function SingleHarness(props: Omit<DatePickerSingleProps, "mode">) {
  const [value, setValue] = useState<Date | undefined>(props.value);
  return (
    <DatePicker
      {...props}
      mode="single"
      value={value}
      onChange={(date) => {
        setValue(date);
        props.onChange?.(date);
      }}
    />
  );
}

function RangeHarness(props: Omit<DatePickerRangeProps, "mode">) {
  const [startValue, setStartValue] = useState<Date | undefined>(
    props.startValue,
  );
  const [endValue, setEndValue] = useState<Date | undefined>(props.endValue);
  return (
    <DatePicker
      {...props}
      mode="range"
      startValue={startValue}
      endValue={endValue}
      onChange={(start, end) => {
        setStartValue(start);
        setEndValue(end);
        props.onChange?.(start, end);
      }}
    />
  );
}

async function openSheet(
  user: ReturnType<typeof userEvent.setup>,
  triggerName: string | RegExp = "날짜 선택",
) {
  await user.click(screen.getByRole("button", { name: triggerName }));
  return within(await screen.findByRole("dialog", { name: "날짜선택" }));
}

describe("DatePicker", () => {
  it("트리거는 DateField 로 렌더되고 값이 없으면 placeholder 를 표시한다", () => {
    render(<SingleHarness today={TODAY} />);
    expect(
      screen.getByRole("button", { name: "날짜 선택" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("트리거 클릭 시 BottomSheet 가 title='날짜선택' 으로 열리고 그 안에 Calendar 가 렌더된다", async () => {
    const user = userEvent.setup();
    render(<SingleHarness today={TODAY} />);
    const dialog = await openSheet(user);
    expect(
      dialog.getByRole("button", { name: "2026년 9월" }),
    ).toBeInTheDocument();
  });

  it("disabled 면 트리거를 클릭해도 시트가 열리지 않는다", async () => {
    const user = userEvent.setup();
    render(<SingleHarness today={TODAY} disabled />);
    const trigger = screen.getByRole("button", { name: "날짜 선택" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("readOnly 면 트리거를 클릭해도 시트가 열리지 않는다", async () => {
    const user = userEvent.setup();
    render(<SingleHarness today={TODAY} readOnly />);
    await user.click(screen.getByRole("button", { name: "날짜 선택" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("title/confirmLabel 을 오버라이드할 수 있다", async () => {
    const user = userEvent.setup();
    render(
      <SingleHarness
        today={TODAY}
        title="여행일 선택"
        confirmLabel="선택 완료"
      />,
    );
    await user.click(screen.getByRole("button", { name: "날짜 선택" }));
    const dialog = within(
      await screen.findByRole("dialog", { name: "여행일 선택" }),
    );
    expect(
      dialog.getByRole("button", { name: "선택 완료" }),
    ).toBeInTheDocument();
  });

  describe("mode='single'(기본값) 라이브 커밋", () => {
    it("날짜 클릭 시 즉시 onChange 가 호출되고 트리거 표시값도 즉시 갱신된다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SingleHarness today={TODAY} onChange={onChange} />);
      const dialog = await openSheet(user);

      await user.click(dialog.getByRole("button", { name: "2026년 9월 15일" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      const called = onChange.mock.calls[0][0] as Date;
      expect(called.getDate()).toBe(15);

      expect(
        screen.getByRole("button", { name: "26.09.15" }),
      ).toBeInTheDocument();
    });

    it("기본 formatDate 는 YY.MM.DD 형식이다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);
      await user.click(dialog.getByRole("button", { name: "2026년 9월 20일" }));
      expect(
        screen.getByRole("button", { name: "26.09.20" }),
      ).toBeInTheDocument();
    });

    it("formatDate 를 커스텀하면 트리거 표시 형식이 바뀐다", async () => {
      const user = userEvent.setup();
      const formatDate = (date: Date) =>
        `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
      render(<SingleHarness today={TODAY} formatDate={formatDate} />);
      const dialog = await openSheet(user);
      await user.click(dialog.getByRole("button", { name: "2026년 9월 15일" }));
      expect(
        screen.getByRole("button", { name: "2026.9.15" }),
      ).toBeInTheDocument();
    });

    it("선택값이 없으면 확인 버튼이 비활성화되고, 선택하면 활성화된다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);

      expect(dialog.getByRole("button", { name: "확인" })).toBeDisabled();

      await user.click(dialog.getByRole("button", { name: "2026년 9월 15일" }));
      expect(dialog.getByRole("button", { name: "확인" })).not.toBeDisabled();
    });

    it("확인 버튼 클릭 시 시트가 닫힌다(값 커밋은 이미 완료된 상태)", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);
      await user.click(dialog.getByRole("button", { name: "2026년 9월 15일" }));
      await user.click(dialog.getByRole("button", { name: "확인" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "26.09.15" }),
      ).toBeInTheDocument();
    });
  });

  describe("과거 날짜 비활성화(disablePastDates)", () => {
    it("기본값(true)일 때 오늘 이전 날짜는 비활성화되고 클릭해도 onChange 가 호출되지 않는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SingleHarness today={TODAY} onChange={onChange} />);
      const dialog = await openSheet(user);

      const pastButton = dialog.getByRole("button", {
        name: "2026년 9월 5일",
      });
      expect(pastButton).toBeDisabled();

      await user.click(pastButton);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("오늘 날짜는 비활성화되지 않는다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);
      expect(
        dialog.getByRole("button", { name: "2026년 9월 10일" }),
      ).not.toBeDisabled();
    });

    it("disablePastDates=false 면 오늘 이전 날짜도 선택할 수 있다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SingleHarness
          today={TODAY}
          disablePastDates={false}
          onChange={onChange}
        />,
      );
      const dialog = await openSheet(user);
      const pastButton = dialog.getByRole("button", {
        name: "2026년 9월 5일",
      });
      expect(pastButton).not.toBeDisabled();
      await user.click(pastButton);
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("mode='range'", () => {
    it("시작일만 선택해도 확인 버튼이 활성화된다", async () => {
      const user = userEvent.setup();
      render(<RangeHarness today={TODAY} />);
      const dialog = await openSheet(user);

      expect(dialog.getByRole("button", { name: "확인" })).toBeDisabled();
      await user.click(dialog.getByRole("button", { name: "2026년 9월 12일" }));
      expect(dialog.getByRole("button", { name: "확인" })).not.toBeDisabled();
    });

    it("시작~종료를 모두 선택하면 onChange(start, end) 가 호출되고 트리거에 '~' 로 표시된다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<RangeHarness today={TODAY} onChange={onChange} />);
      const dialog = await openSheet(user);

      await user.click(dialog.getByRole("button", { name: "2026년 9월 12일" }));
      await user.click(dialog.getByRole("button", { name: "2026년 9월 20일" }));

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ getDate: expect.any(Function) }),
        expect.objectContaining({ getDate: expect.any(Function) }),
      );

      expect(
        screen.getByRole("button", { name: "26.09.12 ~ 26.09.20" }),
      ).toBeInTheDocument();
    });

    it("시트를 닫아도 시작일만 있는 상태가 그대로 유지된다", async () => {
      const user = userEvent.setup();
      render(<RangeHarness today={TODAY} />);
      let dialog = await openSheet(user);
      await user.click(dialog.getByRole("button", { name: "2026년 9월 12일" }));
      await user.click(dialog.getByRole("button", { name: "확인" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );

      dialog = await openSheet(user, /26\.09\.12/);
      expect(
        dialog.getByRole("button", { name: "2026년 9월 12일" }),
      ).toHaveClass("bg-bg-info-deep");
    });
  });

  describe("YearMonthButton 전환", () => {
    it("클릭 시 이전/다음 달 버튼이 사라지고 YearMonthSelect 가 나타난다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);

      await user.click(dialog.getByRole("button", { name: "2026년 9월" }));

      expect(
        dialog.queryByRole("button", { name: "이전 달" }),
      ).not.toBeInTheDocument();
      expect(
        dialog.queryByRole("button", { name: "다음 달" }),
      ).not.toBeInTheDocument();
      expect(dialog.getByRole("listbox", { name: "연도" })).toBeInTheDocument();
    });

    it("월 셀을 클릭하면 표시 월이 바뀌고, 다시 누르면 그리드로 복귀한다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);

      await user.click(dialog.getByRole("button", { name: "2026년 9월" }));
      await user.click(dialog.getByRole("option", { name: "11월" }));

      const yearMonthButton = dialog.getByRole("button", {
        name: "2026년 11월",
      });
      expect(yearMonthButton).toBeInTheDocument();

      await user.click(yearMonthButton);
      expect(
        dialog.getByRole("button", { name: "이전 달" }),
      ).toBeInTheDocument();
    });

    it("YearMonthSelect가 열린 상태에서 '확인'을 누르면 시트가 닫히지 않고 Calendar로 복귀하며, 고른 연/월이 반영된다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);

      await user.click(dialog.getByRole("button", { name: "2026년 9월" }));
      await user.click(dialog.getByRole("option", { name: "11월" }));

      await user.click(dialog.getByRole("button", { name: "확인" }));

      // 시트는 그대로 열려 있어야 한다.
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Calendar 그리드로 복귀하고(이전 달 버튼 존재), 선택한 11월이 반영돼 있어야 한다.
      expect(
        dialog.getByRole("button", { name: "이전 달" }),
      ).toBeInTheDocument();
      expect(
        dialog.getByRole("button", { name: "2026년 11월" }),
      ).toBeInTheDocument();
    });

    it("값 선택 없이도 YearMonthSelect가 열려 있으면 '확인' 버튼이 비활성화되지 않는다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness today={TODAY} />);
      const dialog = await openSheet(user);

      expect(dialog.getByRole("button", { name: "확인" })).toBeDisabled();
      await user.click(dialog.getByRole("button", { name: "2026년 9월" }));
      expect(dialog.getByRole("button", { name: "확인" })).not.toBeDisabled();
    });
  });

  it("마크업에 hex 코드가 없다", async () => {
    const user = userEvent.setup();
    const { container } = render(<SingleHarness today={TODAY} />);
    await openSheet(user);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
