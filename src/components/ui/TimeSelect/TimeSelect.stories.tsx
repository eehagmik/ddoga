import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { BottomSheet } from "../BottomSheet";
import { Header } from "../Header";
import type { TimeSelectValue } from "./TimeSelect";
import { TimeSelect } from "./TimeSelect";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-또가3.0--Design-System?node-id=51405-151034";

const DEFAULT_VALUE: TimeSelectValue = {
  meridiem: "오전",
  hour: 6,
  minute: 5,
};

const meta = {
  title: "Components/TimeSelect",
  component: TimeSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / TimePicker" (node 51405:151034) 와 1:1. 오전/오후(스크롤 없는 라디오 2항목) × 시(1~12, 스크롤) × 분(0~59, 스크롤) 3열 휠 선택 바디. 헤더/확인 버튼이 없는 순수 콘텐츠라 `BottomSheet` 의 `contentsSlot` 에 children 으로 꽂아 쓴다(Figma Guide 합성 예시 참고, `InsideBottomSheet` 스토리). 선택 표시는 포커스 링이 아니라 중앙 셀의 `bg-bg-info-normal`/`bg-bg-info-deep` 배경색 자체로 한다. 분 열은 Figma 목업(0~11 축소 샘플)과 달리 사용자 승인에 따라 0~59 전체를 노출한다. 타이핑 캐럿(직접 입력) 상태는 스코프 밖이다. 상위 조합 컴포넌트 `TimePicker`(`src/components/ui/TimePicker`) 가 `TimeField`+`BottomSheet`+이 컴포넌트를 조합한다.',
      },
    },
  },
  args: {
    value: DEFAULT_VALUE,
    onChange: fn(),
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof TimeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controlled `value`/`onChange` 를 로컬 state 로 감싸는 데모 래퍼(실제 스크롤 동작 확인용). */
function ControlledTimeSelect(
  props: Omit<Parameters<typeof TimeSelect>[0], "value"> & {
    value: TimeSelectValue;
  },
) {
  const [value, setValue] = useState(props.value);

  return (
    <TimeSelect
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
      <ControlledTimeSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // 셀 클릭만으로도 값이 갱신되는지 확인(스크롤 시뮬레이션은 jsdom 한계로 클릭으로 대체).
    const hourSeven = canvas.getByRole("option", { name: "7" });
    await userEvent.click(hourSeven);
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hour: 7 }),
    );
  },
};

/** 비활성화 — 선택된 셀은 checked=true/enable 룩을 유지한 채 클릭/스크롤이 모두 막힌다. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="h-[434px] w-[320px] bg-bg-neutral-normal">
      <ControlledTimeSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const hourSeven = canvas.getByRole("option", { name: "7" });
    await expect(hourSeven).toBeDisabled();
    await userEvent.click(hourSeven);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** 오후·분 60개 전체 확인 — 사용자 승인 결정(분 0~59 확장)을 시각적으로 검증. */
export const AfternoonWithFullMinutes: Story = {
  args: {
    value: { meridiem: "오후", hour: 11, minute: 59 },
  },
  render: (args) => (
    <div className="h-[434px] w-[320px] bg-bg-neutral-normal">
      <ControlledTimeSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("option", { name: "59" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("option", { name: "00" }),
    ).toBeInTheDocument();
  },
};

/**
 * Figma Guide 페이지(51405:151068 근방)의 합성 예시 재현 — 페이지 상단 `Header`
 * (`type="select"`, 타이틀 클릭으로 오버레이를 여는 기존 패턴) + `BottomSheet`
 * (`fixButton` 단일 버튼) + `contentsSlot` 에 꽂힌 `TimeSelect`.
 */
export const InsideBottomSheet: Story = {
  render: (args) => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const [value, setValue] = useState<TimeSelectValue>(DEFAULT_VALUE);
      const label = `${value.meridiem} ${value.hour}:${String(
        value.minute,
      ).padStart(2, "0")}`;

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
            title="시간 선택"
            fixButton={{
              variant: "single",
              primaryLabel: "확인",
              onPrimaryClick: () => setOpen(false),
            }}
          >
            <div className="h-[320px]">
              <TimeSelect
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
    await userEvent.click(canvas.getByRole("button", { name: /오전 6:05/ }));
    const dialog = await canvas.findByRole("dialog", { name: "시간 선택" });
    await expect(dialog).toBeInTheDocument();
    await expect(
      within(dialog).getByRole("button", { name: "확인" }),
    ).toBeInTheDocument();
  },
};
