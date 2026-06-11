"""Config loader. YAML file + HIVE_MIND__SECTION__KEY env overrides."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field


class IdentityCfg(BaseModel):
    principal: str = "local-dev"
    roles: list[str] = Field(default_factory=lambda: ["admin", "reader"])


class PostgresCfg(BaseModel):
    url: str = "postgresql://hive:hive@postgres:5432/hivemind"


class QdrantCfg(BaseModel):
    url: str = "http://qdrant:6333"
    collection_prefix: str = "default__"
    vector_size: int = 768
    distance: str = "cosine"


class ValkeyCfg(BaseModel):
    url: str = "redis://valkey:6379/0"


class OllamaCfg(BaseModel):
    base_url: str = "https://ollama.com"
    embedding_model: str = "nomic-embed-text"
    api_key: str | None = None


class RetrievalCfg(BaseModel):
    default_top_k: int = 20
    default_token_budget: int = 4000
    tokens_per_char: float = 0.25


class AuditCfg(BaseModel):
    retention_days: int = 90


class TelemetryCfg(BaseModel):
    otlp_endpoint: str = "http://otel-collector:4318"
    service_namespace: str = "hive-mind"


class IngestionGitCfg(BaseModel):
    repos: list[str] = Field(default_factory=list)


class IngestionCfg(BaseModel):
    git: IngestionGitCfg = Field(default_factory=IngestionGitCfg)


class HiveMindConfig(BaseModel):
    tenant: str = "default"
    identity: IdentityCfg = Field(default_factory=IdentityCfg)
    postgres: PostgresCfg = Field(default_factory=PostgresCfg)
    qdrant: QdrantCfg = Field(default_factory=QdrantCfg)
    valkey: ValkeyCfg = Field(default_factory=ValkeyCfg)
    ollama: OllamaCfg = Field(default_factory=OllamaCfg)
    retrieval: RetrievalCfg = Field(default_factory=RetrievalCfg)
    audit: AuditCfg = Field(default_factory=AuditCfg)
    telemetry: TelemetryCfg = Field(default_factory=TelemetryCfg)
    ingestion: IngestionCfg = Field(default_factory=IngestionCfg)


_ENV_PREFIX = "HIVE_MIND__"


def _apply_env_overrides(data: dict[str, Any]) -> dict[str, Any]:
    """Apply HIVE_MIND__SECTION__KEY env vars onto a nested dict."""
    for key, value in os.environ.items():
        if not key.startswith(_ENV_PREFIX):
            continue
        path = [seg.lower() for seg in key[len(_ENV_PREFIX) :].split("__")]
        cur = data
        for seg in path[:-1]:
            cur = cur.setdefault(seg, {})
            if not isinstance(cur, dict):
                # Conflict: a leaf value where a section is expected. Skip.
                break
        else:
            leaf = path[-1]
            # Comma-separated list support for roles[]/repos[].
            if "," in value and leaf in ("roles", "repos"):
                cur[leaf] = [v.strip() for v in value.split(",") if v.strip()]
            else:
                cur[leaf] = value
    return data


def load_config(path: str | Path | None = None) -> HiveMindConfig:
    """Load YAML (if present) then layer env-var overrides on top."""
    raw: dict[str, Any] = {}
    if path is None:
        path = os.environ.get("HIVE_MIND_CONFIG", "hive-mind.yaml")
    p = Path(path)
    if p.is_file():
        raw = yaml.safe_load(p.read_text()) or {}
    raw = _apply_env_overrides(raw)
    return HiveMindConfig.model_validate(raw)
