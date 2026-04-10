"""Multi-provider LLM synthesis client."""

from __future__ import annotations

import json
from typing import Optional

from .json_extractor import extract_json
from .structured_output import build_format_instructions
from .types import SynthesisConfig


class LlmSynthesisClient:
    """Multi-provider LLM client with structured output enforcement.

    Supports OpenAI, Anthropic, and Gemini (via OpenAI-compatible endpoint).
    Providers are lazy-loaded — no SDK import until first use.
    """

    def __init__(self, config: SynthesisConfig | None = None) -> None:
        self.config = config or SynthesisConfig()
        self._openai_client = None
        self._anthropic_client = None
        self._gemini_client = None

    def _get_openai_client(self):
        if self._openai_client is None:
            from .providers.openai import get_openai_client
            self._openai_client = get_openai_client()
        return self._openai_client

    def _get_anthropic_client(self):
        if self._anthropic_client is None:
            from .providers.anthropic import get_anthropic_client
            self._anthropic_client = get_anthropic_client()
        return self._anthropic_client

    def _get_gemini_client(self):
        if self._gemini_client is None:
            from .providers.gemini import get_gemini_client
            self._gemini_client = get_gemini_client()
        return self._gemini_client

    def ask(
        self,
        question: str,
        context: str,
        system_prompt: str | None = None,
        provider: str | None = None,
        output_format: str = "markdown",
        schema_language: str | None = None,
        schema_text: str | None = None,
        schema_name: str | None = None,
    ) -> str:
        """Ask the LLM a question with context.

        Args:
            question: The user's question.
            context: Source context to answer from.
            system_prompt: Custom system prompt. Uses a generic default if None.
            provider: LLM provider override ("openai", "anthropic", "gemini").
            output_format: Desired output format ("markdown", "json", "yaml").
            schema_language: Schema language for structured output.
            schema_text: Schema definition text for structured output.
            schema_name: Name for the schema (used in native JSON schema mode).

        Returns:
            LLM response text.
        """
        cfg = self.config
        prov = provider or cfg.llm_provider
        sys_msg = system_prompt or "You are a helpful assistant. Answer based on the provided context."
        user_msg = f"Context:\n\n{context}\n\n---\n\nQuestion: {question}"

        # Determine enforcement strategy
        use_native = False
        native_schema = None
        if output_format == "json" and schema_language == "json_schema" and schema_text:
            try:
                native_schema = json.loads(schema_text)
                use_native = True
            except json.JSONDecodeError:
                use_native = False

        # Anthropic never uses native enforcement
        if prov == "anthropic":
            use_native = False

        # Prompt-engineering path: append schema/format instructions to system prompt
        if not use_native:
            sys_msg += build_format_instructions(output_format, schema_language, schema_text)

        if prov == "anthropic":
            client = self._get_anthropic_client()
            response = client.messages.create(
                model=cfg.anthropic_model,
                max_tokens=cfg.max_tokens,
                system=sys_msg,
                messages=[{"role": "user", "content": user_msg}],
                temperature=cfg.temperature,
            )
            text = response.content[0].text
            if output_format == "json":
                text = extract_json(text)
            return text

        elif prov == "gemini":
            client = self._get_gemini_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = client.chat.completions.create(
                model=cfg.gemini_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=cfg.temperature,
                **kwargs,
            )
            return response.choices[0].message.content

        else:
            # Default: OpenAI
            client = self._get_openai_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = client.chat.completions.create(
                model=cfg.openai_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=cfg.temperature,
                **kwargs,
            )
            return response.choices[0].message.content

    def _get_async_openai_client(self):
        if not hasattr(self, '_async_openai_client') or self._async_openai_client is None:
            from .providers.openai import get_async_openai_client
            self._async_openai_client = get_async_openai_client()
        return self._async_openai_client

    def _get_async_anthropic_client(self):
        if not hasattr(self, '_async_anthropic_client') or self._async_anthropic_client is None:
            from .providers.anthropic import get_async_anthropic_client
            self._async_anthropic_client = get_async_anthropic_client()
        return self._async_anthropic_client

    def _get_async_gemini_client(self):
        if not hasattr(self, '_async_gemini_client') or self._async_gemini_client is None:
            from .providers.gemini import get_async_gemini_client
            self._async_gemini_client = get_async_gemini_client()
        return self._async_gemini_client

    async def async_ask(
        self,
        question: str,
        context: str,
        system_prompt: str | None = None,
        provider: str | None = None,
        output_format: str = "markdown",
        schema_language: str | None = None,
        schema_text: str | None = None,
        schema_name: str | None = None,
    ) -> str:
        """Async version of ask(). Uses async LLM clients."""
        cfg = self.config
        prov = provider or cfg.llm_provider
        sys_msg = system_prompt or "You are a helpful assistant. Answer based on the provided context."
        user_msg = f"Context:\n\n{context}\n\n---\n\nQuestion: {question}"

        use_native = False
        native_schema = None
        if output_format == "json" and schema_language == "json_schema" and schema_text:
            try:
                native_schema = json.loads(schema_text)
                use_native = True
            except json.JSONDecodeError:
                use_native = False

        if prov == "anthropic":
            use_native = False

        if not use_native:
            sys_msg += build_format_instructions(output_format, schema_language, schema_text)

        if prov == "anthropic":
            client = self._get_async_anthropic_client()
            response = await client.messages.create(
                model=cfg.anthropic_model,
                max_tokens=cfg.max_tokens,
                system=sys_msg,
                messages=[{"role": "user", "content": user_msg}],
                temperature=cfg.temperature,
            )
            text = response.content[0].text
            if output_format == "json":
                text = extract_json(text)
            return text

        elif prov == "gemini":
            client = self._get_async_gemini_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = await client.chat.completions.create(
                model=cfg.gemini_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=cfg.temperature,
                **kwargs,
            )
            return response.choices[0].message.content

        else:
            client = self._get_async_openai_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = await client.chat.completions.create(
                model=cfg.openai_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=cfg.temperature,
                **kwargs,
            )
            return response.choices[0].message.content
