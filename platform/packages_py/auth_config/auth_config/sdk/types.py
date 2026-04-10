from typing import TypeVar, Generic, List, Dict, Any
from dataclasses import dataclass, field

T = TypeVar('T')

@dataclass
class SDKResult(Generic[T]):
    """Wrapper for SDK operation results."""
    success: bool
    data: T | None = None
    error: Exception | None = None

@dataclass
class OperationMetadata:
    name: str
    description: str
    parameters: List[str]
