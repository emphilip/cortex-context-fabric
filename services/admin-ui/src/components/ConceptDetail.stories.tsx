import type { Meta, StoryObj } from "@storybook/react";
import { ConceptDetail } from "./ConceptDetail";

const neighbour = (type: string, name: string, state: "confirmed" | "candidate", confidence: number) => ({
  edge: {
    edge_id: `e-${name}`,
    tenant: "default",
    type,
    from_concept_id: "c1",
    to_concept_id: `c-${name}`,
    state,
    confidence,
    created_at: "2026-06-15T00:00:00Z",
    updated_at: "2026-06-15T00:00:00Z",
  },
  peer: {
    concept_id: `c-${name}`,
    tenant: "default",
    name,
    state,
    aliases: [],
    updated_at: "2026-06-15T00:00:00Z",
  },
  evidence_entity_ids: ["ent-1", "ent-2"],
});

const concept = {
  concept_id: "c1",
  tenant: "default",
  name: "lvl()",
  dedupe_key: "lvl",
  state: "confirmed" as const,
  confidence: 1.0,
  aliases: ["level"],
  symbol_kind: "function",
  source_entity_id: "ent-src",
  extractor_version: "graphifyy/0.8.38",
  description: "Computes the heading level for a section node.",
  created_at: "2026-06-15T00:00:00Z",
  updated_at: "2026-06-15T00:00:00Z",
  neighbours_confirmed: [
    neighbour("defined_in", "checks.py", "confirmed", 1.0),
    neighbour("calls", "read()", "confirmed", 0.98),
  ],
  neighbours_candidate: [neighbour("calls", "title_of()", "candidate", 0.71)],
};

export default {
  title: "Graph/ConceptDetail",
  component: ConceptDetail,
} satisfies Meta<typeof ConceptDetail>;

type Story = StoryObj<typeof ConceptDetail>;

export const Default: Story = { args: { concept } };
export const Empty: Story = {
  args: { concept: { ...concept, description: undefined, neighbours_confirmed: [], neighbours_candidate: [] } },
};
export const Candidate: Story = { args: { concept: { ...concept, state: "candidate" } } };
