"""Shared Python building blocks for Hive Mind services."""

from hive_mind_shared.config import HiveMindConfig, load_config
from hive_mind_shared.metrics import metrics_app, record_stage_tokens, record_request
from hive_mind_shared.otel import setup_otel
from hive_mind_shared.types import (
    AuditRecord,
    ContextFragment,
    IdentityContext,
    IngestEvent,
    RetrievalRequest,
    RetrievalResponse,
    StageUsage,
    UsageEnvelope,
)

__all__ = [
    "AuditRecord",
    "ContextFragment",
    "HiveMindConfig",
    "IdentityContext",
    "IngestEvent",
    "RetrievalRequest",
    "RetrievalResponse",
    "StageUsage",
    "UsageEnvelope",
    "load_config",
    "metrics_app",
    "record_request",
    "record_stage_tokens",
    "setup_otel",
]
