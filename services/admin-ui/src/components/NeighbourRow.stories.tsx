import type { Meta, StoryObj } from "@storybook/react";
import { NeighbourRow } from "./NeighbourRow";

const neighbour = {
  edge: {
    edge_id: "e1",
    tenant: "default",
    type: "defined_in",
    from_concept_id: "c-aaaaaaaa",
    to_concept_id: "c-bbbbbbbb",
    state: "confirmed" as const,
    confidence: 1.0,
    created_at: "2026-06-15T00:00:00Z",
    updated_at: "2026-06-15T00:00:00Z",
  },
  peer: {
    concept_id: "c-bbbbbbbb",
    tenant: "default",
    name: "checks.py",
    state: "confirmed" as const,
    aliases: [],
    updated_at: "2026-06-15T00:00:00Z",
  },
  evidence_entity_ids: ["ent-1", "ent-2"],
};

export default {
  title: "Graph/NeighbourRow",
  component: NeighbourRow,
} satisfies Meta<typeof NeighbourRow>;

type Story = StoryObj<typeof NeighbourRow>;

export const Default: Story = { args: { neighbour, onNavigate: () => {} } };
export const NoEvidence: Story = {
  args: { neighbour: { ...neighbour, evidence_entity_ids: [] }, onNavigate: () => {} },
};
export const Candidate: Story = {
  args: {
    neighbour: { ...neighbour, edge: { ...neighbour.edge, type: "calls", state: "candidate", confidence: 0.72 } },
    onNavigate: () => {},
  },
};
