import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { BottomSheet } from "../BottomSheet";
import { Header } from "../Header";
import type { YearMonthSelectValue } from "./YearMonthSelect";
import { YearMonthSelect } from "./YearMonthSelect";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-73918";

const DEFAULT_VALUE: YearMonthSelectValue = { year: 2024, month: 10 };

const meta = {
  title: "Components/YearMonthSelect",
  component: YearMonthSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / _parts/YearMonthSelect" (node 51405:73920) 와 대응. 연도 × 월 2열 휠 선택 바디. `Calendar`(`src/components/ui/Calendar`) 헤더의 YearMonthButton 을 클릭했을 때 `BottomSheet` 의 `contentsSlot` 에 children 으로 꽂아 쓰는 순수 콘텐츠다(헤더/확인 버튼 없음, `TimeSelect` 와 동일 위치의 컴포넌트). 월 열은 Figma 목업(특정 스크롤 스냅샷)과 달리 1~12 고정이며, 연도 열은 `minYear`/`maxYear` 로 범위를 오버라이드할 수 있다(기본 오늘 연도 ±100/+50).',
      },
    },
  },
  args: {
    value: DEFAULT_VALUE,
    onChange: fn(),
  },
  argTypes: {
    disabled: { control: "boolean" },
    minYear: { control: "number" },
    maxYear: { control: "number" },
  },
} satisfies Meta<typeof YearMonthSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controlled `value`/`onChange` 를 로컬 state 로 감싸는 데모 래퍼(실제 스크롤 동작 확인용). */
function ControlledYearMonthSelect(
  props: Omit<Parameters<typeof YearMonthSelect>[0], "value"> & {
    value: YearMonthSelectValue;
  },
) {
  const [value, setValue] = useState(props.value);

  return (
    <YearMonthSelect
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
    />
  );
}

/** 기본형 — 320×434 컨테이너 안에서 실제 스크롤 휠 동작을 확인할 수 있다. */
export const Default: Story = {
  render: (args) => (
    <div className="h-[434px] w-[320px] bg-bg-neutral-normal">
      <ControlledYearMonthSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // 셀 클릭만으로도 값이 갱신되는지 확인(스크롤 시뮬레이션은 jsdom 한계로 클릭으로 대체).
    const monthThree = canvas.getByRole("option", { name: "03월" });
    await userEvent.click(monthThree);
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ month: 3 }),
    );
  },
};

/** 비활성화 — 선택된 셀은 checked=true/enable 룩을 유지한 채 클릭/스크롤이 모두 막힌다. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="h-[434px] w-[320px] bg-bg-neutral-normal">
      <ControlledYearMonthSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const monthThree = canvas.getByRole("option", { name: "03월" });
    await expect(monthThree).toBeDisabled();
    await userEvent.click(monthThree);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** 연도 범위 오버라이드 — `minYear`/`maxYear` 로 좁은 범위(예: 최근 10년)만 노출. */
export const CustomYearRange: Story = {
  args: {
    value: { year: 2026, month: 1 },
    minYear: 2020,
    maxYear: 2030,
  },
  render: (args) => (
    <div className="h-[434px] w-[320px] bg-bg-neutral-normal">
      <ControlledYearMonthSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const yearList = canvas.getByRole("listbox", { name: "연도" });
    await expect(
      within(yearList).getByRole("option", { name: "2020년" }),
    ).toBeInTheDocument();
    await expect(
      within(yearList).getByRole("option", { name: "2030년" }),
    ).toBeInTheDocument();
    await expect(
      within(yearList).queryByRole("option", { name: "2019년" }),
    ).not.toBeInTheDocument();
  },
};

/**
 * 실사용 예시 — `Calendar` 의 YearMonthButton 클릭으로 `BottomSheet` 를 열고, 그 안에
 * `contentsSlot` 으로 `YearMonthSelect` 를 꽂는 합성 패턴(`TimeSelect` 의
 * `InsideBottomSheet` 스토리와 동일 구조).
 */
export const InsideBottomSheet: Story = {
  render: (args) => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const [value, setValue] = useState<YearMonthSelectValue>(DEFAULT_VALUE);
      const label = `${value.year}년 ${value.month}월`;

      return (
        <div className="flex h-dvh w-[360px] flex-col bg-bg-neutral-deep">
          <Header
            type="select"
            titleValue={label}
            onTitleClick={() => setOpen(true)}
          />
          <BottomSheet
            open={open}
            onClose={() => setOpen(false)}
            title="연도/월 선택"
            fixButton={{
              variant: "single",
              primaryLabel: "확인",
              onPrimaryClick: () => setOpen(false),
            }}
          >
            <div className="h-[320px]">
              <YearMonthSelect
                {...args}
                value={value}
                onChange={(next) => {
                  setValue(next);
                  args.onChange(next);
                }}
              />
            </div>
          </BottomSheet>
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /2024년 10월/ }));
    const dialog = await canvas.findByRole("dialog", { name: "연도/월 선택" });
    await expect(dialog).toBeInTheDocument();
    await expect(
      within(dialog).getByRole("button", { name: "확인" }),
    ).toBeInTheDocument();
  },
};
