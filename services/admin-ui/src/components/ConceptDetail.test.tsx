import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConceptDetail } from "./ConceptDetail";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

const base = {
  concept_id: "c1",
  tenant: "default",
  name: "lvl()",
  dedupe_key: "lvl",
  state: "confirmed" as const,
  aliases: ["level"],
  symbol_kind: "function",
  source_entity_id: "ent-src",
  extractor_version: "graphifyy/0.8.38",
  created_at: "2026-06-15T00:00:00Z",
  updated_at: "2026-06-15T00:00:00Z",
  neighbours_confirmed: [],
  neighbours_candidate: [],
};

const neighbour = {
  edge: {
    edge_id: "e1",
    tenant: "default",
    type: "calls",
    from_concept_id: "c1",
    to_concept_id: "c-read",
    state: "confirmed" as const,
    confidence: 0.98,
    created_at: "2026-06-15T00:00:00Z",
    updated_at: "2026-06-15T00:00:00Z",
  },
  peer: {
    concept_id: "c-read",
    tenant: "default",
    name: "read()",
    state: "confirmed" as const,
    aliases: [],
    updated_at: "2026-06-15T00:00:00Z",
  },
  evidence_entity_ids: ["ent-1"],
};

describe("ConceptDetail", () => {
  it("renders header, metadata, and empty neighbour state", () => {
    render(<ConceptDetail concept={base} />);
    expect(screen.getByText("lvl()")).toBeInTheDocument();
    expect(screen.getByText(/function/)).toBeInTheDocument();
    expect(screen.getByText("level")).toBeInTheDocument();
    expect(screen.getByText("source entity")).toHaveAttribute("href", "/entities/ent-src");
    expect(screen.getByText("graphifyy/0.8.38")).toBeInTheDocument();
    expect(screen.getByText("No confirmed neighbours.")).toBeInTheDocument();
  });

  it("renders neighbours by name (not UUID) and navigates on click", () => {
    const onNavigate = vi.fn();
    render(
      <ConceptDetail concept={{ ...base, neighbours_confirmed: [neighbour] }} onNavigate={onNavigate} />,
    );
    const peer = screen.getByText("read()");
    expect(peer).toBeInTheDocument();
    expect(screen.queryByText(/c-read/)).not.toBeInTheDocument();
    fireEvent.click(peer);
    expect(onNavigate).toHaveBeenCalledWith("c-read");
  });

  it("keeps review buttons out of the panel until the actions menu opens", () => {
    render(<ConceptDetail concept={{ ...base, neighbours_confirmed: [neighbour] }} />);
    expect(screen.getByRole("button", { name: /concept actions/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^promote$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^delete$/i })).not.toBeInTheDocument();
  });

  it("shows per-group counts on the segmented switch", () => {
    render(<ConceptDetail concept={{ ...base, neighbours_confirmed: [neighbour] }} />);
    expect(screen.getByText(/Confirmed 1/)).toBeInTheDocument();
    expect(screen.getByText(/Candidate 0/)).toBeInTheDocument();
  });
});
