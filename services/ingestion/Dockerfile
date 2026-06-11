FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy

RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.5.10 /uv /usr/local/bin/uv

WORKDIR /app
COPY pyproject.toml ./
COPY packages/shared-py /app/packages/shared-py
COPY services/pipeline /app/services/pipeline
COPY services/ingestion /app/services/ingestion

RUN uv sync --no-dev --all-packages

ENV HIVE_MIND_CONFIG=/app/hive-mind.yaml
COPY hive-mind.yaml /app/hive-mind.yaml

CMD ["sleep", "infinity"]
