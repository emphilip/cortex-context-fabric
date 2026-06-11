"""Git connector — clones a repo into a temp dir, walks text files, emits docs.

Thin MVP intentionally uses `git` via subprocess rather than libgit2 so we
don't need an extra system dep. A future change swaps to pygit2 for
incremental sync via list_changes(since).
"""

from __future__ import annotations

import hashlib
import logging
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

log = logging.getLogger(__name__)

# File extensions we ingest as text in the MVP. Code + docs + config.
TEXT_EXTS = {
    ".md", ".markdown", ".rst", ".txt",
    ".py", ".pyi", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".go", ".rs", ".java", ".kt", ".rb", ".php", ".cs",
    ".c", ".h", ".cc", ".cpp", ".hpp",
    ".sql", ".yaml", ".yml", ".toml", ".json", ".ini",
    ".sh", ".bash", ".zsh", ".fish", ".ps1",
    ".html", ".css", ".scss", ".sass",
}

MAX_FILE_BYTES = 1_000_000   # 1 MB cap per file
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "dist", "build", "target", ".next", ".cache"}


@dataclass
class GitDocument:
    entity_id: str
    title: str
    body: str
    source: str
    source_uri: str
    source_revision: str
    content_hash: str
    metadata: dict


def _stable_id(tenant: str, source_uri: str) -> str:
    """Deterministic UUID for (tenant, source_uri). Re-ingest keeps the same id."""
    ns = uuid.UUID("6e3a4d1e-0000-0000-0000-000000000001")
    return str(uuid.uuid5(ns, f"{tenant}:{source_uri}"))


def _content_hash(body: bytes) -> str:
    return hashlib.sha256(body).hexdigest()


def clone(repo_url: str, dest: Path) -> str:
    """Clone repo, return the commit SHA."""
    subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, str(dest)],
        check=True,
        capture_output=True,
    )
    sha = subprocess.run(
        ["git", "-C", str(dest), "rev-parse", "HEAD"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    return sha


def walk_repo(
    *, tenant: str, repo_url: str, repo_path: Path, revision: str
) -> Iterator[GitDocument]:
    """Walk the cloned repo and yield documents for each text file."""
    repo_name = repo_url.rstrip("/").rsplit("/", 1)[-1].removesuffix(".git")
    for path in repo_path.rglob("*"):
        if not path.is_file():
            continue
        # Skip ignored directories.
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() not in TEXT_EXTS:
            continue
        try:
            data = path.read_bytes()
        except OSError as exc:
            log.warning("skip %s: %s", path, exc)
            continue
        if len(data) > MAX_FILE_BYTES:
            log.info("skip large file %s (%d bytes)", path, len(data))
            continue
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError:
            log.info("skip non-utf8 %s", path)
            continue
        rel = path.relative_to(repo_path).as_posix()
        source_uri = f"git://{repo_name}/{rel}"
        yield GitDocument(
            entity_id=_stable_id(tenant, source_uri),
            title=rel,
            body=text,
            source="git",
            source_uri=source_uri,
            source_revision=revision,
            content_hash=_content_hash(data),
            metadata={"path": rel, "ext": path.suffix.lower(), "size": len(data)},
        )


def ingest_repo(repo_url: str, tenant: str) -> Iterator[GitDocument]:
    """High-level: clone into a temp dir and walk it."""
    with tempfile.TemporaryDirectory(prefix="hive-mind-git-") as tmp:
        dest = Path(tmp)
        sha = clone(repo_url, dest)
        log.info("cloned %s @ %s", repo_url, sha[:7])
        yield from walk_repo(tenant=tenant, repo_url=repo_url, repo_path=dest, revision=sha)
