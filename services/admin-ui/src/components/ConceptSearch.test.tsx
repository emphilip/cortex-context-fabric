import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConceptSearch } from "./ConceptSearch";

function mockFetch(items: unknown[]) {
  return vi.fn(async () => ({ ok: true, json: async () => ({ items }) })) as unknown as typeof fetch;
}

afterEach(() => vi.restoreAllMocks());

describe("ConceptSearch", () => {
  it("queries the search endpoint, lists matches, and selects one", async () => {
    global.fetch = mockFetch([
      { concept_id: "c1", tenant: "default", name: "read()", state: "confirmed", aliases: [], updated_at: "2026-06-15T00:00:00Z" },
    ]);
    const onSelect = vi.fn();
    render(<ConceptSearch onSelect={onSelect} />);

    fireEvent.change(screen.getByLabelText("Search concepts"), { target: { value: "read" } });

    const result = await screen.findByText("read()");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("search=read"),
      expect.anything(),
    );

    fireEvent.click(result);
    expect(onSelect).toHaveBeenCalledWith("c1");
  });

  it("shows an empty state when there are no matches", async () => {
    global.fetch = mockFetch([]);
    render(<ConceptSearch onSelect={() => {}} />);
    fireEvent.change(screen.getByLabelText("Search concepts"), { target: { value: "zzz" } });
    expect(await screen.findByText("No matches")).toBeInTheDocument();
  });
});
