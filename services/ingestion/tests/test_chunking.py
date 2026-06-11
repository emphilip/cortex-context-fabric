from __future__ import annotations

from hive_mind_ingestion.chunking import chunk_text


def test_empty_returns_empty():
    assert chunk_text("") == []
    assert chunk_text("   ") == []


def test_short_returns_single_chunk():
    chunks = chunk_text("hello world", target_chars=2000)
    assert len(chunks) == 1
    assert chunks[0].text == "hello world"
    assert chunks[0].index == 0


def test_long_text_splits_on_paragraphs():
    para = "x" * 1500
    text = "\n\n".join([para] * 4)
    chunks = chunk_text(text, target_chars=2000, overlap_chars=100)
    # Each paragraph is 1500 chars; 2 fit, so we expect 4 chunks of 1 paragraph each
    # OR 2 chunks of 2 paragraphs depending on math. Either way > 1.
    assert len(chunks) > 1
    # Chunks are indexed sequentially.
    assert [c.index for c in chunks] == list(range(len(chunks)))


def test_oversized_paragraph_hard_sliced():
    p = "y" * 5000
    chunks = chunk_text(p, target_chars=2000, overlap_chars=200)
    assert len(chunks) >= 3
    # No chunk exceeds the target.
    assert all(len(c.text) <= 2000 for c in chunks)
