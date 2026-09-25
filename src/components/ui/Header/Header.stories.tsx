import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import type { HeaderContentsColor, HeaderType, HeaderVariant } from "./Header";
import { Header } from "./Header";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-디자인시스템3.0--Design-System?node-id=51405-85638";

const TYPES: HeaderType[] = ["home", "normal", "select", "search"];
const VARIANTS: HeaderVariant[] = ["normal", "blur", "transparent"];
const CONTENTS_COLORS: HeaderContentsColor[] = ["neutral", "inverse"];

const SLOT_PLACEHOLDER_LABEL = "슬롯";

/**
 * `slot` 데모용 자리표시자. `HorizontalMenuButton`/`VerticalMenuButton` 스토리의
 * 슬롯 placeholder 선례와 동일하게 회색 박스 + "슬롯" 텍스트로 표현한다.
 * 실제 `slot` 은 임의 콘텐츠라 폭을 강제하지 않으므로 너비는 hug(내용만큼)로 두고,
 * 다른 아이콘과 같은 높이(24px)만 맞춘다. meta 기본 args 에 넣어서 Docs 탭
 * 컨트롤에서 `showSlot` 을 켜면(값을 직접 지정하지 않은 다른 스토리에서도) 바로
 * 이 자리표시자가 보이게 한다 — `slot` 은 `ReactNode` 라 컨트롤로 편집할 수
 * 없으니 기본값 자체를 의미 있게 채워두는 것.
 */
function renderSlotPlaceholder() {
  return (
    <span
      className={[
        "inline-flex h-(--sz-24) shrink-0 items-center justify-center",
        "rounded-xs bg-bg-neutral-deepDark px-(--sz-4)",
        "text-body-6 text-typo-neutral-light",
      ].join(" ")}
    >
      {SLOT_PLACEHOLDER_LABEL}
    </span>
  );
}

const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / Header" (node 51405:85638) 와 1:1. 상단 앱 헤더 — 좌측 뒤로가기+타이틀(옵션 드롭다운), 우측 옵션 아이콘 그룹(최대 8개, 커스텀 콘텐츠 슬롯 `showSlot`/`slot` 포함). `type`(home/normal/select/search) × `variant`(normal/blur/transparent) × `contentsColor`(neutral/inverse, transparent 전용) × `bold` 축을 가지며, `variant` 가 blur/transparent 일 때는 `scrollThreshold` 를 넘어 스크롤하면 자동으로 normal/neutral 배경으로 전환된다(Figma 밖 신규 동작). `type="home"` 은 좌측이 `Logo`(뒤로가기 없음) + 우측 user/cart 고정, `type="search"` 는 좌측이 back + `Searchbar`(트리거) 로 대체된다(2026-09-13 Figma 재조사 반영).',
      },
    },
  },
  args: {
    type: "normal",
    variant: "normal",
    contentsColor: "neutral",
    bold: false,
    back: true,
    title: true,
    titleValue: "Title",
    onBack: fn(),
    onTitleClick: undefined,
    showHome: false,
    showSlot: false,
    slot: renderSlotPlaceholder(),
    showUser: false,
    showSearch: false,
    showLike: false,
    showShare: false,
    showCart: false,
    showClose: false,
  },
  argTypes: {
    type: { control: "inline-radio", options: TYPES },
    variant: { control: "inline-radio", options: VARIANTS },
    contentsColor: { control: "inline-radio", options: CONTENTS_COLORS },
    bold: { control: "boolean" },
    back: { control: "boolean" },
    title: { control: "boolean" },
    showSlot: { control: "boolean" },
    slot: { control: false },
    scrollThreshold: { control: "number" },
    cartCount: { control: "number" },
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

/** controls 로 전체 축을 탐색. */
export const Playground: Story = {
  args: {
    showHome: true,
    showUser: true,
    showSearch: true,
    showLike: true,
    showShare: true,
    showCart: true,
    cartCount: 3,
  },
};

/**
 * type 4종 — home 은 좌측 로고 + 우측 user/cart 고정(다른 showX 는 무시됨),
 * search 는 좌측에 back + Searchbar 가 렌더되고 select 는 chevron 이 함께 붙는다.
 */
export const Types: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-1) bg-bg-neutral-deep">
      {TYPES.map((type) => (
        <Header key={type} {...args} type={type} />
      ))}
    </div>
  ),
};

/**
 * type="home" — 좌측 브랜드 `Logo`(horizontal) + 우측 user/cart 고정 조합을
 * `contentsColor` neutral/inverse 두 톤으로 확인한다. inverse 는 투명/어두운
 * 배경 위에서만 대비가 맞으므로 `variant="transparent"` 로 배경을 얹었다.
 */
export const HomeType: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-16)">
      <Header {...args} type="home" contentsColor="neutral" />
      <div className="bg-bg-neutral-dark">
        <Header
          {...args}
          type="home"
          variant="transparent"
          contentsColor="inverse"
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole("img", { name: "또하나의가족" })[0],
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole("button", { name: "마이페이지" })[0],
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole("button", { name: "장바구니" })[0],
    ).toBeInTheDocument();
    // 뒤로가기는 절대 렌더되지 않는다.
    await expect(
      canvas.queryByRole("button", { name: "뒤로가기" }),
    ).not.toBeInTheDocument();
  },
};

