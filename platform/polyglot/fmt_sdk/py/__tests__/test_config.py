"""Tests for fmt_sdk TOML config parsing."""

import tempfile
from pathlib import Path

from fmt_sdk.config import FmtSdkConfig

SAMPLE_TOML = """\
[formatter.go]
command = "gofmt"
args = ["-w"]
extensions = [".go"]
includes = ["**/*.go"]
excludes = ["vendor/**"]

[formatter.python]
command = "ruff"
args = ["format", "--check"]
extensions = [".py"]
includes = ["**/*.py"]
excludes = ["__pycache__/**", ".venv/**"]

[formatter.node]
command = "biome"
args = ["format", "--write"]
extensions = [".js", ".ts", ".mjs", ".mts"]
includes = ["src/**"]
excludes = ["node_modules/**", "dist/**"]

[formatter.rust]
command = "rustfmt"
args = ["--edition", "2021"]
extensions = [".rs"]
includes = ["src/**/*.rs"]
excludes = ["target/**"]
"""


class TestFmtSdkConfig:
    def test_load_config(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write(SAMPLE_TOML)
            f.flush()
            config = FmtSdkConfig.load(f.name)

        assert len(config.formatters) == 4
        assert "go" in config.formatters
        assert "python" in config.formatters
        assert "node" in config.formatters
        assert "rust" in config.formatters

    def test_formatter_entry_fields(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write(SAMPLE_TOML)
            f.flush()
            config = FmtSdkConfig.load(f.name)

        go = config.formatters["go"]
        assert go.command == "gofmt"
        assert go.args == ["-w"]
        assert go.extensions == [".go"]
        assert go.includes == ["**/*.go"]
        assert go.excludes == ["vendor/**"]

    def test_node_multiple_extensions(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write(SAMPLE_TOML)
            f.flush()
            config = FmtSdkConfig.load(f.name)

        node = config.formatters["node"]
        assert len(node.extensions) == 4
        assert ".mjs" in node.extensions

    def test_empty_config(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write("")
            f.flush()
            config = FmtSdkConfig.load(f.name)

        assert len(config.formatters) == 0

    def test_minimal_formatter(self):
        toml_str = '[formatter.shell]\ncommand = "shfmt"\n'
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write(toml_str)
            f.flush()
            config = FmtSdkConfig.load(f.name)

        shell = config.formatters["shell"]
        assert shell.command == "shfmt"
        assert shell.args == []
        assert shell.extensions == []

    def test_load_fixtures_config(self, config_toml_path):
        if config_toml_path.exists():
            config = FmtSdkConfig.load(config_toml_path)
            assert len(config.formatters) > 0
