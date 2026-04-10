"""
Protocol Translation Types

Type definitions for OpenAI and Gemini API formats to enable
bidirectional protocol translation.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import (
    Any,
    Generic,
    Literal,
    TypedDict,
    TypeVar,
)

# =============================================================================
# OpenAI Types
# =============================================================================

OpenAIRole = Literal["system", "user", "assistant", "tool", "function"]


class OpenAIFunctionCall(TypedDict):
    """OpenAI function call in a message."""

    name: str
    arguments: str  # JSON string


class OpenAIToolCall(TypedDict):
    """OpenAI tool call in a message."""

    id: str
    type: Literal["function"]
    function: OpenAIFunctionCall


class OpenAIMessage(TypedDict, total=False):
    """OpenAI chat message."""

    role: OpenAIRole
    content: str | None
    name: str
    function_call: OpenAIFunctionCall
    tool_calls: list[OpenAIToolCall]
    tool_call_id: str


class OpenAIJSONSchema(TypedDict, total=False):
    """OpenAI JSON Schema (subset)."""

    type: str
    properties: dict[str, OpenAIJSONSchema]
    required: list[str]
    items: OpenAIJSONSchema
    enum: list[Any]
    description: str


class OpenAIFunctionDefinition(TypedDict, total=False):
    """OpenAI function definition for tools."""

    name: str
    description: str
    parameters: OpenAIJSONSchema


class OpenAITool(TypedDict):
    """OpenAI tool definition."""

    type: Literal["function"]
    function: OpenAIFunctionDefinition


class OpenAIResponseFormat(TypedDict, total=False):
    """OpenAI response format."""

    type: Literal["text", "json_object", "json_schema"]
    json_schema: OpenAIJSONSchema


class OpenAIToolChoiceFunction(TypedDict):
    """OpenAI tool choice with specific function."""

    type: Literal["function"]
    function: dict[str, str]  # {"name": "function_name"}


OpenAIToolChoice = Literal["none", "auto", "required"] | OpenAIToolChoiceFunction


class OpenAIChatRequest(TypedDict, total=False):
    """OpenAI chat completion request."""

    model: str
    messages: list[OpenAIMessage]
    temperature: float
    top_p: float
    n: int
    stream: bool
    stop: str | list[str]
    max_tokens: int
    presence_penalty: float
    frequency_penalty: float
    logit_bias: dict[str, int]
    user: str
    tools: list[OpenAITool]
    tool_choice: OpenAIToolChoice
    response_format: OpenAIResponseFormat


class OpenAIChoice(TypedDict, total=False):
    """OpenAI chat completion choice."""

    index: int
    message: OpenAIMessage
    finish_reason: Literal["stop", "length", "tool_calls", "content_filter", "function_call"] | None


class OpenAIUsage(TypedDict):
    """OpenAI usage stats."""

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class OpenAIChatResponse(TypedDict, total=False):
    """OpenAI chat completion response."""

    id: str
    object: Literal["chat.completion"]
    created: int
    model: str
    choices: list[OpenAIChoice]
    usage: OpenAIUsage
    system_fingerprint: str


class OpenAIDelta(TypedDict, total=False):
    """OpenAI streaming delta."""

    role: OpenAIRole
    content: str
    function_call: OpenAIFunctionCall
    tool_calls: list[dict[str, Any]]


class OpenAIStreamChoice(TypedDict, total=False):
    """OpenAI streaming choice."""

    index: int
    delta: OpenAIDelta
    finish_reason: str | None


class OpenAIStreamChunk(TypedDict, total=False):
    """OpenAI streaming chunk."""

    id: str
    object: Literal["chat.completion.chunk"]
    created: int
    model: str
    choices: list[OpenAIStreamChoice]
    system_fingerprint: str


# =============================================================================
# Gemini Types
# =============================================================================

GeminiRole = Literal["user", "model"]


class GeminiTextPart(TypedDict):
    """Gemini text part."""

    text: str


class GeminiFunctionCall(TypedDict):
    """Gemini function call data."""

    name: str
    args: dict[str, Any]


class GeminiFunctionCallPart(TypedDict):
    """Gemini function call part."""

    functionCall: GeminiFunctionCall


class GeminiFunctionResponse(TypedDict):
    """Gemini function response data."""

    name: str
    response: dict[str, Any]


class GeminiFunctionResponsePart(TypedDict):
    """Gemini function response part."""

    functionResponse: GeminiFunctionResponse


class GeminiInlineData(TypedDict):
    """Gemini inline data."""

    mimeType: str
    data: str  # base64


class GeminiInlineDataPart(TypedDict):
    """Gemini inline data part (images, etc.)."""

    inlineData: GeminiInlineData


GeminiPart = (
    GeminiTextPart
    | GeminiFunctionCallPart
    | GeminiFunctionResponsePart
    | GeminiInlineDataPart
)


class GeminiContent(TypedDict):
    """Gemini content (message)."""

    role: GeminiRole
    parts: list[GeminiPart]


class GeminiSchema(TypedDict, total=False):
    """Gemini schema (JSON Schema-like)."""

    type: str
    properties: dict[str, GeminiSchema]
    required: list[str]
    items: GeminiSchema
    enum: list[str]
    description: str
    format: str
    nullable: bool


class GeminiFunctionDeclaration(TypedDict, total=False):
    """Gemini function declaration."""

    name: str
    description: str
    parameters: GeminiSchema


class GeminiTool(TypedDict):
    """Gemini tool."""

    functionDeclarations: list[GeminiFunctionDeclaration]


class GeminiFunctionCallingConfig(TypedDict, total=False):
    """Gemini function calling config."""

    mode: Literal["AUTO", "ANY", "NONE"]
    allowedFunctionNames: list[str]


class GeminiToolConfig(TypedDict, total=False):
    """Gemini tool config."""

    functionCallingConfig: GeminiFunctionCallingConfig


class GeminiGenerationConfig(TypedDict, total=False):
    """Gemini generation config."""

    temperature: float
    topP: float
    topK: int
    maxOutputTokens: int
    stopSequences: list[str]
    candidateCount: int
    responseMimeType: str
    responseSchema: GeminiSchema


class GeminiSafetySetting(TypedDict):
    """Gemini safety setting."""

    category: str
    threshold: str


class GeminiSystemInstruction(TypedDict):
    """Gemini system instruction."""

    parts: list[GeminiPart]


class GeminiGenerateRequest(TypedDict, total=False):
    """Gemini generateContent request."""

    contents: list[GeminiContent]
    systemInstruction: GeminiSystemInstruction
    tools: list[GeminiTool]
    toolConfig: GeminiToolConfig
    generationConfig: GeminiGenerationConfig
    safetySettings: list[GeminiSafetySetting]


class GeminiSafetyRating(TypedDict, total=False):
    """Gemini safety rating."""

    category: str
    probability: str
    blocked: bool


class GeminiCandidate(TypedDict, total=False):
    """Gemini candidate."""

    content: GeminiContent
    finishReason: Literal["STOP", "MAX_TOKENS", "SAFETY", "RECITATION", "OTHER"] | None
    index: int
    safetyRatings: list[GeminiSafetyRating]


class GeminiUsageMetadata(TypedDict):
    """Gemini usage metadata."""

    promptTokenCount: int
    candidatesTokenCount: int
    totalTokenCount: int


class GeminiPromptFeedback(TypedDict, total=False):
    """Gemini prompt feedback."""

    blockReason: str
    safetyRatings: list[GeminiSafetyRating]


class GeminiGenerateResponse(TypedDict, total=False):
    """Gemini generateContent response."""

    candidates: list[GeminiCandidate]
    usageMetadata: GeminiUsageMetadata
    promptFeedback: GeminiPromptFeedback


# =============================================================================
# Translation Context
# =============================================================================


@dataclass
class TranslationContext:
    """Context for protocol translation."""

    source: Literal["openai", "gemini"]
    target: Literal["openai", "gemini"]
    model_map: dict[str, str] | None = None
    preserve_extras: bool = False
    generate_tool_call_id: Callable[[], str] | None = None


T = TypeVar("T")


@dataclass
class TranslationResult(Generic[T]):
    """Translation result with metadata."""

    data: T
    warnings: list[str] = field(default_factory=list)
    unmapped: dict[str, Any] | None = None