/**
 * type="search" — 좌측 back + `Searchbar`(트리거)가 렌더되는지, 클릭 시
 * `onSearchbarClick` 이 호출되는지 확인한다.
 */
export const SearchType: Story = {
  args: {
    type: "search",
    onSearchbarClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const searchbar = canvas.getByRole("button", { name: "검색" });
    await expect(searchbar).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "뒤로가기" }),
    ).toBeInTheDocument();

    await userEvent.click(searchbar);
    await expect(args.onSearchbarClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * variant 3종 — blur/transparent 는 배경 위에 얹어야 효과가 드러난다.
 * 데모 전용 색띠(토큰 색만 사용, 컴포넌트 스타일 아님)로 대비를 만든다.
 */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-16)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="relative flex">
          <div className="h-(--sz-96) flex-1 bg-bg-brand-normal" />
          <div className="h-(--sz-96) flex-1 bg-bg-danger-normal" />
          <div className="h-(--sz-96) flex-1 bg-bg-info-normal" />
          <div className="absolute inset-x-0 top-0">
            <Header {...args} variant={variant} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** contentsColor 2종(neutral/inverse) — transparent 배경 위에서만 의미가 있다. */
export const ContentsColors: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-16)">
      {CONTENTS_COLORS.map((contentsColor) => (
        <div key={contentsColor} className="bg-bg-neutral-dark">
          <Header
            {...args}
            variant="transparent"
            contentsColor={contentsColor}
            showHome
            showShare
          />
        </div>
      ))}
    </div>
  ),
};

/** bold: false/true. */
export const Bold: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--sz-1) bg-bg-neutral-deep">
      <Header {...args} bold={false} />
      <Header {...args} bold />
    </div>
  ),
};

/**
 * 옵션 아이콘 그룹 최대 8개(home/slot/user(+dot)/search/like/share/cart(+number)/close).
 * `showSlot`+`slot` 은 Figma 마스터 컴포넌트("_parts/IconOptional", node 51405:85603)의
 * 진짜 커스텀 콘텐츠 슬롯(instance-swap) 기능이다 — Home 다음, User 이전 위치에
 * 소비자가 원하는 콘텐츠를 자유롭게 채워 넣을 수 있다(폭 고정 없음, 높이만 24px).
 */
export const AllOption: Story = {
  args: {
    showHome: true,
    showSlot: true,
    slot: renderSlotPlaceholder(),
    showUser: true,
    userBadge: true,
    showSearch: true,
    showLike: true,
    showShare: true,
    showCart: true,
    cartCount: 12,
    showClose: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(SLOT_PLACEHOLDER_LABEL)).toBeInTheDocument();
  },
};

/**
 * 스크롤 연동 배경 전환. blur/transparent 헤더를 sticky 로 긴 콘텐츠 위에 얹어
 * `scrollThreshold`(여기선 80px) 를 넘게 스크롤하면 normal/neutral 로 바뀌는지 확인한다.
 */
export const ScrollBackgroundSwap: Story = {
  args: {
    type: "select",
    variant: "transparent",
    contentsColor: "inverse",
    titleValue: "스크롤해보세요",
    scrollThreshold: 80,
    showShare: true,
    showCart: true,
  },
  render: (args) => (
    <div className="bg-gray-500">
      <div className="sticky top-0 z-10">
        <Header {...args} />
      </div>
      <div className="flex h-[200vh] flex-col items-center justify-start gap-(--sz-16) p-(--sz-24) text-typo-inverse-normal">
        <p className="text-body-2">
          아래로 80px 이상 스크롤하면 헤더가 normal/neutral 로 전환됩니다.
          (`Header` 는 컨테이너가 아니라 `window` 스크롤을 관찰하므로, 이
          스토리는 문서 전체를 스크롤해야 한다.)
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole("banner");
    await expect(header).toHaveAttribute("data-variant", "transparent");

    window.scrollTo(0, 120);
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() =>
      expect(header).toHaveAttribute("data-variant", "normal"),
    );

    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() =>
      expect(header).toHaveAttribute("data-variant", "transparent"),
    );
  },
};

/** type="select" 타이틀 클릭 시 onTitleClick 이 호출되는지 검증. */
export const SelectTitleClick: Story = {
  args: {
    type: "select",
    titleValue: "정렬 기준",
    onTitleClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const titleButton = canvas.getByRole("button", { name: "정렬 기준" });

    await userEvent.click(titleButton);
    await expect(args.onTitleClick).toHaveBeenCalledTimes(1);
  },
};

/** showLike 를 켜면 LikeToggle(북마크)이 토글되는지 검증. */
export const LikeToggleInteraction: Story = {
  args: {
    showLike: true,
    onLikedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const likeButton = canvas.getByRole("button", { name: "북마크" });

    await userEvent.click(likeButton);
    await expect(args.onLikedChange).toHaveBeenCalledWith(true);
  },
};
