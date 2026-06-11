"""Postgres-backed catalog access. Used by stage 3 (hybrid retrieval BM25)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import asyncpg


@dataclass
class CatalogHit:
    entity_id: str
    source: str
    source_uri: str
    title: str | None
    text: str
    score: float
    classification: str


class CatalogStore:
    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        if self._pool is None:
            self._pool = await asyncpg.create_pool(self._dsn, min_size=1, max_size=8)

    async def close(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    def _require_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("CatalogStore.connect() must be called first")
        return self._pool

    async def insert_entity(self, *, tenant: str, **row: Any) -> None:
        sql = """
        INSERT INTO hive_mind.entity (
          entity_id, tenant, source, source_uri, source_revision,
          parent_entity_id, title, body, content_hash, classification,
          owner, metadata
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12
        )
        ON CONFLICT (tenant, source, source_uri) DO UPDATE SET
          body = EXCLUDED.body,
          title = EXCLUDED.title,
          content_hash = EXCLUDED.content_hash,
          classification = EXCLUDED.classification,
          owner = EXCLUDED.owner,
          metadata = EXCLUDED.metadata,
          source_revision = EXCLUDED.source_revision,
          updated_at = now(),
          last_verified_at = now(),
          freshness_state = 'fresh',
          tombstoned_at = NULL
        """
        pool = self._require_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                sql,
                row["entity_id"],
                tenant,
                row["source"],
                row["source_uri"],
                row.get("source_revision"),
                row.get("parent_entity_id"),
                row.get("title"),
                row["body"],
                row["content_hash"],
                row.get("classification", "internal"),
                row.get("owner"),
                json.dumps(row.get("metadata") or {}),
            )

    async def get_entity(self, *, tenant: str, entity_id: str) -> dict[str, Any] | None:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """SELECT entity_id::text, source, source_uri, title, body,
                          classification, content_hash, metadata, updated_at
                   FROM hive_mind.entity
                   WHERE tenant = $1 AND entity_id = $2 AND tombstoned_at IS NULL""",
                tenant,
                entity_id,
            )
            return dict(row) if row else None

    async def lexical_search(
        self, *, tenant: str, query: str, limit: int
    ) -> list[CatalogHit]:
        """Postgres FTS + trigram fallback. The BM25-ish leg of hybrid retrieval."""
        pool = self._require_pool()
        sql = """
        WITH q AS (
          SELECT plainto_tsquery('simple', $2) AS tsq
        )
        SELECT entity_id::text, source, source_uri, title, body,
               classification,
               ts_rank_cd(
                 to_tsvector('simple', coalesce(title,'') || ' ' || body),
                 (SELECT tsq FROM q)
               ) AS rank
        FROM hive_mind.entity
        WHERE tenant = $1
          AND tombstoned_at IS NULL
          AND (
            to_tsvector('simple', coalesce(title,'') || ' ' || body) @@ (SELECT tsq FROM q)
            OR body % $2
            OR coalesce(title,'') % $2
          )
        ORDER BY rank DESC
        LIMIT $3
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(sql, tenant, query, limit)
        return [
            CatalogHit(
                entity_id=r["entity_id"],
                source=r["source"],
                source_uri=r["source_uri"],
                title=r["title"],
                text=r["body"],
                score=float(r["rank"] or 0.0),
                classification=r["classification"],
            )
            for r in rows
        ]
