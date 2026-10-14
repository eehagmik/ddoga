import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { MemoryRouter } from "react-router-dom";

import { AppShell } from "../../AppShell";
import { LtcProfile } from "./LtcProfile";

const meta = {
  title: "Screens/김또가 어르신",
  component: LtcProfile,
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
} satisfies Meta<typeof LtcProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "김또가님 전용 상담사와 상담하기" }),
    ).toBeVisible();

    const profilePill = canvas.getByRole("button", { name: /최미나수/ });
    await userEvent.click(profilePill);
    await expect(profilePill).toHaveAttribute("aria-pressed", "true");
  },
};
