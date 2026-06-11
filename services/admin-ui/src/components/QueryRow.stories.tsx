import type { Meta, StoryObj } from "@storybook/react";
import { QueryRow } from "./QueryRow";

const meta: Meta<typeof QueryRow> = {
  title: "Admin/QueryRow",
  component: QueryRow,
};
export default meta;

type Story = StoryObj<typeof QueryRow>;

const base = {
  id: 42,
  created_at: new Date("2026-06-10T12:34:56Z").toISOString(),
  principal: "local-dev",
  tool: "retrieve_for_context",
  query: "How do we connect a new model provider?",
  tokens_in: 128,
  tokens_out: 0,
  latency_ms: 215,
  outcome: "ok" as const,
};

export const Default: Story = { args: base };
export const Error: Story = { args: { ...base, outcome: "error", latency_ms: 5000 } };
export const LongQuery: Story = {
  args: {
    ...base,
    query:
      "Walk me through the entire 7-stage retrieval pipeline and explain where token accounting happens at each step in painful detail please",
  },
};
