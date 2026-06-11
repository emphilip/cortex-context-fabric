#!/bin/sh
# Returns 0 only when the configured embedding model has been pulled into
# this Ollama instance. The compose healthcheck calls this every interval
# until the entrypoint's first-start `ollama pull` has finished.
set -eu
MODEL="${OLLAMA_EMBEDDING_MODEL:-nomic-embed-text}"
MODEL_PREFIX="${MODEL%%:*}"
ollama list | awk 'NR>1 {print $1}' | grep -q "^${MODEL_PREFIX}"
