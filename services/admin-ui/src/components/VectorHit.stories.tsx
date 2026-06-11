import type { Meta, StoryObj } from "@storybook/react";
import { VectorHit } from "./VectorHit";

const meta: Meta<typeof VectorHit> = {
  title: "Admin/VectorHit",
  component: VectorHit,
};
export default meta;

type Story = StoryObj<typeof VectorHit>;

const base = {
  rank: 1,
  hit: {
    entity_id: "1e8f2173-e739-59ae-a873-f754d7f1bc3c",
    score: 0.7321,
    source: "git",
    source_uri: "git://anthropic-cookbook/misc/prompt_caching.ipynb",
    title: "misc/prompt_caching.ipynb",
    classification: "internal",
    snippet:
      "This notebook walks through how prompt caching works with Anthropic's API, including cache_control on system messages and how to measure cache hit rates against repeated requests.",
    collection: "default__git",
  },
};

export const Default: Story = { args: base };

export const Empty: Story = {
  args: {
    rank: 7,
    hit: {
      entity_id: "no-snippet",
      score: 0.0123,
      source: "git",
      source_uri: "git://x/y",
      title: null,
      classification: "internal",
      snippet: "",
    },
  },
};

export const Error: Story = {
  args: {
    rank: 0,
    hit: {
      entity_id: "bad-payload",
      score: 0,
      source: "",
      source_uri: "",
      title: "(missing payload)",
      classification: "unknown",
      snippet: "[no snippet — entity likely missing from catalog]",
    },
  },
};

export const WithCallback: Story = {
  args: { ...base, onShowNeighbours: () => alert("show neighbours") },
};
