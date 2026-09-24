import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { Icon } from "../../../icons";
import { BlankGraphic } from "../BlankGraphic";
import { IconButton } from "../IconButton";
import { MenuItem } from "../MenuItem";
import { FloatingMenu } from "./FloatingMenu";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-85287";

const meta = {
  title: "Components/FloatingMenu",
  component: FloatingMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / FloatingMenu" (node 51405:85316) 와 1:1. 흰 배경 카드형 컨테이너로, `items` 배열로 넘긴 `MenuItem`들을 세로로 쌓고 항목 "사이"에만 `Divider`를 자동 삽입한다(첫 항목 앞·마지막 항목 뒤는 제외). Figma의 `MenuItemGroup`은 디자인 파일 전용 헬퍼라 코드에는 반영하지 않았다. 트리거/포지셔닝/열림 상태는 범위 밖(`Tooltip`과 동일한 presentational 원칙).',
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
  },
} satisfies Meta<typeof FloatingMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본 — MenuItem 2개, 사이에 Divider 1개. */
export const Default: Story = {
  args: {
    items: [
      <MenuItem key="1" label="공지사항" />,
      <MenuItem key="2" label="설정" />,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "공지사항" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "설정" }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("separator")).toBeInTheDocument();
  },
};

/** MenuItem 3개 이상 — Divider가 항목 "사이"에만(처음/끝 제외) 삽입되는지 확인. */
export const ThreeItems: Story = {
  args: {
    items: [
      <MenuItem key="1" label="공유하기" />,
      <MenuItem key="2" label="수정하기" />,
      <MenuItem key="3" label="삭제하기" />,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(3);
    // 항목 3개 → 사이 구분선 2개(처음 앞·마지막 뒤 없음).
    await expect(canvas.getAllByRole("separator")).toHaveLength(2);
  },
};

/** 항목 1개 — 사이가 없으므로 Divider 미삽입. */
export const SingleItem: Story = {
  args: {
    items: [<MenuItem key="1" label="Label" />],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Label" }),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole("separator")).not.toBeInTheDocument();
  },
};

/**
 * variant 혼합 — MenuItem 4개 variant를 사용 중요도 순(1.text 2.icon 3.graphic
 * 4.chip)으로 모두 쌓는다.
 */
export const MixedVariants: Story = {
  args: {
    items: [
      <MenuItem key="1" label="텍스트만" variant="text" />,
      <MenuItem key="2" label="아이콘 포함" variant="icon">
        <Icon name="home_01_line" size={24} />
      </MenuItem>,
      <MenuItem key="3" label="그래픽 포함" variant="graphic">
        <BlankGraphic />
      </MenuItem>,
      <MenuItem key="4" label="칩 포함" variant="chip" chipLabel="New" />,
    ],
  },
};

/**
 * IconButton(dots_vertical, icon-neutral-bright) 클릭 시 FloatingMenu가
 * 버튼 바로 아래·좌측 정렬(버튼 기준 오른쪽으로 펼쳐짐)로 열리는 실사용 예시.
 * 버튼이 화면/캔버스 좌측 구석에 있어도 메뉴가 화면 밖으로 잘리지 않도록 오른쪽
 * 방향으로 열리게 한다(사용자 확인 사항). 위치·트리거·바깥 클릭 닫기는
 * `FloatingMenu` 컴포넌트 책임이 아니라(범위 밖), 이 스토리처럼 소비 측에서
 * `relative`/`absolute` 로 직접 배치한다.
 */
function IconButtonMenuExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <IconButton
        aria-label="더보기"
        aria-expanded={open}
        className="text-icon-neutral-bright"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon name="dots_vertical_line" size={24} />
      </IconButton>

      {open && (
        <>
          {/* 바깥 클릭 시 닫기 위한 투명 오버레이. */}
          <div
            aria-hidden
            className="fixed inset-0 z-0"
            onClick={() => setOpen(false)}
          />
          <FloatingMenu
            className="absolute top-full left-0 z-10 mt-[var(--sz-8)]"
            items={[
              <MenuItem
                key="edit"
                label="수정"
                variant="icon"
                onClick={() => setOpen(false)}
              >
                <Icon name="pencil_01_line" size={24} />
              </MenuItem>,
              <MenuItem
                key="delete"
                label="삭제"
                variant="icon"
                onClick={() => setOpen(false)}
              >
                <Icon name="trash_01_line" size={24} />
              </MenuItem>,
            ]}
          />
        </>
      )}
    </div>
  );
}

/** IconButton 트리거로 여닫는 실사용 조합 예시(수정/삭제 메뉴). */
export const TriggeredByIconButton: Story = {
  args: { items: [] },
  render: () => <IconButtonMenuExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "더보기" });
    await expect(
      canvas.queryByRole("button", { name: "수정" }),
    ).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(
      canvas.getByRole("button", { name: "수정" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "삭제" }),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "삭제" }));
    await expect(
      canvas.queryByRole("button", { name: "수정" }),
    ).not.toBeInTheDocument();
  },
};
