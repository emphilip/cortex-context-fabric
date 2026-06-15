"""Small code fixture for deterministic Graphifyy extraction."""


def select_context(query: str, candidates: list[str]) -> list[str]:
    """Return candidate fragments containing a query term."""
    normalized = query.casefold()
    return [candidate for candidate in candidates if normalized in candidate.casefold()]


def assemble_context(query: str, candidates: list[str]) -> str:
    """Join the selected context fragments for an AI tool."""
    return "\n\n".join(select_context(query, candidates))
