"""
Authentication type definitions.
"""
from typing import Protocol, Literal, Optional, Union, Awaitable
from typing_extensions import TypedDict


def greet(name: str) -> str:
    return f"Hello, {name}!"