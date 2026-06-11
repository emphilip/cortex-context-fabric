"""Concrete Ollama embeddings client. Hardcoded — no adapter abstraction yet
(introduced in a follow-up `model-providers` change)."""

from __future__ import annotations

from dataclasses import dataclass

import httpx


@dataclass
class EmbeddingResult:
    vector: list[float]
    tokens_in: int
    model: str
    provider: str = "ollama"


class _PathNotFound(Exception):
    """Internal sentinel: the server returned 404 for the endpoint we tried."""


class OllamaEmbeddings:
    """Embeddings via the Ollama REST API.

    Works against:
      * a local Ollama daemon (`http://ollama:11434` in compose, or
        `http://host.docker.internal:11434` when bridging to a host install)
      * Ollama Cloud (`https://ollama.com`) — note that the embed endpoint is
        gated on most accounts as of 2026-06; the client supports it but the
        thin-MVP deployment does not rely on Cloud for embeddings.
      * any OpenAI-style drop-in that mirrors the Ollama embed routes.

    Endpoint negotiation: the first request tries `/api/embed` (the newer route
    using `{"input":"…"}` → `{"embeddings":[[...]]}`); on a 404 the client
    falls back to `/api/embeddings` (legacy, `{"prompt":"…"}` →
    `{"embedding":[...]}`). The successful path is cached for the lifetime of
    the client to avoid double round-trips.

    When `api_key` is set the request adds `Authorization: Bearer <key>`. Local
    daemons ignore the header.
    """

    def __init__(
        self,
        *,
        base_url: str,
        model: str,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        self._base = base_url.rstrip("/")
        self._model = model
        self._api_key = api_key or None
        headers: dict[str, str] = {}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        self._client = httpx.AsyncClient(timeout=timeout, headers=headers)
        self._preferred_path: str | None = None

    async def embed(self, text: str) -> EmbeddingResult:
        if self._preferred_path is not None:
            vector = await self._call(self._preferred_path, text)
        else:
            try:
                vector = await self._call("/api/embed", text)
                self._preferred_path = "/api/embed"
            except _PathNotFound:
                vector = await self._call("/api/embeddings", text)
                self._preferred_path = "/api/embeddings"

        if vector is None:
            raise RuntimeError("Ollama returned no embedding")
        tokens_in = max(1, len(text) // 4)
        return EmbeddingResult(vector=list(vector), tokens_in=tokens_in, model=self._model)

    async def _call(self, path: str, text: str) -> list[float] | None:
        if path == "/api/embed":
            payload = {"model": self._model, "input": text}
        else:
            payload = {"model": self._model, "prompt": text}
        resp = await self._client.post(f"{self._base}{path}", json=payload)
        if resp.status_code == 404:
            raise _PathNotFound(path)
        resp.raise_for_status()
        body = resp.json()
        if isinstance(body.get("embedding"), list):
            return body["embedding"]
        embs = body.get("embeddings")
        if embs:
            return embs[0]
        return None

    async def close(self) -> None:
        await self._client.aclose()
