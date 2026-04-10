"""Tests for JSON extractor."""

import pytest
from rag_llm_synthesis.json_extractor import extract_json


class TestExtractJson:
    def test_plain_json(self):
        text = '{"key": "value"}'
        assert extract_json(text) == '{"key": "value"}'

    def test_json_in_markdown_fence(self):
        text = '```json\n{"key": "value"}\n```'
        assert extract_json(text) == '{"key": "value"}'

    def test_json_in_generic_fence(self):
        text = '```\n{"key": "value"}\n```'
        assert extract_json(text) == '{"key": "value"}'

    def test_json_with_surrounding_text(self):
        text = 'Here is the result: {"key": "value"} and more text'
        result = extract_json(text)
        assert '"key"' in result

    def test_no_json(self):
        text = "This is just plain text"
        assert extract_json(text) == "This is just plain text"

    def test_json_array(self):
        text = '```json\n[1, 2, 3]\n```'
        assert extract_json(text) == '[1, 2, 3]'

    def test_nested_json(self):
        text = '{"outer": {"inner": "value"}}'
        assert extract_json(text) == '{"outer": {"inner": "value"}}'

    def test_whitespace_handling(self):
        text = '  \n  {"key": "value"}  \n  '
        assert extract_json(text) == '{"key": "value"}'


class TestClientImport:
    def test_barrel_exports(self):
        from rag_llm_synthesis import (
            LlmSynthesisClient,
            extract_json,
            gemini_rerank,
            build_format_instructions,
            SCHEMA_LANGUAGE_LABELS,
            SynthesisConfig,
        )
        assert callable(LlmSynthesisClient)
        assert callable(extract_json)
        assert callable(gemini_rerank)
        assert callable(build_format_instructions)
        assert isinstance(SCHEMA_LANGUAGE_LABELS, dict)
        assert callable(SynthesisConfig)


class TestSynthesisConfig:
    def test_defaults(self):
        from rag_llm_synthesis.types import SynthesisConfig
        cfg = SynthesisConfig()
        assert cfg.llm_provider == "openai"
        assert cfg.openai_model == "gpt-4o"
        assert cfg.temperature == 0.2

    def test_custom_config(self):
        from rag_llm_synthesis.types import SynthesisConfig
        cfg = SynthesisConfig(llm_provider="anthropic", temperature=0.5)
        assert cfg.llm_provider == "anthropic"
        assert cfg.temperature == 0.5


class TestBuildFormatInstructions:
    def test_markdown_returns_empty(self):
        from rag_llm_synthesis.structured_output import build_format_instructions
        assert build_format_instructions("markdown") == ""

    def test_json_format(self):
        from rag_llm_synthesis.structured_output import build_format_instructions
        result = build_format_instructions("json")
        assert "JSON" in result
        assert "MUST" in result

    def test_json_with_schema(self):
        from rag_llm_synthesis.structured_output import build_format_instructions
        result = build_format_instructions("json", "json_schema", '{"type": "object"}')
        assert "JSON Schema" in result
        assert '{"type": "object"}' in result
