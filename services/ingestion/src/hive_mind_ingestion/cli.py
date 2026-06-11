"""hive-mind-ingest CLI."""

from __future__ import annotations

import logging

import click
from hive_mind_shared import load_config

from hive_mind_ingestion.pipeline_runner import run_sync


@click.group()
def main() -> None:
    """Hive Mind ingestion CLI."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


@main.command()
@click.argument("repo_url")
def git(repo_url: str) -> None:
    """Ingest a public git repository (clone, walk, embed)."""
    cfg = load_config()
    parents, chunks = run_sync(repo_url, cfg)
    click.echo(f"Ingested {parents} files / {chunks} chunks from {repo_url}")


if __name__ == "__main__":  # pragma: no cover
    main()
