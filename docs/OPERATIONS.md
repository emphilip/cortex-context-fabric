# Operations

Operational runbook for the v0 stack (see [`bootstrap-thin-mvp`](../openspec/changes/bootstrap-thin-mvp/proposal.md) for the authoritative contract).

## Bringing the stack up

```bash
cp .env.example .env
make up-d    # build + start in the background
make ps      # check status
make logs    # follow combined logs
make down    # stop (keeps volumes)
make down-v  # stop + DELETE volumes (loses everything)
```

First start downloads the Postgres+AGE image, the Qdrant image, the Valkey image, and the Ollama image, and then pulls the configured embedding model (~270 MB for `nomic-embed-text`). Expect 3–5 minutes on a typical laptop.

## Configuration

A single `hive-mind.yaml` file is the source of truth. Environment variables override file values using the convention `HIVE_MIND__<SECTION>__<KEY>` (double underscore separates nesting levels). Copy `.env.example` to `.env` and edit; the compose stack mounts `.env` into every service.

| Key | Default | Notes |
|---|---|---|
| `HIVE_MIND__TENANT` | `default` | Single-tenant deploy slug. |
| `HIVE_MIND__IDENTITY__PRINCIPAL` | `local-dev` | Stubbed identity. Replace before any non-dev deploy. |
| `HIVE_MIND__IDENTITY__ROLES` | `admin,reader` | Comma-separated list. |
| `HIVE_MIND__POSTGRES__URL` | `postgresql://hive:hive@postgres:5432/hivemind` | Catalog + audit. |
| `HIVE_MIND__QDRANT__URL` | `http://qdrant:6333` | Vector store. |
| `HIVE_MIND__VALKEY__URL` | `redis://valkey:6379/0` | Cache (unused by v0). |
| `HIVE_MIND__OLLAMA__BASE_URL` | `http://ollama:11434` | Compose-internal Ollama by default. |
| `HIVE_MIND__OLLAMA__EMBEDDING_MODEL` | `nomic-embed-text` | See "Swapping the embedding model" below. |
| `HIVE_MIND__OLLAMA__API_KEY` | empty | Reserved for chat-only Cloud paths in follow-up changes. |
| `HIVE_MIND__RETRIEVAL__DEFAULT_TOP_K` | `20` | Per-leg retrieval limit. |
| `HIVE_MIND__RETRIEVAL__DEFAULT_TOKEN_BUDGET` | `4000` | Assemble-stage hard cap. |

## Ingestion

The thin MVP ships a single connector: `git`.

```bash
# Ingest a public git repo into the catalog + vector index
make ingest-git REPO=https://github.com/anthropics/anthropic-cookbook

# Or directly:
docker compose -f infra/compose/docker-compose.yml exec ingestion \
  python -m hive_mind_ingestion.cli git <repo-url>
```

Re-ingest is idempotent (entities are upserted by stable ID derived from `(tenant, source_uri)`).

## Swapping the embedding model

The vector dimension is per-collection in Qdrant. If you change `embedding_model`, you must also change `qdrant.vector_size` in `hive-mind.yaml` to match the new model's output dim — and either recreate the Qdrant collections or stand up a fresh tenant.

| Model | Dimension | Notes |
|---|---|---|
| `nomic-embed-text` (default) | 768 | Fast on CPU. Good general baseline. |
| `bge-m3` | 1024 | Multilingual; larger. |
| `qwen3-embedding:8b` | 4096 | Heavy; needs ≥ 16 GB RAM in the Ollama container. |
| `embeddinggemma` | 768 | Google's small embed model. |

Procedure to swap (full reset):

```bash
make down-v
# Edit hive-mind.yaml: ollama.embedding_model AND qdrant.vector_size
# (also update .env's HIVE_MIND__OLLAMA__EMBEDDING_MODEL)
make up-d
# First start re-pulls the new model.
make ingest-git REPO=<your repo>
```

In-place swap (preserves catalog rows but rebuilds vector points) is not yet supported; a `model-providers` follow-up change adds a re-embed CLI.

## Identity stub

v0 hardcodes an identity context from `.env`. Anything calling the MCP server gets the configured `principal` + `roles` + `tenant` attached. The pipeline propagates these to OPA (when it lands in the follow-up) and into every audit row. **Replace with real auth before any non-dev deployment** — the propagation contract is already in place so only the verifier needs to change.

## Observability

- **Traces**: OTel spans are emitted by every service. Set `OTEL_EXPORTER_OTLP_ENDPOINT` to a live collector to see them. v0 does not bundle one — that's a follow-up change.
- **Metrics**: each service exposes `/metrics` in Prometheus format. Scrape from the pipeline at `:8000/metrics`.
- **Response usage**: every `POST /retrieve` response carries a `usage` envelope with per-stage token counts and latency.

## Audit log

Every retrieval writes a row to `hive_mind.audit_log` (partitioned weekly, append-only enforced by trigger). The pipeline exposes two read endpoints:

```bash
curl http://localhost:8000/audit/recent?limit=50
curl http://localhost:8000/audit/42
```

The admin UI's `/queries` page consumes these.

## Troubleshooting

- **`make up-d` hangs on `ollama` health** — first start has to download the embedding model. Tail `docker compose logs ollama` to watch the pull. If it hangs longer than ~5 minutes, check the host's network access to `registry.ollama.ai`.
- **`pipeline /readyz` returns 503** — typically Postgres or Qdrant is still starting; `make ps` shows healthcheck state.
- **Embedding errors after a model swap** — Qdrant collections retain the old vector dimension. Run `make down-v` and re-ingest.
- **`Authorization: Bearer …` showing up in local Ollama logs** — fine. Local Ollama ignores the header. If you don't want it, leave `HIVE_MIND__OLLAMA__API_KEY` unset.
