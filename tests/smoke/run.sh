#!/usr/bin/env bash
# End-to-end smoke test for the thin MVP. Requires:
#   - the dev stack running (`make up-d`)
#   - Ollama reachable at $HIVE_MIND__OLLAMA__BASE_URL with `nomic-embed-text` pulled
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PIPELINE_URL="${PIPELINE_URL:-http://localhost:8000}"
TEST_REPO="${TEST_REPO:-https://github.com/anthropics/anthropic-cookbook}"

say() { printf '\n\e[1;36m▌ %s\e[0m\n' "$*"; }

say "Wait for pipeline /readyz"
for _ in $(seq 1 60); do
  if curl -fsS "$PIPELINE_URL/readyz" >/dev/null 2>&1; then break; fi
  sleep 2
done
curl -fsS "$PIPELINE_URL/readyz"

say "Ingest a small public repo: $TEST_REPO"
docker compose -f "$ROOT/infra/compose/docker-compose.yml" --env-file "$ROOT/.env" \
  exec -T ingestion uv run --package hive-mind-ingestion \
    python -m hive_mind_ingestion.cli git "$TEST_REPO"

say "Query the MCP/pipeline with retrieve_for_context"
RESP="$(curl -fsS -X POST "$PIPELINE_URL/retrieve" \
  -H 'content-type: application/json' \
  -d '{
    "correlation_id": "smoke-test-001",
    "identity": {"principal":"local-dev","roles":["admin","reader"],"tenant":"default"},
    "tool": "retrieve_for_context",
    "query": "How do I do prompt caching?",
    "top_k": 10,
    "token_budget": 2000
  }')"
echo "$RESP" | head -c 2000
echo

say "Verify an audit row was written"
COUNT=$(curl -fsS "$PIPELINE_URL/audit/recent?limit=5" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["items"]))')
if [ "$COUNT" -lt 1 ]; then
  echo "✗ no audit rows found"
  exit 1
fi
echo "✓ $COUNT audit row(s) present"

say "Smoke test PASSED"
