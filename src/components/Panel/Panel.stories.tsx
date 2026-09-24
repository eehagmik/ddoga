import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";
import { Panel } from "./Panel";

const meta = {
  title: "Components/Panel",
  component: Panel,
  tags: ["autodocs"],
  parameters: {
    design: {
      url: "https://www.figma.com/design/kUirarWT1Xugaq0aajY4G6/-%E1%84%84%E1%85%A9%E1%84%80%E1%85%A13.0--Design-System?node-id=51405-127512",
    },
  },
  argTypes: {
    color: {
      control: "radio",
      options: ["white", "dim"],
      description: "Background color variant",
    },
    placement: {
      control: "radio",
      options: ["top", "bottom"],
      description:
        "Panel placement (affects corner radius direction and shadow direction)",
    },
    radius: {
      control: "boolean",
      description: "Enable rounded corners (3xl radius)",
    },
    shadow: {
      control: "boolean",
      description: "Enable drop shadow",
    },
    children: {
      control: false,
      description: "Panel content",
    },
    className: {
      control: "text",
      description: "Optional CSS class override",
    },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {
  args: {
    color: "white",
    placement: "bottom",
    radius: false,
    shadow: false,
    children: <div className="text-center text-sm">Content Slot</div>,
  },
};

// Color variations
export const WhiteColor: Story = {
  args: {
    ...Default.args,
    color: "white",
  },
};

export const DimColor: Story = {
  args: {
    ...Default.args,
    color: "dim",
  },
};

// Placement variations
export const PlacementTop: Story = {
  args: {
    ...Default.args,
    placement: "top",
    color: "white",
  },
};

export const PlacementBottom: Story = {
  args: {
    ...Default.args,
    placement: "bottom",
    color: "white",
  },
};

// Radius variations
export const WithRadius: Story = {
  args: {
    ...Default.args,
    radius: true,
    placement: "bottom",
  },
};

export const WithoutRadius: Story = {
  args: {
    ...Default.args,
    radius: false,
    placement: "bottom",
  },
};

// Shadow variations
export const WithShadowBottom: Story = {
  args: {
    ...Default.args,
    shadow: true,
    placement: "bottom",
  },
};

export const WithShadowTop: Story = {
  args: {
    ...Default.args,
    shadow: true,
    placement: "top",
  },
};

export const WithoutShadow: Story = {
  args: {
    ...Default.args,
    shadow: false,
  },
};

// Combined variations
export const WhiteRadiusShadowBottom: Story = {
  args: {
    color: "white",
    placement: "bottom",
    radius: true,
    shadow: true,
    children: <div className="text-center text-sm">Bottom Panel</div>,
  },
};

export const WhiteRadiusShadowTop: Story = {
  args: {
    color: "white",
    placement: "top",
    radius: true,
    shadow: true,
    children: <div className="text-center text-sm">Top Panel</div>,
  },
};

export const DimRadiusShadowBottom: Story = {
  args: {
    color: "dim",
    placement: "bottom",
    radius: true,
    shadow: true,
    children: <div className="text-center text-sm text-white">Dim Panel</div>,
  },
};

export const DimRadiusShadowTop: Story = {
  args: {
    color: "dim",
    placement: "top",
    radius: true,
    shadow: true,
    children: <div className="text-center text-sm text-white">Dim Panel</div>,
  },
};

// Play function for interaction testing
export const WithPlayFunction: Story = {
  args: {
    ...Default.args,
    color: "white",
    placement: "bottom",
    radius: true,
    shadow: true,
  },
  play: async ({ canvasElement }) => {
    // Verify panel renders with correct data attribute
    const panel = canvasElement.querySelector("[data-node-id='51405:127512']");
    expect(panel).toBeInTheDocument();

    // Verify the slot content
    const slot = canvasElement.querySelector("[data-name='contentsSlot']");
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveAttribute("data-node-id", "51405:127514");
  },
};
