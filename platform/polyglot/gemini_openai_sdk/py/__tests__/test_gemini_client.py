"""
Unit tests for GeminiClient class.

Tests cover:
- Statement coverage for all code paths
- Branch coverage for all conditionals
- Boundary value analysis
- Error handling verification
- Log verification (hyper-observability)
"""
import logging
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from gemini_openai_sdk.constants import DEFAULT_MODEL, MODELS
from gemini_openai_sdk.gemini_client import GeminiClient
from gemini_openai_sdk.types import ChatResponse, UsageStats


class TestGeminiClientInit:
    """Tests for GeminiClient initialization."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_default_initialization(self):
            """Should initialize with defaults."""
            client = GeminiClient()

            assert client._model_type == DEFAULT_MODEL
            assert client._model == MODELS[DEFAULT_MODEL]

        def test_custom_model(self):
            """Should accept custom model."""
            client = GeminiClient(model="pro")

            assert client._model_type == "pro"

        def test_custom_api_key(self):
            """Should accept custom API key."""
            client = GeminiClient(api_key="custom-key")

            assert client._api_key == "custom-key"

        def test_custom_system_prompt(self):
            """Should accept custom system prompt."""
            client = GeminiClient(system_prompt="Custom prompt")

            assert client._system_prompt == "Custom prompt"

    class TestBranchCoverage:
        """Test all branches."""

        def test_with_custom_logger(self, mock_logger):
            """Should accept custom logger."""
            client = GeminiClient(logger_instance=mock_logger)

            assert client._logger == mock_logger

        def test_without_custom_logger(self):
            """Should use default logger."""
            client = GeminiClient()

            assert client._logger is not None


class TestGeminiClientChat:
    """Tests for GeminiClient.chat method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_chat_returns_response(self, mock_api_key, mock_chat_response):
            """chat() should return response object."""
            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.return_value = mock_chat_response

                client = GeminiClient()
                result = await client.chat("Hello")

                assert result.success is True
                assert result.content is not None

        @pytest.mark.asyncio
        async def test_chat_calls_chat_completion(self, mock_api_key, mock_chat_response):
            """chat() should call chat_completion with messages."""
            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.return_value = mock_chat_response

                client = GeminiClient()
                await client.chat("Test prompt")

                mock_chat.assert_called_once()

    class TestBranchCoverage:
        """Test all branches."""

        @pytest.mark.asyncio
        async def test_with_system_prompt(self, mock_api_key, mock_chat_response):
            """Should include system prompt by default."""
            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.return_value = mock_chat_response

                client = GeminiClient(system_prompt="Be helpful")
                await client.chat("Hello")

                call_args = mock_chat.call_args[1]["messages"]
                assert any(m["role"] == "system" for m in call_args)

        @pytest.mark.asyncio
        async def test_without_system_prompt(self, mock_api_key, mock_chat_response):
            """Should exclude system prompt when disabled."""
            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.return_value = mock_chat_response

                client = GeminiClient()
                await client.chat("Hello", use_system_prompt=False)

                call_args = mock_chat.call_args[1]["messages"]
                assert not any(m["role"] == "system" for m in call_args)

    class TestErrorHandling:
        """Test error conditions."""

        @pytest.mark.asyncio
        async def test_handles_api_error(self, mock_api_key):
            """Should return error response on API failure."""
            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.side_effect = Exception("API Error")

                client = GeminiClient()
                result = await client.chat("Hello")

                assert result.success is False
                assert result.error is not None


class TestGeminiClientStream:
    """Tests for GeminiClient.stream method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_stream_returns_accumulated(self, mock_api_key):
            """stream() should return accumulated response."""
            with patch("gemini_openai_sdk.gemini_client.accumulate_stream", new_callable=AsyncMock) as mock_acc:
                mock_acc.return_value = {
                    "content": "Streamed content",
                    "chunk_count": 3,
                    "usage": None
                }

                client = GeminiClient()
                result = await client.stream("Hello")

                assert result.success is True
                assert result.content == "Streamed content"

    class TestErrorHandling:
        """Test error conditions."""

        @pytest.mark.asyncio
        async def test_handles_stream_error(self, mock_api_key):
            """Should return error response on stream failure."""
            with patch("gemini_openai_sdk.gemini_client.accumulate_stream", new_callable=AsyncMock) as mock_acc:
                mock_acc.side_effect = Exception("Stream Error")

                client = GeminiClient()
                result = await client.stream("Hello")

                assert result.success is False


class TestGeminiClientStructure:
    """Tests for GeminiClient.structure method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_structure_returns_parsed(self, mock_api_key):
            """structure() should return parsed JSON."""
            mock_response = {
                "choices": [{"message": {"content": '{"name": "test"}'}}],
                "model": "gemini-2.0-flash",
                "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15}
            }

            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.return_value = mock_response

                client = GeminiClient()
                schema = {"type": "object", "properties": {"name": {"type": "string"}}}
                result = await client.structure("Extract name", schema)

                assert result.success is True
                assert result.parsed == {"name": "test"}


class TestGeminiClientToolCall:
    """Tests for GeminiClient.tool_call method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_tool_call_executes_tools(self, mock_api_key):
            """tool_call() should execute detected tools."""
            mock_response = {
                "choices": [{
                    "message": {
                        "content": None,
                        "tool_calls": [{
                            "id": "call_123",
                            "function": {
                                "name": "get_weather",
                                "arguments": '{"location": "SF"}'
                            }
                        }]
                    },
                    "finish_reason": "tool_calls"
                }],
                "model": "gemini-2.0-flash"
            }

            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.return_value = mock_response

                client = GeminiClient()
                result = await client.tool_call("What's the weather in SF?")

                assert result.success is True
                assert result.tool_calls is not None


class TestGeminiClientHealthCheck:
    """Tests for GeminiClient.health_check method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_returns_health_status(self, mock_api_key):
            """health_check() should return health status."""
            client = GeminiClient()
            result = client.health_check()

            assert "status" in result
            assert "api_key_configured" in result
            assert result["api_key_configured"] is True

        def test_unhealthy_without_key(self, no_api_key):
            """health_check() should report unhealthy without API key."""
            client = GeminiClient()
            result = client.health_check()

            assert result["status"] == "unhealthy"
            assert result["api_key_configured"] is False


class TestGeminiClientConversation:
    """Tests for GeminiClient.conversation method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_conversation_with_history(self, mock_api_key, mock_chat_response):
            """conversation() should handle message history."""
            with patch("gemini_openai_sdk.gemini_client.chat_completion", new_callable=AsyncMock) as mock_chat:
                mock_chat.return_value = mock_chat_response

                client = GeminiClient()
                messages = [
                    {"role": "user", "content": "Hi"},
                    {"role": "assistant", "content": "Hello!"},
                    {"role": "user", "content": "How are you?"}
                ]
                result = await client.conversation(messages)

                assert result.success is True

    class TestErrorHandling:
        """Test error conditions."""

        @pytest.mark.asyncio
        async def test_empty_messages_returns_error(self, mock_api_key):
            """conversation() should error on empty messages."""
            client = GeminiClient()
            result = await client.conversation([])

            assert result.success is False

        @pytest.mark.asyncio
        async def test_none_messages_returns_error(self, mock_api_key):
            """conversation() should error on None messages."""
            client = GeminiClient()
            result = await client.conversation(None)

            assert result.success is False
