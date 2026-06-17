import type { Meta, StoryObj } from "@storybook/react";
import { ConceptSearch } from "./ConceptSearch";

export default {
  title: "Graph/ConceptSearch",
  component: ConceptSearch,
} satisfies Meta<typeof ConceptSearch>;

type Story = StoryObj<typeof ConceptSearch>;

export const Default: Story = { args: { onSelect: () => {} } };
