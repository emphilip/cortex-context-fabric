from __future__ import annotations

from pathlib import Path

from hive_mind_shared.config import load_config


def test_load_default_when_no_file(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("HIVE_MIND_CONFIG", raising=False)
    cfg = load_config()
    assert cfg.tenant == "default"
    assert cfg.identity.principal == "local-dev"


def test_yaml_overrides_default(tmp_path, monkeypatch):
    cfg_file = tmp_path / "hive-mind.yaml"
    cfg_file.write_text("tenant: acme\nidentity:\n  principal: alice\n  roles: [admin]\n")
    cfg = load_config(cfg_file)
    assert cfg.tenant == "acme"
    assert cfg.identity.principal == "alice"
    assert cfg.identity.roles == ["admin"]


def test_env_overrides_yaml(tmp_path, monkeypatch):
    cfg_file = tmp_path / "hive-mind.yaml"
    cfg_file.write_text("tenant: acme\n")
    monkeypatch.setenv("HIVE_MIND__TENANT", "globex")
    monkeypatch.setenv("HIVE_MIND__IDENTITY__PRINCIPAL", "bob")
    monkeypatch.setenv("HIVE_MIND__IDENTITY__ROLES", "admin,auditor")
    cfg = load_config(cfg_file)
    assert cfg.tenant == "globex"
    assert cfg.identity.principal == "bob"
    assert cfg.identity.roles == ["admin", "auditor"]
