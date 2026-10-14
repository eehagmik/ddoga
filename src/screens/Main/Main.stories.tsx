import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { MemoryRouter } from "react-router-dom";

import { AppShell } from "../../AppShell";
import { Main } from "./Main";

const meta = {
  title: "Screens/메인",
  component: Main,
  // 화면은 하단 탭바·플로팅 버튼이 `position: fixed`라 여러 스토리가 한 페이지에 모이는 autodocs에서 서로 겹친다.
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: {
      viewports: {
        mobile375: {
          name: "Mobile 375",
          styles: { width: "375px", height: "812px" },
        },
      },
      defaultViewport: "mobile375",
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AppShell>
          <Story />
        </AppShell>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Main>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lowestTab = canvas.getByRole("button", { name: "최저가" });

    await userEvent.click(lowestTab);

    await waitFor(
      () => expect(lowestTab).toHaveAttribute("aria-current", "true"),
      { timeout: 3000 },
    );
  },
};
