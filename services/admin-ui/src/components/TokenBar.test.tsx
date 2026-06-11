import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TokenBar } from "./TokenBar";

describe("TokenBar", () => {
  it("exposes tokens via title attribute", () => {
    const { container } = render(<TokenBar tokens_in={120} tokens_out={30} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("title", "in: 120, out: 30");
  });

  it("renders the numeric arrows in non-compact mode", () => {
    render(<TokenBar tokens_in={120} tokens_out={30} />);
    expect(screen.getByText("↑ 120")).toBeInTheDocument();
    expect(screen.getByText("↓ 30")).toBeInTheDocument();
  });

  it("omits the numeric arrows in compact mode", () => {
    render(<TokenBar tokens_in={120} tokens_out={30} compact />);
    expect(screen.queryByText("↑ 120")).toBeNull();
  });
});
