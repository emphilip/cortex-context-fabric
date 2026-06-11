"""Ingestion runner: takes a stream of GitDocuments, chunks them, embeds with
Ollama, upserts into Postgres + Qdrant."""

from __future__ import annotations

import asyncio
import logging
import uuid
from collections.abc import Iterable

import httpx
from hive_mind_shared import HiveMindConfig

from hive_mind_ingestion.chunking import chunk_text
from hive_mind_ingestion.connectors.git import GitDocument
from hive_mind_pipeline.providers import OllamaEmbeddings
from hive_mind_pipeline.storage.catalog import CatalogStore
from hive_mind_pipeline.storage.vector import VectorIndex

log = logging.getLogger(__name__)


async def ingest_documents(
    docs: Iterable[GitDocument], *, cfg: HiveMindConfig
) -> tuple[int, int]:
    """Ingest the given documents. Returns (parents, chunks) counts."""
    catalog = CatalogStore(cfg.postgres.url)
    vector = VectorIndex(
        url=cfg.qdrant.url,
        collection_prefix=cfg.qdrant.collection_prefix,
        vector_size=cfg.qdrant.vector_size,
        distance=cfg.qdrant.distance,
    )
    embeddings = OllamaEmbeddings(
        base_url=cfg.ollama.base_url,
        model=cfg.ollama.embedding_model,
        api_key=cfg.ollama.api_key,
    )
    await catalog.connect()
    parents = 0
    chunks_total = 0
    try:
        await vector.ensure_collection("git")
        for doc in docs:
            parents += 1
            # Write parent entity
            await catalog.insert_entity(
                tenant=cfg.tenant,
                entity_id=doc.entity_id,
                source=doc.source,
                source_uri=doc.source_uri,
                source_revision=doc.source_revision,
                title=doc.title,
                body=doc.body,
                content_hash=doc.content_hash,
                classification="internal",
                metadata=doc.metadata,
            )
            # Chunk + embed + upsert vector points
            for ch in chunk_text(doc.body):
                chunk_id = _chunk_id(doc.entity_id, ch.index)
                await catalog.insert_entity(
                    tenant=cfg.tenant,
                    entity_id=chunk_id,
                    source=doc.source,
                    source_uri=f"{doc.source_uri}#chunk={ch.index}",
                    source_revision=doc.source_revision,
                    parent_entity_id=doc.entity_id,
                    title=f"{doc.title} (chunk {ch.index})",
                    body=ch.text,
                    content_hash=doc.content_hash,
                    classification="internal",
                    metadata={**doc.metadata, "chunk_index": ch.index},
                )
                try:
                    emb = await embeddings.embed(ch.text)
                except httpx.HTTPError as exc:
                    log.error("embed failed for %s chunk %d: %s", doc.source_uri, ch.index, exc)
                    continue
                await vector.upsert(
                    source="git",
                    entity_id=chunk_id,
                    vector=emb.vector,
                    payload={
                        "tenant": cfg.tenant,
                        "entity_id": chunk_id,
                        "parent_entity_id": doc.entity_id,
                        "source": "git",
                        "source_uri": doc.source_uri,
                        "title": doc.title,
                        "text": ch.text,
                        "classification": "internal",
                        "chunk_index": ch.index,
                    },
                )
                chunks_total += 1
    finally:
        await catalog.close()
        await vector.close()
        await embeddings.close()
    return parents, chunks_total


def _chunk_id(parent_id: str, index: int) -> str:
    ns = uuid.UUID("6e3a4d1e-0000-0000-0000-000000000002")
    return str(uuid.uuid5(ns, f"{parent_id}:{index}"))


async def run(repo_url: str, cfg: HiveMindConfig) -> tuple[int, int]:
    from hive_mind_ingestion.connectors.git import ingest_repo

    docs = list(ingest_repo(repo_url, cfg.tenant))
    log.info("ingesting %d documents from %s", len(docs), repo_url)
    return await ingest_documents(docs, cfg=cfg)


def run_sync(repo_url: str, cfg: HiveMindConfig) -> tuple[int, int]:
    return asyncio.run(run(repo_url, cfg))
