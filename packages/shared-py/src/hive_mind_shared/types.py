"""Wire types shared between Python services. Mirrors packages/shared/src/index.ts."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class IdentityContext(BaseModel):
    model_config = ConfigDict(frozen=True)
    principal: str
    roles: tuple[str, ...]
    tenant: str


class RetrievalRequest(BaseModel):
    correlation_id: str
    identity: IdentityContext
    tool: str
    query: str
    top_k: int = 20
    token_budget: int = 4000
    filters: dict[str, Any] = Field(default_factory=dict)


class ContextFragment(BaseModel):
    entity_id: str
    source: str
    source_uri: str
    title: str | None = None
    text: str
    score: float
    tokens: int
    classification: str = "internal"


class StageUsage(BaseModel):
    stage: str
    model: str | None = None
    provider: str | None = None
    tokens_in: int = 0
    tokens_out: int = 0
    latency_ms: int = 0


class UsageEnvelope(BaseModel):
    total_tokens_in: int = 0
    total_tokens_out: int = 0
    total_latency_ms: int = 0
    by_stage: list[StageUsage] = Field(default_factory=list)


class RetrievalResponse(BaseModel):
    correlation_id: str
    fragments: list[ContextFragment]
    usage: UsageEnvelope
    final_context_hash: str
    vector_collection: str | None = None
    vector_snapshot_id: str | None = None


class AuditRecord(BaseModel):
    id: int
    created_at: datetime
    correlation_id: str
    tenant: str
    principal: str
    roles: list[str]
    tool: str
    query: str
    candidate_ids: list[str]
    final_entity_ids: list[str]
    final_context_hash: str
    tokens_in: int
    tokens_out: int
    latency_ms: int
    outcome: Literal["ok", "error"]
    error_code: str | None = None


class IngestEvent(BaseModel):
    type: Literal["document_created", "document_updated", "document_tombstoned"]
    tenant: str
    entity_id: str
    source: str
    source_uri: str
    content_hash: str
