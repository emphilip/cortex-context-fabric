import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntityRow } from "./EntityRow";

const base = {
  entity_id: "e1",
  tenant: "default",
  source: "git",
  source_uri: "git://x/y",
  title: "y",
  classification: "internal",
  freshness_state: "fresh",
  updated_at: new Date("2026-06-11T12:00:00Z").toISOString(),
  tombstoned_at: null,
};

describe("EntityRow", () => {
  it("renders title, source, classification, freshness", () => {
    render(<EntityRow entity={base} />);
    expect(screen.getByText("y")).toBeInTheDocument();
    expect(screen.getByText("git")).toBeInTheDocument();
    expect(screen.getByText("internal")).toBeInTheDocument();
    expect(screen.getByText("fresh")).toBeInTheDocument();
  });

  it("falls back to source_uri when title is null", () => {
    render(<EntityRow entity={{ ...base, title: null }} />);
    expect(screen.getByText("git://x/y")).toBeInTheDocument();
  });

  it("renders the RIP marker for tombstoned entities", () => {
    render(<EntityRow entity={{ ...base, tombstoned_at: new Date().toISOString() }} />);
    expect(screen.getByText("RIP")).toBeInTheDocument();
  });

  it("links to the detail page", () => {
    render(<EntityRow entity={base} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/entities/e1");
  });
});
