import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryRow } from "./QueryRow";

const base = {
  id: 42,
  created_at: new Date("2026-06-10T12:34:56Z").toISOString(),
  principal: "alice",
  tool: "retrieve_for_context",
  query: "test query",
  tokens_in: 100,
  tokens_out: 25,
  latency_ms: 215,
  outcome: "ok" as const,
};

describe("QueryRow", () => {
  it("renders principal, query, and outcome", () => {
    render(<QueryRow {...base} />);
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("test query")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders ERR when outcome is error", () => {
    render(<QueryRow {...base} outcome="error" />);
    expect(screen.getByText("ERR")).toBeInTheDocument();
  });

  it("links to the detail page", () => {
    render(<QueryRow {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/queries/42");
  });
});
