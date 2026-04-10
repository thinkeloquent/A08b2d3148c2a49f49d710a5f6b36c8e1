"""
Types Module - Data Classes and Type Definitions

Defines response types and data structures for the SDK.
All field names use snake_case for API consistency.
"""

from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class UsageStats:
    """Token usage statistics from API response."""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    def to_dict(self) -> Dict[str, int]:
        return asdict(self)


@dataclass
class ChatMessage:
    """Chat message structure."""
    role: str  # "system", "user", "assistant", "tool"
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        result = {"role": self.role, "content": self.content}
        if self.name:
            result["name"] = self.name
        if self.tool_call_id:
            result["tool_call_id"] = self.tool_call_id
        return result


@dataclass
class ToolCall:
    """Tool call from model response."""
    id: str
    function_name: str
    arguments: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "function": self.function_name,
            "arguments": self.arguments,
        }


@dataclass
class ToolResult:
    """Result from tool execution."""
    tool_call_id: str
    function_name: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.tool_call_id,
            "function": self.function_name,
            "arguments": self.arguments,
            "result": self.result,
        }


@dataclass
class StreamChunk:
    """Single chunk from streaming response."""
    content: Optional[str] = None
    role: Optional[str] = None
    finish_reason: Optional[str] = None
    id: Optional[str] = None
    model: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class ChatResponse:
    """
    Standardized response from chat operations.

    All SDK methods return this structure for consistency.
    """
    success: bool
    content: Optional[str] = None
    model: Optional[str] = None
    finish_reason: Optional[str] = None
    usage: Optional[UsageStats] = None
    error: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None
    # Additional fields for specific operations
    parsed: Optional[Dict[str, Any]] = None
    schema: Optional[Dict[str, Any]] = None
    validation: Optional[Dict[str, Any]] = None
    tool_calls: Optional[List[ToolResult]] = field(default_factory=list)
    chunk_count: Optional[int] = None
    chunks: Optional[List[Dict[str, Any]]] = None
    accumulated: Optional[Dict[str, Any]] = None
    format_info: Optional[Dict[str, Any]] = None
    assistant_message: Optional[Dict[str, Any]] = None
    # Metadata
    execution_time_ms: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding None values."""
        result: Dict[str, Any] = {"success": self.success}

        if self.content is not None:
            result["content"] = self.content
        if self.model is not None:
            result["model"] = self.model
        if self.finish_reason is not None:
            result["finish_reason"] = self.finish_reason
        if self.usage is not None:
            result["usage"] = self.usage.to_dict()
        if self.error is not None:
            result["error"] = self.error
        if self.parsed is not None:
            result["parsed"] = self.parsed
        if self.schema is not None:
            result["schema"] = self.schema
        if self.validation is not None:
            result["validation"] = self.validation
        if self.tool_calls:
            result["tool_calls"] = [tc.to_dict() for tc in self.tool_calls]
        if self.chunk_count is not None:
            result["chunk_count"] = self.chunk_count
        if self.chunks is not None:
            result["chunks"] = self.chunks
        if self.accumulated is not None:
            result["accumulated"] = self.accumulated
        if self.format_info is not None:
            result["format_info"] = self.format_info
        if self.assistant_message is not None:
            result["assistant_message"] = self.assistant_message
        if self.execution_time_ms is not None:
            result["execution_time_ms"] = self.execution_time_ms

        return result

    @classmethod
    def error_response(cls, error: str, execution_time_ms: Optional[float] = None) -> "ChatResponse":
        """Create an error response."""
        return cls(
            success=False,
            error=error,
            execution_time_ms=execution_time_ms,
        )

    @classmethod
    def from_api_response(
        cls,
        response: Dict[str, Any],
        execution_time_ms: Optional[float] = None,
    ) -> "ChatResponse":
        """Create response from raw API response."""
        try:
            choice = response.get("choices", [{}])[0]
            message = choice.get("message", {})
            usage_data = response.get("usage", {})

            usage = UsageStats(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            )

            return cls(
                success=True,
                content=message.get("content"),
                model=response.get("model"),
                finish_reason=choice.get("finish_reason"),
                usage=usage,
                raw_response=response,
                execution_time_ms=execution_time_ms,
            )
        except Exception as e:
            return cls.error_response(str(e), execution_time_ms)
