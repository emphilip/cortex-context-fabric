import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NeighbourRow } from "./NeighbourRow";

const neighbour = {
  edge: {
    edge_id: "e1",
    tenant: "default",
    type: "calls",
    from_concept_id: "c-aaaaaaaa",
    to_concept_id: "c-bbbbbbbb",
    state: "confirmed" as const,
    confidence: 0.98,
    created_at: "2026-06-15T00:00:00Z",
    updated_at: "2026-06-15T00:00:00Z",
  },
  peer: {
    concept_id: "c-bbbbbbbb",
    tenant: "default",
    name: "read()",
    state: "confirmed" as const,
    aliases: [],
    updated_at: "2026-06-15T00:00:00Z",
  },
  evidence_entity_ids: ["ent-1"],
};

describe("NeighbourRow", () => {
  it("shows the peer name, never the raw UUID", () => {
    render(<NeighbourRow neighbour={neighbour} onNavigate={() => {}} />);
    expect(screen.getByText("read()")).toBeInTheDocument();
    expect(screen.queryByText(/c-bbbbbbbb/)).not.toBeInTheDocument();
    expect(screen.getByText("calls")).toBeInTheDocument();
    expect(screen.getByText("0.98")).toBeInTheDocument();
  });

  it("navigates to the peer concept on click", () => {
    const onNavigate = vi.fn();
    render(<NeighbourRow neighbour={neighbour} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("read()"));
    expect(onNavigate).toHaveBeenCalledWith("c-bbbbbbbb");
  });

  it("renders evidence links and no per-row review buttons", () => {
    render(<NeighbourRow neighbour={neighbour} onNavigate={() => {}} />);
    expect(screen.getByText("evidence")).toHaveAttribute("href", "/entities/ent-1");
    expect(
      screen.queryByRole("button", { name: /promote|demote|edit|delete/i }),
    ).not.toBeInTheDocument();
  });
});
