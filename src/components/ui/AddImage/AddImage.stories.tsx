import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useState } from "react";

import type { AddImageItem, AddImageProps } from "./AddImage";
import { AddImage } from "./AddImage";

const FIGMA_URL =
  "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-디자인3.0--Design-System?node-id=51405-5649";

/** Avatar 스토리 선례와 동일하게 네트워크 없이 렌더되는 인라인 SVG 데이터 URI 샘플. */
const SAMPLE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23a6b3ad'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23f5f8f7'/%3E%3Cellipse cx='50' cy='95' rx='32' ry='25' fill='%23f5f8f7'/%3E%3C/svg%3E";

function makeItems(count: number): AddImageItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `sample-${i}`,
    url: SAMPLE_SRC,
  }));
}

/**
 * `AddImage` 는 controlled(`images` + `onChange`) 컴포넌트라, 스토리 캔버스에서 실제로
 * 추가/삭제가 동작하는 모습을 보여주려면 로컬 state 로 감싸는 wrapper 가 필요하다.
 */
function StatefulAddImage({
  initialImages = [],
  onChange,
  ...rest
}: Omit<AddImageProps, "images" | "onChange"> & {
  initialImages?: AddImageItem[];
  onChange?: AddImageProps["onChange"];
}) {
  const [images, setImages] = useState<AddImageItem[]>(initialImages);
  return (
    <AddImage
      {...rest}
      images={images}
      onChange={(next) => {
        setImages(next);
        onChange?.(next);
      }}
    />
  );
}

const meta = {
  title: "Components/AddImage",
  component: AddImage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          'Figma "또가3.0 Design System / AddImage" (문서 노드 51405:5544 / 메인 컴포넌트 51405:5649) 와 1:1. "사진" 버튼(addButton)을 누르면 파일 선택창이 열리고, 고른 이미지가 오른쪽에 68×68 썸네일로 등록되며 각 썸네일 우상단 `ClearButton` 으로 삭제할 수 있다. `images`/`onChange` controlled, 개수 제한 없음(가로 스크롤로 처리, `Scroll axis="x"` 재사용), `multiple` 다중 선택 기본 true, `file` 없이 `url` 만 있는 프리필(기존 서버 이미지)도 지원한다.',
      },
    },
  },
  args: {
    images: [],
    onChange: fn(),
  },
} satisfies Meta<typeof AddImage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 빈 상태 — addButton 만 노출. */
export const Default: Story = {
  render: (args) => <StatefulAddImage {...args} />,
};

/** 이미지 4장이 등록된 상태. */
export const WithImages: Story = {
  render: (args) => <StatefulAddImage {...args} initialImages={makeItems(4)} />,
};

/**
 * 썸네일이 많아 컨테이너 폭을 넘치는 상태 — 가로 스크롤이 걸리지만
 * `Scroll` 위에 이 컴포넌트가 덧씌운 `!important` 처리로 스크롤바는 시각적으로 숨는다.
 */
export const ManyImages: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <StatefulAddImage {...args} initialImages={makeItems(10)} />
    </div>
  ),
};

/** `file` 없이 `url` 만 있는 프리필 항목(서버에 이미 저장된 기존 이미지) 지원 확인. */
export const WithPrefilledUrl: Story = {
  render: (args) => (
    <StatefulAddImage
      {...args}
      initialImages={[{ id: "prefilled-1", url: SAMPLE_SRC }]}
    />
  ),
};

/** disabled — addButton 클릭도, 썸네일 삭제도 막힌다(네이티브 `disabled` 동작에 위임). */
export const Disabled: Story = {
  render: (args) => (
    <StatefulAddImage {...args} disabled initialImages={makeItems(2)} />
  ),
};

/**
 * 파일 선택 → 썸네일 등록 → 삭제 흐름을 `userEvent.upload()` 로 검증한다.
 * 썸네일 `<img alt="">` 는 장식 이미지라 접근성 트리에서 제외돼 role 쿼리로 못 잡으므로
 * `querySelectorAll("img")` 로 개수를 직접 확인한다.
 */
export const AddAndRemove: Story = {
  render: (args) => <StatefulAddImage {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileInput = canvasElement.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["photo-bytes"], "photo.png", {
      type: "image/png",
    });

    await expect(canvasElement.querySelectorAll("img")).toHaveLength(0);

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(canvasElement.querySelectorAll("img")).toHaveLength(1);
    });

    const removeBtn = canvas.getByRole("button", { name: "이미지 삭제" });
    await userEvent.click(removeBtn);

    await waitFor(() => {
      expect(canvasElement.querySelectorAll("img")).toHaveLength(0);
    });
  },
};
