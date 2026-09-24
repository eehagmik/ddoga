import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AddImageItem } from "./AddImage";
import { AddImage } from "./AddImage";

// jsdom 은 URL.createObjectURL/revokeObjectURL 을 구현하지 않으므로 테스트 범위에서만 모킹한다.
beforeEach(() => {
  let counter = 0;
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => `blob:mock-${counter++}`),
      revokeObjectURL: vi.fn(),
    }),
  );
});

function makeFile(name = "photo.png", type = "image/png") {
  return new File(["photo-bytes"], name, { type });
}

describe("AddImage", () => {
  it("images 가 비어 있으면 addButton 만 렌더하고 썸네일이 없다", () => {
    const { container } = render(<AddImage images={[]} onChange={vi.fn()} />);
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("파일을 선택하면 onChange 에 새 항목이 append 된 배열이 전달된다", () => {
    const onChange = vi.fn();
    const { container } = render(<AddImage images={[]} onChange={onChange} />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = makeFile();

    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as AddImageItem[];
    expect(next).toHaveLength(1);
    expect(next[0].file).toBe(file);
    expect(next[0].url).toMatch(/^blob:mock-/);
    expect(typeof next[0].id).toBe("string");
    expect(next[0].id.length).toBeGreaterThan(0);
  });

  it("multiple 파일을 한 번에 선택하면 모두 추가된다", () => {
    const onChange = vi.fn();
    const { container } = render(<AddImage images={[]} onChange={onChange} />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toHaveAttribute("multiple");

    fireEvent.change(input, {
      target: { files: [makeFile("a.png"), makeFile("b.png")] },
    });

    const next = onChange.mock.calls[0][0] as AddImageItem[];
    expect(next).toHaveLength(2);
    expect(next[0].id).not.toBe(next[1].id);
  });

  it("multiple=false 면 input 에 multiple 속성이 없다", () => {
    const { container } = render(
      <AddImage images={[]} onChange={vi.fn()} multiple={false} />,
    );
    expect(container.querySelector('input[type="file"]')).not.toHaveAttribute(
      "multiple",
    );
  });

  it("accept 기본값은 image/* 이고 커스텀 값으로 오버라이드된다", () => {
    const { container, rerender } = render(
      <AddImage images={[]} onChange={vi.fn()} />,
    );
    expect(container.querySelector('input[type="file"]')).toHaveAttribute(
      "accept",
      "image/*",
    );

    rerender(<AddImage images={[]} onChange={vi.fn()} accept="image/png" />);
    expect(container.querySelector('input[type="file"]')).toHaveAttribute(
      "accept",
      "image/png",
    );
  });

  it("등록된 이미지는 68x68 썸네일 img 로 렌더된다", () => {
    const images: AddImageItem[] = [
      { id: "1", url: "https://example.com/a.png" },
      { id: "2", url: "https://example.com/b.png" },
    ];
    const { container } = render(
      <AddImage images={images} onChange={vi.fn()} />,
    );
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("file 없이 url 만 있는 프리필 항목도 정상 렌더된다(서버 기존 이미지)", () => {
    const images: AddImageItem[] = [
      { id: "prefilled", url: "https://example.com/existing.png" },
    ];
    const { container } = render(
      <AddImage images={images} onChange={vi.fn()} />,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/existing.png",
    );
  });

  it("썸네일의 ClearButton 을 클릭하면 해당 항목만 제거된 배열로 onChange 가 호출된다", () => {
    const onChange = vi.fn();
    const images: AddImageItem[] = [
      { id: "1", url: "blob:local-1", file: makeFile() },
      { id: "2", url: "https://example.com/b.png" },
    ];
    const { getAllByRole } = render(
      <AddImage images={images} onChange={onChange} />,
    );

    const clearButtons = getAllByRole("button", { name: "이미지 삭제" });
    expect(clearButtons).toHaveLength(2);

    fireEvent.click(clearButtons[0]);

    expect(onChange).toHaveBeenCalledWith([
      { id: "2", url: "https://example.com/b.png" },
    ]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-1");
  });

  it("file 없는 프리필 항목을 삭제해도 revokeObjectURL 은 호출되지 않는다", () => {
    const onChange = vi.fn();
    const images: AddImageItem[] = [
      { id: "prefilled", url: "https://example.com/existing.png" },
    ];
    const { getByRole } = render(
      <AddImage images={images} onChange={onChange} />,
    );

    fireEvent.click(getByRole("button", { name: "이미지 삭제" }));

    expect(onChange).toHaveBeenCalledWith([]);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("onAdd 콜백이 선택된 File[] 과 함께 호출된다", () => {
    const onAdd = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      <AddImage images={[]} onChange={onChange} onAdd={onAdd} />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = makeFile();
    fireEvent.change(input, { target: { files: [file] } });
    expect(onAdd).toHaveBeenCalledWith([file]);
  });

  it("onRemove 콜백은 삭제된 항목의 id 로 호출된다", () => {
    const onRemove = vi.fn();
    const images: AddImageItem[] = [
      { id: "target-id", url: "https://example.com/a.png" },
    ];
    const { getByRole } = render(
      <AddImage images={images} onChange={vi.fn()} onRemove={onRemove} />,
    );
    fireEvent.click(getByRole("button", { name: "이미지 삭제" }));
    expect(onRemove).toHaveBeenCalledWith("target-id");
  });

  it("개수 제한 없이 계속 추가할 수 있다(addButton 이 항상 렌더된다)", () => {
    const images: AddImageItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: `${i}`,
      url: `https://example.com/${i}.png`,
    }));
    const { container } = render(
      <AddImage images={images} onChange={vi.fn()} />,
    );
    expect(container.querySelectorAll("img")).toHaveLength(12);
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
  });

  it("disabled 면 file input 과 ClearButton 이 모두 비활성화된다", () => {
    const images: AddImageItem[] = [
      { id: "1", url: "https://example.com/a.png" },
    ];
    const { container, getByRole } = render(
      <AddImage images={images} onChange={vi.fn()} disabled />,
    );
    expect(container.querySelector('input[type="file"]')).toBeDisabled();
    expect(getByRole("button", { name: "이미지 삭제" })).toBeDisabled();
  });

  it("disabled 인 ClearButton 을 클릭해도 onChange/onRemove 가 호출되지 않는다", () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    const images: AddImageItem[] = [
      { id: "1", url: "https://example.com/a.png" },
    ];
    const { getByRole } = render(
      <AddImage
        images={images}
        onChange={onChange}
        onRemove={onRemove}
        disabled
      />,
    );
    fireEvent.click(getByRole("button", { name: "이미지 삭제" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("addLabel/clearLabel 커스텀 텍스트가 반영된다", () => {
    const images: AddImageItem[] = [
      { id: "1", url: "https://example.com/a.png" },
    ];
    const { getByText, getByRole } = render(
      <AddImage
        images={images}
        onChange={vi.fn()}
        addLabel="촬영"
        clearLabel="삭제하기"
      />,
    );
    expect(getByText("촬영")).toBeInTheDocument();
    expect(getByRole("button", { name: "삭제하기" })).toBeInTheDocument();
  });

  it("className 을 루트(Scroll)에 병합한다", () => {
    const { container } = render(
      <AddImage images={[]} onChange={vi.fn()} className="my-custom-class" />,
    );
    expect(container.firstElementChild).toHaveClass("my-custom-class");
  });

  it("색·크기를 토큰 유틸로만 지정하고 인라인 style 에 hex 가 없다", () => {
    const images: AddImageItem[] = [
      { id: "1", url: "https://example.com/a.png" },
    ];
    const { container } = render(
      <AddImage images={images} onChange={vi.fn()} />,
    );
    container.querySelectorAll("*").forEach((el) => {
      const style = el.getAttribute("style") ?? "";
      expect(style).not.toMatch(/#[0-9a-fA-F]{3,}/);
    });
  });
});
