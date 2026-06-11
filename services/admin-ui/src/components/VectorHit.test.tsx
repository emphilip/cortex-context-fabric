import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VectorHit } from "./VectorHit";

const hit = {
  entity_id: "e1",
  score: 0.7321,
  source: "git",
  source_uri: "git://x/y",
  title: "y",
  classification: "internal",
  snippet: "hello",
  collection: "default__git",
};

describe("VectorHit", () => {
  it("renders rank, title, source, snippet, score", () => {
    render(<VectorHit hit={hit} rank={1} />);
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("y")).toBeInTheDocument();
    expect(screen.getByText("git")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("0.7321")).toBeInTheDocument();
  });

  it("renders 4 decimal places of score even for tiny values", () => {
    render(<VectorHit hit={{ ...hit, score: 0.001 }} rank={1} />);
    expect(screen.getByText("0.0010")).toBeInTheDocument();
  });

  it("falls back to entity_id when title is missing", () => {
    render(<VectorHit hit={{ ...hit, title: null }} rank={1} />);
    expect(screen.getByText("e1")).toBeInTheDocument();
  });

  it("hides the neighbours button when no callback is provided", () => {
    render(<VectorHit hit={hit} rank={1} />);
    expect(screen.queryByText("show neighbours")).toBeNull();
  });

  it("fires the neighbours callback", () => {
    const fn = vi.fn();
    render(<VectorHit hit={hit} rank={1} onShowNeighbours={fn} />);
    fireEvent.click(screen.getByText("show neighbours"));
    expect(fn).toHaveBeenCalledWith(hit);
  });
});
