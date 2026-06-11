"""Simple, deterministic text chunker. Good enough for the thin MVP."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Chunk:
    index: int
    text: str


def chunk_text(
    text: str, *, target_chars: int = 2000, overlap_chars: int = 200
) -> list[Chunk]:
    """Split text into ~target_chars windows with `overlap_chars` overlap.

    Splits on paragraph boundaries (blank lines) when possible to avoid
    breaking sentences mid-thought; falls back to hard slicing.
    """
    text = text.strip()
    if not text:
        return []
    if len(text) <= target_chars:
        return [Chunk(index=0, text=text)]

    def hard_slice(s: str) -> list[str]:
        step = max(1, target_chars - overlap_chars)
        return [s[i : i + target_chars] for i in range(0, len(s), step)]

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    buf = ""
    for p in paragraphs:
        if len(p) > target_chars:
            if buf:
                chunks.append(buf)
                buf = ""
            chunks.extend(hard_slice(p))
            continue
        if not buf:
            buf = p
        elif len(buf) + 2 + len(p) <= target_chars:
            buf = f"{buf}\n\n{p}"
        else:
            chunks.append(buf)
            buf = p
    if buf:
        chunks.append(buf)

    return [Chunk(index=i, text=c) for i, c in enumerate(chunks)]
