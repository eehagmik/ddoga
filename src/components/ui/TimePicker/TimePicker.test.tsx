import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TimePicker } from "./TimePicker";
import type { TimePickerRangeProps, TimePickerSingleProps } from "./TimePicker";
import type { TimeSelectValue } from "../TimeSelect";

/** 2026-09-23 오전 9:05 — 스토리/문서 예시("오전 9:05")와 통일한 고정 "현재 시각". */
const NOW = new Date(2026, 8, 23, 9, 5);

function SingleHarness(props: Omit<TimePickerSingleProps, "mode">) {
  const [value, setValue] = useState<TimeSelectValue | undefined>(props.value);
  return (
    <TimePicker
      {...props}
      mode="single"
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

function RangeHarness(props: Omit<TimePickerRangeProps, "mode">) {
  const [startValue, setStartValue] = useState<TimeSelectValue | undefined>(
    props.startValue,
  );
  const [endValue, setEndValue] = useState<TimeSelectValue | undefined>(
    props.endValue,
  );
  return (
    <TimePicker
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
  trigger: HTMLElement,
  dialogName: string | RegExp,
) {
  await user.click(trigger);
  return within(await screen.findByRole("dialog", { name: dialogName }));
}

/**
 * 시/분 열은 숫자 포맷이 겹칠 수 있어("10" 은 시·분 모두에 존재) `role="listbox"`
 * 스코프로 좁혀 조회한다(`aria-label` "시"/"분").
 */
function hourOption(scope: ReturnType<typeof within>, name: string) {
  return within(scope.getByRole("listbox", { name: "시" })).getByRole(
    "option",
    { name },
  );
}
function minuteOption(scope: ReturnType<typeof within>, name: string) {
  return within(scope.getByRole("listbox", { name: "분" })).getByRole(
    "option",
    { name },
  );
}

describe("TimePicker", () => {
  it("트리거는 TimeField 로 렌더되고 값이 없으면 placeholder 를 표시한다", () => {
    render(<SingleHarness now={NOW} />);
    expect(
      screen.getByRole("button", { name: "시간 선택" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("트리거 클릭 시 BottomSheet 가 title='시간 선택' 으로 열리고 그 안에 TimeSelect 3열이 렌더된다", async () => {
    const user = userEvent.setup();
    render(<SingleHarness now={NOW} />);
    const dialog = await openSheet(
      user,
      screen.getByRole("button", { name: "시간 선택" }),
      "시간 선택",
    );
    expect(dialog.getByRole("listbox", { name: "시" })).toBeInTheDocument();
    expect(dialog.getByRole("listbox", { name: "분" })).toBeInTheDocument();
  });

  it("disabled 면 트리거를 클릭해도 시트가 열리지 않는다", async () => {
    const user = userEvent.setup();
    render(<SingleHarness now={NOW} disabled />);
    const trigger = screen.getByRole("button", { name: "시간 선택" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("readOnly 면 트리거를 클릭해도 시트가 열리지 않는다", async () => {
    const user = userEvent.setup();
    render(<SingleHarness now={NOW} readOnly />);
    await user.click(screen.getByRole("button", { name: "시간 선택" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("title/confirmLabel 을 오버라이드할 수 있다", async () => {
    const user = userEvent.setup();
    render(
      <SingleHarness
        now={NOW}
        title="알림 시간 선택"
        confirmLabel="선택 완료"
      />,
    );
    await user.click(screen.getByRole("button", { name: "시간 선택" }));
    const dialog = within(
      await screen.findByRole("dialog", { name: "알림 시간 선택" }),
    );
    expect(
      dialog.getByRole("button", { name: "선택 완료" }),
    ).toBeInTheDocument();
  });

  describe("mode='single'(기본값) — 기본값 자동 커밋 + 라이브 커밋", () => {
    it("값이 없을 때 시트를 열면 now 기준 기본값이 즉시 onChange 로 커밋되고 트리거에도 반영된다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SingleHarness now={NOW} onChange={onChange} />);
      await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "시간 선택",
      );

      expect(onChange).toHaveBeenCalledWith({
        meridiem: "오전",
        hour: 9,
        minute: 5,
      });
      expect(
        screen.getByRole("button", { name: "오전 9:05" }),
      ).toBeInTheDocument();
    });

    it("확인 버튼은 항상 활성화되어 있다(시트를 열면 이미 유효한 기본값이 존재)", async () => {
      const user = userEvent.setup();
      render(<SingleHarness now={NOW} />);
      const dialog = await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "시간 선택",
      );
      expect(dialog.getByRole("button", { name: "확인" })).not.toBeDisabled();
    });

    it("시(hour) 셀을 클릭하면 즉시 onChange 가 호출되고 트리거 표시값도 즉시 갱신된다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SingleHarness now={NOW} onChange={onChange} />);
      const dialog = await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "시간 선택",
      );

      await user.click(hourOption(dialog, "10"));

      expect(onChange).toHaveBeenLastCalledWith({
        meridiem: "오전",
        hour: 10,
        minute: 5,
      });
      expect(
        screen.getByRole("button", { name: "오전 10:05" }),
      ).toBeInTheDocument();
    });

    it("기본 formatTime 은 '{meridiem} {hour}:{분2자리}' 형식이다", async () => {
      const user = userEvent.setup();
      render(<SingleHarness now={NOW} />);
      const dialog = await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "시간 선택",
      );
      await user.click(minuteOption(dialog, "00"));
      expect(
        screen.getByRole("button", { name: "오전 9:00" }),
      ).toBeInTheDocument();
    });

    it("formatTime 을 커스텀하면 트리거 표시 형식이 바뀐다", async () => {
      const user = userEvent.setup();
      const formatTime = (value: TimeSelectValue) =>
        `${value.hour}시 ${value.minute}분 ${value.meridiem}`;
      render(<SingleHarness now={NOW} formatTime={formatTime} />);
      await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "시간 선택",
      );
      expect(
        screen.getByRole("button", { name: "9시 5분 오전" }),
      ).toBeInTheDocument();
    });

    it("확인 버튼 클릭 시 시트가 닫힌다(값 커밋은 이미 완료된 상태)", async () => {
      const user = userEvent.setup();
      render(<SingleHarness now={NOW} />);
      const dialog = await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "시간 선택",
      );
      await user.click(hourOption(dialog, "10"));
      await user.click(dialog.getByRole("button", { name: "확인" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "오전 10:05" }),
      ).toBeInTheDocument();
    });

    it("이미 값이 있으면 시트를 열어도 그 값을 그대로 보여주고 onChange 를 재호출하지 않는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SingleHarness
          now={NOW}
          value={{ meridiem: "오후", hour: 3, minute: 30 }}
          onChange={onChange}
        />,
      );
      await openSheet(
        user,
        screen.getByRole("button", { name: "오후 3:30" }),
        "시간 선택",
      );
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("mode='range'", () => {
    it("시작 필드를 열면 now 기준 기본값이 즉시 커밋되고, 종료 필드는 여전히 placeholder 다", async () => {
      const user = userEvent.setup();
      render(<RangeHarness now={NOW} />);

      const [startTrigger] = screen.getAllByRole("button", {
        name: "시간 선택",
      });
      await openSheet(user, startTrigger, "시작시간 선택");

      expect(
        screen.getByRole("button", { name: "오전 9:05" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "시간 선택" }),
      ).toBeInTheDocument();
    });

    it("종료 필드를 열면 시작값+6시간(분 유지) 기본값이 즉시 커밋된다", async () => {
      const user = userEvent.setup();
      render(
        <RangeHarness
          now={NOW}
          startValue={{ meridiem: "오전", hour: 9, minute: 5 }}
        />,
      );

      await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "종료시간 선택",
      );

      expect(
        screen.getByRole("button", { name: "오후 3:05" }),
      ).toBeInTheDocument();
    });

    it("자정을 넘나드는 시작값도 종료 기본값(+6시간)이 12시간제로 올바르게 랩어라운드된다", async () => {
      const user = userEvent.setup();
      render(
        <RangeHarness
          now={NOW}
          startValue={{ meridiem: "오후", hour: 10, minute: 15 }}
        />,
      );

      await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "종료시간 선택",
      );

      // 오후 10시 + 6시간 = 다음날 오전 4시.
      expect(
        screen.getByRole("button", { name: "오전 4:15" }),
      ).toBeInTheDocument();
    });

    it("편집 중인 필드만 갱신되고 다른 쪽 값은 그대로 유지된다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <RangeHarness
          now={NOW}
          startValue={{ meridiem: "오전", hour: 9, minute: 5 }}
          endValue={{ meridiem: "오후", hour: 3, minute: 5 }}
          onChange={onChange}
        />,
      );

      const dialog = await openSheet(
        user,
        screen.getByRole("button", { name: "오전 9:05" }),
        "시작시간 선택",
      );
      await user.click(hourOption(dialog, "8"));

      expect(onChange).toHaveBeenLastCalledWith(
        { meridiem: "오전", hour: 8, minute: 5 },
        { meridiem: "오후", hour: 3, minute: 5 },
      );
      expect(
        screen.getByRole("button", { name: "오후 3:05" }),
      ).toBeInTheDocument();
    });

    it("startLabel/endLabel 로 시트 타이틀 기본값이 '{label} 선택' 으로 계산된다", async () => {
      const user = userEvent.setup();
      render(
        <RangeHarness now={NOW} startLabel="출근 시간" endLabel="퇴근 시간" />,
      );
      const [startTrigger] = screen.getAllByRole("button", {
        name: "시간 선택",
      });
      await openSheet(user, startTrigger, "출근 시간 선택");
    });

    it("startSheetTitle/endSheetTitle 을 직접 오버라이드할 수 있다", async () => {
      const user = userEvent.setup();
      render(
        <RangeHarness
          now={NOW}
          startSheetTitle="언제부터?"
          endSheetTitle="언제까지?"
        />,
      );
      const [startTrigger] = screen.getAllByRole("button", {
        name: "시간 선택",
      });
      await openSheet(user, startTrigger, "언제부터?");
    });

    it("시작~종료를 순서대로 선택하는 전체 플로우", async () => {
      const user = userEvent.setup();
      render(<RangeHarness now={NOW} />);

      const [startTrigger] = screen.getAllByRole("button", {
        name: "시간 선택",
      });
      let dialog = await openSheet(user, startTrigger, "시작시간 선택");
      await user.click(hourOption(dialog, "8"));
      await user.click(dialog.getByRole("button", { name: "확인" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "오전 8:05" }),
      ).toBeInTheDocument();

      dialog = await openSheet(
        user,
        screen.getByRole("button", { name: "시간 선택" }),
        "종료시간 선택",
      );
      expect(
        screen.getByRole("button", { name: "오후 2:05" }),
      ).toBeInTheDocument();
      await user.click(hourOption(dialog, "5"));
      await user.click(dialog.getByRole("button", { name: "확인" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );

      expect(
        screen.getByRole("button", { name: "오전 8:05" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "오후 5:05" }),
      ).toBeInTheDocument();
    });
  });

  it("마크업에 hex 코드가 없다", async () => {
    const user = userEvent.setup();
    const { container } = render(<SingleHarness now={NOW} />);
    await user.click(screen.getByRole("button", { name: "시간 선택" }));
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
